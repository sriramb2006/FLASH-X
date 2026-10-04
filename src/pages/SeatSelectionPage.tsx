import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Shield,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  Users,
  Compass,
  Zap,
  MapPin
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Schedule, SeatData, PredictivePricingAnalysis } from '../../shared/types';
import { PredictivePricingGraph } from '../components/PredictivePricingGraph';

export const SeatSelectionPage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionToken, user } = useAuth();

  const maxPassengers = parseInt(searchParams.get('passengers') || '1', 10);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [predictivePricing, setPredictivePricing] = useState<PredictivePricingAnalysis | null>(null);
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [pitch, setPitch] = useState<number>(60);
  const [yaw, setYaw] = useState<number>(-35);
  const [cabinLights, setCabinLights] = useState<'neon' | 'warm' | 'off'>('neon');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [holdError, setHoldError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  // Load schedule and seat matrix
  useEffect(() => {
    async function loadData() {
      if (!scheduleId) return;
      setIsLoading(true);
      try {
        const [matrixRes, searchRes, intelRes] = await Promise.all([
          api.getSeatsMatrix(scheduleId),
          api.searchBuses({}),
          api.getScheduleIntelligence(scheduleId).catch(() => null),
        ]);

        setSeats(matrixRes.seats || []);
        setRecommendations(matrixRes.recommendations || []);

        const currentSch = searchRes.schedules.find(s => s.id === scheduleId);
        if (currentSch) setSchedule(currentSch);

        if (intelRes?.predictivePricing) {
          setPredictivePricing(intelRes.predictivePricing);
        }
      } catch (err) {
        console.error('Failed to load seat layout:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [scheduleId]);

  // Countdown timer for seat hold
  useEffect(() => {
    if (!holdExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        setHoldError('Seat hold has expired. Please reselect your preferred seats.');
        setSelectedSeatIds([]);
        setHoldExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const toggleSeatSelection = async (seat: SeatData) => {
    if (seat.status === 'booked') return;
    setHoldError('');

    let updatedList: string[];
    if (selectedSeatIds.includes(seat.id) || selectedSeatIds.includes(seat.seatNumber)) {
      // Deselect
      updatedList = selectedSeatIds.filter(id => id !== seat.id && id !== seat.seatNumber);
    } else {
      // Check maximum seats
      if (selectedSeatIds.length >= maxPassengers) {
        // If single passenger, replace selection; otherwise alert
        if (maxPassengers === 1) {
          updatedList = [seat.seatNumber];
        } else {
          setHoldError(`Maximum ${maxPassengers} seat(s) can be selected for this booking.`);
          return;
        }
      } else {
        updatedList = [...selectedSeatIds, seat.seatNumber];
      }
    }

    if (updatedList.length === 0) {
      setSelectedSeatIds([]);
      setHoldExpiresAt(null);
      if (scheduleId) api.releaseSeats(scheduleId, sessionToken);
      return;
    }

    // Call server-side hold to prevent concurrency double-booking
    setIsHolding(true);
    try {
      if (scheduleId) {
        const holdRes = await api.holdSeats(scheduleId, updatedList, sessionToken);
        if (holdRes.success) {
          setSelectedSeatIds(updatedList);
          setHoldExpiresAt(holdRes.expiresAt || Date.now() + 300000);
        }
      }
    } catch (err: any) {
      setHoldError(err.message || 'Seat unavailable or held by another passenger');
    } finally {
      setIsHolding(false);
    }
  };

  // Fare calculations
  const baseFare = schedule?.baseFare || 1200;
  let totalSeatCharges = 0;
  selectedSeatIds.forEach(seatNum => {
    const s = seats.find(st => st.seatNumber === seatNum || st.id === seatNum);
    if (s && s.priceMultiplier > 1.0) {
      totalSeatCharges += Math.round(baseFare * (s.priceMultiplier - 1.0));
    }
  });

  const subtotal = (baseFare * selectedSeatIds.length) + totalSeatCharges;
  const taxesGst = Math.round(subtotal * 0.05);
  const platformFee = selectedSeatIds.length > 0 ? 25 : 0;
  const estimatedTotal = subtotal + taxesGst + platformFee;

  const handleProceedToCheckout = () => {
    if (selectedSeatIds.length === 0) {
      setHoldError('Please select at least 1 seat to proceed.');
      return;
    }
    const params = new URLSearchParams({
      scheduleId: scheduleId || '',
      seats: selectedSeatIds.join(','),
      passengers: String(selectedSeatIds.length),
    });
    navigate(`/checkout?${params.toString()}`);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredSeats = seats.filter(s => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every(filter => {
      if (filter === 'Window Seat') return s.isWindow;
      if (filter === 'Aisle Seat') return s.isAisle;
      if (filter === 'Extra Legroom') return s.type === 'sleeper';
      return true;
    });
  });

  const lowerSeats = filteredSeats.filter(s => s.deck === 'lower');
  const upperSeats = filteredSeats.filter(s => s.deck === 'upper');
  const activeDeckSeats = activeDeck === 'lower' ? lowerSeats : upperSeats;

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back and summary button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Departures</span>
          </button>

          {/* Active Hold Countdown Badge */}
          {holdExpiresAt && secondsRemaining > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Seats Locked: {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Coach Header Card */}
        {schedule && (
          <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-mono text-gray-400">{schedule.bus.operatorName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                  {schedule.bus.category}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white">{schedule.bus.busName}</h2>
              <div className="text-xs text-gray-400 font-mono mt-1 flex items-center space-x-3">
                <span>{schedule.route.sourceCity} → {schedule.route.destCity}</span>
                <span>•</span>
                <span>Dep: {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>•</span>
                <span className="text-emerald-400">{schedule.route.estimatedHours} hrs transit</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Base Fare</span>
              <div className="text-2xl font-display font-bold text-[#E7CB58]">₹{schedule.baseFare}</div>
              <span className="text-[10px] text-gray-400 font-mono">Per Passenger</span>
            </div>
          </div>
        )}

        {/* Predictive Pricing & Historical Demand Intelligence Section */}
        {predictivePricing && (
          <PredictivePricingGraph
            data={predictivePricing}
            onBookNowClick={handleProceedToCheckout}
          />
        )}

        {/* Hold Error Alert */}
        {holdError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{holdError}</span>
          </div>
        )}

        {/* Main Seat Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Seat Map */}
          <div className="lg:col-span-8 bg-[#16181F] border border-white/10 rounded-2xl p-6 space-y-6">
            
            {/* Deck Switcher, Filters & Legend */}
            <div className="space-y-4 pb-4 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveDeck('lower')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                      activeDeck === 'lower'
                        ? 'bg-[#E7CB58] text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Lower Deck ({lowerSeats.length} Berths)
                  </button>
                  {upperSeats.length > 0 && (
                    <button
                      onClick={() => setActiveDeck('upper')}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                        activeDeck === 'upper'
                          ? 'bg-[#E7CB58] text-black shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      Upper Deck ({upperSeats.length} Berths)
                    </button>
                  )}
                </div>

                {/* Filters & 2D/3D View Switcher */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center space-x-1.5">
                    {['Window Seat', 'Aisle Seat', 'Extra Legroom'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => toggleFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                          activeFilters.includes(filter)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-white/10 hidden sm:block" />

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode('2d')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        viewMode === '2d'
                          ? 'bg-[#E7CB58] text-black shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      2D PLAN
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('3d')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center space-x-1 ${
                        viewMode === '3d'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                      </span>
                      <span>3D CABIN</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-white/30 bg-white/5" />
                  <span>Available</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#E7CB58] text-black font-bold" />
                  <span>Selected</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-gray-800 border border-gray-700 opacity-60" />
                  <span>Booked</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-pink-400 bg-pink-500/20" />
                  <span>Female Reserved</span>
                </span>
              </div>
            </div>

            {viewMode === '2d' ? (
              /* Coach Chassis Layout Front / Driver Indicator */
              <div className="relative border-2 border-white/15 rounded-3xl p-6 bg-black/40">
                
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-4 mb-4 border-b border-dashed border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="uppercase tracking-wider">Coach Front (Driver & Entry Door)</span>
                  </div>
                  <span>{activeDeck.toUpperCase()} DECK</span>
                </div>

                {/* Seats Matrix Render (2+1 Layout) */}
                <motion.div
                  className="space-y-4 max-w-md mx-auto cursor-grab active:cursor-grabbing"
                  drag
                  dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {[1, 2, 3, 4, 5].map(rowNum => {
                    const seatA = activeDeckSeats.find(s => s.row === rowNum && s.col === 1);
                    const seatB = activeDeckSeats.find(s => s.row === rowNum && s.col === 2);
                    const seatC = activeDeckSeats.find(s => s.row === rowNum && s.col === 3);

                    const renderBerth = (seat?: SeatData) => {
                      if (!seat) return <div className="w-16 h-28" />;
                      const isSelected = selectedSeatIds.includes(seat.id) || selectedSeatIds.includes(seat.seatNumber);
                      const isBooked = seat.status === 'booked';
                      const isFemale = seat.status === 'female_reserved';

                      return (
                        <button
                          type="button"
                          key={seat.id}
                          disabled={isBooked}
                          onClick={() => toggleSeatSelection(seat)}
                          className={`w-16 sm:w-20 h-28 rounded-xl border flex flex-col items-center justify-between p-2 text-xs transition-all relative ${
                            isBooked
                              ? 'bg-black/60 border-white/5 text-gray-600 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#E7CB58] text-black font-bold border-amber-300 shadow-xl shadow-amber-500/30 scale-105'
                              : isFemale
                              ? 'bg-pink-950/20 border-pink-500/50 text-pink-300 hover:border-pink-400'
                              : 'bg-white/5 border-white/20 text-gray-200 hover:border-[#E7CB58] hover:bg-white/10'
                          }`}
                          title={`${seat.seatNumber} • ${seat.type} (${seat.isWindow ? 'Window' : 'Aisle'})`}
                        >
                          {/* Berth Pillow Indicator */}
                          <div className={`w-8 h-2 rounded-full ${isSelected ? 'bg-black/30' : 'bg-white/20'}`} />

                          <div className="font-mono font-bold text-sm">{seat.seatNumber}</div>

                          <div className="text-[10px] font-mono">
                            {isBooked ? 'SOLD' : isSelected ? 'SELECTED' : `₹${Math.round(baseFare * seat.priceMultiplier)}`}
                          </div>

                          {/* Female Badge */}
                          {isFemale && !isSelected && !isBooked && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 text-[8px] flex items-center justify-center text-white">
                              ♀
                            </span>
                          )}
                        </button>
                      );
                    };

                    return (
                      <div key={rowNum} className="flex items-center justify-between gap-4">
                        {/* Left Single Berth (Window) */}
                        <div className="flex-1 flex justify-center">
                          {renderBerth(seatA)}
                        </div>

                        {/* Wide Aisle */}
                        <div className="w-12 text-center text-[10px] font-mono text-gray-600 rotate-90 tracking-widest select-none">
                          AISLE
                        </div>

                        {/* Right Double Berths */}
                        <div className="flex-1 flex justify-center space-x-2">
                          {renderBerth(seatB)}
                          {renderBerth(seatC)}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Coach Rear */}
                <div className="mt-6 pt-3 text-center border-t border-dashed border-white/10 text-[10px] font-mono text-gray-500 uppercase">
                  Coach Rear (Emergency Exit & Engine Bay)
                </div>

              </div>
            ) : (
              /* Isometric 3D Preview Mode */
              <div className="relative border-2 border-purple-500/20 rounded-3xl p-6 bg-black/60 overflow-hidden flex flex-col space-y-4">
                
                {/* 3D Controls and Angle Tuners */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400 font-mono">Yaw (Z):</span>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={yaw} 
                        onChange={(e) => setYaw(Number(e.target.value))}
                        className="w-20 accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-white/10 appearance-none"
                      />
                      <span className="text-[10px] font-mono text-[#E7CB58] w-8 text-right">{yaw}°</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400 font-mono">Pitch (X):</span>
                      <input 
                        type="range" 
                        min="25" 
                        max="80" 
                        value={pitch} 
                        onChange={(e) => setPitch(Number(e.target.value))}
                        className="w-20 accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-white/10 appearance-none"
                      />
                      <span className="text-[10px] font-mono text-[#E7CB58] w-8 text-right">{pitch}°</span>
                    </div>
                  </div>

                  {/* Preset Angles & Ambient Lighting Toggles */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => { setPitch(60); setYaw(-35); }}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 text-gray-300"
                    >
                      Default Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPitch(35); setYaw(0); }}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 text-gray-300"
                    >
                      Side Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPitch(78); setYaw(0); }}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 text-gray-300"
                    >
                      Top Down
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* Light Controls */}
                    <button
                      type="button"
                      onClick={() => setCabinLights(cabinLights === 'neon' ? 'warm' : cabinLights === 'warm' ? 'off' : 'neon')}
                      className={`px-2 py-1 rounded border text-[10px] font-mono flex items-center space-x-1 transition-all ${
                        cabinLights === 'neon'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : cabinLights === 'warm'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                          : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                      title="Toggle Cabin LED Ambient Mode"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span className="uppercase">{cabinLights} Light</span>
                    </button>
                  </div>
                </div>

                {/* Info Tip */}
                <div className="text-[10px] font-mono text-gray-400 flex items-center space-x-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span><strong>3D Interactive Cabin:</strong> Adjust sliders to orbit. Drag or hover over any berth to preview its luxury comfort structure. Directly click beds in 3D to select!</span>
                </div>

                {/* 3D Canvas Box */}
                <div className="relative w-full h-[480px] bg-gradient-to-b from-[#0e0f13] to-[#14161f] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5">
                  
                  {/* Subtle Grid Floor Base */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b2b73 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                  {/* Drivers / Deck Labels in Space */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-1 text-[10px] font-mono text-gray-400 pointer-events-none">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>COACH FRONT</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>STACKED CABIN MATRIX</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-end space-y-1 text-[10px] font-mono text-gray-400 pointer-events-none">
                    <span className="text-gray-300">ACTIVE: {activeDeck.toUpperCase()} DECK</span>
                    <span className="text-[9px] text-gray-500">INACTIVE DECK FADED FOR FOCUS</span>
                  </div>

                  {/* 3D Scene Transform Center */}
                  <div
                    className="relative transition-transform duration-300 ease-out"
                    style={{
                      perspective: '1500px',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className="relative transition-all duration-300"
                      style={{
                        transform: `rotateX(${pitch}deg) rotateY(0deg) rotateZ(${yaw}deg)`,
                        transformStyle: 'preserve-3d',
                        width: '530px',
                        height: '245px',
                      }}
                    >
                      {/* 3D Bus Platform / Chassis Rim */}
                      <div
                        className={`absolute inset-0 rounded-[30px] border-2 transition-all duration-500 ${
                          cabinLights === 'neon'
                            ? 'bg-[#10121a]/95 border-purple-500/30 shadow-[0_0_40px_rgba(147,51,234,0.25)]'
                            : cabinLights === 'warm'
                            ? 'bg-[#121115]/95 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
                            : 'bg-[#0f1013] border-white/10'
                        }`}
                        style={{
                          transform: 'translateZ(-14px)',
                          boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,255,255,0.02)',
                        }}
                      >
                        {/* Interactive Aisle Track running down middle */}
                        <div 
                          className={`absolute left-[70px] right-[10px] top-[84px] h-[34px] rounded-lg transition-colors duration-500 flex items-center justify-center ${
                            cabinLights === 'neon' 
                              ? 'bg-purple-950/20 border-y border-purple-500/10' 
                              : cabinLights === 'warm'
                              ? 'bg-amber-950/10 border-y border-amber-500/10'
                              : 'bg-black/40'
                          }`}
                        >
                          <div className="text-[7px] text-white/10 font-mono tracking-[0.25em] uppercase font-bold">Aisle Lane</div>
                        </div>

                        {/* Neon Mood Under-Glow Strip */}
                        {cabinLights === 'neon' && (
                          <div className="absolute -inset-1.5 rounded-[32px] border border-cyan-500/20 blur-sm pointer-events-none" />
                        )}
                        {cabinLights === 'warm' && (
                          <div className="absolute -inset-1.5 rounded-[32px] border border-amber-500/20 blur-sm pointer-events-none" />
                        )}
                      </div>

                      {/* Driver Front Platform Detail */}
                      <div
                        className="absolute left-[10px] top-[10px] w-[50px] h-[225px] border-r border-dashed border-white/15"
                        style={{
                          transform: 'translateZ(-10px)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* Steering Wheel representation */}
                        <div
                          className="absolute left-[15px] top-[140px] w-7 h-7 rounded-full border-2 border-zinc-600 flex items-center justify-center bg-zinc-900"
                          style={{
                            transform: 'translateZ(18px) rotateY(-20deg)',
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        </div>
                        {/* Dashboard Monitor Glow */}
                        <div
                          className={`absolute left-[6px] top-[100px] w-1 h-5 rounded transition-all duration-500 ${
                            cabinLights === 'neon' ? 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]' : 'bg-[#E7CB58]'
                          }`}
                          style={{ transform: 'translateZ(15px) rotateY(15deg)' }}
                        />
                        {/* Drivers Chair */}
                        <div
                          className="absolute left-[14px] top-[85px] w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg"
                          style={{
                            transform: 'translateZ(10px)',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          <div className="w-6 h-6 rounded-md bg-zinc-700 border border-zinc-600" />
                        </div>
                      </div>

                      {/* Structural 3D Support Columns at coach corners */}
                      {[
                        { left: '70px', top: '12px' },
                        { left: '70px', top: '228px' },
                        { left: '490px', top: '12px' },
                        { left: '490px', top: '228px' }
                      ].map((pillar, pIdx) => (
                        <div
                          key={pIdx}
                          className="absolute w-1 h-[90px] bg-gradient-to-t from-white/10 via-white/20 to-white/10 opacity-30 border-l border-white/20"
                          style={{
                            left: pillar.left,
                            top: pillar.top,
                            transform: 'rotateX(-90deg)',
                            transformOrigin: 'top',
                          }}
                        />
                      ))}

                      {/* Stacked Seats/Berths Engine */}
                      {seats.map(seat => {
                        const isLower = seat.deck === 'lower';
                        const isSelected = selectedSeatIds.includes(seat.id) || selectedSeatIds.includes(seat.seatNumber);
                        const isBooked = seat.status === 'booked';
                        const isFemale = seat.status === 'female_reserved';

                        // Check deck active status to apply faded contrast
                        const isDeckActive = seat.deck === activeDeck;
                        const opacityStyle = isDeckActive ? 'opacity-100 z-10' : 'opacity-15 pointer-events-none scale-95';

                        // Compute 3D Coordinates inside the grid
                        const colNum = seat.col;
                        const rowNum = seat.row;

                        // Position coordinates:
                        // Row 1 to 5 maps to left-to-right (from driver platform)
                        const leftPos = (rowNum - 1) * 82 + 75;
                        // Col 1 (Single) sits at top, Col 2 & 3 sits at bottom
                        const topPos = colNum === 1 ? 25 : colNum === 2 ? 128 : 178;
                        // Height elevation on the Z-axis
                        const zTranslation = isLower ? 0 : 85;

                        return (
                          <div
                            key={seat.id}
                            className={`absolute transition-all duration-500 ease-out transform-gpu ${opacityStyle}`}
                            style={{
                              left: `${leftPos}px`,
                              top: `${topPos}px`,
                              transform: `translateZ(${zTranslation}px)`,
                              transformStyle: 'preserve-3d',
                              width: '72px',
                              height: '42px',
                            }}
                          >
                            {/* Volumetric mattress base buttons */}
                            <button
                              type="button"
                              disabled={isBooked || !isDeckActive}
                              onClick={() => toggleSeatSelection(seat)}
                              className={`absolute inset-0 rounded-lg border text-[10px] font-mono flex flex-col items-center justify-between p-1 transition-all relative ${
                                isBooked
                                  ? 'bg-[#181a1f]/80 border-white/5 text-zinc-600 cursor-not-allowed shadow-none'
                                  : isSelected
                                  ? 'bg-[#E7CB58] border-amber-300 text-black font-bold shadow-[0_0_20px_rgba(231,203,88,0.6)] scale-105'
                                  : isFemale
                                  ? 'bg-pink-950/20 border-pink-500/40 text-pink-300 hover:border-pink-400'
                                  : 'bg-[#141722]/90 border-white/15 text-gray-200 hover:border-amber-400 hover:bg-[#1b2031] hover:scale-105'
                              }`}
                              style={{
                                transform: 'translateZ(10px)',
                                transformStyle: 'preserve-3d',
                                boxShadow: isSelected 
                                  ? '0 0 15px rgba(231,203,88,0.5)' 
                                  : '0 8px 12px rgba(0,0,0,0.4)',
                              }}
                              title={`Berth ${seat.seatNumber} • ${seat.type}`}
                            >
                              {/* 3D pillow detail raised above mattress */}
                              <div
                                className={`absolute left-1 top-[5px] w-3 h-[calc(100%-10px)] rounded-sm transition-all ${
                                  isSelected ? 'bg-black/25' : 'bg-white/10'
                                }`}
                                style={{
                                  transform: 'translateZ(4px)',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }}
                              />

                              {/* Berth Seat Number Label */}
                              <div className="font-mono font-bold text-xs pl-3 self-center translate-z-10">
                                {seat.seatNumber}
                              </div>

                              {/* Small details / Price Tag inside bed */}
                              <div className="text-[8px] pl-3 self-center font-mono opacity-80">
                                {isBooked ? 'SOLD' : isSelected ? 'HELD' : `₹${Math.round(baseFare * seat.priceMultiplier)}`}
                              </div>

                              {/* Female indicator badge on pillow inside 3D */}
                              {isFemale && !isSelected && !isBooked && (
                                <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-pink-500 text-[8px] flex items-center justify-center text-white font-bold leading-none">
                                  ♀
                                </span>
                              )}
                            </button>

                            {/* 3D Shadow extrusion (Bottom volumetric face) */}
                            <div
                              className={`absolute left-[1.5px] right-[1.5px] bottom-0 h-[10px] rounded-b-lg transition-colors duration-500 ${
                                isBooked
                                  ? 'bg-zinc-950/80'
                                  : isSelected
                                  ? 'bg-amber-600/80'
                                  : isFemale
                                  ? 'bg-pink-900/40'
                                  : 'bg-[#1f263d]'
                              }`}
                              style={{
                                transform: 'rotateX(-90deg) translateY(5px)',
                                transformOrigin: 'bottom',
                              }}
                            />
                            
                            {/* 3D Shadow extrusion (Left volumetric face) */}
                            <div
                              className={`absolute top-[1px] bottom-0 left-0 w-[10px] rounded-l-md transition-colors duration-500 ${
                                isBooked
                                  ? 'bg-zinc-950/70'
                                  : isSelected
                                  ? 'bg-amber-700/80'
                                  : isFemale
                                  ? 'bg-pink-900/30'
                                  : 'bg-[#151c33]'
                              }`}
                              style={{
                                transform: 'rotateY(-90deg) translateX(-5px)',
                                transformOrigin: 'left',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Legend for 3D View */}
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                  <span>* Adjust Yaw/Pitch sliders to tilt or view the entire volumetric model</span>
                  <span>* Click any opaque 3D block to reserve</span>
                </div>

              </div>
            )}

            {/* Smart Seat Intelligence Guidance */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#E7CB58]">
                <Sparkles className="w-4 h-4" />
                <span>Smart Seat Intelligence™ Recommendations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between font-mono text-[11px] text-white">
                      <span>Berth {rec.seatNumber} ({rec.deck} deck)</span>
                      <span className="text-[#E7CB58] text-[10px]">{rec.tag}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{rec.recommendationReason}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Fare Summary & Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-5 sticky top-24">
              
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Reservation Summary
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  {selectedSeatIds.length} of {maxPassengers} seat(s) selected
                </span>
              </div>

              {/* Selected Seats Badges */}
              <div>
                <span className="text-xs text-gray-400 font-mono block mb-2">Selected Berths:</span>
                {selectedSeatIds.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500 font-mono">
                    Click available berths on the seat map to lock
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeatIds.map(num => (
                      <span
                        key={num}
                        className="px-3 py-1 rounded-lg bg-[#E7CB58] text-black font-mono font-bold text-xs flex items-center space-x-1.5"
                      >
                        <span>Berth {num}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-white/10 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Base Seat Fare ({selectedSeatIds.length}x)</span>
                  <span>₹{baseFare * selectedSeatIds.length}</span>
                </div>
                {totalSeatCharges > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Premium Berth Multiplier</span>
                    <span>₹{totalSeatCharges}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>GST (5%)</span>
                  <span>₹{taxesGst}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Passenger Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Payable Amount</span>
                  <span className="text-base text-[#E7CB58]">₹{estimatedTotal}</span>
                </div>
              </div>

              {/* Concurrency protection badge */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400 leading-snug space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  <span>CONCURRENCY SAFEGUARD</span>
                </div>
                <p>
                  Selected seats are locked for 5 minutes via atomic hold tokens to prevent double-booking.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={selectedSeatIds.length === 0 || isHolding}
                onClick={handleProceedToCheckout}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:scale-[1.02] active:scale-[0.99] text-black font-display font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue to Passenger Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
