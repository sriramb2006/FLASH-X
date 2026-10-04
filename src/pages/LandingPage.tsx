import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Shield,
  Cpu,
  Clock,
  Navigation,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Zap,
  TrendingUp,
  Volume2,
  Heart,
  ChevronRight,
  Activity,
  Layers,
  Star
} from 'lucide-react';
import { api } from '../lib/api';

interface LandingPageProps {
  onOpenVoiceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenVoiceModal }) => {
  const navigate = useNavigate();

  // Search form state
  const [sourceCity, setSourceCity] = useState('Coimbatore');
  const [destCity, setDestCity] = useState('Bengaluru');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [passengerCount, setPassengerCount] = useState(1);
  const [category, setCategory] = useState('All');
  const [locations, setLocations] = useState<{ cities: string[]; terminals: any[] }>({
    cities: ['Coimbatore', 'Bengaluru', 'Chennai', 'Madurai', 'Kochi', 'Hyderabad'],
    terminals: [],
  });

  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  const handleSwap = () => {
    const temp = sourceCity;
    setSourceCity(destCity);
    setDestCity(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      source: sourceCity,
      destination: destCity,
      date: travelDate,
      passengers: String(passengerCount),
      category: category !== 'All' ? category : '',
    });
    navigate(`/search?${query.toString()}`);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setSourceCity(from);
    setDestCity(to);
    const query = new URLSearchParams({
      source: from,
      destination: to,
      date: travelDate,
    });
    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white selection:bg-[#E7CB58] selection:text-black">
      
      {/* ========================================================
          1. CINEMATIC HERO SECTION
         ======================================================== */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-10 pb-20 overflow-hidden grid-bg">
        
        {/* Atmospheric radial lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#E7CB58]/15 via-purple-600/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Official Brand Identity Emblem */}
        <div className="flex flex-col items-center justify-center mb-5 group">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border border-amber-500/40 p-1 overflow-hidden shadow-2xl shadow-amber-500/25 group-hover:scale-105 group-hover:border-amber-400 transition-all">
            <img
              src="/flashx_os_logo.jpg"
              alt="FLASH-X Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <span className="text-[11px] font-mono text-[#E7CB58] tracking-widest uppercase font-semibold mt-2.5">
            Beyond Booking. Beyond Navigation. Beyond Travel.
          </span>
        </div>

        {/* System telemetry bar */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E7CB58] animate-ping" />
          <span className="text-[#E7CB58] font-bold">FLASH-X CORE</span>
          <span className="text-gray-500">|</span>
          <span>Intercity Travel Intelligence Platform</span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="hidden sm:inline text-emerald-400">Autonomous Telemetry</span>
        </div>

        {/* Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
            Travel intelligently. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7CB58] via-amber-300 to-amber-500">
              Arrive confidently.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            "Don't just book a seat. Orchestrate the entire journey." — Outstation bus travel transformed by predictive telemetry, Smart Seat Intelligence, and automated safety check-ins.
          </p>
        </div>

        {/* ========================================================
            INTELLIGENT JOURNEY SEARCH WORKSPACE (Signature Component)
           ======================================================== */}
        <div className="w-full max-w-5xl mt-10 z-10">
          <div className="bg-[#16181F]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 relative">
            
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between pb-5 mb-5 border-b border-white/10 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#E7CB58] text-black flex items-center justify-center font-bold text-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-display font-semibold text-white uppercase tracking-wider">
                  Corridor Journey Planner
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE NETWORK INVENTORY</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#E7CB58] text-xs font-mono flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Voice-to-Journey™</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                
                {/* Origin Selector */}
                <div className="md:col-span-3 bg-black/40 rounded-2xl p-3 border border-white/10 hover:border-[#E7CB58]/40 transition-colors">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Origin Station
                  </label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#E7CB58] flex-shrink-0" />
                    <select
                      value={sourceCity}
                      onChange={(e) => setSourceCity(e.target.value)}
                      className="bg-transparent text-white font-semibold text-sm focus:outline-none w-full cursor-pointer"
                    >
                      {locations.cities.map((city) => (
                        <option key={city} value={city} className="bg-[#1A1D26] text-white">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                    {sourceCity === 'Coimbatore' ? 'Gandhipuram Terminal' : `${sourceCity} Hub`}
                  </span>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-gray-300 hover:text-[#E7CB58] transition-transform hover:rotate-180"
                    title="Swap Origin and Destination"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Selector */}
                <div className="md:col-span-3 bg-black/40 rounded-2xl p-3 border border-white/10 hover:border-[#E7CB58]/40 transition-colors">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Destination Station
                  </label>
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <select
                      value={destCity}
                      onChange={(e) => setDestCity(e.target.value)}
                      className="bg-transparent text-white font-semibold text-sm focus:outline-none w-full cursor-pointer"
                    >
                      {locations.cities.map((city) => (
                        <option key={city} value={city} className="bg-[#1A1D26] text-white">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                    {destCity === 'Bengaluru' ? 'Madiwala / Majestic Hub' : `${destCity} Central`}
                  </span>
                </div>

                {/* Travel Date */}
                <div className="md:col-span-3 bg-black/40 rounded-2xl p-3 border border-white/10 hover:border-[#E7CB58]/40 transition-colors">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Departure Date
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="bg-transparent text-white font-semibold text-sm focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Select preferred journey day
                  </span>
                </div>

                {/* Action CTA */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:scale-[1.02] active:scale-[0.99] text-black font-display font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Plan Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Category Filter Pills & Passenger Count */}
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-gray-400 text-[11px] font-mono mr-1">Coach Class:</span>
                  {['All', 'Electric Hyperliner', 'AC Sleeper', 'Volvo Multi-Axle', 'Seater'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        category === cat
                          ? 'bg-[#E7CB58] text-black font-semibold'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs">Travelers:</span>
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value, 10))}
                    className="bg-white/10 border border-white/10 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num} className="bg-[#1A1D26]">
                        {num} {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>

          </div>
        </div>

        {/* Popular Intercity Corridors Fast Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-4xl z-10 text-xs">
          <span className="text-gray-400 text-[11px] font-mono mr-1">Featured Corridors:</span>
          {[
            { from: 'Coimbatore', to: 'Bengaluru', label: 'Coimbatore ⇄ Bengaluru (NH544)', time: '6h 30m', fare: '₹750' },
            { from: 'Bengaluru', to: 'Chennai', label: 'Bengaluru ⇄ Chennai (NH48)', time: '5h 45m', fare: '₹980' },
            { from: 'Chennai', to: 'Madurai', label: 'Chennai ⇄ Madurai (NH45)', time: '7h 15m', fare: '₹1,050' },
            { from: 'Coimbatore', to: 'Kochi', label: 'Coimbatore ⇄ Kochi (Palakkad Gap)', time: '4h 30m', fare: '₹850' },
            { from: 'Bengaluru', to: 'Hyderabad', label: 'Bengaluru ⇄ Hyderabad (NH44)', time: '8h 30m', fare: '₹1,500' },
          ].map((corridor, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickRoute(corridor.from, corridor.to)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 text-gray-300 hover:text-white transition-all flex items-center space-x-2"
            >
              <span>{corridor.label}</span>
              <span className="text-[#E7CB58] font-mono font-semibold">{corridor.fare}</span>
            </button>
          ))}
        </div>

      </section>

      {/* ========================================================
          2. SIX CONNECTED INTELLIGENCE MODULES (The PPT Pillars)
         ======================================================== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>INTELLIGENCE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            Six Autonomous Travel Engines
          </h2>
          <p className="text-gray-400 text-sm sm:text-base font-light">
            Connecting schedules, seat telemetry, route risk, and passenger preferences into a unified mobility operating system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Module 1: FlashMind */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-[#E7CB58]/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#E7CB58]/15 text-[#E7CB58] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashMind™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">Predictive</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Multi-criteria ranking engine predicting suitable itineraries. Calculates Journey Success Score™ factoring punctuality, weather risk, and coach equipment.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>Factors: Arrival Constraints • Reliability • Legroom</span>
            </div>
          </div>

          {/* Module 2: FlashGuardian */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-pink-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashGuardian™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-400/10 text-pink-300 font-mono">Safety Shield</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Journey Safety & Risk Assistance. Features automated night check-in heartbeats, Women Safety Mode™, and one-tap emergency contact escalation.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>Features: Verified SOS • Trusted Contacts • Weather Radar</span>
            </div>
          </div>

          {/* Module 3: FlashDNA */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-purple-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashDNA™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-400/10 text-purple-300 font-mono">Personalization</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Remembers user-approved travel traits: sleeper vs seater, lower berth single pods, AC comfort, window views. Explicit passenger control to review or reset.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>Zero Dark Inferences • Fully User-Controlled</span>
            </div>
          </div>

          {/* Module 4: FlashRoute */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-cyan-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashRoute™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 font-mono">Multi-Leg Graph</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Constructs feasible multi-leg itineraries when direct buses are sold out. Validates transfer times (45m+ buffer) at verified highway oasis terminals.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>Graph Search • Guaranteed Connection Buffers</span>
            </div>
          </div>

          {/* Module 5: FlashTimeline */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-amber-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashTimeline™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">Orchestration</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              End-to-end trip timeline from packing reminders (-3h) to boarding-point arrival, highway rest stops, and terminal drop-off ETA.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>Milestone Alarms • Real-Time Progression</span>
            </div>
          </div>

          {/* Module 6: FlashReplay */}
          <div className="p-6 rounded-2xl bg-[#16181F] border border-white/10 hover:border-emerald-500/40 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-display font-bold text-white">FlashReplay™</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 font-mono">Memory & CO2</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Rich summary of completed journeys. Tracks carbon offset saved versus air travel, personal punctuality index, and verified comfort reviews.
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
              <span>CO2 Analytics • Searchable Trip History</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. ADVANCED PPT INNOVATIONS SHOWCASE
         ======================================================== */}
      <section className="py-20 bg-[#0E0F12] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E7CB58]/10 border border-[#E7CB58]/30 text-[#E7CB58] text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SIGNATURE INNOVATIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Designed for absolute travel clarity, not confusing hype.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                FLASHX OS replaces generic booking templates with specialized algorithms engineered for highway mobility in South India.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Journey Success Score™</h4>
                    <p className="text-xs text-gray-400">
                      Transparent 0-100 index based on route weather, operator punctuality records, road topography, and buffer feasibility.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Women Safety Mode™</h4>
                    <p className="text-xs text-gray-400">
                      Opt-in safety shield with reserved female berths, automatic trusted contact notification at boarding/drop-off, and one-tap discreet SOS.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Family Travel Monitor™</h4>
                    <p className="text-xs text-gray-400">
                      Consent-based link sharing. Family can check live milestone progress on the corridor without exposing ticket QR, passenger identity, or card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Interactive Preview Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#16181F] border border-[#E7CB58]/30 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase">Live Journey Telemetry Card</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">KA-01-FX-2026</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400">COACH</span>
                    <div className="text-sm font-bold text-white">Hyperline AI Titan 2.0</div>
                    <span className="text-[11px] text-amber-300 font-mono">Electric Hyperliner AC Sleeper</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-400">SUCCESS SCORE</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">96 / 100</div>
                    <span className="text-[10px] text-gray-400">High Suitability</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>Coimbatore (Gandhipuram)</span>
                    <span className="text-emerald-400 font-semibold">Bengaluru (Madiwala)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-[#E7CB58] w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>Dep: 22:30 IST</span>
                    <span>Midway: Salem NH544</span>
                    <span>Arr: 05:00 IST</span>
                  </div>
                </div>

                {/* Telemetry pill grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Cruising Speed</span>
                    <span className="text-white font-bold">84 km/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">AI Delay Predictor</span>
                    <span className="text-emerald-400 font-bold">+0m (On-time)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Cabin Climate</span>
                    <span className="text-cyan-400 font-bold">22.5°C HEPA</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => navigate('/search?source=Coimbatore&destination=Bengaluru')}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-[#E7CB58] hover:text-black text-white font-medium text-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>View Departures On This Route</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. VERIFIED OPERATORS & FLEET STANDARDS
         ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Authorized Fleet Network
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            Strictly vetted coach operators compliant with FLASHX OS safety telemetry and speed monitoring.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'FLASHX Hyperline', type: 'Electric Multi-Axle', rating: '4.9 ★', badge: 'Flagship' },
            { name: 'SRS Titanium', type: 'Volvo B11R Sleeper', rating: '4.8 ★', badge: 'Verified' },
            { name: 'IntrCity SmartBus', type: 'Private AC Lounge', rating: '4.7 ★', badge: 'Verified' },
            { name: 'GreenLine EV', type: 'Zero-Emission Coach', rating: '4.9 ★', badge: 'Eco Certified' },
            { name: 'KPN Dreamliner', type: 'Scania Metrolink HD', rating: '4.6 ★', badge: 'Verified' },
          ].map((op, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface border border-white/10 hover:border-white/20 transition-all text-center space-y-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono block w-max mx-auto mb-2">
                {op.badge}
              </span>
              <div className="font-semibold text-xs text-white truncate">{op.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{op.type}</div>
              <div className="text-xs text-amber-400 font-bold pt-1">{op.rating}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
