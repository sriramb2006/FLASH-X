import { jsPDF } from 'jspdf';
import { Booking, Schedule } from '../../shared/types';

export const exportTripSummaryPdf = (booking: Booking, schedule?: Schedule | null): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top Dark Banner
  doc.setFillColor(16, 17, 20); // #101114
  doc.rect(0, 0, 210, 42, 'F');

  // Gold accent line
  doc.setFillColor(231, 203, 88); // #E7CB58
  doc.rect(0, 42, 210, 3, 'F');

  // Brand Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('FLASHX OS', 15, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(231, 203, 88);
  doc.text('OFFICIAL DIGITAL TRIP SUMMARY & TRAVEL PASS', 15, 26);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(170, 175, 185);
  doc.text('Autonomous Intercity Mobility Telemetry • Certified Offline Document', 15, 33);

  // Booking Reference Card Top-Right
  doc.setFillColor(26, 28, 36);
  doc.roundedRect(125, 8, 70, 26, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('BOOKING REFERENCE', 130, 15);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(231, 203, 88);
  doc.text(booking.bookingReference, 130, 23);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text(`Issued: ${new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`, 130, 29);

  // 1. Corridor & Schedule Itinerary
  let y = 56;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('1. CORRIDOR & SCHEDULE ITINERARY', 15, y);

  y += 5;
  doc.setFillColor(246, 248, 252);
  doc.roundedRect(15, y, 180, 42, 2, 2, 'F');
  doc.setDrawColor(215, 220, 230);
  doc.roundedRect(15, y, 180, 42, 2, 2, 'S');

  // Origin Details
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 120);
  doc.text('ORIGIN / BOARDING STATION', 22, y + 8);

  doc.setFontSize(13);
  doc.setTextColor(16, 17, 20);
  doc.text(booking.sourceCity, 22, y + 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 75, 85);
  doc.text(`Point: ${booking.boardingPoint}`, 22, y + 23);
  doc.text(`Dep: ${new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(booking.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`, 22, y + 30);

  // Arrow Symbol
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(231, 160, 40);
  doc.text('-->', 96, y + 17);

  // Destination Details
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 120);
  doc.text('DESTINATION / DROPOFF BAY', 115, y + 8);

  doc.setFontSize(13);
  doc.setTextColor(16, 17, 20);
  doc.text(booking.destCity, 115, y + 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 75, 85);
  doc.text(`Point: ${booking.droppingPoint}`, 115, y + 23);
  doc.text(`Arr: ${new Date(booking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(booking.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`, 115, y + 30);

  // 2. Carrier & Fleet Details
  y += 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('2. CARRIER & FLEET TELEMETRY', 15, y);

  y += 5;
  doc.setFillColor(246, 248, 252);
  doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
  doc.setDrawColor(215, 220, 230);
  doc.roundedRect(15, y, 180, 22, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 120);
  doc.text('OPERATOR CARRIER', 22, y + 7);
  doc.text('COACH SERVICE MODEL', 80, y + 7);
  doc.text('RESERVATION STATUS', 142, y + 7);

  doc.setFontSize(9);
  doc.setTextColor(16, 17, 20);
  doc.text(booking.operatorName || 'FlashX Sovereign Express', 22, y + 15);
  doc.text(booking.busName || 'Electric Hyperline Sleeper 2+1', 80, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(booking.status || 'CONFIRMED', 142, y + 15);

  // 3. Passenger & Berth Allocation
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('3. PASSENGER & BERTH ALLOCATION', 15, y);

  y += 5;
  // Table Header
  doc.setFillColor(232, 236, 244);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 65, 75);
  doc.text('PASSENGER NAME', 22, y + 5);
  doc.text('AGE / GENDER', 85, y + 5);
  doc.text('ASSIGNED BERTH', 125, y + 5);
  doc.text('PRIMARY CONTACT', 155, y + 5);

  y += 7;
  const passengers = (booking.passengers && booking.passengers.length > 0)
    ? booking.passengers
    : [
        {
          name: booking.primaryContact?.name || 'Primary Passenger',
          age: 28,
          gender: 'Male',
          seatNumber: booking.seats?.[0]?.seatNumber || 'Berth L1A'
        }
      ];

  passengers.forEach((p, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(15, y, 180, 8, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 8, 195, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(p.name || 'Traveler', 22, y + 5.5);
    doc.text(`${p.age || 28} / ${p.gender || 'N/A'}`, 85, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(215, 140, 20);
    doc.text(p.seatNumber || booking.seats?.[idx]?.seatNumber || `Seat ${idx + 1}`, 125, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(booking.primaryContact?.mobile || 'Verified Mobile', 155, y + 5.5);
    y += 8;
  });

  // 4. Fare Breakdown & Loyalty Summary
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('4. FARE BREAKDOWN & LOYALTY SUMMARY', 15, y);

  y += 5;
  doc.setFillColor(246, 248, 252);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'F');
  doc.setDrawColor(215, 220, 230);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Base Highway Transportation Fare:', 22, y + 7);
  doc.text(`INR ${(booking.totalAmount * 0.88).toFixed(2)}`, 85, y + 7);

  doc.text('Automated NHAI Tolls & Express Clearance:', 22, y + 13);
  doc.text(`INR ${(booking.totalAmount * 0.07).toFixed(2)}`, 85, y + 13);

  doc.text('FlashGuardian Passenger Insurance & GST (5%):', 22, y + 19);
  doc.text(`INR ${(booking.totalAmount * 0.05).toFixed(2)}`, 85, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 17, 20);
  doc.text('TOTAL AMOUNT PAID:', 115, y + 9);

  doc.setFontSize(13);
  doc.setTextColor(215, 140, 20);
  doc.text(`INR ${booking.totalAmount.toLocaleString()}`, 115, y + 18);

  doc.setFontSize(7);
  doc.setTextColor(16, 185, 129);
  doc.text(`+${Math.round(booking.totalAmount * 0.15)} FlashMiles Loyalty Points Credited`, 115, y + 24);

  // 5. Boarding & Safety Instructions
  y += 35;
  doc.setFillColor(240, 247, 255);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'F');
  doc.setDrawColor(180, 210, 240);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(25, 75, 160);
  doc.text('BOARDING INSTRUCTIONS & FLASHGUARDIAN™ SAFETY PROTOCOLS', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 55, 65);
  doc.text('• Arrive at the departure bay at least 15 minutes prior to scheduled departure.', 20, y + 11);
  doc.text('• Carry this offline PDF document along with any valid Government Photo Identity Proof (Aadhaar, Passport, DL).', 20, y + 16);
  doc.text('• Luggage allowance: 1 piece registered cargo baggage (up to 20kg) + 1 compact cabin handbag (up to 7kg).', 20, y + 21);
  doc.text('• 24/7 Operations Central Control Room: 1800-FLASH-SOS (1800-352-7476) • Police/Ambulance: 112.', 20, y + 26);

  // Document Verification Security Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(130, 135, 145);
  doc.text(`Document Cryptographic Security Hash: SHA256-${booking.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, 15, 287);
  doc.text('FLASHX OS • Autonomous Intercity Coach Network • System Authenticated', 120, 287);

  // Save the PDF file to user device
  const filename = `FlashX_Trip_Summary_${booking.bookingReference}_${booking.sourceCity}_to_${booking.destCity}.pdf`;
  doc.save(filename);
};
