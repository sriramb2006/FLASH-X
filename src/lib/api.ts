import {
  User,
  Schedule,
  Bus,
  Booking,
  TravelReview,
  SystemAuditLog,
  JourneySuccessEvaluation,
  LoyaltyAccount,
  LoyaltyReward,
  PredictivePricingAnalysis,
} from '../../shared/types';

const API_BASE = '/api';

function getAuthHeaders(token?: string): Record<string, string> {
  const t = token || (typeof window !== 'undefined' ? localStorage.getItem('flashx_token') : null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  // Auth
  async login(credentials: { identifier?: string; email?: string; username?: string; password?: string; role?: string } | string, roleParam?: string): Promise<{ user: User; token: string }> {
    const payload = typeof credentials === 'string'
      ? { identifier: credentials, password: 'pass', expectedRole: roleParam }
      : {
          identifier: credentials.identifier || credentials.username || credentials.email,
          password: credentials.password || 'pass',
          expectedRole: credentials.role || roleParam,
        };

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('System authentication service is temporarily unavailable or returned a non-JSON format. Please try again or refresh the page.');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }
    return data;
  },

  async register(data: { name: string; username?: string; email: string; mobile: string; password?: string; role?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('System registration service is temporarily unavailable. Please try again or refresh.');
    }
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Registration failed');
    }
    return resData;
  },

  async getMe(token?: string): Promise<{ user: User }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    return res.json();
  },

  async updateProfile(user: User): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
    return res.json();
  },

  // Routes & Search
  async getLocations(): Promise<{ cities: string[]; terminals: { city: string; terminal: string }[] }> {
    const res = await fetch(`${API_BASE}/routes/locations`);
    return res.json();
  },

  async getPopularRoutes(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/routes/popular`);
    return res.json();
  },

  async searchBuses(params: Record<string, any>): Promise<{
    count: number;
    schedules: (Schedule & {
      journeySuccessScore: number;
      journeyScoreFactors: JourneySuccessEvaluation['factors'];
      intelligenceExplanations: string[];
      delayPrediction: any;
    })[];
    multiLegOption: any;
    isLiveFeed?: boolean;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/buses/search?${query.toString()}`);
    return res.json();
  },

  async getBusDetails(id: string): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses/${id}`);
    if (!res.ok) throw new Error('Bus not found');
    return res.json();
  },

  // Seats & Holds
  async getSeatsMatrix(scheduleId: string): Promise<{ scheduleId: string; seats: any[]; recommendations: any[] }> {
    const res = await fetch(`${API_BASE}/seats/matrix/${scheduleId}`);
    return res.json();
  },

  async holdSeats(scheduleId: string, seatIds: string[], sessionToken: string): Promise<{ success: boolean; heldSeats?: any[]; expiresAt?: number }> {
    const res = await fetch(`${API_BASE}/seats/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, seatIds, sessionToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to hold seat');
    return data;
  },

  async releaseSeats(scheduleId: string, sessionToken: string): Promise<void> {
    await fetch(`${API_BASE}/seats/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, sessionToken }),
    });
  },

  async getScheduleIntelligence(scheduleId: string): Promise<{
    successScore: JourneySuccessEvaluation;
    delayPrediction: any;
    seatRecommendations: any[];
    predictivePricing: PredictivePricingAnalysis;
  }> {
    const res = await fetch(`${API_BASE}/intelligence/schedule/${scheduleId}`);
    if (!res.ok) throw new Error('Failed to load schedule intelligence');
    return res.json();
  },

  // Booking & Checkout
  async checkoutBooking(payload: any): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    return data;
  },

  async getBookings(userId?: string, token?: string): Promise<Booking[]> {
    const url = userId ? `${API_BASE}/bookings?userId=${userId}` : `${API_BASE}/bookings`;
    const res = await fetch(url, { headers: getAuthHeaders(token) });
    return res.json();
  },

  async getBooking(id: string): Promise<{ booking: Booking; schedule?: Schedule }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },

  async cancelBooking(id: string, userId: string): Promise<{ success: boolean; refundAmount: number }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Cancellation failed');
    return data;
  },

  async addScrapbookEntry(bookingId: string, note: string, photoUrl: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/scrapbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, photoUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save scrapbook memory');
    return data;
  },

  async prioritizeBooking(bookingId: string, isPrioritized: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrioritized }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to prioritize booking');
    return data;
  },

  async verifyTicket(ref: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tickets/verify/${ref}`);
    return res.json();
  },

  // Intelligence & AI
  async askAiAssistant(message: string, context?: any): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });
    return res.json();
  },

  async parseVoiceIntent(transcript: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/voice-parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    return res.json();
  },

  async optimizeRoute(source: string, destination: string): Promise<any> {
    const res = await fetch(`${API_BASE}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, destination }),
    });
    if (!res.ok) throw new Error('Route optimization request failed.');
    return res.json();
  },

  // Safety & Family Tracking
  async triggerSos(bookingId?: string, userId?: string, location?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/safety/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, userId, location }),
    });
    return res.json();
  },

  async getFamilyTrack(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/family/track/${token}`);
    if (!res.ok) throw new Error('Shared track unavailable or expired');
    return res.json();
  },

  async revokeFamilyToken(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/family/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.json();
  },

  async getCityGuide(city: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/city-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city }),
    });
    if (!res.ok) throw new Error('Failed to retrieve AI city guide');
    return res.json();
  },

  // Operator & Admin
  async getOperatorOverview(token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/operator/overview`, { headers });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to load operator overview');
    }
    return res.json();
  },

  async createOperatorBus(payload: any, token?: string): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/operator/buses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add bus');
    }
    return res.json();
  },

  async updateOperatorBus(id: string, payload: any, token?: string): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/operator/buses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAdminUsers(token?: string): Promise<any[]> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/admin/users`, { headers });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to load users');
    }
    return res.json();
  },

  async getAdminMetrics(token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers });
    return res.json();
  },

  async getAuditLogs(token?: string): Promise<SystemAuditLog[]> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers });
    return res.json();
  },

  async resetDatabase(token?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/seed`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    return res.json();
  },

  async createOperatorSchedule(payload: any, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    };
    const res = await fetch(`${API_BASE}/operator/schedules`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createOperatorRoute(payload: any, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    };
    const res = await fetch(`${API_BASE}/operator/routes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create route corridor');
    return data;
  },

  // Reviews
  async getReviews(): Promise<TravelReview[]> {
    const res = await fetch(`${API_BASE}/reviews`);
    return res.json();
  },

  async submitReview(payload: any): Promise<TravelReview> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Loyalty & FlashMiles Rewards
  async getLoyaltyData(userId?: string, token?: string): Promise<{ account: LoyaltyAccount; catalog: LoyaltyReward[] }> {
    const url = userId ? `${API_BASE}/loyalty?userId=${userId}` : `${API_BASE}/loyalty`;
    const res = await fetch(url, { headers: getAuthHeaders(token) });
    return res.json();
  },

  async redeemLoyaltyReward(rewardId: string, userId?: string, token?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/loyalty/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ rewardId, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to redeem reward');
    return data;
  },

  async claimLoyaltyMission(missionId: string, userId?: string, token?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/loyalty/missions/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ missionId, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to claim mission reward');
    return data;
  },
};
