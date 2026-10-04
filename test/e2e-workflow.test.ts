/**
 * Integration & E2E Verification Test Suite for FLASHX OS
 * Verifies Multi-Role Authentication, RBAC Visibility, Seat Holds, and Booking Workflow
 */

async function runTests() {
  const BASE = 'http://localhost:3000/api';
  console.log('🧪 Starting FLASHX OS Multi-Role Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Role 1: System Admin Login with username "admin" and password "pass"
  let adminToken = '';
  await test('System Admin Login (admin / pass)', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'pass', expectedRole: 'ADMIN' }),
    });
    if (!res.ok) throw new Error('Admin login failed');
    const data = await res.json();
    if (!data.user || data.user.role !== 'ADMIN') throw new Error('Invalid admin role');
    adminToken = data.token;
  });

  // 2. Role 2: Fleet Operator Login with username "operator" and password "pass"
  let operatorToken = '';
  await test('Fleet Operator Login (operator / pass)', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'operator', password: 'pass', expectedRole: 'OPERATOR' }),
    });
    if (!res.ok) throw new Error('Operator login failed');
    const data = await res.json();
    if (!data.user || data.user.role !== 'OPERATOR') throw new Error('Invalid operator role');
    operatorToken = data.token;
  });

  // 3. Role 3: Passenger Login with username "passenger" and password "pass"
  let passengerToken = '';
  await test('Passenger Login (passenger / pass)', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'passenger', password: 'pass', expectedRole: 'PASSENGER' }),
    });
    if (!res.ok) throw new Error('Passenger login failed');
    const data = await res.json();
    if (!data.user || data.user.role !== 'PASSENGER') throw new Error('Invalid passenger role');
    passengerToken = data.token;
  });

  // 4. Role 4: User Registration Flow
  const regUsername = `traveler_${Date.now().toString(36)}`;
  await test('New Passenger Registration & Login', async () => {
    const regRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Registered Traveler',
        username: regUsername,
        email: `${regUsername}@test.com`,
        mobile: '+91 99001 12233',
        password: 'pass',
      }),
    });
    if (!regRes.ok) throw new Error('Registration failed');
    const regData = await regRes.json();
    if (!regData.user || regData.user.username !== regUsername) throw new Error('Invalid registered user');

    // Login with newly registered username and password
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: regUsername, password: 'pass' }),
    });
    if (!loginRes.ok) throw new Error('Login with new credentials failed');
  });

  // 5. Role Visibility & Endpoint Access Control
  await test('RBAC: Operator Overview Access Check', async () => {
    const res = await fetch(`${BASE}/operator/overview`, {
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    if (!res.ok) throw new Error('Operator overview failed');
    const data = await res.json();
    if (!Array.isArray(data.buses) || !data.manifests) throw new Error('Invalid operator payload');
  });

  await test('RBAC: Admin Access to User Directory & Platform Metrics', async () => {
    const usersRes = await fetch(`${BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!usersRes.ok) throw new Error('Admin users endpoint failed');
    const usersData = await usersRes.json();
    if (!Array.isArray(usersData) || usersData.length === 0) throw new Error('Empty user directory');
  });

  // 6. Bus Search test
  let testScheduleId = '';
  await test('Intercity Bus Search & Intelligence Scoring', async () => {
    const res = await fetch(`${BASE}/buses/search?source=Coimbatore&destination=Bengaluru`);
    const data = await res.json();
    if (!data.schedules || data.schedules.length === 0) throw new Error('No buses returned');
    const first = data.schedules[0];
    if (typeof first.journeySuccessScore !== 'number') throw new Error('Missing Journey Success Score');
    if (!first.delayPrediction) throw new Error('Missing delay prediction');
    testScheduleId = first.id;
  });

  // 7. Seat Matrix test
  let testSeatNumber = 'L1A';
  await test('Seat Matrix & Layout Generation', async () => {
    const res = await fetch(`${BASE}/seats/matrix/${testScheduleId}`);
    const data = await res.json();
    if (!data.seats || data.seats.length === 0) throw new Error('Empty seat matrix');
    const available = data.seats.find((s: any) => s.status === 'available');
    if (available) testSeatNumber = available.seatNumber;
  });

  // 8. Seat Hold test (Concurrency protection)
  const testToken = `test-session-${Date.now()}`;
  await test('Seat Hold & Concurrency Safeguard', async () => {
    const res = await fetch(`${BASE}/seats/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduleId: testScheduleId,
        seatIds: [testSeatNumber],
        sessionToken: testToken,
      }),
    });
    if (!res.ok) throw new Error('Failed to hold seat');
    const data = await res.json();
    if (!data.success || !data.expiresAt) throw new Error('Invalid hold response');

    // Attempt concurrent hold from another session should fail
    const conflictRes = await fetch(`${BASE}/seats/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduleId: testScheduleId,
        seatIds: [testSeatNumber],
        sessionToken: 'competing-user-token',
      }),
    });
    if (conflictRes.status !== 409) throw new Error('Concurrency collision failed to block competing session');
  });

  // 9. Booking Checkout & Ticket Issuance test
  let createdBookingId = '';
  let ticketQrPayload = '';
  await test('Booking Checkout & Cryptographic Ticket Creation', async () => {
    const res = await fetch(`${BASE}/bookings/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr-passenger-demo',
        passengerEmail: 'passenger@flashx.os',
        passengerMobile: '+91 98401 23456',
        scheduleId: testScheduleId,
        passengers: [
          { name: 'Arjun Swaminathan', age: 29, gender: 'male', seatNumber: testSeatNumber, seatId: `${testScheduleId}-${testSeatNumber}` }
        ],
        sessionToken: testToken,
        promoCode: 'FLASHX2026',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    const data = await res.json();
    if (!data.booking || !data.booking.bookingReference) throw new Error('Missing booking reference');
    createdBookingId = data.booking.id;
    ticketQrPayload = data.booking.ticketQrPayload;
  });

  // 10. Ticket Verification Endpoint test
  await test('Ticket Checkpoint Verification Endpoint', async () => {
    const res = await fetch(`${BASE}/tickets/verify/${ticketQrPayload}`);
    const data = await res.json();
    if (!data.valid) throw new Error('Ticket failed checkpoint scanner verification');
  });

  // 11. Cancellation & Refund Policy test
  await test('Booking Cancellation & Refund Engine', async () => {
    const res = await fetch(`${BASE}/bookings/${createdBookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr-passenger-demo' }),
    });
    const data = await res.json();
    if (!data.success || typeof data.refundAmount !== 'number') throw new Error('Cancellation refund failed');
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
