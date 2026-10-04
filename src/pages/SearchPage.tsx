import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { Schedule } from '../../shared/types';
import { PriceTrendChart } from '../components/PriceTrendChart';
import { PriceWatch } from '../components/PriceWatch';
import { IntelligentRouteOptimizer } from '../components/IntelligentRouteOptimizer';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const sourceCity = searchParams.get('source') || searchParams.get('from') || 'Coimbatore';
  const destCity = searchParams.get('destination') || searchParams.get('to') || 'Bengaluru';
  const travelDate = searchParams.get('date') || '';
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);

  // Filter States
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'All');
  const [sleeperOnly, setSleeperOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);
  const [departureTimeRange, setDepartureTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('departure');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Data States
  const [schedules, setSchedules] = useState<any[]>([]);
  const [multiLegOption, setMultiLegOption] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  // AI City Guide States
  const [cityGuide, setCityGuide] = useState<any | null>(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);

  useEffect(() => {
    if (!destCity) return;
    async function loadGuide() {
      setIsGuideLoading(true);
      try {
        const guide = await api.getCityGuide(destCity);
        setCityGuide(guide);
      } catch (err) {
        console.error('Failed fetching AI city guide:', err);
      } finally {
        setIsGuideLoading(false);
      }
    }
    loadGuide();
  }, [destCity]);

  // Fetch buses matching parameters
  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await api.searchBuses({
          source: sourceCity,
          destination: destCity,
          date: travelDate,
          category: category !== 'All' ? category : undefined,
          sleeperOnly: sleeperOnly ? 'true' : undefined,
          acOnly: acOnly ? 'true' : undefined,
          departureTimeRange: departureTimeRange !== 'all' ? departureTimeRange : undefined,
          sortBy,
          maxPrice: maxPrice || undefined,
        });
        setSchedules(res.schedules || []);
        setMultiLegOption(res.multiLegOption || null);
      } catch (err) {
        console.error('Error fetching buses:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [sourceCity, destCity, travelDate, category, sleeperOnly, acOnly, departureTimeRange, sortBy, maxPrice]);

  const handleSelectSeats = (scheduleId: string) => {
    navigate(`/seats/${scheduleId}?passengers=${passengerCount}`);
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Summary Strip */}
        <div className="bg-[#16181F] border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono mb-1">
              <span>OUTSTATION CORRIDOR</span>
              <span>•</span>
              <span className="text-[#E7CB58] font-bold">VERIFIED OPERATING INVENTORY</span>
            </div>
            <div className="flex items-center space-x-3 text-xl sm:text-2xl font-display font-bold text-white">
              <span>{sourceCity}</span>
              <ArrowRight className="w-5 h-5 text-[#E7CB58]" />
              <span>{destCity}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3 font-mono">
              <span>{travelDate || 'Any Date Available'}</span>
              <span>•</span>
              <span>{passengerCount} Traveler{passengerCount > 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{schedules.length} Direct Coach Options</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors"
            >
              Modify Route
            </button>
            <div className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE DISPATCH FEED</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters + Result List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ========================================================
              LEFT SIDEBAR: INTELLIGENT FILTERS
             ======================================================== */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-6 sticky top-24">
              
              {/* Trend Chart */}
              <div className="pb-6 border-b border-white/10">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-3">
                  Price Forecast (7 Days)
                </label>
                <PriceTrendChart />
              </div>

              {/* Price Watch */}
              <PriceWatch source={sourceCity} destination={destCity} />

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <SlidersHorizontal className="w-4 h-4 text-[#E7CB58]" />
                  <span>Filter Telemetry</span>
                </div>
                <button
                  onClick={() => {
                    setCategory('All');
                    setSleeperOnly(false);
                    setAcOnly(false);
                    setDepartureTimeRange('all');
                    setMaxPrice(2000);
                  }}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-2">
                  Sort Departures By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                >
                  <option value="departure">Earliest Departure</option>
                  <option value="price_asc">Lowest Base Fare</option>
                  <option value="duration">Fastest Duration</option>
                  <option value="seats">Most Available Seats</option>
                </select>
              </div>

              {/* Departure Time Slots */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-2">
                  Departure Window
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { key: 'all', label: 'All Times' },
                    { key: 'morning', label: 'Morning (6-12)' },
                    { key: 'afternoon', label: 'Afternoon (12-17)' },
                    { key: 'evening', label: 'Evening (17-21)' },
                    { key: 'night', label: 'Night (21-6)' },
                  ].map(slot => (
                    <button
                      key={slot.key}
                      onClick={() => setDepartureTimeRange(slot.key)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors text-left ${
                        departureTimeRange === slot.key
                          ? 'bg-[#E7CB58] text-black font-semibold'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coach Category */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-2">
                  Coach Category
                </label>
                <div className="space-y-1.5">
                  {['All', 'Electric Hyperliner', 'Volvo Multi-Axle', 'AC Sleeper', 'Seater'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        category === cat
                          ? 'bg-[#E7CB58]/15 border border-[#E7CB58]/40 text-[#E7CB58] font-semibold'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sleeperOnly}
                    onChange={(e) => setSleeperOnly(e.target.checked)}
                    className="rounded bg-black border-white/20 text-[#E7CB58] focus:ring-0"
                  />
                  <span>Sleeper Berths Only</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acOnly}
                    onChange={(e) => setAcOnly(e.target.checked)}
                    className="rounded bg-black border-white/20 text-[#E7CB58] focus:ring-0"
                  />
                  <span>Air-Conditioned Only</span>
                </label>
              </div>

              {/* Max Price Slider */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 font-mono">Max Budget:</span>
                  <span className="text-[#E7CB58] font-bold font-mono">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-[#E7CB58] cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* ========================================================
              RIGHT AREA: SCHEDULED BUSES
             ======================================================== */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Intelligent Route Optimizer */}
            <IntelligentRouteOptimizer sourceCity={sourceCity} destCity={destCity} />

            {/* AI City Guide Module */}
            {isGuideLoading ? (
              <div className="p-5 rounded-2xl bg-[#16181F] border border-purple-500/20 animate-pulse space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs font-mono text-gray-400">Consulting Gemini AI Guide for {destCity}...</span>
                </div>
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ) : cityGuide ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#16181F] to-[#16181F] border border-white/10 space-y-4">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-white flex items-center space-x-1.5">
                        <span>{destCity} Travel Guide</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono font-bold uppercase tracking-wider">AI Insight</span>
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Automated highway travel briefing & checkpoint guide</p>
                    </div>
                  </div>

                  {/* Safety Rating badge */}
                  {cityGuide.safetyRating && (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Safety index: {cityGuide.safetyRating}</span>
                    </div>
                  )}
                </div>

                {/* Cultural Summary */}
                <p className="text-xs text-gray-300 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/5">
                  "{cityGuide.summary}"
                </p>

                {/* Tips & Places Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Essential Local Tips */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#E7CB58] uppercase tracking-wider block">🔑 Essential Local Transit Tips</span>
                    <ul className="space-y-2 text-xs">
                      {cityGuide.essentialTips?.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2 text-gray-300 leading-relaxed font-mono text-[11px]">
                          <span className="text-purple-400 shrink-0 font-bold">0{idx + 1}.</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Must-See Landmarks */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">🗺️ Recommended Sights & Sights</span>
                    <div className="space-y-2 text-xs">
                      {cityGuide.mustSeePlaces?.map((place: any, pIdx: number) => (
                        <div key={pIdx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="font-bold text-white font-mono text-[11px] flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>{place.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-mono leading-relaxed">{place.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : null}

            {/* Multi-Leg Graph Recommendation (FlashRoute) */}
            {multiLegOption && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-[#16181F] border border-purple-500/30 mb-4 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono uppercase">
                      FlashRoute™ 1-Stop Transfer
                    </span>
                    <span className="text-xs font-semibold text-white">Guaranteed Highway Connection</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#E7CB58]">Total: ₹{multiLegOption.totalFare}</span>
                </div>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                  {multiLegOption.itineraryExplanation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-gray-400 text-[10px] block">LEG 1: DIRECT COACH</span>
                    <span className="text-white font-semibold">{multiLegOption.leg1.from} → {multiLegOption.leg1.to}</span>
                    <div className="text-gray-400 text-[11px]">{multiLegOption.leg1.busName}</div>
                  </div>
                  <div>
                    <span className="text-purple-300 text-[10px] block">LEG 2: CONNECTING COACH</span>
                    <span className="text-white font-semibold">{multiLegOption.leg2.from} → {multiLegOption.leg2.to}</span>
                    <div className="text-gray-400 text-[11px]">{multiLegOption.leg2.busName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#E7CB58] border-t-transparent animate-spin mx-auto" />
                <span className="text-xs font-mono text-gray-400 block">Querying FLASHX Autonomous Inventory...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && schedules.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#16181F] border border-white/10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-display font-bold text-white">No departures match current filters</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Try adjusting departure time ranges, coach categories, or budget limits to reveal available coaches on this corridor.
                </p>
                <button
                  onClick={() => {
                    setCategory('All');
                    setSleeperOnly(false);
                    setAcOnly(false);
                    setDepartureTimeRange('all');
                    setMaxPrice(2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold hover:bg-amber-400 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* List of Verified Coach Schedules */}
            {!isLoading && schedules.map((sch: any) => {
              const depDate = new Date(sch.departureTime);
              const arrDate = new Date(sch.arrivalTime);
              const isExpanded = expandedScoreId === sch.id;

              return (
                <div
                  key={sch.id}
                  className="bg-[#16181F] border border-white/10 hover:border-[#E7CB58]/40 rounded-2xl p-5 transition-all shadow-xl space-y-4 relative"
                >
                  {/* Top Coach Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className="font-display font-bold text-sm text-white">{sch.bus.busName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                        {sch.bus.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                        {sch.bus.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-gray-400">{sch.bus.operatorName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                        {sch.bus.operatorRating} ★
                      </span>
                    </div>
                  </div>

                  {/* Main Journey Times & Route Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    
                    {/* Departure info */}
                    <div className="sm:col-span-3">
                      <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                        {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="text-xs font-semibold text-gray-300 truncate">
                        {sch.route.sourceTerminal.split('/')[0]}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {depDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Duration / Arrow / Distance */}
                    <div className="sm:col-span-3 text-center space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {sch.route.estimatedHours} hrs • {sch.route.distanceKm} km
                      </span>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-0.5 w-12 bg-white/20" />
                        <Compass className="w-3.5 h-3.5 text-[#E7CB58]" />
                        <div className="h-0.5 w-12 bg-white/20" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        Direct Highway Route
                      </span>
                    </div>

                    {/* Arrival info */}
                    <div className="sm:col-span-3 sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                        {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="text-xs font-semibold text-gray-300 truncate">
                        {sch.route.destTerminal.split('/')[0]}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {arrDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="sm:col-span-3 sm:text-right sm:border-l sm:border-white/10 sm:pl-4 space-y-2">
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono block uppercase">Starts at</span>
                        <div className="text-2xl font-display font-extrabold text-[#E7CB58]">
                          ₹{sch.baseFare}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono block">+ GST 5% at checkout</span>
                      </div>

                      <button
                        onClick={() => handleSelectSeats(sch.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E7CB58] to-amber-500 hover:scale-[1.02] text-black font-semibold text-xs tracking-wide shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <span>Select Seats</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Intelligence Factors & Available Seats Bar */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Journey Success Score Badge */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setExpandedScoreId(isExpanded ? null : sch.id)}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">{sch.journeySuccessScore}/100</span>
                        <span className="text-[10px] hidden sm:inline">Success Score™</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                      </button>

                      {/* AI Delay Predictor Badge */}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>
                          {sch.delayPrediction?.estimatedDelayMin === 0
                            ? 'On-time (0m delay)'
                            : `+${sch.delayPrediction?.estimatedDelayMin}m expected`}
                        </span>
                      </span>
                    </div>

                    {/* Available Seats status */}
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className="text-gray-400">Available:</span>
                      <span className="text-[#E7CB58] font-bold">
                        {sch.availableSeatsCount} / {sch.bus.totalSeats} seats
                      </span>
                    </div>

                  </div>

                  {/* Expandable Journey Success Score Explanation */}
                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400 border-b border-white/10 pb-1.5">
                        <span>Explainable Score Breakdown:</span>
                        <span>Estimated suitability for this trip</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                        <div>Punctuality: <b className="text-white">{sch.journeyScoreFactors?.punctualityIndex}%</b></div>
                        <div>Weather Road Safety: <b className="text-white">{sch.journeyScoreFactors?.weatherSafetyIndex}%</b></div>
                        <div>Operator Grade: <b className="text-white">{sch.journeyScoreFactors?.operatorReliability}%</b></div>
                        <div>Comfort Index: <b className="text-white">{sch.journeyScoreFactors?.comfortEquipScore}%</b></div>
                      </div>
                      <ul className="list-disc list-inside text-gray-300 text-[11px] space-y-1 pt-1">
                        {sch.intelligenceExplanations?.map((exp: string, i: number) => (
                          <li key={i}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </div>
  );
};
