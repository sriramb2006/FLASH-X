import fs from 'fs';
import path from 'path';
import {
  User,
  Bus,
  BusRoute,
  Schedule,
  SeatData,
  Booking,
  TravelReview,
  SystemAuditLog,
  SafetyCheckinRecord,
  LoyaltyAccount,
  LoyaltyReward,
  LoyaltyTransaction,
  LoyaltyMission,
} from '../shared/types.js';

export interface DatabaseSchema {
  users: User[];
  buses: Bus[];
  routes: BusRoute[];
  schedules: Schedule[];
  seatMatrix: Record<string, SeatData[]>; // scheduleId -> SeatData[]
  bookings: Booking[];
  reviews: TravelReview[];
  auditLogs: SystemAuditLog[];
  safetyCheckins: SafetyCheckinRecord[];
  familyTokens: Record<string, { bookingId: string; expiresAt: number; revoked: boolean }>;
  loyaltyAccounts: Record<string, LoyaltyAccount>;
}

const DB_FILE = path.resolve(process.cwd(), 'data/flashx-db.json');

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate realistic Indian routes
const INITIAL_ROUTES: BusRoute[] = [
  {
    id: 'route-cbe-blr',
    sourceCity: 'Coimbatore',
    destCity: 'Bengaluru',
    sourceTerminal: 'Gandhipuram Central Terminal',
    destTerminal: 'Madiwala / Electronic City Hub',
    distanceKm: 365,
    estimatedHours: 6.5,
    stops: [
      { id: 's1', name: 'Gandhipuram Omni Bus Stand', landmark: 'Platform 4', type: 'boarding', timeOffsetMin: 0, latitude: 11.0168, longitude: 76.9558 },
      { id: 's2', name: 'Hope College / Peelamedu', landmark: 'Opp. Fun Mall', type: 'boarding', timeOffsetMin: 20, latitude: 11.0284, longitude: 77.0016 },
      { id: 's3', name: 'Avinashi Bypass Toll', landmark: 'Highway NH544', type: 'boarding', timeOffsetMin: 50, latitude: 11.1924, longitude: 77.2694 },
      { id: 's4', name: 'Salem NH Rest & Recharge Hub', landmark: 'Saravana Bhavan Express', type: 'rest', timeOffsetMin: 180, latitude: 11.6643, longitude: 78.1460 },
      { id: 's5', name: 'Hosur Bus Stand Bypass', landmark: 'Sipcot Flyover', type: 'dropping', timeOffsetMin: 330, latitude: 12.7409, longitude: 77.8253 },
      { id: 's6', name: 'Electronic City Toll Plaza', landmark: 'Elevated Toll Gate', type: 'dropping', timeOffsetMin: 360, latitude: 12.8399, longitude: 77.6770 },
      { id: 's7', name: 'Madiwala St. John Hospital', landmark: 'Total Mall Junction', type: 'dropping', timeOffsetMin: 390, latitude: 12.9226, longitude: 77.6174 },
    ],
  },
  {
    id: 'route-blr-cbe',
    sourceCity: 'Bengaluru',
    destCity: 'Coimbatore',
    sourceTerminal: 'Majestic / Madiwala Terminal',
    destTerminal: 'Gandhipuram Central Terminal',
    distanceKm: 365,
    estimatedHours: 6.5,
    stops: [
      { id: 'sb1', name: 'Majestic KBS Station', landmark: 'Platform 18', type: 'boarding', timeOffsetMin: 0, latitude: 12.9774, longitude: 77.5708 },
      { id: 'sb2', name: 'Shantinagar Bus Station', landmark: 'Depot 2', type: 'boarding', timeOffsetMin: 25, latitude: 12.9542, longitude: 77.5925 },
      { id: 'sb3', name: 'Madiwala Police Station', landmark: 'Maruti Complex', type: 'boarding', timeOffsetMin: 50, latitude: 12.9226, longitude: 77.6174 },
      { id: 'sb4', name: 'Electronic City Toll Plaza', landmark: 'Phase 1 Gate', type: 'boarding', timeOffsetMin: 80, latitude: 12.8399, longitude: 77.6770 },
      { id: 'sb5', name: 'Salem Food Court', landmark: 'Highway Plaza', type: 'rest', timeOffsetMin: 220, latitude: 11.6643, longitude: 78.1460 },
      { id: 'sb6', name: 'Lakshmi Mills / Peelamedu', landmark: 'Avinashi Road', type: 'dropping', timeOffsetMin: 360, latitude: 11.0118, longitude: 76.9856 },
      { id: 'sb7', name: 'Gandhipuram Central', landmark: 'City Center', type: 'dropping', timeOffsetMin: 390, latitude: 11.0168, longitude: 76.9558 },
    ],
  },
  {
    id: 'route-blr-maa',
    sourceCity: 'Bengaluru',
    destCity: 'Chennai',
    sourceTerminal: 'Madiwala / Indiranagar Hub',
    destTerminal: 'Koyambedu / CMBT Hub',
    distanceKm: 345,
    estimatedHours: 5.8,
    stops: [
      { id: 'bm1', name: 'Indiranagar 100ft Road', landmark: 'Metro Pillar 88', type: 'boarding', timeOffsetMin: 0, latitude: 12.9784, longitude: 77.6408 },
      { id: 'bm2', name: 'Madiwala / Silk Board', landmark: 'Silk Board Flyover', type: 'boarding', timeOffsetMin: 35, latitude: 12.9177, longitude: 77.6238 },
      { id: 'bm3', name: 'Hosur Flyover Junction', landmark: 'Bus Bay 1', type: 'boarding', timeOffsetMin: 70, latitude: 12.7409, longitude: 77.8253 },
      { id: 'bm4', name: 'Vellore Golden Temple Rest Stop', landmark: 'Food Village', type: 'rest', timeOffsetMin: 200, latitude: 12.9165, longitude: 79.1325 },
      { id: 'bm5', name: 'Sriperumbudur Toll', landmark: 'Hyundai Plant Junction', type: 'dropping', timeOffsetMin: 290, latitude: 12.9719, longitude: 79.9422 },
      { id: 'bm6', name: 'Guindy Kathipara Junction', landmark: 'Metro Concourse', type: 'dropping', timeOffsetMin: 320, latitude: 13.0067, longitude: 80.2025 },
      { id: 'bm7', name: 'Koyambedu CMBT Hub', landmark: 'Omni Terminal Gate 3', type: 'dropping', timeOffsetMin: 350, latitude: 13.0694, longitude: 80.1948 },
    ],
  },
  {
    id: 'route-maa-mdu',
    sourceCity: 'Chennai',
    destCity: 'Madurai',
    sourceTerminal: 'Koyambedu / Kilambakkam KCBT',
    destTerminal: 'Mattuthavani Omni Terminal',
    distanceKm: 460,
    estimatedHours: 7.5,
    stops: [
      { id: 'mm1', name: 'Koyambedu CMBT', landmark: 'Platform A', type: 'boarding', timeOffsetMin: 0, latitude: 13.0694, longitude: 80.1948 },
      { id: 'mm2', name: 'Kilambakkam KCBT Mega Terminal', landmark: 'Bay 12', type: 'boarding', timeOffsetMin: 45, latitude: 12.8624, longitude: 80.0827 },
      { id: 'mm3', name: 'Tindivanam Highway Hub', landmark: 'Aasife Biryani', type: 'rest', timeOffsetMin: 150, latitude: 12.2330, longitude: 79.6508 },
      { id: 'mm4', name: 'Trichy Central Toll', landmark: 'Toll Plaza Stop', type: 'dropping', timeOffsetMin: 300, latitude: 10.7905, longitude: 78.7047 },
      { id: 'mm5', name: 'Dindigul Bypass', landmark: 'Collectorate Junction', type: 'dropping', timeOffsetMin: 390, latitude: 10.3673, longitude: 77.9803 },
      { id: 'mm6', name: 'Mattuthavani Omni Terminal', landmark: 'Platform 2', type: 'dropping', timeOffsetMin: 450, latitude: 9.9463, longitude: 78.1565 },
    ],
  },
  {
    id: 'route-cbe-cok',
    sourceCity: 'Coimbatore',
    destCity: 'Kochi',
    sourceTerminal: 'Ukkadam Bus Stand',
    destTerminal: 'Vyttila Mobility Hub',
    distanceKm: 190,
    estimatedHours: 4.5,
    stops: [
      { id: 'ck1', name: 'Gandhipuram Omni Stand', landmark: 'Main Entrance', type: 'boarding', timeOffsetMin: 0, latitude: 11.0168, longitude: 76.9558 },
      { id: 'ck2', name: 'Ukkadam Bus Terminal', landmark: 'Toll Exit', type: 'boarding', timeOffsetMin: 20, latitude: 10.9916, longitude: 76.9606 },
      { id: 'ck3', name: 'Palakkad KSRTC Stand Bypass', landmark: 'Chandranagar Junction', type: 'dropping', timeOffsetMin: 90, latitude: 10.7867, longitude: 76.6548 },
      { id: 'ck4', name: 'Thrissur Round Bypass', landmark: 'Mannuthy Junction', type: 'rest', timeOffsetMin: 170, latitude: 10.5364, longitude: 76.2642 },
      { id: 'ck5', name: 'Aluva Flyover Metro Station', landmark: 'Metro Pillar 42', type: 'dropping', timeOffsetMin: 230, latitude: 10.1076, longitude: 76.3516 },
      { id: 'ck6', name: 'Vyttila Mobility Hub', landmark: 'Terminal Gate 1', type: 'dropping', timeOffsetMin: 270, latitude: 9.9676, longitude: 76.3182 },
    ],
  },
  {
    id: 'route-blr-hyd',
    sourceCity: 'Bengaluru',
    destCity: 'Hyderabad',
    sourceTerminal: 'Hebbal / Majestic Terminal',
    destTerminal: 'Gachibowli / MGBS Terminal',
    distanceKm: 570,
    estimatedHours: 8.5,
    stops: [
      { id: 'bh1', name: 'Majestic KBS Station', landmark: 'Platform 20', type: 'boarding', timeOffsetMin: 0, latitude: 12.9774, longitude: 77.5708 },
      { id: 'bh2', name: 'Hebbal Flyover Bus Bay', landmark: 'Opposite Esteem Mall', type: 'boarding', timeOffsetMin: 40, latitude: 13.0358, longitude: 77.5970 },
      { id: 'bh3', name: 'Anantapur Food Oasis', landmark: 'NH44 Midway Resort', type: 'rest', timeOffsetMin: 240, latitude: 14.6819, longitude: 77.6006 },
      { id: 'bh4', name: 'Kurnool Toll Gate', landmark: 'NH Bypass', type: 'dropping', timeOffsetMin: 360, latitude: 15.8281, longitude: 78.0373 },
      { id: 'bh5', name: 'Shamshabad Airport Junction', landmark: 'ORR Toll', type: 'dropping', timeOffsetMin: 460, latitude: 17.2403, longitude: 78.4294 },
      { id: 'bh6', name: 'Gachibowli ORR Circle', landmark: 'Outer Ring Road Exit', type: 'dropping', timeOffsetMin: 490, latitude: 17.4401, longitude: 78.3489 },
      { id: 'bh7', name: 'MGBS Central Hyderabad', landmark: 'Bay 5', type: 'dropping', timeOffsetMin: 510, latitude: 17.3784, longitude: 78.4819 },
    ],
  },
];

