export type UserRole = 'PASSENGER' | 'OPERATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  mobile: string;
  role: UserRole;
  operatorId?: string;
  avatarUrl?: string;
  emergencyContacts: EmergencyContact[];
  savedPassengers: SavedPassenger[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    delayAlerts: boolean;
    safetyCheckins: boolean;
  };
  travelPreferences: {
    preferredSeatType: 'sleeper' | 'seater' | 'any';
    berthPreference: 'lower' | 'upper' | 'any';
    positionPreference: 'window' | 'aisle' | 'any';
    acPreference: 'ac' | 'non-ac' | 'any';
    dietaryNotes?: string;
    preferredRoutes?: Array<{ source: string; destination: string }>;
  };
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnBooking: boolean;
  notifyOnSOS: boolean;
}

export interface SavedPassenger {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  idNumber?: string;
}

export interface BusAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface RouteStop {
  id: string;
  name: string;
  landmark: string;
  type: 'boarding' | 'dropping' | 'rest';
  timeOffsetMin: number;
  latitude: number;
  longitude: number;
}

export interface BusRoute {
  id: string;
  sourceCity: string;
  destCity: string;
  sourceTerminal: string;
  destTerminal: string;
  distanceKm: number;
  estimatedHours: number;
  stops: RouteStop[];
}

export interface SeatData {
  id: string;
  seatNumber: string;
  deck: 'lower' | 'upper';
  row: number;
  col: number;
  type: 'sleeper' | 'seater';
  isWindow: boolean;
  isAisle: boolean;
  priceMultiplier: number;
  status: 'available' | 'held' | 'booked' | 'female_reserved' | 'accessible';
  heldUntil?: number;
  heldBySession?: string;
  passengerGender?: 'male' | 'female';
}

export interface Bus {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorRating: number;
  operatorContact: string;
  busNumber: string;
  busName: string;
  category: string;
  type: 'AC Sleeper (2+1)' | 'AC Seater (2+2)' | 'Luxury Multi-Axle' | 'Super Luxury';
  totalSeats: number;
  deckCount: 1 | 2;
  amenities: string[];
  cancellationPolicy: {
    freeCancellationHours: number;
    partialRefundHours: number;
    partialRefundPercent: number;
  };
  isActive: boolean;
}

export interface Schedule {
  id: string;
  busId: string;
  routeId: string;
  bus: Bus;
  route: BusRoute;
  departureTime: string; // ISO
  arrivalTime: string;   // ISO
  baseFare: number;
  availableSeatsCount: number;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'ARRIVED' | 'CANCELLED';
  delayMinutes: number;
  liveLatitude?: number;
  liveLongitude?: number;
  lastLocationUpdate?: string;
  trackingSource: 'LIVE_SIMULATED' | 'SCHEDULED_MILESTONES';
  occupancyRatePct?: number;
}

export interface SeatHoldPayload {
  scheduleId: string;
  seatIds: string[];
  holdToken?: string;
}

export interface BookingPassenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
  seatId: string;
}

export interface BookingFareBreakdown {
  baseFare: number;
  seatCharges: number;
  taxesGst: number;
  platformFee: number;
  discount: number;
  totalFare: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  passengerEmail: string;
  passengerMobile: string;
  scheduleId: string;
  busName: string;
  operatorName: string;
  sourceCity: string;
  destCity: string;
  departureTime: string;
  arrivalTime: string;
  boardingPoint: string;
  droppingPoint: string;
  passengers: BookingPassenger[];
  fareBreakdown: BookingFareBreakdown;
  promoCodeApplied?: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  transactionId: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUND_PENDING';
  ticketQrPayload: string;
  refundAmount?: number;
  refundTimestamp?: string;
  safetyCheckinStatus?: 'SCHEDULED' | 'CHECKED_IN' | 'MISSED';
  familyShareToken?: string;
  scrapbook?: { note: string; photoUrl: string; updatedAt: string }[];
  isPrioritized?: boolean;
  createdAt: string;
}

export interface SafetyCheckinRecord {
  id: string;
  bookingId: string;
  userId: string;
  timePrompted: string;
  status: 'PROMPTED' | 'CONFIRMED_SAFE' | 'ALERTED';
  note?: string;
}

export interface TravelReview {
  id: string;
  bookingId: string;
  busId: string;
  userId: string;
  userName: string;
  rating: number;
  punctualityScore: number;
  cleanlinessScore: number;
  comfortScore: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  details: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  amount: number; // positive for earned, negative for redeemed
  type: 'TRIP_EARNED' | 'GREEN_EV_BONUS' | 'MISSION_BONUS' | 'REWARD_REDEEMED' | 'TIER_BONUS' | 'REVIEW_BONUS';
  title: string;
  description: string;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  code: string;
  title: string;
  description: string;
  costMiles: number;
  discountType: 'FIXED_AMOUNT' | 'PERCENT' | 'FREE_PERK' | 'FREE_TRIP';
  discountValue: number; // e.g. 150 for ₹150 OFF
  minFare?: number;
  icon: string;
  category: 'DISCOUNT' | 'SEAT_UPGRADE' | 'FOOD_BEVERAGE' | 'VIP_PASS';
  isPopular?: boolean;
}

export interface LoyaltyMission {
  id: string;
  title: string;
  description: string;
  rewardMiles: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
  badge: string;
}

export type LoyaltyTierName = 'SILVER_CRUISER' | 'GOLD_VOYAGER' | 'PLATINUM_SOVEREIGN';

export interface LoyaltyAccount {
  userId: string;
  balance: number;
  lifetimeMiles: number;
  tier: LoyaltyTierName;
  tierProgress: number; // 0 to 100 towards next tier
  milesToNextTier: number;
  totalDistanceKm?: number;
  ticketCount?: number;
  activeVouchers: {
    rewardId: string;
    code: string;
    title: string;
    discountValue: number;
    claimedAt: string;
    expiresAt: string;
    isUsed: boolean;
  }[];
  history: LoyaltyTransaction[];
  missions: LoyaltyMission[];
}

export interface PriceTrendPoint {
  timeOffset: string;
  price: number;
  demandIndex: number;
  confidence: number;
  type: 'HISTORICAL' | 'CURRENT' | 'PROJECTED';
}

export interface PredictivePricingAnalysis {
  scheduleId: string;
  currentFare: number;
  predictedPeakFare: number;
  predictedLowestFare: number;
  recommendation: 'BOOK_NOW' | 'FAIR_PRICE' | 'WAIT_POSSIBLE_DROP';
  recommendationTitle: string;
  recommendationReason: string;
  priceUrgency: 'HIGH' | 'MODERATE' | 'LOW';
  seatsRemaining: number;
  occupancySurgeRiskPct: number;
  priceTrend: PriceTrendPoint[];
  historicalAverageFare: number;
  savingsVsPeak: number;
  demandFactor: string;
}

export interface JourneySuccessEvaluation {
  score: number; // 0-100
  factors: {
    punctualityIndex: number;
    weatherSafetyIndex: number;
    operatorReliability: number;
    comfortEquipScore: number;
    bufferFeasibility: number;
  };
  explanation: string[];
  confidence: 'High' | 'Medium' | 'Real-Time Telemetry Grounded';
}
