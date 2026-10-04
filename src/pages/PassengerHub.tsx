import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Clock,
  Shield,
  Heart,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Star,
  Gift,
  Crown,
  Contrast,
  Eye,
  Globe
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Booking, TravelReview, LoyaltyAccount } from '../../shared/types';
import { TripHistorySection } from '../components/TripHistorySection';
import { LoyaltyRewardsSection } from '../components/LoyaltyRewardsSection';
import { NotificationCenter } from '../components/NotificationCenter';
import { TripThemeCustomizer, resolveDestinationVibe, TripVibeThemeId } from '../components/TripThemeCustomizer';
import { GlobalJourneyExplorer } from '../components/GlobalJourneyExplorer';

export const PassengerHub: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { highContrast, toggleHighContrast } = useAccessibility();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'journey' | 'calendar' | 'history' | 'rewards' | 'guardian' | 'baggage' | 'worldmap' | 'dna' | 'replay' | 'flashpay'>('journey');
  const [tripVibeTheme, setTripVibeTheme] = useState<TripVibeThemeId>(() => {
    try {
      return (localStorage.getItem('flashx_trip_vibe') as TripVibeThemeId) || 'auto';
    } catch {
      return 'auto';
    }
  });
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [selectedPoiFilter, setSelectedPoiFilter] = useState<'all' | 'food' | 'toll' | 'guardian'>('all');
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<any | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<TravelReview[]>([]);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [checkinConfirmed, setCheckinConfirmed] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preferred Routes Preference states
  const [prefSource, setPrefSource] = useState('');
  const [prefDest, setPrefDest] = useState('');
  const [prefRouteSuccess, setPrefRouteSuccess] = useState('');

  // Trip Calendar states
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [selectedCalendarTrip, setSelectedCalendarTrip] = useState<Booking | null>(null);

  // Baggage Tracker Simulation states
  const [baggageTagInput, setBaggageTagInput] = useState('FX-BAG-9842');
  const [scannedBag, setScannedBag] = useState<any>({
    tagId: 'FX-BAG-9842',
    weightKg: 18.4,
    status: 'IN_TRANSIT',
    location: 'Salem Highway Cargo Bay - Sector B',
    lastScanned: '20 mins ago at Avinashi RFID Kiosk',
    tempCelsius: 19.2,
    humidityPct: 42,
    tamperSeal: 'SECURE RFID SHA-256 VERIFIED'
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = (tagId: string) => {
    setIsScanning(true);
    setBaggageTagInput(tagId);
    setTimeout(() => {
      if (tagId.includes('9842')) {
        setScannedBag({
          tagId: 'FX-BAG-9842',
          weightKg: 18.4,
          status: 'IN_TRANSIT',
          location: 'Salem Highway Cargo Bay - Sector B',
          lastScanned: '20 mins ago at Avinashi RFID Kiosk',
          tempCelsius: 19.2,
          humidityPct: 42,
          tamperSeal: 'SECURE RFID SHA-256 VERIFIED'
        });
      } else if (tagId.includes('1082')) {
        setScannedBag({
          tagId: 'FX-BAG-1082',
          weightKg: 22.1,
          status: 'CHECKED_IN',
          location: 'Terminal 2 Autonomous Bag Drop Kiosk',
          lastScanned: 'Just now (RFID Handshake Successful)',
          tempCelsius: 21.0,
          humidityPct: 45,
          tamperSeal: 'TAMPER-EVIDENCE SEAL INTACT'
        });
      } else {
        setScannedBag({
          tagId: tagId || 'FX-BAG-7721',
          weightKg: 15.0,
          status: 'AT_DESTINATION',
          location: 'Arrival Terminal Bay 4 Carousel',
          lastScanned: 'Completed 1 hour ago',
          tempCelsius: 20.5,
          humidityPct: 40,
          tamperSeal: 'READY FOR CAROUSEL RETRIEVAL'
        });
      }
      setIsScanning(false);
    }, 600);
  };

  // Load user's bookings, reviews and loyalty data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [bks, revs, loy] = await Promise.all([
          api.getBookings(user?.id),
          api.getReviews(),
          api.getLoyaltyData(user?.id).catch(() => null),
        ]);
        setBookings(bks || []);
        setReviews(revs || []);
        if (loy?.account) {
          setLoyaltyAccount(loy.account);
        }
      } catch (err) {
        console.error('Failed loading passenger hub data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Clock Ticker for animated arrival countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Primary active upcoming booking
  const activeBooking = bookings.find(b => b.status === 'CONFIRMED') || bookings[0];

  const getJourneyProgress = (booking: Booking) => {
    const start = new Date(booking.departureTime).getTime();
    const end = new Date(booking.arrivalTime).getTime();
    const total = end - start;
    if (total <= 0) return { pct: 50, remainingStr: '02h 15m 00s', status: 'In Transit' };
    
    if (nowTime < start) {
      const diff = start - nowTime;
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return { 
        pct: 0, 
        remainingStr: `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`,
        status: 'Departure Countdown'
      };
    } else if (nowTime > end) {
      return { pct: 100, remainingStr: 'Arrived Safe', status: 'Completed' };
    } else {
      const elapsed = nowTime - start;
      const pct = (elapsed / total) * 100;
      const diff = end - nowTime;
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return {
        pct,
        remainingStr: `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`,
        status: 'Arriving In'
      };
    }
  };

  const getRouteDetails = (source: string, destination: string) => {
    const srcLower = (source || '').toLowerCase();
    const destLower = (destination || '').toLowerCase();

    if (
      (srcLower.includes('coimbatore') && destLower.includes('bengaluru')) ||
      (srcLower.includes('bengaluru') && destLower.includes('coimbatore'))
    ) {
      return {
        path: 'M 40 180 Q 150 160 230 140 T 360 40',
        stops: [
          { name: 'Coimbatore Terminal', x: 40, y: 180, desc: 'Primary Electric Charging Hub', time: 'Dep 08:30' },
          { name: 'Avinashi Bypass', x: 100, y: 168, desc: 'NH544 High-Speed Corridor Waypoint', time: '09:10' },
          { name: 'Erode Junction', x: 160, y: 156, desc: 'Automated Toll Clearance Check', time: '10:05' },
          { name: 'Salem Midway Oasis', x: 230, y: 140, desc: 'Authorized Rest Stop & Crew Rotation', time: '11:15' },
          { name: 'Dharmapuri Plaza', x: 275, y: 105, desc: 'Safety Heartbeat & Speed Telemetry Sync', time: '12:30' },
          { name: 'Hosur Outpost', x: 325, y: 65, desc: 'Karnataka Border Clearance Node', time: '13:40' },
          { name: 'Bengaluru Terminal', x: 360, y: 40, desc: 'Final Destination Dropoff Bay', time: 'Arr 14:15' }
        ],
        pois: [
          { name: 'NH544 Food Court Stop', x: 130, y: 150, type: 'food' },
          { name: 'L&T Toll Gate (Salem)', x: 215, y: 125, type: 'toll' },
          { name: 'FlashGuardian Highway Rescue Station', x: 295, y: 80, type: 'guardian' }
        ]
      };
    }

    if (
      (srcLower.includes('bengaluru') && destLower.includes('chennai')) ||
      (srcLower.includes('chennai') && destLower.includes('bengaluru'))
    ) {
      return {
        path: 'M 40 40 Q 150 65 240 85 T 360 110',
        stops: [
          { name: 'Bengaluru Hub', x: 40, y: 40, desc: 'Sovereign Fleet Departure Terminal', time: 'Dep 06:00' },
          { name: 'Hosur Tollway', x: 100, y: 52, desc: 'Border FastTag Auto Gate', time: '06:45' },
          { name: 'Krishnagiri Junction', x: 165, y: 68, desc: 'NH48 Corridor Split', time: '07:50' },
          { name: 'Vellore Fort Waypoint', x: 240, y: 85, desc: 'Mid-Route Thermal Camera Audit', time: '09:20' },
          { name: 'Kanchipuram Bypass', x: 300, y: 98, desc: 'Smart Highway Speed Sensor Pit', time: '10:45' },
          { name: 'Chennai Central', x: 360, y: 110, desc: 'Arrival Terminal Bay 12', time: 'Arr 11:30' }
        ],
        pois: [
          { name: 'Saravana Bhavan Stop', x: 130, y: 55, type: 'food' },
          { name: 'Vellore Toll Plaza', x: 210, y: 78, type: 'toll' },
          { name: 'FlashX Highway Rescue Node', x: 285, y: 92, type: 'guardian' }
        ]
      };
    }

    // Default Curve Path generator for any other city combinations
    return {
      path: 'M 45 170 Q 200 120 200 100 T 355 45',
      stops: [
        { name: source || 'Boarding Hub', x: 45, y: 170, desc: 'Boarding Point Departure Terminal', time: 'Departure' },
        { name: 'Midway Halt', x: 180, y: 120, desc: 'Authorized Refreshment Hub', time: 'Halfway' },
        { name: 'Border Node', x: 280, y: 70, desc: 'Interstate Electronic Clearance Hub', time: 'Cleared' },
        { name: destination || 'Dropoff Point', x: 355, y: 45, desc: 'Dropping Point Terminal Bay', time: 'Arrival' }
      ],
      pois: [
        { name: 'Highway Oasis Fast Food', x: 150, y: 130, type: 'food' },
        { name: 'RFID Automated Toll Gate', x: 250, y: 90, type: 'toll' },
        { name: 'FlashGuardian Highway SOS Hub', x: 300, y: 60, type: 'guardian' }
      ]
    };
  };

  const handleSosTrigger = async () => {
    const confirm = window.confirm('TRIGGER EMERGENCY SOS PROTOCOL: Dispatches emergency alert to your registered emergency contacts and regional operations center. Proceed?');
    if (!confirm) return;
    try {
      await api.triggerSos(activeBooking?.id, user?.id);
      setSosActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckin = () => {
    setCheckinConfirmed(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    try {
      await api.submitReview({
        bookingId: activeBooking?.id || 'bk-direct',
        busId: 'bus-fx-hyperline-01',
        rating: newReviewRating,
        comment: newReviewText,
        tags: ['Punctual', 'Clean Berths', 'Smooth Suspension'],
      });
      setReviewSubmitted(true);
      setNewReviewText('');
      const updated = await api.getReviews();
      setReviews(updated);
    } catch (e) {
      console.error(e);
    }
  };

  // Preference update
  const handleUpdatePreference = async (key: string, val: any) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      travelPreferences: {
        ...user.travelPreferences,
        [key]: val,
      },
    };
    await updateUser(updatedUser);
  };

  const handleSelectTripVibe = (themeId: TripVibeThemeId) => {
    setTripVibeTheme(themeId);
    try {
      localStorage.setItem('flashx_trip_vibe', themeId);
    } catch (e) {
      console.warn('Could not save trip vibe theme:', e);
    }
  };

  const handleTogglePrioritize = async (bookingId: string, prioritized: boolean) => {
    try {
      await api.prioritizeBooking(bookingId, prioritized);
      const updatedBookings = await api.getBookings(user?.id);
      setBookings(updatedBookings);
    } catch (err) {
      console.error('Failed prioritizing booking:', err);
    }
  };

  const handleAddPreferredRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !prefSource.trim() || !prefDest.trim()) return;

    const currentRoutes = user.travelPreferences?.preferredRoutes || [];
    const exists = currentRoutes.some(
      r => r.source.toLowerCase() === prefSource.trim().toLowerCase() &&
           r.destination.toLowerCase() === prefDest.trim().toLowerCase()
    );

    if (exists) {
      setPrefRouteSuccess('This preferred route corridor is already registered.');
      setTimeout(() => setPrefRouteSuccess(''), 3000);
      return;
    }

    const updatedRoutes = [...currentRoutes, { source: prefSource.trim(), destination: prefDest.trim() }];
    const updatedUser = {
      ...user,
      travelPreferences: {
        ...user.travelPreferences,
        preferredRoutes: updatedRoutes
      }
    };

    try {
      await api.updateProfile(updatedUser);
      await updateUser(updatedUser);
      setPrefSource('');
      setPrefDest('');
      setPrefRouteSuccess('Preferred route saved successfully!');
      setTimeout(() => setPrefRouteSuccess(''), 3000);
    } catch (err) {
      console.error('Failed saving preferred route:', err);
    }
  };

  const handleRemovePreferredRoute = async (index: number) => {
    if (!user) return;
    const currentRoutes = user.travelPreferences?.preferredRoutes || [];
    const updatedRoutes = currentRoutes.filter((_, idx) => idx !== index);

    const updatedUser = {
      ...user,
      travelPreferences: {
        ...user.travelPreferences,
        preferredRoutes: updatedRoutes
      }
    };

    try {
      await api.updateProfile(updatedUser);
      await updateUser(updatedUser);
    } catch (err) {
      console.error('Failed removing preferred route:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Profile Strip */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E7CB58] to-amber-600 flex items-center justify-center text-black font-display font-extrabold text-xl shadow-lg">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">{user?.name || 'Passenger Traveler'}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  {user?.role === 'ADMIN' ? 'SYSADMIN AUDIT PERSPECTIVE' : 'VERIFIED TRAVELER'}
                </span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-0.5 flex flex-wrap items-center gap-3">
                <span>{user?.email}</span>
                <span>•</span>
                <span>{user?.mobile}</span>
                <span>•</span>
                <span className="text-[#E7CB58]">{bookings.length} Registered Bookings</span>
              </div>
            </div>
          </div>

          {/* Right: Loyalty Status Widget & Quick Action */}
          <div className="flex flex-wrap items-center gap-3">
            {loyaltyAccount && (
              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className="p-3 rounded-2xl bg-black/50 border border-[#E7CB58]/30 hover:border-[#E7CB58] transition-all text-left space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between space-x-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                    <Crown className={`w-3 h-3 ${loyaltyAccount.tier === 'PLATINUM_SOVEREIGN' ? 'text-purple-400' : loyaltyAccount.tier === 'GOLD_VOYAGER' ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span>{loyaltyAccount.tier === 'PLATINUM_SOVEREIGN' ? 'Platinum' : loyaltyAccount.tier === 'GOLD_VOYAGER' ? 'Gold' : 'Silver'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#E7CB58] group-hover:underline">
                    {loyaltyAccount.balance.toLocaleString()} Miles
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${loyaltyAccount.tier === 'PLATINUM_SOVEREIGN' ? 'from-purple-500 to-indigo-500' : loyaltyAccount.tier === 'GOLD_VOYAGER' ? 'from-[#E7CB58] to-amber-400' : 'from-gray-400 to-gray-300'}`}
                      style={{ width: `${Math.max(10, loyaltyAccount.tierProgress)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-300 font-mono">
                    {loyaltyAccount.tierProgress}% to {loyaltyAccount.tier === 'PLATINUM_SOVEREIGN' ? 'Elite' : loyaltyAccount.tier === 'GOLD_VOYAGER' ? 'Platinum' : 'Gold'}
                  </span>
                </div>
              </button>
            )}

            <Link
              to="/search"
              className="px-4 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors flex items-center space-x-1.5 shadow-md shadow-amber-500/10"
            >
              <Compass className="w-4 h-4" />
              <span>Book New Journey</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar text-xs font-mono">
          {[
            { id: 'journey', label: 'Active Journey Telemetry', icon: Compass },
            { id: 'baggage', label: 'Baggage Tracker', icon: Shield },
            { id: 'worldmap', label: 'Global Journey Explorer', icon: Globe },
            { id: 'calendar', label: 'Trip Calendar', icon: Calendar },
            { id: 'history', label: `Trip History (${bookings.length})`, icon: Calendar },
            { id: 'rewards', label: 'FlashRewards™ Loyalty', icon: Gift },
            { id: 'guardian', label: 'FlashGuardian™ Safety', icon: Shield },
            { id: 'dna', label: 'FlashDNA™ Preferences', icon: Heart },
            { id: 'replay', label: 'FlashReplay™ Memory', icon: TrendingUp },
            { id: 'flashpay', label: 'FlashPay™ Wallet', icon: Gift },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-[#E7CB58] text-black font-bold shadow-lg shadow-amber-500/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: ACTIVE JOURNEY TELEMETRY & FLASHTIMELINE
           ======================================================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {activeBooking ? (() => {
              const activeVibe = resolveDestinationVibe(activeBooking.destCity, tripVibeTheme);

              return (
                <div className="space-y-6">
                  {/* Destination Vibe Customization Tool */}
                  <TripThemeCustomizer
                    currentTheme={tripVibeTheme}
                    destinationCity={activeBooking.destCity}
                    onSelectTheme={handleSelectTripVibe}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: Journey Monitor Card with Destination Vibe Theme */}
                    <div className={`lg:col-span-8 bg-gradient-to-br ${activeVibe.bgGradient} border ${activeVibe.cardBorder} rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden transition-all duration-500`}>
                      
                      {/* Destination Vibe Ambient Watermark */}
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl select-none">
                        {activeVibe.emoji}
                      </div>

                      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-2 relative z-10">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-gray-400 uppercase">Active Corridor Transit</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeVibe.badgeBg} ${activeVibe.badgeText} ${activeVibe.badgeBorder} font-bold font-mono`}>
                              {activeVibe.emoji} {activeVibe.name}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                            {activeBooking.sourceCity} ⇄ {activeBooking.destCity}
                          </h2>
                          <div className={`text-xs ${activeVibe.accentText} font-mono mt-0.5 font-bold flex items-center space-x-2`}>
                            <span>{activeBooking.busName} ({activeBooking.operatorName})</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-300 text-[11px] font-normal">{activeVibe.tagline}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>SCHEDULED / IN TRANSIT</span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-1">Ref: {activeBooking.bookingReference}</div>
                        </div>
                      </div>

                      {/* Stateful Interactive SVG Route Map & Live Timer */}
                      {(() => {
                        const progress = getJourneyProgress(activeBooking);
                        const route = getRouteDetails(activeBooking.sourceCity, activeBooking.destCity);

                        // Calculate active bus coordinates on SVG path
                        const findBusCoordinate = (pct: number) => {
                          if (pct <= 0) return { x: route.stops[0].x, y: route.stops[0].y };
                          if (pct >= 100) return { x: route.stops[route.stops.length - 1].x, y: route.stops[route.stops.length - 1].y };

                          const stopsCount = route.stops.length;
                          const index = Math.min(stopsCount - 2, Math.floor((pct / 100) * (stopsCount - 1)));
                          const partPct = (pct / 100 * (stopsCount - 1)) - index;

                          const pA = route.stops[index];
                          const pB = route.stops[index + 1];

                          return {
                            x: pA.x + (pB.x - pA.x) * partPct,
                            y: pA.y + (pB.y - pA.y) * partPct
                          };
                        };

                        const busPos = findBusCoordinate(progress.pct);

                        return (
                          <div className="bg-black/40 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur-sm">
                            
                            {/* Live Telemetry Arrival Panel */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/5 pb-4 items-center">
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">TELEMETRY MODE</span>
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">Live GPS Stream</span>
                                </div>
                              </div>

                              {/* Countdown arrival timer */}
                              <div className={`text-center ${activeVibe.accentBg} border ${activeVibe.cardBorder} p-2.5 rounded-2xl`}>
                                <span className="text-[10px] font-mono text-gray-300 uppercase block tracking-wider">{progress.status}</span>
                                <div className={`text-lg font-mono font-extrabold ${activeVibe.accentText} tracking-widest mt-0.5 tabular-nums`}>
                                  {progress.remainingStr}
                                </div>
                              </div>

                              <div className="text-right space-y-0.5 font-mono">
                                <span className="text-[9px] text-gray-400 uppercase tracking-widest block">JOURNEY PROGRESS</span>
                                <div className="text-xs text-gray-200">
                                  <span className="font-bold text-white">{Math.round(progress.pct)}%</span> Elapsed
                                </div>
                              </div>
                            </div>

                            {/* Interactive Filtering Options for Map POIs */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                              <span className="text-[10px] font-mono text-gray-400 pl-2">Filter POI Pins:</span>
                              <div className="flex items-center space-x-1">
                                {(['all', 'food', 'toll', 'guardian'] as const).map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedPoiFilter(type)}
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-colors ${
                                      selectedPoiFilter === type
                                        ? `${activeVibe.accentBg} ${activeVibe.accentText} border ${activeVibe.cardBorder}`
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                                  >
                                    {type === 'all' ? 'Show All' : type === 'food' ? '🍔 Rest Stops' : type === 'toll' ? '🎫 Toll Gates' : '🛡️ Guardian'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Interactive SVG Map Visualizer Container */}
                            <div className="relative w-full h-[240px] bg-[#0c0d11]/90 rounded-2xl border border-white/10 overflow-hidden">
                              
                              {/* Map Grid Background */}
                              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #3b2b73 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                              {/* Live Speed / Compass overlay */}
                              <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-black/80 border border-white/15 rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-gray-300 pointer-events-none z-10">
                                <span className={`${activeVibe.accentText} font-bold animate-pulse`}>84 KM/H</span>
                                <span className="text-gray-600">|</span>
                                <span>Heading North-East</span>
                              </div>

                              <div className="absolute bottom-3 right-3 bg-black/80 border border-white/15 rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-gray-300 pointer-events-none z-10">
                                Vibe: <span className={`${activeVibe.accentText} font-bold`}>{activeVibe.name}</span>
                              </div>

                              {/* Actual Vector SVG Canvas */}
                              <svg className="w-full h-full p-6" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                                
                                {/* Road Track Glow Path */}
                                <path
                                  d={route.path}
                                  fill="none"
                                  stroke={activeVibe.pathStroke}
                                  strokeOpacity="0.18"
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                />

                                {/* Main highway route vector path */}
                                <path
                                  d={route.path}
                                  fill="none"
                                  stroke="rgba(255, 255, 255, 0.18)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeDasharray="5,5"
                                />

                                {/* Elapsed route travel trail */}
                                <path
                                  d={route.path}
                                  fill="none"
                                  stroke={activeVibe.pathStroke}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeDasharray={400}
                                  strokeDashoffset={400 - (400 * progress.pct / 100)}
                                  className="transition-all duration-1000 ease-out"
                                />

                                {/* Render Filtered Highway POI Pins */}
                                {route.pois
                                  .filter(poi => selectedPoiFilter === 'all' || poi.type === selectedPoiFilter)
                                  .map((poi, idx) => {
                                    const isFood = poi.type === 'food';
                                    const isToll = poi.type === 'toll';
                                    const pinColor = isFood ? '#f59e0b' : isToll ? '#3b82f6' : '#ec4899';
                                    
                                    return (
                                      <g
                                        key={idx}
                                        transform={`translate(${poi.x}, ${poi.y})`}
                                        className="cursor-help"
                                        onMouseEnter={() => setHoveredPoi(poi)}
                                        onMouseLeave={() => setHoveredPoi(null)}
                                      >
                                        <circle r="4" fill={pinColor} className="animate-pulse" />
                                        <circle r="2" fill="#fff" />
                                        <title>{poi.name} ({poi.type.toUpperCase()})</title>
                                      </g>
                                    );
                                  })}

                                {/* Render Corridor Checkpoint stops along route */}
                                {route.stops.map((stop, sIdx) => {
                                  const isStopActive = sIdx === activeStopIndex;
                                  const isPassed = (sIdx / (route.stops.length - 1)) * 100 < progress.pct;
                                  const isCurrentDestination = sIdx === route.stops.length - 1;

                                  return (
                                    <g
                                      key={sIdx}
                                      transform={`translate(${stop.x}, ${stop.y})`}
                                      className="cursor-pointer group"
                                      onClick={() => setActiveStopIndex(isStopActive ? null : sIdx)}
                                    >
                                      {isStopActive && (
                                        <circle r="12" fill={activeVibe.pathStroke} fillOpacity="0.25" className="animate-ping" />
                                      )}

                                      <circle
                                        r={isCurrentDestination ? "7" : "5.5"}
                                        fill={isStopActive ? activeVibe.busColor : isPassed ? '#10b981' : '#1e293b'}
                                        stroke={isStopActive ? '#fff' : isPassed ? '#4ade80' : 'rgba(255,255,255,0.4)'}
                                        strokeWidth="1.5"
                                        className="transition-colors duration-300"
                                      />

                                      {isCurrentDestination && (
                                        <circle r="3" fill="#fff" />
                                      )}

                                      {/* Stop Labels */}
                                      <text
                                        y={sIdx % 2 === 0 ? "-12" : "16"}
                                        textAnchor="middle"
                                        fill={isStopActive ? activeVibe.busColor : isPassed ? '#a7f3d0' : '#94a3b8'}
                                        className="text-[7.5px] font-mono font-bold select-none transition-colors"
                                      >
                                        {stop.name.split(' ')[0]}
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Animated Moving Bus Indicator */}
                                {progress.pct > 0 && progress.pct < 100 && (
                                  <g transform={`translate(${busPos.x}, ${busPos.y})`}>
                                    <circle r="8.5" fill={activeVibe.busColor} fillOpacity="0.25" className="animate-ping" />
                                    <circle r="6" fill={activeVibe.busColor} stroke="#000" strokeWidth="1" />
                                    <rect x="-3" y="-2" width="6" height="4" rx="1" fill="#000" />
                                    <circle cx="-1.5" cy="2" r="0.8" fill="#fff" />
                                    <circle cx="1.5" cy="2" r="0.8" fill="#fff" />
                                  </g>
                                )}

                              </svg>

                              {/* Hover POI Tooltip Overlay */}
                              {hoveredPoi && (
                                <div className="absolute top-2 right-2 bg-black/90 border border-white/10 px-3 py-1.5 rounded-xl text-[9px] font-mono text-gray-200 shadow-xl pointer-events-none">
                                  <span className={`${activeVibe.accentText} font-bold`}>📍 POI Pinpoint:</span> {hoveredPoi.name}
                                  <span className="block text-gray-500 text-[8px] uppercase font-semibold mt-0.5">{hoveredPoi.type} amenity on highway</span>
                                </div>
                              )}

                            </div>

                            {/* Checkpoint Detail Card (Triggered by clicking stops on map) */}
                            {activeStopIndex !== null ? (
                              <div className="p-3 bg-black/50 border border-white/15 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`w-2 h-2 rounded-full ${activeVibe.accentBg}`} />
                                    <h4 className="text-xs font-bold text-white">
                                      {route.stops[activeStopIndex].name}
                                    </h4>
                                    <span className={`text-[9px] px-1.5 rounded font-mono ${activeVibe.accentText} bg-white/10`}>
                                      {route.stops[activeStopIndex].time}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-300">{route.stops[activeStopIndex].desc}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveStopIndex(null)}
                                  className="text-gray-400 hover:text-white font-mono text-[10px]"
                                >
                                  [Close]
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] font-mono text-gray-400 text-center">
                                * Click any checkpoint terminal on the route map above to view scheduled milestones and waypoint telemetries.
                              </div>
                            )}

                        {/* Summary / ETA Footer */}
                        <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-3 text-gray-400 gap-3">
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-[#E7CB58]" />
                            <span>Departed: {new Date(activeBooking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          <span className="text-emerald-400">⚡ FastTag cleared</span>
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span>ETA: {new Date(activeBooking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>

                      </div>
                    );
                  })()}

                  {/* FlashTimeline End-to-End Milestone Schedule */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-mono text-[#E7CB58] uppercase tracking-wider">
                      <Clock className="w-4 h-4" />
                      <span>FlashTimeline™ End-to-End Orchestration</span>
                    </div>

                    <div className="space-y-3 relative pl-6 border-l-2 border-white/10 text-xs">
                      
                      {/* Milestone 1 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-[#16181F]" />
                        <div className="text-white font-semibold">T-3 Hours: Pre-Trip Packing & Luggage Notice</div>
                        <div className="text-gray-400 text-[11px]">HEPA purifiers pre-cycled on bus. Berth chargers verified.</div>
                      </div>

                      {/* Milestone 2 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-[#16181F]" />
                        <div className="text-white font-semibold">T-30 Min: Terminal Boarding Call (Bay 4)</div>
                        <div className="text-gray-400 text-[11px]">{activeBooking.boardingPoint} • Photo ID required at scanner.</div>
                      </div>

                      {/* Milestone 3 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#E7CB58] ring-4 ring-[#16181F]" />
                        <div className="text-white font-semibold">Scheduled Departure: {new Date(activeBooking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-400 text-[11px]">FASTag automated highway electronic toll pass clearing.</div>
                      </div>

                      {/* Milestone 4 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-purple-400 ring-4 ring-[#16181F]" />
                        <div className="text-white font-semibold">En-Route Rest Stop (Salem Highway Oasis - 25 min)</div>
                        <div className="text-gray-400 text-[11px]">Sanitized rest facilities and driver rotation point.</div>
                      </div>

                      {/* Milestone 5 */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-[#16181F]" />
                        <div className="text-white font-semibold">Estimated Arrival: {new Date(activeBooking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-400 text-[11px]">Terminal: {activeBooking.droppingPoint}</div>
                      </div>

                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <Link
                      to={`/tickets/${activeBooking.id}`}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center space-x-2"
                    >
                      <span>View Official Digital Boarding Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>

                {/* Right: Quick Action & Safety Panel */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <NotificationCenter booking={activeBooking} />

                  {/* Safety Check-in Action Box */}
                  <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 text-pink-400 text-xs font-mono uppercase tracking-wider">
                      <Shield className="w-4 h-4" />
                      <span>FlashGuardian™ Check-in</span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Periodic safety heartbeat. Confirming your status pings your registered emergency contact ({user?.emergencyContacts[0]?.name || 'Primary Contact'}).
                    </p>

                    <button
                      type="button"
                      onClick={handleCheckin}
                      disabled={checkinConfirmed}
                      className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 ${
                        checkinConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20 hover:scale-[1.02]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{checkinConfirmed ? '✓ Status Verified Safe' : 'I Am Safe — Check In Now'}</span>
                    </button>

                    {/* SOS Emergency Button */}
                    <div className="pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleSosTrigger}
                        className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>{sosActive ? 'EMERGENCY DISPATCH ACTIVE' : 'Trigger SOS Alert (Emergency)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Family Share Card */}
                  {activeBooking.familyShareToken && (
                    <div className="bg-[#16181F] border border-purple-500/30 rounded-3xl p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-purple-300 text-xs font-mono uppercase">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Family Travel Monitor™ Link</span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Share this consent-safe link with parents or spouse to let them follow your bus on the corridor without ticket secrets.
                      </p>
                      <Link
                        to={`/track/${activeBooking.familyShareToken}`}
                        target="_blank"
                        className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center justify-center space-x-2 transition-colors"
                      >
                        <span>Preview Family Tracking View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                </div>

              </div>
            </div>
            );
          })() : (
            <div className="p-12 text-center rounded-3xl bg-[#16181F] border border-white/10 space-y-3">
                <Compass className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No active trips currently scheduled</h3>
                <p className="text-xs text-gray-400">Book an intercity coach to orchestrate your journey telemetry.</p>
                <Link
                  to="/search"
                  className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold"
                >
                  Explore Corridors
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: TRIP CALENDAR VIEW
           ======================================================== */}
        {activeTab === 'calendar' && (() => {
          // Compute Days of Current Month
          const year = calendarDate.getFullYear();
          const month = calendarDate.getMonth();
          
          const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
          const totalDays = new Date(year, month + 1, 0).getDate();
          
          // Get name of Month
          const monthName = calendarDate.toLocaleString('default', { month: 'long' });
          
          // Monthly days grid
          const daysArray = [];
          // Prepend padding days from previous month
          for (let i = 0; i < firstDayIndex; i++) {
            daysArray.push(null);
          }
          // Populate current month days
          for (let d = 1; d <= totalDays; d++) {
            daysArray.push(d);
          }

          // Compute Days of Current Week
          const currentWeekDays = [];
          const startOfCurrentWeek = new Date(calendarDate);
          // Find Sunday of the current week
          startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay());
          for (let i = 0; i < 7; i++) {
            const tempDay = new Date(startOfCurrentWeek);
            tempDay.setDate(startOfCurrentWeek.getDate() + i);
            currentWeekDays.push(tempDay);
          }

          // Filter bookings matching a specific date
          const getTripsForDate = (dateObj: Date) => {
            return bookings.filter(b => {
              const depDate = new Date(b.departureTime);
              return depDate.getFullYear() === dateObj.getFullYear() &&
                     depDate.getMonth() === dateObj.getMonth() &&
                     depDate.getDate() === dateObj.getDate() &&
                     b.status === 'CONFIRMED';
            });
          };

          const handlePrev = () => {
            if (calendarView === 'month') {
              setCalendarDate(new Date(year, month - 1, 1));
            } else {
              const prevWeek = new Date(calendarDate);
              prevWeek.setDate(prevWeek.getDate() - 7);
              setCalendarDate(prevWeek);
            }
          };

          const handleNext = () => {
            if (calendarView === 'month') {
              setCalendarDate(new Date(year, month + 1, 1));
            } else {
              const nextWeek = new Date(calendarDate);
              nextWeek.setDate(nextWeek.getDate() + 7);
              setCalendarDate(nextWeek);
            }
          };

          const handleToday = () => {
            setCalendarDate(new Date(2026, 9, 4)); // Reset to user's perspective date (Oct 4, 2026)
          };

          return (
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              
              {/* Calendar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#E7CB58]" />
                    <h2 className="text-xl font-display font-bold text-white">Visual Trip Scheduler</h2>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    Track and orchestrate your regional corridor schedules across dates.
                  </p>
                </div>

                {/* View selectors & Navigators */}
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                  {/* Monthly vs Weekly Selector */}
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                    <button
                      onClick={() => setCalendarView('month')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        calendarView === 'month' ? 'bg-[#E7CB58] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Month View
                    </button>
                    <button
                      onClick={() => setCalendarView('week')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        calendarView === 'week' ? 'bg-[#E7CB58] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Week View
                    </button>
                  </div>

                  {/* Month Switcher Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-colors cursor-pointer"
                    >
                      ◀
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E7CB58] font-bold font-mono transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <span className="text-white font-bold px-1.5 min-w-[120px] text-center uppercase tracking-wider">
                      {calendarView === 'month' ? `${monthName} ${year}` : `Wk: ${startOfCurrentWeek.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-colors cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>

              {calendarView === 'month' ? (
                /* ================= MONTHLY CALENDAR GRID ================= */
                <div className="space-y-4">
                  {/* Days header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar Matrix */}
                  <div className="grid grid-cols-7 gap-2">
                    {daysArray.map((day, idx) => {
                      if (day === null) {
                        return <div key={`pad-${idx}`} className="min-h-[90px] rounded-2xl bg-black/10 border border-transparent" />;
                      }

                      const cellDate = new Date(year, month, day);
                      const isToday = day === 4 && month === 9 && year === 2026; // Oct 4, 2026 perspective
                      const cellTrips = getTripsForDate(cellDate);

                      return (
                        <div
                          key={`day-${day}`}
                          className={`min-h-[95px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                            isToday
                              ? 'bg-amber-950/20 border-[#E7CB58] shadow-md shadow-amber-500/5'
                              : 'bg-black/25 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {/* Day count marker */}
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-mono font-bold ${isToday ? 'text-[#E7CB58]' : 'text-gray-400'}`}>
                              {day}
                            </span>
                            {isToday && (
                              <span className="text-[8px] bg-[#E7CB58] text-black font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono">
                                Today
                              </span>
                            )}
                          </div>

                          {/* Trips container */}
                          <div className="mt-1 space-y-1.5 flex-1 flex flex-col justify-end">
                            {cellTrips.map(trip => (
                              <button
                                key={trip.id}
                                onClick={() => setSelectedCalendarTrip(trip)}
                                className="w-full text-left p-1.5 rounded-lg bg-[#E7CB58]/10 border border-[#E7CB58]/20 hover:border-[#E7CB58]/50 text-[#E7CB58] transition-all cursor-pointer group"
                              >
                                <div className="text-[9px] font-bold leading-tight truncate group-hover:underline">
                                  {trip.sourceCity.slice(0, 3)} ➔ {trip.destCity.slice(0, 3)}
                                </div>
                                <div className="text-[8px] text-gray-400 font-mono scale-[0.9] origin-left mt-0.5">
                                  {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ================= WEEKLY CALENDAR LIST ================= */
                <div className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {currentWeekDays.map((dateObj, idx) => {
                      const isToday = dateObj.getDate() === 4 && dateObj.getMonth() === 9 && dateObj.getFullYear() === 2026;
                      const cellTrips = getTripsForDate(dateObj);
                      const dayLabel = dateObj.toLocaleDateString('default', { weekday: 'short' });

                      return (
                        <div
                          key={`week-day-${idx}`}
                          className={`p-3.5 rounded-2xl border transition-all space-y-3 min-h-[160px] flex flex-col justify-between ${
                            isToday
                              ? 'bg-amber-950/20 border-[#E7CB58] shadow-md shadow-amber-500/5'
                              : 'bg-black/25 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <div>
                              <div className={`text-xs font-bold ${isToday ? 'text-[#E7CB58]' : 'text-white'}`}>
                                {dayLabel}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            {isToday && (
                              <span className="text-[8px] bg-[#E7CB58] text-black font-bold px-1.5 py-0.2 rounded uppercase">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 flex-1 flex flex-col justify-end">
                            {cellTrips.length === 0 ? (
                              <div className="text-[10px] text-gray-600 italic text-center py-4">No trips</div>
                            ) : (
                              cellTrips.map(trip => (
                                <button
                                  key={trip.id}
                                  onClick={() => setSelectedCalendarTrip(trip)}
                                  className="w-full text-left p-2 rounded-xl bg-[#E7CB58]/10 border border-[#E7CB58]/20 hover:border-[#E7CB58]/50 text-[#E7CB58] transition-all cursor-pointer group"
                                >
                                  <div className="text-[10px] font-bold leading-snug group-hover:underline">
                                    {trip.sourceCity} ➔ {trip.destCity}
                                  </div>
                                  <div className="text-[9px] text-gray-400 mt-0.5">
                                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-[8px] text-gray-500 truncate mt-0.5">
                                    {trip.busName}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Trip Details Drawer / Panel */}
              {selectedCalendarTrip && (
                <div className="p-5 rounded-2xl bg-black/40 border border-[#E7CB58]/20 space-y-4 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                        RESERVATION DETAILS
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {selectedCalendarTrip.sourceCity} ➔ {selectedCalendarTrip.destCity}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Coach Equipment: {selectedCalendarTrip.busName} ({selectedCalendarTrip.operatorName})
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCalendarTrip(null)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-gray-300">
                    <div className="bg-[#16181F] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase block">Boarding Point</span>
                      <span className="font-semibold text-white">{selectedCalendarTrip.boardingPoint}</span>
                      <span className="text-[10px] text-amber-300 block">
                        {new Date(selectedCalendarTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="bg-[#16181F] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase block">Dropping Terminal</span>
                      <span className="font-semibold text-white">{selectedCalendarTrip.droppingPoint}</span>
                      <span className="text-[10px] text-cyan-300 block">
                        {new Date(selectedCalendarTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="bg-[#16181F] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase block">Berth Details</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedCalendarTrip.passengers.map(p => (
                          <span key={p.seatNumber} className="px-1.5 py-0.5 rounded bg-[#E7CB58] text-black text-[10px] font-bold">
                            {p.seatNumber}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-emerald-400 block font-semibold mt-1">Paid ₹{selectedCalendarTrip.fareBreakdown.totalFare}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      to={`/tickets/${selectedCalendarTrip.id}`}
                      className="px-4 py-2 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black text-xs font-bold font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <span>Retrieve Boarding Pass & QR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* ========================================================
            TAB: BAGGAGE TRACKER MODULE & BARCODE SIMULATOR
           ======================================================== */}
        {activeTab === 'baggage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            
            {/* Left: Barcode Scanner Simulator */}
            <div className="lg:col-span-5 bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-amber-500/10 text-[#E7CB58]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">Smart Baggage Scanner™</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">RFID Barcode & Cargo Telemetry Station</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-mono uppercase text-gray-400 block">Simulate RFID Barcode Tag Scan:</label>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={baggageTagInput}
                    onChange={(e) => setBaggageTagInput(e.target.value)}
                    placeholder="e.g. FX-BAG-9842"
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#E7CB58]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSimulateScan(baggageTagInput)}
                    disabled={isScanning}
                    className="px-4 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-semibold text-xs font-mono transition-colors"
                  >
                    {isScanning ? 'Scanning...' : 'Scan Tag'}
                  </button>
                </div>

                {/* Quick Quick-Select Sample Tags */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Quick Select Active Luggage Tags:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { tag: 'FX-BAG-9842', route: 'Coimbatore ➔ Bengaluru (Lower Deck Bay B)', weight: '18.4 kg' },
                      { tag: 'FX-BAG-1082', route: 'Bengaluru ➔ Chennai (Terminal Drop)', weight: '22.1 kg' },
                      { tag: 'FX-BAG-3301', route: 'Chennai ➔ Madurai (Carousel 4)', weight: '15.0 kg' }
                    ].map((sample) => (
                      <button
                        key={sample.tag}
                        type="button"
                        onClick={() => handleSimulateScan(sample.tag)}
                        className={`p-3 rounded-xl border text-left font-mono transition-all flex items-center justify-between ${
                          scannedBag.tagId === sample.tag
                            ? 'bg-[#E7CB58]/15 border-[#E7CB58] text-white shadow'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#E7CB58] text-xs">{sample.tag}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{sample.route}</div>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-black/40 px-2 py-1 rounded">{sample.weight}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barcode Graphic Animation */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 text-center space-y-2">
                <div className="tracking-[0.4em] font-mono font-bold text-lg text-gray-300">
                  ||| | |||| || ||| | ||||
                </div>
                <span className="text-[9px] font-mono text-gray-500 uppercase">Laser RFID Sensor Matrix Active</span>
              </div>
            </div>

            {/* Right: Detailed Baggage Status Telemetry */}
            <div className="lg:col-span-7 bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-[#E7CB58] uppercase block">Scanned Luggage Profile</span>
                  <h3 className="text-xl font-display font-bold text-white mt-0.5">{scannedBag.tagId}</h3>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border inline-block ${
                    scannedBag.status === 'IN_TRANSIT'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : scannedBag.status === 'CHECKED_IN'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {scannedBag.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-1">Weight: {scannedBag.weightKg} kg</span>
                </div>
              </div>

              {/* Compartment & Environmental Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase block">Cargo Temperature</span>
                  <div className="text-base font-bold text-cyan-400">{scannedBag.tempCelsius}°C</div>
                  <span className="text-[10px] text-gray-400">Climate Controlled Hold</span>
                </div>

                <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase block">Hold Humidity</span>
                  <div className="text-base font-bold text-purple-400">{scannedBag.humidityPct}%</div>
                  <span className="text-[10px] text-gray-400">Optimal Range</span>
                </div>

                <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase block">Tamper Seal Hash</span>
                  <div className="text-[11px] font-bold text-emerald-400 truncate">{scannedBag.tamperSeal}</div>
                  <span className="text-[10px] text-gray-400">Blockchain Secured</span>
                </div>
              </div>

              {/* End-to-End Luggage Milestone Steps */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-mono uppercase text-gray-400 block">Luggage Telemetry Lifecycle</span>
                
                <div className="space-y-3 relative pl-6 border-l-2 border-white/10 text-xs font-mono">
                  
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-[#16181F]" />
                    <div className="text-white font-semibold">1. Autonomous Station Bag Drop Kiosk</div>
                    <div className="text-gray-400 text-[11px]">RFID tag successfully printed and scanned at originating terminal.</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-[#16181F]" />
                    <div className="text-white font-semibold">2. Loaded into Lower Deck Cargo Bay Sector B</div>
                    <div className="text-gray-400 text-[11px]">Current Location: {scannedBag.location} ({scannedBag.lastScanned})</div>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-[#16181F] ${scannedBag.status === 'AT_DESTINATION' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    <div className="text-white font-semibold">3. Arrival Terminal Carousel Retrieval</div>
                    <div className="text-gray-400 text-[11px]">Scheduled ready for pickup at destination dropping bay carousel.</div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB: GLOBAL JOURNEY EXPLORER & WORLD MAP VIEW
           ======================================================== */}
        {activeTab === 'worldmap' && (
          <div className="space-y-6 animate-in fade-in">
            <GlobalJourneyExplorer
              bookings={bookings}
              activeBooking={activeBooking}
            />
          </div>
        )}

        {/* ========================================================
            TAB 2: TRIP HISTORY & RE-BOOKING SECTION
           ======================================================== */}
        {activeTab === 'history' && (
          <TripHistorySection
            bookings={bookings}
            onReviewTrip={() => setActiveTab('replay')}
            onTogglePrioritize={handleTogglePrioritize}
          />
        )}

        {/* ========================================================
            TAB 3: FLASHREWARDS LOYALTY & FLASHMILES SECTION
           ======================================================== */}
        {activeTab === 'rewards' && (
          <LoyaltyRewardsSection
            userId={user?.id}
          />
        )}

        {/* ========================================================
            TAB 3: FLASHGUARDIAN SAFETY PANEL
           ======================================================== */}
        {activeTab === 'guardian' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Emergency Contacts Management */}
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-pink-400 text-xs font-mono uppercase tracking-wider">
                <Phone className="w-4 h-4" />
                <span>Trusted Emergency Contacts</span>
              </div>
              <p className="text-xs text-gray-300">
                These contacts receive automated SMS telemetry upon your boarding and instant notifications if you trigger an SOS.
              </p>

              <div className="space-y-2">
                {user?.emergencyContacts?.map(ec => (
                  <div key={ec.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{ec.name} ({ec.relationship})</div>
                      <div className="text-gray-400 font-mono text-[11px]">{ec.phone}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      SYNCED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather & Road Risk Telemetry */}
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Corridor Risk Telemetry (South India)</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="font-semibold text-emerald-400">NH544 (Coimbatore — Salem — Bengaluru)</div>
                  <div className="text-gray-300 text-[11px]">Clear asphalt, zero fog disruption. 6-lane elevated expressway operational.</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                  <div className="font-semibold text-amber-400">Palakkad Gap (Coimbatore — Kochi)</div>
                  <div className="text-gray-300 text-[11px]">Light seasonal rain gusts. Drivers maintain 65 km/h regulated ghat limit.</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: FLASHDNA PERSONALIZATION SETTINGS
           ======================================================== */}
        {activeTab === 'dna' && (
          <div className="max-w-2xl bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono uppercase tracking-wider">
                <Heart className="w-4 h-4" />
                <span>FlashDNA™ Autonomous Personalization & Settings</span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mt-1">Traveler DNA & Display Profile</h3>
              <p className="text-xs text-gray-400">
                Configure berth preferences, travel corridor shortcuts, and visual accessibility settings across your entire FLASHX OS experience.
              </p>
            </div>

            {/* Accessibility & High Contrast Card */}
            <div className="p-5 rounded-2xl bg-black/50 border border-yellow-500/30 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Contrast className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>High Contrast Display Mode</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        highContrast ? 'bg-[#FFFF00] text-black' : 'bg-white/10 text-gray-400'
                      }`}>
                        {highContrast ? 'Active' : 'Standard'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Boosts global UI variables, text luminance, and stark black backgrounds for users with low vision or visual impairments.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    highContrast
                      ? 'bg-[#FFFF00] text-black shadow-lg shadow-yellow-400/20 ring-2 ring-yellow-400'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{highContrast ? 'Enabled' : 'Enable High Contrast'}</span>
                </button>
              </div>

              {highContrast && (
                <div className="pt-2 border-t border-white/10 text-[10px] text-yellow-300 flex items-center space-x-1.5">
                  <span>✓ WCAG AAA high-contrast variables active: pure black canvas, 100% yellow accents, high text contrast.</span>
                </div>
              )}
            </div>

            {/* Destination Vibe Theme Customization Card */}
            <div className="space-y-2">
              <TripThemeCustomizer
                currentTheme={tripVibeTheme}
                destinationCity={activeBooking?.destCity || 'Destination Hub'}
                onSelectTheme={handleSelectTripVibe}
              />
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Berth Configuration</span>
                  <span className="text-gray-400 text-[11px]">Preferred lower single pod or upper berth</span>
                </div>
                <select
                  value={user?.travelPreferences?.berthPreference || 'lower'}
                  onChange={(e) => handleUpdatePreference('berthPreference', e.target.value)}
                  className="bg-[#16181F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="lower">Lower Berth (Motion Stable)</option>
                  <option value="upper">Upper Berth (Panoramic)</option>
                  <option value="any">No Preference</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Window vs Aisle</span>
                  <span className="text-gray-400 text-[11px]">Highway horizon view vs ease of exit</span>
                </div>
                <select
                  value={user?.travelPreferences?.positionPreference || 'window'}
                  onChange={(e) => handleUpdatePreference('positionPreference', e.target.value)}
                  className="bg-[#16181F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="window">Window Berth</option>
                  <option value="aisle">Aisle Berth</option>
                  <option value="any">Any Position</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Climate Preference</span>
                  <span className="text-gray-400 text-[11px]">Regulated HEPA cabin air conditioning</span>
                </div>
                <select
                  value={user?.travelPreferences?.acPreference || 'ac'}
                  onChange={(e) => handleUpdatePreference('acPreference', e.target.value)}
                  className="bg-[#16181F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="ac">Air-Conditioned</option>
                  <option value="non-ac">Non-AC</option>
                </select>
              </div>

              {/* Preferred Route Corridor Preferences */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <div>
                  <span className="text-white font-semibold block text-sm">Preferred Route Corridors</span>
                  <span className="text-gray-400 text-[11px]">Save your frequent city pairs for expedited smart search suggestions.</span>
                </div>

                <form onSubmit={handleAddPreferredRoute} className="flex flex-wrap items-end gap-3 font-mono text-xs">
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] text-gray-500 block mb-1 uppercase">Source City</label>
                    <input
                      type="text"
                      required
                      list="pref-cities"
                      value={prefSource}
                      onChange={(e) => setPrefSource(e.target.value)}
                      placeholder="e.g. Coimbatore"
                      className="w-full bg-[#16181F] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] text-gray-500 block mb-1 uppercase">Destination City</label>
                    <input
                      type="text"
                      required
                      list="pref-cities"
                      value={prefDest}
                      onChange={(e) => setPrefDest(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-[#16181F] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                    />
                  </div>

                  <datalist id="pref-cities">
                    <option value="Coimbatore" />
                    <option value="Bengaluru" />
                    <option value="Chennai" />
                    <option value="Madurai" />
                    <option value="Mysore" />
                    <option value="Wayanad (Kerala)" />
                    <option value="Salem" />
                  </datalist>

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold font-mono transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Save Preference
                  </button>
                </form>

                {prefRouteSuccess && (
                  <p className="text-emerald-400 text-xs font-mono font-semibold animate-pulse">✓ {prefRouteSuccess}</p>
                )}

                {/* Display Saved Routes List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Your Saved Corridor Shortlists:</span>
                  {(user?.travelPreferences?.preferredRoutes || []).length === 0 ? (
                    <p className="text-[11px] text-gray-600 italic">No saved corridors yet. Add your frequent transit paths above!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(user?.travelPreferences?.preferredRoutes || []).map((route, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#16181F] border border-white/5 flex items-center justify-between group">
                          <div>
                            <span className="text-white font-bold font-mono text-xs">{route.source} ➔ {route.destination}</span>
                            <span className="block text-[9px] text-[#E7CB58] font-mono mt-0.5">Frequent Transit Pair</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/search?source=${encodeURIComponent(route.source)}&destination=${encodeURIComponent(route.destination)}`}
                              className="px-2.5 py-1 rounded bg-[#E7CB58]/10 hover:bg-[#E7CB58]/20 text-[#E7CB58] text-[10px] font-bold transition-all"
                            >
                              Quick Book
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemovePreferredRoute(idx)}
                              className="text-red-400 hover:text-red-300 text-[10px] font-bold p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500 font-mono">
              Privacy Promise: FLASHX OS does not infer sensitive private attributes or share your DNA data with external advertisers.
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: FLASHREPLAY JOURNEY MEMORY & REVIEWS
           ======================================================== */}
        {activeTab === 'replay' && (
          <div className="space-y-6">
            
            {/* Travel Analytics Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Intercity Distance</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">1,095 km</div>
                <span className="text-[10px] text-emerald-400 font-mono">3 Intercity Corridors</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Carbon Offset vs Flying</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">142 kg CO2</div>
                <span className="text-[10px] text-gray-400 font-mono">Electric & Multi-Axle efficiency</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Historical Punctuality</span>
                <div className="text-2xl font-bold font-mono text-[#E7CB58] mt-1">98.2%</div>
                <span className="text-[10px] text-gray-400 font-mono">On-Time Terminal Arrival</span>
              </div>
            </div>

            {/* Leave a Journey Review */}
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#E7CB58]" />
                <span>Submit Verified Coach Review</span>
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-mono">Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share details on cabin silence, suspension, punctuality, and charging speed..."
                  className="w-full bg-[#101114] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E7CB58]/50"
                />

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors"
                >
                  Submit Verified Review
                </button>

                {reviewSubmitted && (
                  <span className="text-xs text-emerald-400 font-mono ml-3">
                    ✓ Review stored in immutable journey memory ledger.
                  </span>
                )}
              </form>
            </div>

            {/* Past reviews list */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-gray-400">Past Verified Reviews</h4>
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#16181F] border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{rev.userName}</span>
                    <span className="text-amber-400 font-mono font-bold">{rev.rating} ★</span>
                  </div>
                  <p className="text-gray-300">{rev.comment}</p>
                  <div className="flex flex-wrap gap-1">
                    {rev.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 6: FLASHPAY™ DIGITAL WALLET
           ======================================================== */}
        {activeTab === 'flashpay' && (
          <div className="space-y-6">
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
                <Gift className="w-5 h-5 text-[#E7CB58]" />
                <span>FlashPay™ Digital Wallet</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs text-gray-400 uppercase font-mono">Available Credits</span>
                  <div className="text-3xl font-bold text-white font-mono">₹ 1,250.00</div>
                  <button className="text-xs bg-[#E7CB58] text-black px-3 py-1.5 rounded-lg font-semibold mt-2">Add Funds</button>
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs text-gray-400 uppercase font-mono">Promotional Credits</span>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">₹ 500.00</div>
                  <span className="text-[10px] text-gray-500">Valid until 2026-12-31</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white">Saved Payment Methods</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                    <span>Visa ending in 4242</span>
                  </div>
                  <span className="text-emerald-400 font-mono">DEFAULT</span>
                </div>
              </div>
              <button className="text-xs text-gray-400 hover:text-white underline">+ Add New Method</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