const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-fx-hyperline-01',
    operatorId: 'op-flashx',
    operatorName: 'FLASHX Hyperline Sovereign',
    operatorRating: 4.9,
    operatorContact: '+91 80 4499 1100',
    busNumber: 'KA-01-FX-2026',
    busName: 'Hyperline AI Titan 2.0',
    category: 'Electric Hyperliner',
    type: 'AC Sleeper (2+1)',
    totalSeats: 30,
    deckCount: 2,
    amenities: ['5G Satellite WiFi', 'Personal OLED 4K Screen', 'Active Noise-Cancelling Berths', 'N95 HEPA Air Purifier', 'Individual Climate Pod', 'Emergency Panic Shield', 'Wireless QI Fast Charging', 'Ergonomic Memory Foam'],
    cancellationPolicy: { freeCancellationHours: 6, partialRefundHours: 2, partialRefundPercent: 50 },
    isActive: true,
  },
  {
    id: 'bus-srs-titanium',
    operatorId: 'op-srs',
    operatorName: 'SRS Titanium Travel Lines',
    operatorRating: 4.8,
    operatorContact: '+91 80 2670 9999',
    busNumber: 'KA-05-AA-7890',
    busName: 'Titanium Volvo B11R Multi-Axle',
    category: 'Volvo Multi-Axle B11R',
    type: 'AC Sleeper (2+1)',
    totalSeats: 36,
    deckCount: 2,
    amenities: ['High-Speed WiFi', 'USB-C 65W PD Charging', 'Sanitized Bedding & Blanket', 'Live GPS Tracking', 'Mineral Water & Snacks', 'Reading Lamp', 'SOS Alarm'],
    cancellationPolicy: { freeCancellationHours: 8, partialRefundHours: 3, partialRefundPercent: 50 },
    isActive: true,
  },
  {
    id: 'bus-intrcity-smart',
    operatorId: 'op-intrcity',
    operatorName: 'IntrCity SmartBus AI Lounge',
    operatorRating: 4.7,
    operatorContact: '+91 99 1004 8888',
    busNumber: 'TN-38-BZ-4321',
    busName: 'SmartBus CyberGlider AC',
    category: 'IntrCity SmartBus AC',
    type: 'AC Sleeper (2+1)',
    totalSeats: 30,
    deckCount: 2,
    amenities: ['SmartBus In-Lounge Check-in', 'Private Sleeper Cabin', 'Captain Assistance', 'CCTV Security', 'GPS Real-Time Telemetry', 'Sanitized Washroom Onboard'],
    cancellationPolicy: { freeCancellationHours: 6, partialRefundHours: 2, partialRefundPercent: 40 },
    isActive: true,
  },
  {
    id: 'bus-greenline-ev',
    operatorId: 'op-greenline',
    operatorName: 'GreenLine ZeroEmission EV',
    operatorRating: 4.9,
    operatorContact: '+91 44 2828 0000',
    busNumber: 'TN-01-EV-8822',
    busName: 'GreenLine Pure Electric Sleeper',
    category: 'Electric Hyperliner',
    type: 'AC Sleeper (2+1)',
    totalSeats: 30,
    deckCount: 2,
    amenities: ['100% Zero Tailpipe Emission', 'Whisper Silent Motor', 'Eco-Pillow & Bamboo Linen', 'Solar Roof Backup', '4G WiFi', 'Child Seat Harness Ready', 'Emergency Assistance'],
    cancellationPolicy: { freeCancellationHours: 12, partialRefundHours: 4, partialRefundPercent: 60 },
    isActive: true,
  },
  {
    id: 'bus-kpn-speedster',
    operatorId: 'op-kpn',
    operatorName: 'KPN Dreamliner Express',
    operatorRating: 4.6,
    operatorContact: '+91 427 244 5555',
    busNumber: 'TN-30-CD-9012',
    busName: 'Scania Metrolink HD Executive',
    category: 'Scania Metrolink HD',
    type: 'AC Seater (2+2)',
    totalSeats: 40,
    deckCount: 1,
    amenities: ['140° Reclining Leather Seating', 'Individual AC Vents', 'Bottle Holder & Food Tray', 'USB Mobile Port', 'Emergency Exit Hammer', 'Punctuality Guarantee'],
    cancellationPolicy: { freeCancellationHours: 6, partialRefundHours: 2, partialRefundPercent: 50 },
    isActive: true,
  },
];

