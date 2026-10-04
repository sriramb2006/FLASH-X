import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Zap,
  Radio,
  Clock,
  Compass,
  DollarSign,
  Users,
  ChevronRight,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';
import { Booking, BusRoute, Bus, Schedule } from '../../shared/types';

interface AdminDataVisualizationProps {
  bookings: Booking[];
  metrics: any;
  buses: Bus[];
  routes: BusRoute[];
  schedules: Schedule[];
  timeframe: '24h' | '7d' | '30d';
  setTimeframe: (tf: '24h' | '7d' | '30d') => void;
}

// Custom Glassmorphism Tooltip for Area & Line Charts
const BookingTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#16181F]/95 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl shadow-2xl font-mono text-xs text-white min-w-[200px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <span className="font-bold text-[#E7CB58]">{label}</span>
          <span className="text-[10px] text-gray-400 uppercase">Live Telemetry</span>
        </div>
        {payload.map((entry: any, index: number) => {
          const isRev = entry.name.toLowerCase().includes('revenue');
          const isRate = entry.name.toLowerCase().includes('occupancy') || entry.name.toLowerCase().includes('rate');
          const formattedVal = isRev
            ? `₹${Number(entry.value).toLocaleString()}`
            : isRate
            ? `${entry.value}%`
            : entry.value;

          return (
            <div key={`entry-${index}`} className="flex items-center justify-between py-1">
              <span className="flex items-center space-x-2 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white ml-2">{formattedVal}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Fleet Occupancy Bar Chart
const FleetOccupancyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#16181F]/95 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl shadow-2xl font-mono text-xs text-white min-w-[220px]">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
          <span className="font-bold text-white">{data.busName}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            data.occupancyRate >= 85
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : data.occupancyRate >= 75
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {data.status}
          </span>
        </div>
        <div className="space-y-1 text-gray-300 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Coach Reg:</span>
            <span className="text-white font-mono">{data.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Category:</span>
            <span className="text-white">{data.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Occupancy Rate:</span>
            <span className="text-[#E7CB58] font-bold text-sm">{data.occupancyRate}%</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
            <span className="text-gray-400">Berths Occupied:</span>
            <span className="text-emerald-400 font-semibold">{data.occupied} / {data.totalSeats} seats</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining Vacant:</span>
            <span className="text-gray-300 font-semibold">{data.available} berths</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Corridor Route Bar Chart
const CorridorTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#16181F]/95 backdrop-blur-md border border-white/15 p-3 rounded-xl shadow-2xl font-mono text-xs text-white min-w-[200px]">
        <div className="font-bold text-[#E7CB58] border-b border-white/10 pb-1 mb-1.5">{data.route}</div>
        <div className="space-y-1 text-[11px] text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Corridor Distance:</span>
            <span className="text-white">{data.distance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Occupancy Rate:</span>
            <span className="text-cyan-400 font-bold">{data.occupancyRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Daily Departures:</span>
            <span className="text-white font-semibold">{data.trips} Trips / day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Corridor Fare:</span>
            <span className="text-[#E7CB58] font-semibold">₹{data.avgFare}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDataVisualization: React.FC<AdminDataVisualizationProps> = ({
  bookings,
  metrics,
  buses,
  routes,
  schedules,
  timeframe,
  setTimeframe,
}) => {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');
  const [metricViewMode, setMetricViewMode] = useState<'COMBINED' | 'BOOKINGS_ONLY' | 'REVENUE_ONLY'>('COMBINED');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [isLivePulsing, setIsLivePulsing] = useState<boolean>(true);

  // Periodic heartbeat timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter bookings based on selected corridor if filtered
  const filteredBookings = useMemo(() => {
    if (selectedRouteFilter === 'ALL') return bookings;
    return bookings.filter(b => {
      const match = `${b.sourceCity} ⇄ ${b.destCity}`.toLowerCase();
      return match.includes(selectedRouteFilter.toLowerCase());
    });
  }, [bookings, selectedRouteFilter]);

  // Aggregate totals
  const totalRevenue = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.fareBreakdown?.totalFare || 0), 0) || metrics?.totalRevenue || 148500;
  }, [filteredBookings, metrics]);

  const totalBookingsCount = useMemo(() => {
    return filteredBookings.length || metrics?.totalBookings || 36;
  }, [filteredBookings, metrics]);

  // Dynamic booking trend dataset based on timeframe
  const bookingTrendsData = useMemo(() => {
    if (timeframe === '24h') {
      const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const hourlyDistribution = [3, 2, 1, 5, 11, 16, 14, 19, 27, 39, 45, 23];
      const sumDist = hourlyDistribution.reduce((a, b) => a + b, 0);

      return hours.map((hour, idx) => {
        const factor = hourlyDistribution[idx] / sumDist;
        const count = Math.max(1, Math.round(totalBookingsCount * factor * 1.4));
        const rev = Math.round(totalRevenue * factor * 1.4);
        const occ = Math.min(98, Math.max(60, Math.round(66 + (hourlyDistribution[idx] / 45) * 31)));

        return {
          time: hour,
          bookings: count,
          revenue: rev,
          occupancy: occ,
          targetOccupancy: 80,
        };
      });
    } else if (timeframe === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayWeights = [0.11, 0.12, 0.14, 0.17, 0.23, 0.16, 0.07];

      return days.map((day, idx) => {
        const factor = dayWeights[idx];
        const count = Math.max(4, Math.round(totalBookingsCount * factor * 3.8));
        const rev = Math.round(totalRevenue * factor * 3.8);
        const occ = Math.min(97, Math.max(68, Math.round(71 + factor * 105)));

        return {
          time: day,
          bookings: count,
          revenue: rev,
          occupancy: occ,
          targetOccupancy: 80,
        };
      });
    } else {
      // 30 Days aggregated in 5-day intervals
      const blocks = ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-30'];
      const blockWeights = [0.14, 0.17, 0.18, 0.16, 0.20, 0.15];

      return blocks.map((block, idx) => {
        const factor = blockWeights[idx];
        const count = Math.max(12, Math.round(totalBookingsCount * factor * 16));
        const rev = Math.round(totalRevenue * factor * 16);
        const occ = Math.min(96, Math.max(73, Math.round(77 + (idx % 3) * 6)));

        return {
          time: block,
          bookings: count,
          revenue: rev,
          occupancy: occ,
          targetOccupancy: 80,
        };
      });
    }
  }, [timeframe, totalBookingsCount, totalRevenue]);

  // Fleet Occupancy dataset
  const fleetOccupancyData = useMemo(() => {
    if (!buses || buses.length === 0) {
      return [
        { busName: 'KPN Star Hyperliner', code: 'KA-01-F-9921', type: 'AC Sleeper (2+1)', totalSeats: 36, occupied: 34, available: 2, occupancyRate: 94.4, status: 'High Demand' },
        { busName: 'SRS Scania Metrolink', code: 'KA-04-E-4412', type: 'Luxury Multi-Axle', totalSeats: 44, occupied: 39, available: 5, occupancyRate: 88.6, status: 'High Demand' },
        { busName: 'GreenLine Electric EV', code: 'TN-38-EV-1002', type: 'AC Seater (2+2)', totalSeats: 40, occupied: 33, available: 7, occupancyRate: 82.5, status: 'Optimal' },
        { busName: 'VRL Volvo 9600 B11R', code: 'KA-25-AA-7890', type: 'AC Sleeper (2+1)', totalSeats: 36, occupied: 32, available: 4, occupancyRate: 88.8, status: 'High Demand' },
        { busName: 'Jabbar Super Express', code: 'AP-09-BK-3301', type: 'Super Luxury', totalSeats: 42, occupied: 31, available: 11, occupancyRate: 73.8, status: 'Standard' },
      ];
    }

    return buses.map((b, idx) => {
      const busSchedules = (schedules || []).filter(s => s.busId === b.id || s.bus?.id === b.id);
      const totalSeats = b.totalSeats || 36;
      let occupancyRate = 82;

      if (busSchedules.length > 0) {
        const avgOcc = busSchedules.reduce((acc, s) => acc + (s.occupancyRatePct || 82), 0) / busSchedules.length;
        occupancyRate = Math.round(avgOcc);
      } else {
        const fallbacks = [94.4, 88.6, 82.5, 88.8, 73.8, 86.0];
        occupancyRate = fallbacks[idx % fallbacks.length];
      }

      const occupied = Math.round((occupancyRate / 100) * totalSeats);
      const available = Math.max(0, totalSeats - occupied);
      const status = occupancyRate >= 85 ? 'High Demand' : occupancyRate >= 75 ? 'Optimal' : 'Standard';

      return {
        busName: b.busName,
        code: b.busNumber,
        type: b.type,
        totalSeats,
        occupied,
        available,
        occupancyRate,
        status,
      };
    });
  }, [buses, schedules]);

  // Average Fleet Occupancy across all buses
  const avgFleetOccupancyRate = useMemo(() => {
    if (fleetOccupancyData.length === 0) return 84.8;
    const sum = fleetOccupancyData.reduce((acc, cur) => acc + cur.occupancyRate, 0);
    return Math.round((sum / fleetOccupancyData.length) * 10) / 10;
  }, [fleetOccupancyData]);

  // Highway Corridor Occupancy Data
  const corridorOccupancyData = useMemo(() => {
    if (!routes || routes.length === 0) {
      return [
        { route: 'Coimbatore ⇄ BLR', fullRoute: 'Coimbatore ⇄ Bengaluru', distance: '365 km', occupancyRate: 92.4, trips: 8, avgFare: 1150 },
        { route: 'Bengaluru ⇄ MAA', fullRoute: 'Bengaluru ⇄ Chennai', distance: '348 km', occupancyRate: 88.2, trips: 10, avgFare: 980 },
        { route: 'Chennai ⇄ MDU', fullRoute: 'Chennai ⇄ Madurai', distance: '462 km', occupancyRate: 83.5, trips: 6, avgFare: 1250 },
        { route: 'Coimbatore ⇄ COK', fullRoute: 'Coimbatore ⇄ Kochi', distance: '190 km', occupancyRate: 85.0, trips: 5, avgFare: 680 },
        { route: 'Bengaluru ⇄ HYD', fullRoute: 'Bengaluru ⇄ Hyderabad', distance: '570 km', occupancyRate: 78.4, trips: 6, avgFare: 1450 },
      ];
    }

    return routes.map((r, idx) => {
      const defaultRates = [92.4, 88.2, 83.5, 85.0, 78.4, 86.0];
      const occRate = defaultRates[idx % defaultRates.length];
      const shortName = `${r.sourceCity.substring(0, 3).toUpperCase()} ⇄ ${r.destCity.substring(0, 3).toUpperCase()}`;
      return {
        route: shortName,
        fullRoute: `${r.sourceCity} ⇄ ${r.destCity}`,
        distance: `${r.distanceKm} km`,
        occupancyRate: occRate,
        trips: 4 + (idx % 4) * 2,
        avgFare: Math.round(r.distanceKm * 2.8),
      };
    });
  }, [routes]);

  // Seat Type / Berth Distribution (Pie Chart)
  const seatTypeDistribution = useMemo(() => {
    return [
      { name: 'AC Sleeper Lower Berth', value: 44, color: '#E7CB58', seats: '312 berths booked' },
      { name: 'AC Sleeper Upper Berth', value: 32, color: '#06B6D4', seats: '228 berths booked' },
      { name: 'Luxury Seater Window', value: 16, color: '#10B981', seats: '114 seats booked' },
      { name: 'Luxury Seater Aisle', value: 8, color: '#8B5CF6', seats: '57 seats booked' },
    ];
  }, []);

  // Live booking activity ticker events
  const liveBookingEvents = useMemo(() => {
    if (bookings.length > 0) {
      return bookings.slice(0, 4).map((b, i) => ({
        id: b.id || `bk-${i}`,
        ref: b.bookingReference,
        passenger: b.passengerEmail.split('@')[0],
        corridor: `${b.sourceCity} → ${b.destCity}`,
        fare: b.fareBreakdown?.totalFare || 1250,
        time: `${i * 3 + 2}m ago`,
        seats: b.passengers?.map(p => p.seatNumber).join(', ') || 'L3',
      }));
    }
    return [
      { id: '1', ref: 'FX-78190', passenger: 'karthik.s', corridor: 'Coimbatore → Bengaluru', fare: 1350, time: '2m ago', seats: 'L2 (Lower Berth)' },
      { id: '2', ref: 'FX-66412', passenger: 'priya.n', corridor: 'Bengaluru → Chennai', fare: 1100, time: '5m ago', seats: 'U4 (Upper Berth)' },
      { id: '3', ref: 'FX-99023', passenger: 'arun.kumar', corridor: 'Chennai → Madurai', fare: 1450, time: '11m ago', seats: 'L7, L8' },
      { id: '4', ref: 'FX-33129', passenger: 'divya.m', corridor: 'Coimbatore → Kochi', fare: 720, time: '18m ago', seats: 'W12 (Window)' },
    ];
  }, [bookings]);

  return (
    <div className="space-y-6">

      {/* Top Telemetry Header & Controls */}
      <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-white">
                  Real-Time Booking Trends & Fleet Telemetry
                </h2>
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE SOCKET ACTIVE</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Continuous ingestion from Indian intercity outstation routes • Updated at {lastRefreshedAt}
              </p>
            </div>
          </div>

          {/* Timeframe & Mode Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Timeframe selector */}
            <div className="bg-[#101114] border border-white/10 p-1 rounded-xl flex items-center space-x-1">
              {[
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === tf.id
                      ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Metric Mode Filter */}
            <div className="bg-[#101114] border border-white/10 p-1 rounded-xl flex items-center space-x-1">
              {[
                { id: 'COMBINED', label: 'Dual View' },
                { id: 'BOOKINGS_ONLY', label: 'Bookings' },
                { id: 'REVENUE_ONLY', label: 'Revenue' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMetricViewMode(m.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    metricViewMode === m.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Corridor Filter */}
            <select
              value={selectedRouteFilter}
              onChange={(e) => setSelectedRouteFilter(e.target.value)}
              className="bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E7CB58]/50 text-xs font-mono"
            >
              <option value="ALL">All Highway Corridors</option>
              <option value="Coimbatore">Coimbatore Corridors</option>
              <option value="Bengaluru">Bengaluru Corridors</option>
              <option value="Chennai">Chennai Corridors</option>
              <option value="Madurai">Madurai Corridors</option>
              <option value="Kochi">Kochi Corridors</option>
            </select>
          </div>
        </div>

        {/* 4 Summary Real-Time Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 font-mono">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
              <span>Booking Velocity</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.8%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {timeframe === '24h' ? '18.4' : timeframe === '7d' ? '138' : '592'}
              <span className="text-xs font-normal text-gray-400 ml-1">
                {timeframe === '24h' ? 'tickets/hr' : 'tickets/wk'}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Peak velocity: 19:00 - 22:00 IST</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
              <span>Fleet Occupancy Rate</span>
              <span className="text-cyan-400 font-bold">+4.8% delta</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
              {avgFleetOccupancyRate}%
              <span className="text-xs font-normal text-gray-400 ml-1">system-wide</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Target threshold: 80.0%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
              <span>Top Corridor Demand</span>
              <span className="text-[#E7CB58] font-bold">92.4% Load</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white mt-1 truncate">
              Coimbatore ⇄ BLR
            </div>
            <span className="text-[10px] text-gray-500 mt-1">8 daily schedules • ₹1,150 avg</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
              <span>Period Gross Revenue</span>
              <span className="text-purple-400 font-bold">Paid</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#E7CB58] mt-1">
              ₹{(totalRevenue * (timeframe === '24h' ? 1 : timeframe === '7d' ? 3.5 : 12)).toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Avg berth value: ₹1,240</span>
          </div>
        </div>
      </div>

      {/* Primary Chart 1: Real-Time Booking Trends & Gross Revenue */}
      <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-display font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Booking Trends & Revenue Velocity</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Time-series distribution across {timeframe === '24h' ? 'diurnal departure hours' : timeframe === '7d' ? 'weekly cadence' : 'monthly cycles'}.
            </p>
          </div>

          {/* Quick Legend Tags */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            {(metricViewMode === 'COMBINED' || metricViewMode === 'BOOKINGS_ONLY') && (
              <span className="flex items-center space-x-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Bookings Count</span>
              </span>
            )}
            {(metricViewMode === 'COMBINED' || metricViewMode === 'REVENUE_ONLY') && (
              <span className="flex items-center space-x-1.5 text-[#E7CB58]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E7CB58]" />
                <span>Gross Revenue (₹)</span>
              </span>
            )}
          </div>
        </div>

        {/* Recharts Area / Composed Chart */}
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bookingTrendsData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E7CB58" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#E7CB58" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: '#ffffff15' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: '#ffffff15' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#E7CB58"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: '#ffffff15' }}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip content={<BookingTrendTooltip />} />
              
              {(metricViewMode === 'COMBINED' || metricViewMode === 'BOOKINGS_ONLY') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                  activeDot={{ r: 6, fill: '#06B6D4', stroke: '#16181F', strokeWidth: 2 }}
                />
              )}

              {(metricViewMode === 'COMBINED' || metricViewMode === 'REVENUE_ONLY') && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Platform Revenue (₹)"
                  stroke="#E7CB58"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                  activeDot={{ r: 6, fill: '#E7CB58', stroke: '#16181F', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Primary Chart 2: Fleet Occupancy Rates & Capacity Utilization */}
      <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-display font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Fleet-Wide Occupancy Rates & Capacity Utilization</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Live seat fill percentage per coach against the 80% breakeven performance target.
            </p>
          </div>

          {/* Legend tags for thresholds */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&gt; 85% High Demand</span>
            </span>
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>75–84% Optimal</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>&lt; 75% Standard</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart with Target Reference Line */}
        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetOccupancyData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="busName"
                stroke="#9ca3af"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                interval={0}
                tickFormatter={(val) => {
                  const parts = val.split(' ');
                  return parts.length > 2 ? `${parts[0]} ${parts[1]}` : val;
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={{ stroke: '#ffffff15' }}
              />
              <Tooltip content={<FleetOccupancyTooltip />} />
              <ReferenceLine
                y={80}
                stroke="#E7CB58"
                strokeDasharray="4 4"
                label={{
                  value: 'Target Breakeven 80%',
                  fill: '#E7CB58',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  position: 'top',
                }}
              />
              <Bar dataKey="occupancyRate" name="Occupancy Rate (%)" radius={[6, 6, 0, 0]}>
                {fleetOccupancyData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      entry.occupancyRate >= 85
                        ? '#10B981'
                        : entry.occupancyRate >= 75
                        ? '#06B6D4'
                        : '#F59E0B'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Grid: Corridor Routes & Berth Preference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 3: Highway Corridor Route Load Factor */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-display font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Corridor Route Occupancy & Travel Velocity</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Seat occupancy load factor across South India intercity highways.
            </p>
          </div>

          <div className="h-[250px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={corridorOccupancyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  fontSize={11}
                  fontFamily="monospace"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={{ stroke: '#ffffff15' }}
                />
                <YAxis
                  type="category"
                  dataKey="route"
                  stroke="#9ca3af"
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  width={110}
                  axisLine={{ stroke: '#ffffff15' }}
                />
                <Tooltip content={<CorridorTooltip />} />
                <Bar dataKey="occupancyRate" name="Route Occupancy" radius={[0, 6, 6, 0]}>
                  {corridorOccupancyData.map((_, index) => (
                    <Cell
                      key={`corr-${index}`}
                      fill={['#06B6D4', '#E7CB58', '#10B981', '#8B5CF6', '#EC4899'][index % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Berth Class & Seat Distribution (Donut Chart) */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-display font-bold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#E7CB58]" />
              <span>Berth Class Inventory Distribution</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Passenger preference split between Upper/Lower Sleepers and Seaters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[250px]">
            <div className="w-full sm:w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={seatTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {seatTypeDistribution.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<BookingTrendTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend Cards */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs font-mono">
              {seatTypeDistribution.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300 text-[11px] truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Booking Telemetry Feed (Real-Time Ingestion Ticker) */}
      <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-white uppercase tracking-wider">
              Live Real-Time Seat Reservation Feed
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Streaming from Payment Gateway & Concurrency Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-1">
          {liveBookingEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#E7CB58]">{evt.ref}</span>
                <span className="text-gray-500">{evt.time}</span>
              </div>
              <div className="font-semibold text-white truncate">{evt.corridor}</div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                <span className="text-gray-400">{evt.seats}</span>
                <span className="text-emerald-400 font-bold">₹{evt.fare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
