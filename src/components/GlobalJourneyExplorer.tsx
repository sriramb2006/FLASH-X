import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Compass,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Info,
  X,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { Booking } from '../../shared/types';

interface GlobalJourneyExplorerProps {
  bookings: Booking[];
  activeBooking?: Booking;
}

interface CityCoord {
  name: string;
  country: string;
  x: number;
  y: number;
}

// Normalized SVG Coordinates (viewBox 0 0 900 500)
const CITY_COORDINATES: Record<string, CityCoord> = {
  // India & Regional hubs
  'coimbatore': { name: 'Coimbatore', country: 'India', x: 570, y: 310 },
  'bengaluru': { name: 'Bengaluru', country: 'India', x: 580, y: 285 },
  'chennai': { name: 'Chennai', country: 'India', x: 605, y: 280 },
  'kochi': { name: 'Kochi', country: 'India', x: 565, y: 325 },
  'hyderabad': { name: 'Hyderabad', country: 'India', x: 585, y: 250 },
  'madurai': { name: 'Madurai', country: 'India', x: 580, y: 325 },
  'mysore': { name: 'Mysore', country: 'India', x: 568, y: 290 },
  'salem': { name: 'Salem', country: 'India', x: 585, y: 298 },
  'wayanad': { name: 'Wayanad', country: 'India', x: 560, y: 305 },
  'goa': { name: 'Goa', country: 'India', x: 550, y: 275 },
  'mumbai': { name: 'Mumbai', country: 'India', x: 545, y: 240 },
  'pune': { name: 'Pune', country: 'India', x: 552, y: 250 },
  'delhi': { name: 'Delhi', country: 'India', x: 565, y: 195 },
  'jaipur': { name: 'Jaipur', country: 'India', x: 550, y: 210 },
  // International Global Hubs
  'dubai': { name: 'Dubai', country: 'UAE', x: 480, y: 220 },
  'singapore': { name: 'Singapore', country: 'Singapore', x: 690, y: 320 },
  'bangkok': { name: 'Bangkok', country: 'Thailand', x: 660, y: 260 },
  'london': { name: 'London', country: 'UK', x: 280, y: 140 },
};

function getCityCoord(cityName: string): CityCoord {
  const norm = (cityName || '').trim().toLowerCase();
  for (const [key, coord] of Object.entries(CITY_COORDINATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coord;
    }
  }
  // Fallback hash-based positioning near South Asia
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) hash = (hash << 5) - hash + cityName.charCodeAt(i);
  const x = 550 + (Math.abs(hash) % 80);
  const y = 260 + (Math.abs(hash >> 3) % 80);
  return { name: cityName, country: 'Destination', x, y };
}