function generateSeatLayout(busId: string, type: string, deckCount: number): SeatData[] {
  const seats: SeatData[] = [];
  if (deckCount === 2 || type.includes('Sleeper')) {
    // 2 Decks: Lower (L) and Upper (U), 2+1 layout
    // Left side: Single berths (S1, S2, ...)
    // Right side: Double berths (D1, D2, ...)
    const rows = 5;
    for (let r = 1; r <= rows; r++) {
      // Lower Single (Window)
      seats.push({
        id: `${busId}-L-${r}A`,
        seatNumber: `L${r}A`,
        deck: 'lower',
        row: r,
        col: 1,
        type: 'sleeper',
        isWindow: true,
        isAisle: false,
        priceMultiplier: 1.05,
        status: (r === 2) ? 'booked' : 'available',
      });
      // Lower Double (Aisle & Window)
      seats.push({
        id: `${busId}-L-${r}B`,
        seatNumber: `L${r}B`,
        deck: 'lower',
        row: r,
        col: 2,
        type: 'sleeper',
        isWindow: false,
        isAisle: true,
        priceMultiplier: 1.0,
        status: (r === 4) ? 'booked' : 'available',
      });
      seats.push({
        id: `${busId}-L-${r}C`,
        seatNumber: `L${r}C`,
        deck: 'lower',
        row: r,
        col: 3,
        type: 'sleeper',
        isWindow: true,
        isAisle: false,
        priceMultiplier: 1.0,
        status: (r === 1) ? 'female_reserved' : 'available',
      });

      // Upper Single (Window)
      seats.push({
        id: `${busId}-U-${r}A`,
        seatNumber: `U${r}A`,
        deck: 'upper',
        row: r,
        col: 1,
        type: 'sleeper',
        isWindow: true,
        isAisle: false,
        priceMultiplier: 1.1,
        status: 'available',
      });
      // Upper Double
      seats.push({
        id: `${busId}-U-${r}B`,
        seatNumber: `U${r}B`,
        deck: 'upper',
        row: r,
        col: 2,
        type: 'sleeper',
        isWindow: false,
        isAisle: true,
        priceMultiplier: 1.0,
        status: (r === 3) ? 'booked' : 'available',
      });
      seats.push({
        id: `${busId}-U-${r}C`,
        seatNumber: `U${r}C`,
        deck: 'upper',
        row: r,
        col: 3,
        type: 'sleeper',
        isWindow: true,
        isAisle: false,
        priceMultiplier: 1.05,
        status: 'available',
      });
    }
  } else {
    // 1 Deck: Seater 2+2 (10 rows = 40 seats)
    const rows = 10;
    for (let r = 1; r <= rows; r++) {
      ['A', 'B', 'C', 'D'].forEach((colChar, cIndex) => {
        const isWin = colChar === 'A' || colChar === 'D';
        seats.push({
          id: `${busId}-S-${r}${colChar}`,
          seatNumber: `${r}${colChar}`,
          deck: 'lower',
          row: r,
          col: cIndex + 1,
          type: 'seater',
          isWindow: isWin,
          isAisle: !isWin,
          priceMultiplier: isWin ? 1.05 : 1.0,
          status: (r === 2 && colChar === 'A') || (r === 5 && colChar === 'C') ? 'booked' : 'available',
        });
      });
    }
  }
  return seats;
}

