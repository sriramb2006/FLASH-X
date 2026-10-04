import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  ArrowRight,
  RotateCcw,
  QrCode,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CreditCard,
  Download,
  Star,
  Zap,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Luggage,
  Sparkles
} from 'lucide-react';
import { Booking } from '../../shared/types';

interface TripHistorySectionProps {
  bookings: Booking[];
  onReviewTrip?: (booking: Booking) => void;
  onTogglePrioritize?: (bookingId: string, prioritized: boolean) => void;
}

export type TripFilterStatus = 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PRIORITY';

export const TripHistorySection: React.FC<TripHistorySectionProps> = ({
  bookings,
  onReviewTrip,
  onTogglePrioritize,
}) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<TripFilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [rebookModalBooking, setRebookModalBooking] = useState<Booking | null>(null);

  // Helper to determine if trip is past
  const isPastTrip = (b: Booking) => {
    return new Date(b.arrivalTime).getTime() < Date.now();
  };

  // Filtered & Sorted list (Prioritized bookings float to top)
  const filteredBookings = useMemo(() => {
    const list = bookings.filter(b => {
      // Status filter
      if (filterStatus === 'CONFIRMED') {
        if (b.status !== 'CONFIRMED' || isPastTrip(b)) return false;
      } else if (filterStatus === 'COMPLETED') {
        if (b.status === 'CANCELLED' || (!isPastTrip(b) && b.status === 'CONFIRMED')) return false;
      } else if (filterStatus === 'CANCELLED') {
        if (b.status !== 'CANCELLED') return false;
      } else if (filterStatus === 'PRIORITY') {
        if (!b.isPrioritized || isPastTrip(b) || b.status !== 'CONFIRMED') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCity = b.sourceCity.toLowerCase().includes(q) || b.destCity.toLowerCase().includes(q);
        const matchRef = b.bookingReference.toLowerCase().includes(q);
        const matchBus = b.busName.toLowerCase().includes(q) || b.operatorName.toLowerCase().includes(q);
        const matchPassenger = b.passengers.some(p => p.name.toLowerCase().includes(q));
        if (!matchCity && !matchRef && !matchBus && !matchPassenger) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (a.isPrioritized && !b.isPrioritized) return -1;
      if (!a.isPrioritized && b.isPrioritized) return 1;
      return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
    });
  }, [bookings, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalTrips = bookings.length;
    const completedTrips = bookings.filter(b => b.status === 'CONFIRMED' && isPastTrip(b)).length;
    const upcomingTrips = bookings.filter(b => b.status === 'CONFIRMED' && !isPastTrip(b)).length;
    const totalSpent = bookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + (b.fareBreakdown?.totalFare || 0), 0);

    // Approximate distance estimate ~ 350km per booking
    const estimatedDistanceKm = completedTrips * 360 + upcomingTrips * 360;

    return {
      totalTrips,
      completedTrips,
      upcomingTrips,
      totalSpent,
      estimatedDistanceKm,
    };
  }, [bookings]);

  // Handle 1-Click Re-booking
  const handleQuickRebook = (booking: Booking, customDate?: string) => {
    // Tomorrow's date as ISO string default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = customDate || tomorrow.toISOString().split('T')[0];

    const params = new URLSearchParams({
      source: booking.sourceCity,
      destination: booking.destCity,
      date: dateStr,
      passengers: booking.passengers.length.toString(),
    });

    navigate(`/search?${params.toString()}`);
  };

  const handleCopyFamilyLink = (b: Booking) => {
    if (!b.familyShareToken) return;
    const shareUrl = `${window.location.origin}/track/${b.familyShareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(b.familyShareToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          TRIP ANALYTICS & TRAVEL RESUME HUD
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-[#16181F] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-mono">
            <span>Total Bookings</span>
            <Calendar className="w-3.5 h-3.5 text-[#E7CB58]" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold text-white">
            {stats.totalTrips}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            {stats.upcomingTrips} Upcoming • {stats.completedTrips} Completed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181F] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-mono">
            <span>Distance Traveled</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold text-cyan-400">
            {stats.estimatedDistanceKm.toLocaleString()} <span className="text-xs font-normal text-gray-400">km</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            Interstate corridors
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181F] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-mono">
            <span>Total Fare Paid</span>
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold text-[#E7CB58]">
            ₹{stats.totalSpent.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Instant refund eligible
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181F] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-mono">
            <span>Reliability Tier</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold text-purple-300">
            Tier-1 FX
          </div>
          <div className="text-[11px] text-purple-400 font-mono">
            VIP Boarding Pass Holder
          </div>
        </div>

      </div>

      {/* ========================================================
          SEARCH & FILTER ACTION BAR
         ======================================================== */}
      <div className="bg-[#16181F] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: 'ALL', label: `All Trips (${bookings.length})` },
            { id: 'CONFIRMED', label: `Upcoming (${stats.upcomingTrips})` },
            { id: 'PRIORITY', label: `★ Priority (${bookings.filter(b => b.isPrioritized && !isPastTrip(b) && b.status === 'CONFIRMED').length})` },
            { id: 'COMPLETED', label: `Completed (${stats.completedTrips})` },
            { id: 'CANCELLED', label: `Cancelled` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id as TripFilterStatus)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city, coach, or ref..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-[#E7CB58]/50"
          />
        </div>

      </div>

      {/* ========================================================
          TRIP CARDS LIST
         ======================================================== */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#16181F] border border-white/10 space-y-4 font-mono">
          <Compass className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Trips Found</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {searchQuery
                ? `No booking records match "${searchQuery}". Try adjusting your search query or clear filters.`
                : 'You have no trips in this category. Ready to book your next autonomous highway journey?'}
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            <Compass className="w-4 h-4" />
            <span>Search Bus Corridors</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => {
            const depDate = new Date(b.departureTime);
            const arrDate = new Date(b.arrivalTime);
            const isPast = isPastTrip(b);
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.id}
                className={`bg-[#16181F] border rounded-3xl p-5 sm:p-6 transition-all hover:border-white/30 space-y-4 shadow-xl relative overflow-hidden ${
                  isCancelled
                    ? 'border-red-500/20 opacity-80'
                    : isPast
                    ? 'border-white/10'
                    : 'border-[#E7CB58]/40 shadow-[#E7CB58]/5'
                }`}
              >
                {/* Accent Top Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isCancelled
                      ? 'bg-red-500/60'
                      : isPast
                      ? 'bg-cyan-500/60'
                      : 'bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58]'
                  }`}
                />

                {/* Top Header: Route & Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg sm:text-xl font-display font-extrabold text-white flex items-center space-x-2">
                        <span>{b.sourceCity}</span>
                        <ArrowRight className="w-4 h-4 text-[#E7CB58]" />
                        <span>{b.destCity}</span>
                      </div>

                      {/* Status Badges */}
                      {isCancelled ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold">
                          CANCELLED & REFUNDED
                        </span>
                      ) : isPast ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>COMPLETED JOURNEY</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center space-x-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>CONFIRMED • UPCOMING</span>
                        </span>
                      )}

                      {b.isPrioritized && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E7CB58]/20 text-[#E7CB58] border border-[#E7CB58]/40 text-[10px] font-mono font-bold flex items-center space-x-1 shadow-sm">
                          <Star className="w-3 h-3 fill-[#E7CB58]" />
                          <span>PRIORITY BOOKING</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 font-mono mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-white font-semibold">{b.busName}</span>
                      <span>•</span>
                      <span>{b.operatorName}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-gray-400 uppercase block">Booking Reference</span>
                    <span className="text-sm font-bold text-[#E7CB58]">{b.bookingReference}</span>
                    <div className="text-[10px] text-gray-500">
                      Booked {new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Body: Journey Schedule & Passenger Manifest */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
                  
                  {/* Departure & Arrival Box */}
                  <div className="md:col-span-4 p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400 text-[10px] uppercase">
                      <Clock className="w-3.5 h-3.5 text-[#E7CB58]" />
                      <span>Schedule Timing</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Departure:</span>
                        <span className="text-white font-bold">
                          {depDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Arrival:</span>
                        <span className="text-white font-bold">
                          {arrDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-300 truncate pt-1 border-t border-white/5">
                      Boarding: {b.boardingPoint}
                    </div>
                  </div>

                  {/* Berths & Manifest Box */}
                  <div className="md:col-span-4 p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400 text-[10px] uppercase">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Assigned Berths & Travelers</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {b.passengers.map(p => (
                        <span key={p.seatNumber} className="px-2.5 py-0.5 rounded-lg bg-[#E7CB58] text-black font-bold text-xs">
                          {p.seatNumber}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-300 truncate text-[11px]">
                      {b.passengers.map(p => `${p.name} (${p.age}y)`).join(', ')}
                    </div>
                  </div>

                  {/* Payment & Fare Box */}
                  <div className="md:col-span-4 p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
                        <span>Fare Settlement</span>
                        <span className="text-emerald-400 font-bold">PAID</span>
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        ₹{b.fareBreakdown.totalFare}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      Txn: {b.transactionId.substring(0, 16)}...
                    </div>
                  </div>

                </div>

                {/* Bottom Action Strip */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 font-mono text-xs">
                  
                  {/* Left: Quick actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tickets/${b.id}`}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#E7CB58]" />
                      <span>View E-Ticket & QR</span>
                    </Link>

                    {b.familyShareToken && (
                      <button
                        type="button"
                        onClick={() => handleCopyFamilyLink(b)}
                        className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Copy live tracking link for family members"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedToken === b.familyShareToken ? 'Link Copied!' : 'Family Track Link'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onTogglePrioritize && onTogglePrioritize(b.id, !b.isPrioritized)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        b.isPrioritized
                          ? 'bg-[#E7CB58] text-black border-[#E7CB58] font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                      title="Prioritize or pin this booking to the top of your list"
                    >
                      <Star className={`w-3.5 h-3.5 ${b.isPrioritized ? 'fill-black' : ''}`} />
                      <span>{b.isPrioritized ? 'Prioritized' : 'Set Priority'}</span>
                    </button>
                  </div>

                  {/* Right: Instant 1-Click Re-Booking Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRebookModalBooking(b)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:brightness-110 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Book This Trip</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          INSTANT RE-BOOK MODAL (ONE-CLICK EXPEDITED BOOKING)
         ======================================================== */}
      {rebookModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#16181F] border-2 border-[#E7CB58] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl relative font-mono text-xs">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#E7CB58] text-black font-display font-bold flex items-center justify-center text-sm">
                  FX
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">Re-Book Previous Journey</h3>
                  <p className="text-[11px] text-gray-400">One-click route expedition with saved preferences</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRebookModalBooking(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Route Summary */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="text-sm font-display font-bold text-white flex items-center space-x-2">
                <span>{rebookModalBooking.sourceCity}</span>
                <ArrowRight className="w-4 h-4 text-[#E7CB58]" />
                <span>{rebookModalBooking.destCity}</span>
              </div>
              <div className="text-gray-400 text-xs">
                Previous Coach: <strong className="text-white">{rebookModalBooking.busName}</strong>
              </div>
              <div className="text-gray-400 text-xs">
                Passengers to replicate: <strong className="text-[#E7CB58]">{rebookModalBooking.passengers.length} ({rebookModalBooking.passengers.map(p => p.name).join(', ')})</strong>
              </div>
            </div>

            {/* Select Date Options */}
            <div className="space-y-2">
              <label className="text-gray-300 block font-semibold">Choose Travel Date for Re-booking:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'Tomorrow',
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    desc: new Date(Date.now() + 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                  },
                  {
                    label: 'In 3 Days',
                    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                    desc: new Date(Date.now() + 86400000 * 3).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                  },
                  {
                    label: 'Next Weekend',
                    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
                    desc: new Date(Date.now() + 86400000 * 6).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                  },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      handleQuickRebook(rebookModalBooking, opt.date);
                      setRebookModalBooking(null);
                    }}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#E7CB58]/20 border border-white/10 hover:border-[#E7CB58] text-center transition-all cursor-pointer group"
                  >
                    <span className="block text-white font-bold group-hover:text-[#E7CB58]">{opt.label}</span>
                    <span className="text-[10px] text-gray-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRebookModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  handleQuickRebook(rebookModalBooking);
                  setRebookModalBooking(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-amber-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Search Available Coaches</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