export const GlobalJourneyExplorer: React.FC<GlobalJourneyExplorerProps> = ({
  bookings,
  activeBooking
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [selectedTrip, setSelectedTrip] = useState<Booking | null>(null);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'GLOBAL' | 'CORRIDOR'>('GLOBAL');

  // Filtered journeys
  const filteredBookings = bookings.filter(b => {
    if (filterMode === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'PENDING';
    if (filterMode === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'CANCELLED';
    return true;
  });

  // Calculate stats
  const totalCitiesVisited = new Set(
    bookings.flatMap(b => [b.sourceCity, b.destCity].filter(Boolean))
  ).size;

  const totalKilometers = bookings.reduce((sum, b) => {
    // Estimated 380km per route average
    return sum + (b.totalAmount > 1500 ? 520 : 360);
  }, 0);

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl font-mono relative">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E7CB58] to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/15">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-white text-xl">Global Journey Explorer™</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                Vector GIS Matrix
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Interactive world route visualizer. Click any route trajectory to inspect passenger milestones, digital passes, and telemetries.
            </p>
          </div>
        </div>

        {/* View & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'ALL' ? 'bg-[#E7CB58] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Trips ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'UPCOMING' ? 'bg-purple-500 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'COMPLETED' ? 'bg-emerald-500 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Past ({bookings.filter(b => b.status === 'COMPLETED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Metrics Counter Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 border border-white/5 p-3.5 rounded-2xl text-xs">
        <div className="space-y-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest block">EXPLORER MILEAGE</span>
          <span className="text-base font-bold text-[#E7CB58]">{totalKilometers.toLocaleString()} KM</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest block">CONNECTED HUBS</span>
          <span className="text-base font-bold text-cyan-400">{totalCitiesVisited} Destinations</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest block">EXPEDITIONS LOGGED</span>
          <span className="text-base font-bold text-purple-400">{bookings.length} Registered</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest block">EXPLORER RANK</span>
          <span className="text-base font-bold text-emerald-400">Sovereign Voyager</span>
        </div>
      </div>

      {/* Interactive SVG World Map Canvas */}
      <div className="relative w-full h-[460px] bg-[#0c0d12] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center shadow-inner group">
        
        {/* Subtle Map Coordinate Grid */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Dynamic SVG Map */}
        <svg
          className="w-full h-full p-4"
          viewBox="0 0 900 480"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients for Route Lines */}
            <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E7CB58" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="pastRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="upcomingRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Continents & Landmass Vector Silhouettes */}
          <g className="fill-slate-800/40 stroke-slate-700/50 stroke-[0.75] select-none pointer-events-none">
            {/* Europe & Middle East */}
            <path d="M 220 100 Q 280 80 340 120 T 420 180 Q 480 200 460 250 T 360 260 Q 280 240 240 180 Z" />
            {/* South Asia & Indian Subcontinent */}
            <path d="M 520 180 Q 560 170 600 200 Q 620 250 580 340 Q 560 360 550 340 Q 530 270 510 230 Z" />
            {/* Southeast Asia & East Asia */}
            <path d="M 640 180 Q 720 170 780 220 T 730 320 Q 680 340 650 280 Z" />
            {/* Africa outline hint */}
            <path d="M 280 220 Q 360 230 380 310 T 340 420 Q 280 440 250 350 Z" />
            {/* Australia / Oceania */}
            <path d="M 750 340 Q 840 330 830 400 T 740 410 Z" />
          </g>

          {/* Latitude & Longitude Geodesic Rings */}
          <g className="stroke-white/5 stroke-[0.5] fill-none stroke-dasharray-4">
            <line x1="0" y1="240" x2="900" y2="240" />
            <line x1="0" y1="120" x2="900" y2="120" />
            <line x1="0" y1="360" x2="900" y2="360" />
            <line x1="450" y1="0" x2="450" y2="480" />
          </g>

          {/* Render All Trip Arcs / Trajectories */}
          {filteredBookings.map((b) => {
            const pA = getCityCoord(b.sourceCity);
            const pB = getCityCoord(b.destCity);

            const isCurrentActive = activeBooking?.id === b.id;
            const isCompleted = b.status === 'COMPLETED';
            const isHovered = hoveredTripId === b.id;
            const isSelected = selectedTrip?.id === b.id;

            // Compute bezier curve midpoint arc
            const dx = pB.x - pA.x;
            const dy = pB.y - pA.y;
            const cx = (pA.x + pB.x) / 2 - dy * 0.25;
            const cy = (pA.y + pB.y) / 2 + dx * 0.15;
            const pathD = `M ${pA.x} ${pA.y} Q ${cx} ${cy} ${pB.x} ${pB.y}`;

            const strokeColor = isCurrentActive
              ? '#E7CB58'
              : isCompleted
              ? '#10B981'
              : '#A855F7';

            return (
              <g key={b.id} className="cursor-pointer">
                {/* Thick clickable hit-box area */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  onClick={() => setSelectedTrip(b)}
                  onMouseEnter={() => setHoveredTripId(b.id)}
                  onMouseLeave={() => setHoveredTripId(null)}
                />

                {/* Glowing Outer Path on Hover/Active */}
                {(isHovered || isSelected || isCurrentActive) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isCurrentActive ? "10" : "8"}
                    strokeOpacity={isCurrentActive ? "0.35" : "0.2"}
                    strokeLinecap="round"
                    className={isCurrentActive ? "animate-pulse" : ""}
                  />
                )}

                {/* Main Trajectory Curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isCurrentActive ? "3.5" : isSelected ? "3" : "2"}
                  strokeDasharray={isCompleted ? "4,4" : isCurrentActive ? "none" : "6,3"}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  onClick={() => setSelectedTrip(b)}
                  onMouseEnter={() => setHoveredTripId(b.id)}
                  onMouseLeave={() => setHoveredTripId(null)}
                />

                {/* Mid-Route Interactive Waypoint Pin */}
                <g
                  transform={`translate(${cx}, ${cy})`}
                  onClick={() => setSelectedTrip(b)}
                  onMouseEnter={() => setHoveredTripId(b.id)}
                  onMouseLeave={() => setHoveredTripId(null)}
                >
                  <circle
                    r={isSelected || isHovered ? "7" : "4.5"}
                    fill={strokeColor}
                    stroke="#000"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  {isCurrentActive && (
                    <circle r="12" fill="rgba(231,203,88,0.3)" className="animate-ping" />
                  )}
                </g>
              </g>
            );
          })}

          {/* Render Unique City Node Pins */}
          {(() => {
            const renderedCities = new Map<string, CityCoord>();
            filteredBookings.forEach(b => {
              if (b.sourceCity) renderedCities.set(b.sourceCity.toLowerCase(), getCityCoord(b.sourceCity));
              if (b.destCity) renderedCities.set(b.destCity.toLowerCase(), getCityCoord(b.destCity));
            });

            return Array.from(renderedCities.values()).map((city, idx) => {
              const isSourceOfSelected = selectedTrip && selectedTrip.sourceCity.toLowerCase().includes(city.name.toLowerCase());
              const isDestOfSelected = selectedTrip && selectedTrip.destCity.toLowerCase().includes(city.name.toLowerCase());
              const isHighlight = isSourceOfSelected || isDestOfSelected;

              return (
                <g key={idx} transform={`translate(${city.x}, ${city.y})`} className="cursor-pointer group select-none">
                  {isHighlight && (
                    <circle r="14" fill="rgba(231,203,88,0.35)" className="animate-ping" />
                  )}
                  
                  <circle
                    r={isHighlight ? "6.5" : "4.5"}
                    fill={isHighlight ? "#E7CB58" : "#fff"}
                    stroke="#000"
                    strokeWidth="1.5"
                  />
                  
                  {/* City Label */}
                  <text
                    y={idx % 2 === 0 ? "-10" : "14"}
                    textAnchor="middle"
                    fill={isHighlight ? "#E7CB58" : "#94a3b8"}
                    className="text-[8px] font-mono font-bold group-hover:fill-white transition-colors"
                  >
                    {city.name}
                  </text>
                </g>
              );
            });
          })()}
        </svg>

        {/* Legend Overlay in Map Corner */}
        <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-[10px] text-gray-300 space-y-1.5 shadow-xl pointer-events-none">
          <span className="font-bold text-white uppercase block text-[9px] text-gray-400">Trajectory Index</span>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-[#E7CB58] rounded-full inline-block" />
            <span>Active Real-Time Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-purple-400 border border-purple-300 border-dashed rounded-full inline-block" />
            <span>Scheduled Upcoming Trip</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-emerald-400 border border-emerald-300 border-dashed rounded-full inline-block" />
            <span>Archived / Completed Journey</span>
          </div>
        </div>

        {/* Instructions pill */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-300">
          💡 Click any trajectory arc to open trip summary
        </div>

      </div>

      {/* ========================================================
          TRIP SPECIFIC SUMMARY POPOVER / MODAL CARD
         ======================================================== */}
      {selectedTrip && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1b1e28] to-[#12131a] border border-amber-500/40 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          <div className="flex flex-wrap items-start justify-between pb-3 border-b border-white/10 gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  selectedTrip.status === 'CONFIRMED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : selectedTrip.status === 'COMPLETED'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {selectedTrip.status} JOURNEY
                </span>
                <span className="text-[10px] text-gray-400">Ref: {selectedTrip.bookingReference}</span>
              </div>
              
              <h4 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                {selectedTrip.sourceCity} <span className="text-[#E7CB58]">→</span> {selectedTrip.destCity}
              </h4>
              <div className="text-xs text-amber-300 font-mono">
                {selectedTrip.busName} • {selectedTrip.operatorName}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTrip(null)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close Trip Summary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid of Key Journey Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block">Departure</span>
              <div className="text-white font-bold">{new Date(selectedTrip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div className="text-emerald-400 font-mono text-[11px]">{new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block">Arrival Bay</span>
              <div className="text-white font-bold">{new Date(selectedTrip.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div className="text-cyan-400 font-mono text-[11px]">{new Date(selectedTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block">Berth Allocation</span>
              <div className="text-[#E7CB58] font-bold text-sm">
                {selectedTrip.seats?.map(s => s.seatNumber).join(', ') || 'Berth L1A'}
              </div>
              <div className="text-gray-400 text-[10px]">{selectedTrip.passengers?.length || 1} Passenger(s)</div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block">Fare & Miles</span>
              <div className="text-white font-bold text-sm">₹{selectedTrip.totalAmount.toLocaleString()}</div>
              <div className="text-amber-400 text-[10px]">+{Math.round(selectedTrip.totalAmount * 0.15)} FlashMiles</div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/10 gap-3">
            <div className="text-xs text-gray-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FlashGuardian™ Verified Passenger Manifest</span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/tickets/${selectedTrip.id}`}
                className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors flex items-center space-x-1.5 shadow-md shadow-amber-500/10"
              >
                <span>View Digital Ticket Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