function generateInitialSchedules(): Schedule[] {
  const schedules: Schedule[] = [];
  const baseDate = new Date();
  
  // Create schedules for today, tomorrow, and subsequent days
  const routeBusCombinations = [
    { routeId: 'route-cbe-blr', busId: 'bus-fx-hyperline-01', depHour: 22, depMin: 30, baseFare: 1350 },
    { routeId: 'route-cbe-blr', busId: 'bus-srs-titanium', depHour: 23, depMin: 15, baseFare: 1100 },
    { routeId: 'route-cbe-blr', busId: 'bus-greenline-ev', depHour: 21, depMin: 45, baseFare: 1400 },
    { routeId: 'route-cbe-blr', busId: 'bus-kpn-speedster', depHour: 14, depMin: 0, baseFare: 750 },
    { routeId: 'route-blr-cbe', busId: 'bus-fx-hyperline-01', depHour: 23, depMin: 0, baseFare: 1350 },
    { routeId: 'route-blr-cbe', busId: 'bus-intrcity-smart', depHour: 22, depMin: 0, baseFare: 1150 },
    { routeId: 'route-blr-maa', busId: 'bus-fx-hyperline-01', depHour: 6, depMin: 30, baseFare: 1200 },
    { routeId: 'route-blr-maa', busId: 'bus-srs-titanium', depHour: 23, depMin: 30, baseFare: 980 },
    { routeId: 'route-maa-mdu', busId: 'bus-intrcity-smart', depHour: 21, depMin: 15, baseFare: 1050 },
    { routeId: 'route-cbe-cok', busId: 'bus-greenline-ev', depHour: 17, depMin: 0, baseFare: 850 },
    { routeId: 'route-blr-hyd', busId: 'bus-fx-hyperline-01', depHour: 21, depMin: 0, baseFare: 1750 },
    { routeId: 'route-blr-hyd', busId: 'bus-srs-titanium', depHour: 22, depMin: 30, baseFare: 1500 },
  ];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    routeBusCombinations.forEach((item, idx) => {
      const dep = new Date(baseDate);
      dep.setDate(dep.getDate() + dayOffset);
      dep.setHours(item.depHour, item.depMin, 0, 0);

      const route = INITIAL_ROUTES.find(r => r.id === item.routeId)!;
      const bus = INITIAL_BUSES.find(b => b.id === item.busId)!;

      const arr = new Date(dep.getTime() + route.estimatedHours * 60 * 60 * 1000);
      const isToday = dayOffset === 0;

      schedules.push({
        id: `sched-${item.routeId}-${item.busId}-d${dayOffset}-${idx}`,
        busId: bus.id,
        routeId: route.id,
        bus,
        route,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        baseFare: item.baseFare,
        availableSeatsCount: bus.totalSeats - 4, // 4 initially booked
        status: isToday && item.depHour < 12 ? 'DEPARTED' : 'SCHEDULED',
        delayMinutes: 0,
        trackingSource: 'LIVE_SIMULATED',
        occupancyRatePct: Math.round(((bus.totalSeats - 4) / bus.totalSeats) * 100),
      });
    });
  }

  return schedules;
}

const DEFAULT_LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew-150-off',
    code: 'FXMILES150',
    title: '₹150 Flat Off Next Journey',
    description: 'Instant ₹150 discount applied across all interstate AC sleeper & seater routes.',
    costMiles: 300,
    discountType: 'FIXED_AMOUNT',
    discountValue: 150,
    minFare: 500,
    icon: 'Ticket',
    category: 'DISCOUNT',
    isPopular: true,
  },
  {
    id: 'rew-300-off',
    code: 'FXMILES300',
    title: '₹300 Off Sovereign Sleeper',
    description: 'Special ₹300 subsidy for multi-axle luxury sleeper berth bookings.',
    costMiles: 550,
    discountType: 'FIXED_AMOUNT',
    discountValue: 300,
    minFare: 800,
    icon: 'Zap',
    category: 'DISCOUNT',
    isPopular: true,
  },
  {
    id: 'rew-zero-cancel',
    code: 'FXZEROCANCEL',
    title: 'Zero Cancellation & Reschedule Pass',
    description: '100% full refund guarantee on cancellation up to 2 hours before coach departure.',
    costMiles: 200,
    discountType: 'FREE_PERK',
    discountValue: 100,
    icon: 'ShieldCheck',
    category: 'VIP_PASS',
  },
  {
    id: 'rew-lounge-meal',
    code: 'FXFOODBOX',
    title: 'Salem/Vellore Highway Food & Drink Box',
    description: 'Complimentary hot meal & gourmet beverage at partner highway refreshment stops.',
    costMiles: 400,
    discountType: 'FREE_PERK',
    discountValue: 200,
    icon: 'Coffee',
    category: 'FOOD_BEVERAGE',
  },
  {
    id: 'rew-free-trip',
    code: 'FXFREETRIP',
    title: '100% Free Interstate Journey',
    description: 'Complete complimentary ticket on any corridor across southern network.',
    costMiles: 2500,
    discountType: 'FREE_TRIP',
    discountValue: 1500,
    icon: 'Sparkles',
    category: 'VIP_PASS',
  },
];

const DEFAULT_LOYALTY_MISSIONS: LoyaltyMission[] = [
  {
    id: 'mis-ev-green',
    title: 'Zero-Emission Eco Voyager',
    description: 'Complete 1 booking on GreenLine Electric Hyperliner.',
    rewardMiles: 150,
    progress: 1,
    target: 1,
    isCompleted: true,
    isClaimed: false,
    icon: 'Zap',
    badge: 'ECO-WARRIOR',
  },
  {
    id: 'mis-multi-corridor',
    title: 'Southern Highway Master',
    description: 'Book trips connecting 2 or more distinct southern cities.',
    rewardMiles: 300,
    progress: 2,
    target: 2,
    isCompleted: true,
    isClaimed: false,
    icon: 'Compass',
    badge: 'EXPLORER',
  },
  {
    id: 'mis-safety-checkin',
    title: 'FlashGuardian Sentinel',
    description: 'Perform a real-time safety status check-in while traveling.',
    rewardMiles: 100,
    progress: 1,
    target: 1,
    isCompleted: true,
    isClaimed: false,
    icon: 'Shield',
    badge: 'GUARDIAN',
  },
  {
    id: 'mis-voice-planner',
    title: 'Voice AI Commander',
    description: 'Use the Voice-to-Journey assistant to search corridors.',
    rewardMiles: 50,
    progress: 1,
    target: 1,
    isCompleted: true,
    isClaimed: false,
    icon: 'Mic',
    badge: 'AI-PIONEER',
  },
];

export class DatabaseService {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    ensureDataDirectory();
    let schema: DatabaseSchema;
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.routes && parsed.buses && parsed.schedules) {
          schema = parsed;
        } else {
          schema = this.createSeedData();
        }
      } catch (err) {
        console.error('Failed reading DB file, re-seeding:', err);
        schema = this.createSeedData();
      }
    } else {
      schema = this.createSeedData();
    }

    // Ensure system accounts for FleetOps and Admin have exact requested credentials
    const opUserIndex = schema.users.findIndex(u => u.role === 'OPERATOR');
    const operatorAccount: User = {
      id: 'usr-operator-fleetops',
      name: 'Rajesh Kannan (Fleet Operations)',
      username: 'fleetops@flashx.com',
      password: 'fleetops123$%^',
      email: 'fleetops@flashx.com',
      mobile: '+91 98940 77665',
      role: 'OPERATOR',
      operatorId: 'op-flashx',
      emergencyContacts: [],
      savedPassengers: [],
      notificationPreferences: { email: true, sms: true, inApp: true, delayAlerts: true, safetyCheckins: false },
      travelPreferences: { preferredSeatType: 'any', berthPreference: 'any', positionPreference: 'any', acPreference: 'ac' },
      createdAt: new Date().toISOString(),
    };
    if (opUserIndex !== -1) {
      schema.users[opUserIndex] = { ...schema.users[opUserIndex], ...operatorAccount };
    } else {
      schema.users.push(operatorAccount);
    }

    const adminUserIndex = schema.users.findIndex(u => u.role === 'ADMIN');
    const adminAccount: User = {
      id: 'usr-admin-systemadmin',
      name: 'Principal Systems Administrator',
      username: 'systemadmin@flashx.com',
      password: 'systemadmin123$%&',
      email: 'systemadmin@flashx.com',
      mobile: '+91 90000 00001',
      role: 'ADMIN',
      emergencyContacts: [],
      savedPassengers: [],
      notificationPreferences: { email: true, sms: true, inApp: true, delayAlerts: true, safetyCheckins: true },
      travelPreferences: { preferredSeatType: 'sleeper', berthPreference: 'lower', positionPreference: 'window', acPreference: 'ac' },
      createdAt: new Date().toISOString(),
    };
    if (adminUserIndex !== -1) {
      schema.users[adminUserIndex] = { ...schema.users[adminUserIndex], ...adminAccount };
    } else {
      schema.users.push(adminAccount);
    }

    // Remove legacy placeholder passenger demo user to enforce mandatory passenger sign-up
    schema.users = schema.users.filter(u => u.id !== 'usr-passenger-demo');

    return schema;
  }

  public createSeedData(): DatabaseSchema {
    const schedules = generateInitialSchedules();
    const seatMatrix: Record<string, SeatData[]> = {};

    schedules.forEach(sch => {
      seatMatrix[sch.id] = generateSeatLayout(sch.busId, sch.bus.type, sch.bus.deckCount);
    });

    const systemUsers: User[] = [
      {
        id: 'usr-operator-fleetops',
        name: 'Rajesh Kannan (Fleet Operations)',
        username: 'fleetops@flashx.com',
        password: 'fleetops123$%^',
        email: 'fleetops@flashx.com',
        mobile: '+91 98940 77665',
        role: 'OPERATOR',
        operatorId: 'op-flashx',
        emergencyContacts: [],
        savedPassengers: [],
        notificationPreferences: { email: true, sms: true, inApp: true, delayAlerts: true, safetyCheckins: false },
        travelPreferences: { preferredSeatType: 'any', berthPreference: 'any', positionPreference: 'any', acPreference: 'ac' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-admin-systemadmin',
        name: 'Principal Systems Administrator',
        username: 'systemadmin@flashx.com',
        password: 'systemadmin123$%&',
        email: 'systemadmin@flashx.com',
        mobile: '+91 90000 00001',
        role: 'ADMIN',
        emergencyContacts: [],
        savedPassengers: [],
        notificationPreferences: { email: true, sms: true, inApp: true, delayAlerts: true, safetyCheckins: true },
        travelPreferences: { preferredSeatType: 'sleeper', berthPreference: 'lower', positionPreference: 'window', acPreference: 'ac' },
        createdAt: new Date().toISOString(),
      },
    ];

    const initialBookings: Booking[] = [
      {
        id: 'bk-demo-001',
        bookingReference: 'FX-2026-9842',
        userId: 'usr-passenger-demo',
        passengerEmail: 'passenger@flashx.os',
        passengerMobile: '+91 98401 23456',
        scheduleId: schedules[0].id,
        busName: schedules[0].bus.busName,
        operatorName: schedules[0].bus.operatorName,
        sourceCity: schedules[0].route.sourceCity,
        destCity: schedules[0].route.destCity,
        departureTime: schedules[0].departureTime,
        arrivalTime: schedules[0].arrivalTime,
        boardingPoint: 'Gandhipuram Omni Bus Stand',
        droppingPoint: 'Madiwala St. John Hospital',
        passengers: [
          { name: 'Arjun Swaminathan', age: 29, gender: 'male', seatNumber: 'L2A', seatId: `${schedules[0].busId}-L-2A` },
        ],
        fareBreakdown: {
          baseFare: schedules[0].baseFare,
          seatCharges: 70,
          taxesGst: Math.round(schedules[0].baseFare * 0.05),
          platformFee: 25,
          discount: 100,
          totalFare: schedules[0].baseFare + 70 + Math.round(schedules[0].baseFare * 0.05) + 25 - 100,
        },
        promoCodeApplied: 'FLASHX2026',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI / Razorpay Sandbox',
        transactionId: 'TXN-RZP-98428812',
        status: 'CONFIRMED',
        ticketQrPayload: 'FX-TKT-9842-SECURE-VERIFIED',
        familyShareToken: 'ft-demo-9842',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    const initialReviews: TravelReview[] = [
      {
        id: 'rev-1',
        bookingId: 'bk-hist-01',
        busId: 'bus-fx-hyperline-01',
        userId: 'usr-passenger-demo',
        userName: 'Arjun S.',
        rating: 5,
        punctualityScore: 5,
        cleanlinessScore: 5,
        comfortScore: 5,
        comment: 'Silent electric ride on NH544. Active noise cancellation made sleeping effortless.',
        tags: ['Punctual', 'Clean Berths', 'Futuristic Tech', 'Smooth Suspension'],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'rev-2',
        bookingId: 'bk-hist-02',
        busId: 'bus-srs-titanium',
        userId: 'usr-passenger-demo',
        userName: 'Deepa V.',
        rating: 4.8,
        punctualityScore: 5,
        cleanlinessScore: 4.7,
        comfortScore: 4.8,
        comment: 'Driver followed speed telemetry strictly. Arrived in Bengaluru 10 minutes ahead of schedule.',
        tags: ['Safety First', 'Great Crew', 'Fast Charging'],
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
    ];

    const seed: DatabaseSchema = {
      users: systemUsers,
      buses: INITIAL_BUSES,
      routes: INITIAL_ROUTES,
      schedules,
      seatMatrix,
      bookings: initialBookings,
      reviews: initialReviews,
      auditLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          action: 'SYSTEM_BOOT',
          entity: 'FLASHX OS Core',
          details: 'Initialized Autonomous Travel Intelligence Operating System database with multi-corridor inventory.',
        },
      ],
      safetyCheckins: [],
      familyTokens: {
        'ft-demo-9842': { bookingId: 'bk-demo-001', expiresAt: Date.now() + 86400000 * 3, revoked: false },
      },
      loyaltyAccounts: {},
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        ensureDataDirectory();
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('Error saving flashx-db.json:', err);
      }
    }, 100);
  }

  public saveSync() {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Getters
  public getUsers(): User[] { return this.data.users; }
  public getBuses(): Bus[] { return this.data.buses; }
  public getRoutes(): BusRoute[] { return this.data.routes; }
  public getSchedules(): Schedule[] { return this.data.schedules; }
  public getBookings(): Booking[] { return this.data.bookings; }
  public getReviews(): TravelReview[] { return this.data.reviews; }
  public getAuditLogs(): SystemAuditLog[] { return this.data.auditLogs; }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByUsernameOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      (u.username && u.username.toLowerCase() === clean) || 
      (u.email && u.email.toLowerCase() === clean)
    );
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.addAuditLog(user.id, user.email, 'USER_REGISTERED', 'User', `Registered role: ${user.role}`);
    this.save();
  }

  public updateUser(user: User) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.data.users[idx] = user;
      this.save();
    }
  }

  // Seats & Concurrency-Safe Hold Engine
  public getSeatMatrix(scheduleId: string): SeatData[] {
    const seats = this.data.seatMatrix[scheduleId];
    if (!seats) {
      // Find schedule and build layout
      const sch = this.data.schedules.find(s => s.id === scheduleId);
      if (sch) {
        this.data.seatMatrix[scheduleId] = generateSeatLayout(sch.busId, sch.bus.type, sch.bus.deckCount);
        this.save();
        return this.data.seatMatrix[scheduleId];
      }
      return [];
    }

    // Auto-expire held seats if expired
    const now = Date.now();
    let updated = false;
    seats.forEach(s => {
      if (s.status === 'held' && s.heldUntil && s.heldUntil < now) {
        s.status = 'available';
        s.heldUntil = undefined;
        s.heldBySession = undefined;
        updated = true;
      }
    });

    if (updated) {
      this.save();
    }

    return seats;
  }

  public holdSeats(scheduleId: string, seatIds: string[], sessionToken: string): { success: boolean; error?: string; heldSeats?: SeatData[]; expiresAt?: number } {
    const seats = this.getSeatMatrix(scheduleId);
    if (!seats || seats.length === 0) {
      return { success: false, error: 'Schedule not found or seat matrix unavailable' };
    }

    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes hold

    // Check availability
    for (const seatId of seatIds) {
      const target = seats.find(s => s.id === seatId || s.seatNumber === seatId);
      if (!target) {
        return { success: false, error: `Seat ${seatId} does not exist on this coach` };
      }
      if (target.status === 'booked') {
        return { success: false, error: `Seat ${target.seatNumber} has already been reserved and paid for` };
      }
      if (target.status === 'held' && target.heldUntil && target.heldUntil > now && target.heldBySession !== sessionToken) {
        return { success: false, error: `Seat ${target.seatNumber} is currently held by another passenger. Please select another seat.` };
      }
    }

    // Apply hold atomically
    const heldSeats: SeatData[] = [];
    seats.forEach(s => {
      if (seatIds.includes(s.id) || seatIds.includes(s.seatNumber)) {
        s.status = 'held';
        s.heldUntil = expiresAt;
        s.heldBySession = sessionToken;
        heldSeats.push(s);
      } else if (s.heldBySession === sessionToken && !seatIds.includes(s.id) && !seatIds.includes(s.seatNumber)) {
        // Release previous seats held by this session
        s.status = 'available';
        s.heldUntil = undefined;
        s.heldBySession = undefined;
      }
    });

    this.save();
    return { success: true, heldSeats, expiresAt };
  }

  public releaseHeldSeats(scheduleId: string, sessionToken: string) {
    const seats = this.getSeatMatrix(scheduleId);
    if (!seats) return;
    seats.forEach(s => {
      if (s.heldBySession === sessionToken && s.status === 'held') {
        s.status = 'available';
        s.heldUntil = undefined;
        s.heldBySession = undefined;
      }
    });
    this.save();
  }

  // Create & Confirm Booking
  public createBooking(booking: Booking, sessionToken: string): { success: boolean; error?: string; booking?: Booking } {
    const seats = this.getSeatMatrix(booking.scheduleId);
    if (!seats) {
      return { success: false, error: 'Departure schedule not found' };
    }

    // Verify seats
    for (const p of booking.passengers) {
      const s = seats.find(st => st.id === p.seatId || st.seatNumber === p.seatNumber);
      if (!s) {
        return { success: false, error: `Seat ${p.seatNumber} was not found` };
      }
      if (s.status === 'booked') {
        return { success: false, error: `Seat ${p.seatNumber} has already been booked` };
      }
      if (s.status === 'held' && s.heldBySession && s.heldBySession !== sessionToken) {
        return { success: false, error: `Seat ${p.seatNumber} hold has expired and was taken by another user` };
      }
    }

    // Permanently mark seats as booked
    seats.forEach(s => {
      const isBookingSeat = booking.passengers.some(p => p.seatId === s.id || p.seatNumber === s.seatNumber);
      if (isBookingSeat) {
        s.status = 'booked';
        s.heldUntil = undefined;
        s.heldBySession = undefined;
      }
    });

    // Update schedule available seats count
    const sch = this.data.schedules.find(s => s.id === booking.scheduleId);
    if (sch) {
      sch.availableSeatsCount = Math.max(0, sch.availableSeatsCount - booking.passengers.length);
      sch.occupancyRatePct = Math.round(((sch.bus.totalSeats - sch.availableSeatsCount) / sch.bus.totalSeats) * 100);
    }

    // Add family share token
    if (booking.familyShareToken) {
      this.data.familyTokens[booking.familyShareToken] = {
        bookingId: booking.id,
        expiresAt: Date.now() + 86400000 * 5, // 5 days
        revoked: false,
      };
    }

    this.data.bookings.unshift(booking);
    this.addAuditLog(booking.userId, booking.passengerEmail, 'BOOKING_CONFIRMED', 'Booking', `Booking ref: ${booking.bookingReference} for ${booking.passengers.length} passenger(s) on ${booking.busName}`);
    
    // Award loyalty FlashMiles
    if (booking.userId) {
      const milesEarned = booking.fareBreakdown.totalFare;
      this.awardLoyaltyMiles(
        booking.userId,
        milesEarned,
        'TRIP_EARNED',
        `Journey Miles: ${booking.sourceCity} → ${booking.destCity}`,
        `Credited for booking ${booking.bookingReference} on ${booking.busName}`
      );
    }

    this.saveSync();

    return { success: true, booking };
  }

  public cancelBooking(bookingId: string, userId: string): { success: boolean; error?: string; refundAmount?: number } {
    const bk = this.data.bookings.find(b => b.id === bookingId);
    if (!bk) {
      return { success: false, error: 'Booking record not found' };
    }

    if (bk.status === 'CANCELLED') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    // Calculate refund based on bus cancellation policy
    const sch = this.data.schedules.find(s => s.id === bk.scheduleId);
    const depTime = new Date(bk.departureTime).getTime();
    const hoursLeft = (depTime - Date.now()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursLeft >= 6) {
      refundPercent = 100;
    } else if (hoursLeft >= 2) {
      refundPercent = 50;
    } else {
      refundPercent = 0;
    }

    const refundAmount = Math.round((bk.fareBreakdown.totalFare * refundPercent) / 100);

    bk.status = 'CANCELLED';
    bk.paymentStatus = 'REFUNDED';
    bk.refundAmount = refundAmount;
    bk.refundTimestamp = new Date().toISOString();

    // Free the seats in the matrix
    const seats = this.getSeatMatrix(bk.scheduleId);
    if (seats) {
      seats.forEach(s => {
        if (bk.passengers.some(p => p.seatId === s.id || p.seatNumber === s.seatNumber)) {
          s.status = 'available';
          s.heldUntil = undefined;
          s.heldBySession = undefined;
        }
      });
    }

    if (sch) {
      sch.availableSeatsCount = Math.min(sch.bus.totalSeats, sch.availableSeatsCount + bk.passengers.length);
      sch.occupancyRatePct = Math.round(((sch.bus.totalSeats - sch.availableSeatsCount) / sch.bus.totalSeats) * 100);
    }

    this.addAuditLog(userId, bk.passengerEmail, 'BOOKING_CANCELLED', 'Booking', `Cancelled ${bk.bookingReference}. Calculated refund: ₹${refundAmount} (${refundPercent}%)`);
    this.saveSync();

    return { success: true, refundAmount };
  }

  // Operator inventory management
  public addBus(bus: Bus) {
    this.data.buses.push(bus);
    this.addAuditLog(undefined, 'operator', 'BUS_CREATED', 'Bus', `Added coach ${bus.busNumber} (${bus.busName})`);
    this.save();
  }

  public updateBus(bus: Bus) {
    const idx = this.data.buses.findIndex(b => b.id === bus.id);
    if (idx !== -1) {
      this.data.buses[idx] = bus;
      this.save();
    }
  }

  public addSchedule(schedule: Schedule) {
    this.data.schedules.push(schedule);
    this.data.seatMatrix[schedule.id] = generateSeatLayout(schedule.busId, schedule.bus.type, schedule.bus.deckCount);
    this.addAuditLog(undefined, 'operator', 'SCHEDULE_CREATED', 'Schedule', `Created departure ${schedule.route.sourceCity} -> ${schedule.route.destCity} at ${schedule.departureTime}`);
    this.save();
  }

  public addReview(review: TravelReview) {
    this.data.reviews.unshift(review);
    this.save();
  }

  public addSafetyCheckin(record: SafetyCheckinRecord) {
    this.data.safetyCheckins.push(record);
    this.save();
  }

  public addAuditLog(userId: string | undefined, userEmail: string | undefined, action: string, entity: string, details: string) {
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      entity,
      details,
    });
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }

  public getFamilyShareStatus(token: string) {
    const entry = this.data.familyTokens[token];
    if (!entry || entry.revoked || entry.expiresAt < Date.now()) {
      return null;
    }
    const booking = this.data.bookings.find(b => b.id === entry.bookingId);
    if (!booking) return null;
    const schedule = this.data.schedules.find(s => s.id === booking.scheduleId);
    return {
      bookingReference: booking.bookingReference,
      busName: booking.busName,
      operatorName: booking.operatorName,
      sourceCity: booking.sourceCity,
      destCity: booking.destCity,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      boardingPoint: booking.boardingPoint,
      droppingPoint: booking.droppingPoint,
      status: booking.status,
      passengersCount: booking.passengers.length,
      trackingStatus: schedule?.trackingSource || 'SCHEDULED_MILESTONES',
      delayMinutes: schedule?.delayMinutes || 0,
      stops: schedule?.route?.stops || [],
    };
  }

  public revokeFamilyToken(token: string) {
    if (this.data.familyTokens[token]) {
      this.data.familyTokens[token].revoked = true;
      this.save();
    }
  }

  // ==========================================
  // LOYALTY REWARDS & FLASHMILES ENGINE
  // ==========================================

  public getLoyaltyRewards(): LoyaltyReward[] {
    return DEFAULT_LOYALTY_REWARDS;
  }

  public getLoyaltyAccount(userId: string): LoyaltyAccount {
    this.data.loyaltyAccounts = this.data.loyaltyAccounts || {};
    
    if (!this.data.loyaltyAccounts[userId]) {
      // Calculate initial miles from existing confirmed bookings
      const userBookings = this.data.bookings.filter(b => b.userId === userId && b.status === 'CONFIRMED');
      const earnedFromBookings = userBookings.reduce((sum, b) => sum + (b.fareBreakdown?.totalFare || 0), 0);
      const startingMiles = Math.max(2250, earnedFromBookings + 1400); // Set demo traveler to Gold tier by default (2250 miles, 4 tickets, 1,520 km)
      
      const ticketCount = Math.max(4, userBookings.length + 3);
      const totalDistanceKm = ticketCount * 380; // e.g. 1,520 km

      let tier: 'SILVER_CRUISER' | 'GOLD_VOYAGER' | 'PLATINUM_SOVEREIGN' = 'SILVER_CRUISER';
      let tierProgress = 0;
      let milesToNextTier = 1500;

      // Status granting based on distance, ticket count, or miles
      if (startingMiles >= 4000 || totalDistanceKm >= 3500 || ticketCount >= 8) {
        tier = 'PLATINUM_SOVEREIGN';
        tierProgress = 100;
        milesToNextTier = 0;
      } else if (startingMiles >= 1500 || totalDistanceKm >= 1200 || ticketCount >= 3) {
        tier = 'GOLD_VOYAGER';
        tierProgress = Math.min(100, Math.round(((startingMiles - 1500) / 2500) * 100) + 25);
        milesToNextTier = Math.max(0, 4000 - startingMiles);
      } else {
        tier = 'SILVER_CRUISER';
        tierProgress = Math.round((startingMiles / 1500) * 100);
        milesToNextTier = 1500 - startingMiles;
      }

      this.data.loyaltyAccounts[userId] = {
        userId,
        balance: startingMiles,
        lifetimeMiles: startingMiles,
        tier,
        tierProgress,
        milesToNextTier,
        totalDistanceKm,
        ticketCount,
        activeVouchers: [
          {
            rewardId: 'rew-150-off',
            code: 'FXWELCOME150',
            title: 'Welcome ₹150 Off Voucher',
            discountValue: 150,
            claimedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(),
            isUsed: false,
          },
        ],
        history: [
          {
            id: `tx-${Date.now()}-1`,
            userId,
            amount: startingMiles,
            type: 'TRIP_EARNED',
            title: 'Welcome & Initial Travel Miles',
            description: 'Credited for registration and first interstate corridor trips',
            createdAt: new Date().toISOString(),
          },
        ],
        missions: JSON.parse(JSON.stringify(DEFAULT_LOYALTY_MISSIONS)),
      };
      this.save();
    }

    return this.data.loyaltyAccounts[userId];
  }

  public awardLoyaltyMiles(
    userId: string,
    amount: number,
    type: 'TRIP_EARNED' | 'GREEN_EV_BONUS' | 'MISSION_BONUS' | 'REWARD_REDEEMED' | 'TIER_BONUS' | 'REVIEW_BONUS',
    title: string,
    description: string
  ): LoyaltyAccount {
    const account = this.getLoyaltyAccount(userId);
    account.balance += amount;
    if (amount > 0) {
      account.lifetimeMiles += amount;
    }

    // Recalculate tier
    if (account.lifetimeMiles >= 4000) {
      account.tier = 'PLATINUM_SOVEREIGN';
      account.tierProgress = 100;
      account.milesToNextTier = 0;
    } else if (account.lifetimeMiles >= 1500) {
      account.tier = 'GOLD_VOYAGER';
      account.tierProgress = Math.round(((account.lifetimeMiles - 1500) / 2500) * 100);
      account.milesToNextTier = 4000 - account.lifetimeMiles;
    } else {
      account.tier = 'SILVER_CRUISER';
      account.tierProgress = Math.round((account.lifetimeMiles / 1500) * 100);
      account.milesToNextTier = 1500 - account.lifetimeMiles;
    }

    account.history.unshift({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      amount,
      type,
      title,
      description,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return account;
  }

  public redeemLoyaltyReward(userId: string, rewardId: string): { success: boolean; error?: string; voucher?: any; account?: LoyaltyAccount } {
    const account = this.getLoyaltyAccount(userId);
    const reward = DEFAULT_LOYALTY_REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    if (account.balance < reward.costMiles) {
      return { success: false, error: `Insufficient FlashMiles balance. Required: ${reward.costMiles}, Available: ${account.balance}` };
    }

    // Deduct miles
    account.balance -= reward.costMiles;

    const voucherCode = `${reward.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    const voucher = {
      rewardId: reward.id,
      code: voucherCode,
      title: reward.title,
      discountValue: reward.discountValue,
      claimedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
      isUsed: false,
    };

    account.activeVouchers.unshift(voucher);
    account.history.unshift({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      amount: -reward.costMiles,
      type: 'REWARD_REDEEMED',
      title: `Redeemed ${reward.title}`,
      description: `Generated voucher code ${voucherCode} for ₹${reward.discountValue} benefit`,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return { success: true, voucher, account };
  }

  public claimLoyaltyMission(userId: string, missionId: string): { success: boolean; error?: string; rewardMiles?: number; account?: LoyaltyAccount } {
    const account = this.getLoyaltyAccount(userId);
    const mission = account.missions.find(m => m.id === missionId);
    if (!mission) {
      return { success: false, error: 'Mission not found' };
    }

    if (mission.isClaimed) {
      return { success: false, error: 'Mission reward has already been claimed' };
    }

    mission.isCompleted = true;
    mission.isClaimed = true;

    this.awardLoyaltyMiles(
      userId,
      mission.rewardMiles,
      'MISSION_BONUS',
      `Completed: ${mission.title}`,
      `Earned bonus miles for mission milestone (${mission.badge})`
    );

    return { success: true, rewardMiles: mission.rewardMiles, account };
  }
}

export const db = new DatabaseService();
