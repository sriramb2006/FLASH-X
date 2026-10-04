import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Bus,
  Clock,
  Zap,
  Activity,
  BarChart3,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Layers,
  ArrowRight,
  Percent,
  CheckCircle2
} from 'lucide-react';

type TimeRange = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type ProjectionScenario = 'BALANCED' | 'PEAK_SURGE' | 'CONSERVATIVE';
type ProjectionViewMode = 'DAILY' | 'CUMULATIVE';

interface KPIMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: React.ReactNode;
  colorTheme: string;
}

interface DailyRevenueForecast {
  dayNumber: number;
  dateStr: string;
  dayShort: string;
  isWeekend: boolean;
  isFestive: boolean;
  projectedRevenue: number; // in INR
  conservativeRevenue: number;
  optimisticRevenue: number;
  cumulativeRevenue: number;
  bookingVelocityPct: number; // e.g. +14.2%
  primaryDriver: string;
  occupancyEstimatePct: number;
}

// Generate deterministic 30-day forward projection based on calendar dynamics
const generate30DayForecast = (scenario: ProjectionScenario): DailyRevenueForecast[] => {
  const scenarioMultiplier = scenario === 'PEAK_SURGE' ? 1.16 : scenario === 'CONSERVATIVE' ? 0.88 : 1.0;
  const daysOfWeek = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  
  let runningCumulative = 0;
  const list: DailyRevenueForecast[] = [];

  for (let i = 1; i <= 30; i++) {
    const dayIndex = (i - 1) % 7;
    const dayShort = daysOfWeek[dayIndex];
    const isWeekend = dayShort === 'Fri' || dayShort === 'Sat' || dayShort === 'Sun';
    const isFestive = i >= 20 && i <= 24; // Festive holiday surge (Diwali weekend wave)

    // Base daily revenue curve (Lakhs in INR)
    let baseLakhs = 18.5; // Base regular weekday
    if (dayShort === 'Fri') baseLakhs = 26.5; // Friday night IT exodus
    else if (dayShort === 'Sat') baseLakhs = 23.8; // Saturday intercity leisure
    else if (dayShort === 'Sun') baseLakhs = 27.6; // Sunday return sleeper wave
    else if (dayShort === 'Mon') baseLakhs = 19.8; // Monday morning business rush
    else if (dayShort === 'Thu') baseLakhs = 20.4; // Thursday early bookings

    // Festive multiplier
    if (isFestive) {
      baseLakhs *= 1.28;
    }

    // Booking velocity factor (simulating dynamic advance booking speed)
    const velocityFactor = isFestive ? 24.5 : isWeekend ? 18.2 : 9.5;
    const finalDailyRevenue = Math.round(baseLakhs * scenarioMultiplier * 100000);
    const conservative = Math.round(finalDailyRevenue * 0.86);
    const optimistic = Math.round(finalDailyRevenue * 1.15);

    runningCumulative += finalDailyRevenue;

    // Driver label
    let driver = 'Regular Intercity Scheduled Runs';
    if (isFestive) driver = 'Diwali Festival Peak Advance Demand';
    else if (dayShort === 'Fri') driver = 'Bengaluru IT Corridor Weekend Exodus';
    else if (dayShort === 'Sun') driver = 'Interstate Sunday Sleeper Return Rush';
    else if (dayShort === 'Sat') driver = 'Western Ghats & Pilgrimage Leisure Run';
    else if (dayShort === 'Mon') driver = 'Metropolitan Business Commuter Express';

    const occupancy = isFestive ? 98.4 : isWeekend ? 94.6 : 86.8;

    list.push({
      dayNumber: i,
      dateStr: `Day ${i} (${dayShort})`,
      dayShort,
      isWeekend,
      isFestive,
      projectedRevenue: finalDailyRevenue,
      conservativeRevenue: conservative,
      optimisticRevenue: optimistic,
      cumulativeRevenue: runningCumulative,
      bookingVelocityPct: velocityFactor,
      primaryDriver: driver,
      occupancyEstimatePct: occupancy,
    });
  }

  return list;
};

export const PerformanceKPIsWidget: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('DAILY');
  const [projectionScenario, setProjectionScenario] = useState<ProjectionScenario>('BALANCED');
  const [viewMode, setViewMode] = useState<ProjectionViewMode>('DAILY');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [hoveredDay, setHoveredDay] = useState<DailyRevenueForecast | null>(null);

  // Dynamic KPI dataset based on timeframe
  const kpiData: Record<TimeRange, KPIMetric[]> = {
    DAILY: [
      {
        title: 'Fleet Utilization Rate',
        value: '91.4%',
        change: '+3.8%',
        isPositive: true,
        subtitle: '124 of 136 active coaches deployed',
        icon: <Bus className="w-5 h-5 text-cyan-400" />,
        colorTheme: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
      },
      {
        title: 'Average Seat Occupancy',
        value: '94.2%',
        change: '+5.1%',
        isPositive: true,
        subtitle: 'Peak weekend exodus loading',
        icon: <Users className="w-5 h-5 text-emerald-400" />,
        colorTheme: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
      },
      {
        title: 'Revenue per Kilometer (RPK)',
        value: '₹148.50',
        change: '+₹6.20',
        isPositive: true,
        subtitle: 'Driven by 1.25x surge pricing',
        icon: <DollarSign className="w-5 h-5 text-[#E7CB58]" />,
        colorTheme: 'from-amber-500/20 to-transparent border-amber-500/30 text-[#E7CB58]',
      },
      {
        title: 'On-Time Performance (OTP)',
        value: '97.6%',
        change: '+1.4%',
        isPositive: true,
        subtitle: 'Average delay < 4.2 minutes',
        icon: <Clock className="w-5 h-5 text-purple-400" />,
        colorTheme: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
      },
    ],
    WEEKLY: [
      {
        title: 'Fleet Utilization Rate',
        value: '88.7%',
        change: '+2.4%',
        isPositive: true,
        subtitle: 'Weekly average across 7 corridors',
        icon: <Bus className="w-5 h-5 text-cyan-400" />,
        colorTheme: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
      },
      {
        title: 'Average Seat Occupancy',
        value: '89.8%',
        change: '+3.2%',
        isPositive: true,
        subtitle: 'Consistent demand across weekdays',
        icon: <Users className="w-5 h-5 text-emerald-400" />,
        colorTheme: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
      },
      {
        title: 'Revenue per Kilometer (RPK)',
        value: '₹141.20',
        change: '+₹4.50',
        isPositive: true,
        subtitle: 'Optimized dynamic yield management',
        icon: <DollarSign className="w-5 h-5 text-[#E7CB58]" />,
        colorTheme: 'from-amber-500/20 to-transparent border-amber-500/30 text-[#E7CB58]',
      },
      {
        title: 'On-Time Performance (OTP)',
        value: '96.1%',
        change: '+0.8%',
        isPositive: true,
        subtitle: 'Weather-adjusted corridor routing',
        icon: <Clock className="w-5 h-5 text-purple-400" />,
        colorTheme: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
      },
    ],
    MONTHLY: [
      {
        title: 'Fleet Utilization Rate',
        value: '86.5%',
        change: '+1.9%',
        isPositive: true,
        subtitle: 'Monthly rolling operational uptime',
        icon: <Bus className="w-5 h-5 text-cyan-400" />,
        colorTheme: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
      },
      {
        title: 'Average Seat Occupancy',
        value: '87.4%',
        change: '+2.1%',
        isPositive: true,
        subtitle: 'Seasonal baseline demand index',
        icon: <Users className="w-5 h-5 text-emerald-400" />,
        colorTheme: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
      },
      {
        title: 'Revenue per Kilometer (RPK)',
        value: '₹138.40',
        change: '+₹5.10',
        isPositive: true,
        subtitle: 'Net yield after fuel & toll amortisation',
        icon: <DollarSign className="w-5 h-5 text-[#E7CB58]" />,
        colorTheme: 'from-amber-500/20 to-transparent border-amber-500/30 text-[#E7CB58]',
      },
      {
        title: 'On-Time Performance (OTP)',
        value: '95.4%',
        change: '+1.1%',
        isPositive: true,
        subtitle: 'Consistent intercity punctuality',
        icon: <Clock className="w-5 h-5 text-purple-400" />,
        colorTheme: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
      },
    ],
  };

  const activeMetrics = kpiData[timeRange];

  // 30-Day forecast calculation
  const forecastData = useMemo(() => {
    return generate30DayForecast(projectionScenario);
  }, [projectionScenario]);

  // Aggregate Projection Statistics
  const totalProjectedRevenue = useMemo(() => {
    return forecastData[forecastData.length - 1]?.cumulativeRevenue || 0;
  }, [forecastData]);

  const avgDailyRevenue = useMemo(() => {
    return Math.round(totalProjectedRevenue / 30);
  }, [totalProjectedRevenue]);

  const peakDay = useMemo(() => {
    return forecastData.reduce((prev, current) => (prev.projectedRevenue > current.projectedRevenue ? prev : current), forecastData[0]);
  }, [forecastData]);

  const activeDayData = useMemo(() => {
    return forecastData.find(d => d.dayNumber === selectedDayNumber) || forecastData[0];
  }, [forecastData, selectedDayNumber]);

  // SVG Chart Geometry
  const chartWidth = 920;
  const chartHeight = 280;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Max value calculation for scaling
  const maxValue = useMemo(() => {
    if (viewMode === 'CUMULATIVE') {
      return totalProjectedRevenue * 1.05;
    }
    const maxDaily = Math.max(...forecastData.map(d => d.optimisticRevenue));
    return maxDaily * 1.1;
  }, [forecastData, viewMode, totalProjectedRevenue]);

  // Coordinate scales
  const getX = (index: number) => paddingLeft + (index / (forecastData.length - 1)) * plotWidth;
  const getY = (val: number) => paddingTop + plotHeight - (val / maxValue) * plotHeight;

  // Path generators
  const mainLinePath = useMemo(() => {
    return forecastData.map((d, i) => {
      const val = viewMode === 'CUMULATIVE' ? d.cumulativeRevenue : d.projectedRevenue;
      const x = getX(i);
      const y = getY(val);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [forecastData, viewMode, maxValue]);

  const areaFillPath = useMemo(() => {
    if (!mainLinePath) return '';
    const lastX = getX(forecastData.length - 1);
    const firstX = getX(0);
    const bottomY = paddingTop + plotHeight;
    return `${mainLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [mainLinePath, forecastData]);

  // Confidence envelope path for daily mode
  const confidenceBandPath = useMemo(() => {
    if (viewMode === 'CUMULATIVE') return '';
    const upperPoints = forecastData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.optimisticRevenue)}`).join(' ');
    const lowerPoints = [...forecastData].reverse().map((d, i) => {
      const origIndex = forecastData.length - 1 - i;
      return `L ${getX(origIndex)} ${getY(d.conservativeRevenue)}`;
    }).join(' ');
    return `${upperPoints} ${lowerPoints} Z`;
  }, [forecastData, viewMode, maxValue]);

  // Format currency helpers
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  const formatLakhsExact = (val: number) => {
    return `₹${(val / 100000).toFixed(2)}L`;
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
      
      {/* SECTION 1: Top Header & Timeframe Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-display font-bold">
            <BarChart3 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Fleet Performance KPIs & Yield Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE FINANCIAL & OPERATIONAL YIELD</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              High-level operational metrics tracking utilization rates, passenger occupancy, and revenue per kilometer across intervals.
            </p>
          </div>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range.charAt(0) + range.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeMetrics.map((metric, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-b ${metric.colorTheme} border backdrop-blur-sm space-y-4 font-mono transition-all hover:scale-[1.02] shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">{metric.title}</span>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                {metric.icon}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                {metric.value}
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className={`inline-flex items-center space-x-0.5 font-bold ${metric.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{metric.change}</span>
                </span>
                <span className="text-gray-400 text-[10px]">vs prior {timeRange.toLowerCase()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-gray-300 flex items-center justify-between">
              <span className="truncate">{metric.subtitle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: 30-DAY PROJECTED REVENUE & INCOME FORECAST CHART */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        
        {/* Chart Header & Mission Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold shadow-lg shadow-amber-500/10">
              <DollarSign className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                  30-Day Forward Projected Revenue Chart
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#E7CB58] text-[10px] font-mono font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#E7CB58]" />
                  <span>BOOKING VELOCITY ENGINE</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Deterministic 30-day forward income model synthesizing real-time reservation pace, day-of-week demand curvature, and festive surge dynamics.
              </p>
            </div>
          </div>

          {/* Interactive Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* View Mode Toggle: Daily vs Cumulative */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <span className="text-[10px] text-gray-400 uppercase px-2">Metric:</span>
              <button
                onClick={() => setViewMode('DAILY')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'DAILY'
                    ? 'bg-[#E7CB58] text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Daily Trend
              </button>
              <button
                onClick={() => setViewMode('CUMULATIVE')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'CUMULATIVE'
                    ? 'bg-[#E7CB58] text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Cumulative Run-Rate
              </button>
            </div>

            {/* Scenario Selector */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <span className="text-[10px] text-gray-400 uppercase px-2">Model:</span>
              {(['BALANCED', 'PEAK_SURGE', 'CONSERVATIVE'] as ProjectionScenario[]).map(sc => (
                <button
                  key={sc}
                  onClick={() => setProjectionScenario(sc)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    projectionScenario === sc
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {sc === 'BALANCED' ? 'Realistic' : sc === 'PEAK_SURGE' ? 'High Surge' : 'Conservative'}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* 30-Day Headline Metrics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          
          {/* Card 1: Total 30-Day Revenue */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#181A24] to-black/60 border border-amber-500/30 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Total 30-Day Projected Revenue</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#E7CB58]">
              {formatINR(totalProjectedRevenue)}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+15.4% YoY Expansion</span>
              <span className="text-gray-400">• 30 Days Gross</span>
            </div>
          </div>

          {/* Card 2: Average Daily Run Rate */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Average Daily Run Rate</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">
              {formatINR(avgDailyRevenue)}
              <span className="text-xs font-normal text-gray-400">/day</span>
            </div>
            <div className="text-[10px] text-cyan-400 flex items-center space-x-1 pt-0.5">
              <span>91.2% Network Fleet Utilization</span>
            </div>
          </div>

          {/* Card 3: Peak Revenue Day */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Peak Single-Day Revenue</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
              {formatINR(peakDay.projectedRevenue)}
            </div>
            <div className="text-[10px] text-gray-300 flex items-center space-x-1 pt-0.5 truncate">
              <span className="text-[#E7CB58] font-bold">{peakDay.dateStr}</span>
              <span className="text-gray-400">• {peakDay.primaryDriver}</span>
            </div>
          </div>

          {/* Card 4: Current Booking Velocity */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Current Booking Velocity</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-cyan-400 flex items-center space-x-1.5">
              <span>+18.4%</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-normal">Fast</span>
            </div>
            <div className="text-[10px] text-gray-400 pt-0.5">
              Advance bookings pacing 1.28x above historical seasonal norm
            </div>
          </div>

        </div>

        {/* Interactive SVG Chart Container */}
        <div className="bg-[#10121A] border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
          
          {/* Chart Sub-Header with Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 text-gray-300">
                <span className="w-3 h-0.5 bg-[#E7CB58] rounded" />
                <span>{viewMode === 'DAILY' ? 'Projected Daily Revenue' : 'Cumulative Revenue Run-Rate'}</span>
              </span>
              {viewMode === 'DAILY' && (
                <span className="flex items-center space-x-1.5 text-gray-400">
                  <span className="w-3 h-2 bg-amber-500/15 border border-amber-500/40 rounded-sm" />
                  <span>Confidence Corridor (±15%)</span>
                </span>
              )}
              <span className="flex items-center space-x-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500/30 border border-purple-500" />
                <span>Weekend Exoduses (Fri–Sun)</span>
              </span>
              <span className="flex items-center space-x-1.5 text-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500" />
                <span>Festive Surge (Diwali Wave)</span>
              </span>
            </div>

            <div className="text-[11px] text-gray-400">
              Hover along days to inspect revenue breakdowns • Click to pin telemetry
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[720px] select-none cursor-crosshair"
              onMouseLeave={() => setHoveredDay(null)}
            >
              <defs>
                {/* Main Curve Gradient */}
                <linearGradient id="revenue-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E7CB58" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#E7CB58" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#E7CB58" stopOpacity="0.0" />
                </linearGradient>

                {/* Cumulative Gradient */}
                <linearGradient id="cumulative-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#10B981" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>

                {/* Shaded Confidence Band Gradient */}
                <linearGradient id="confidence-band-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.03" />
                </linearGradient>

                {/* Node Glow Filter */}
                <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const y = paddingTop + plotHeight - frac * plotHeight;
                const valueAtLine = frac * maxValue;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#ffffff"
                      strokeOpacity="0.08"
                      strokeDasharray={frac === 0 ? 'none' : '3,3'}
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {viewMode === 'CUMULATIVE'
                        ? `₹${(valueAtLine / 10000000).toFixed(1)}Cr`
                        : `₹${(valueAtLine / 100000).toFixed(0)}L`}
                    </text>
                  </g>
                );
              })}

              {/* Weekend & Festive Background Highlight Bands */}
              {forecastData.map((d, i) => {
                if (!d.isWeekend && !d.isFestive) return null;
                const x = getX(i) - (plotWidth / 29) / 2;
                const w = plotWidth / 29;
                const fillColor = d.isFestive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(168, 85, 247, 0.06)';
                return (
                  <rect
                    key={`band-${i}`}
                    x={x}
                    y={paddingTop}
                    width={w}
                    height={plotHeight}
                    fill={fillColor}
                  />
                );
              })}

              {/* Confidence Band (Daily mode only) */}
              {confidenceBandPath && (
                <path
                  d={confidenceBandPath}
                  fill="url(#confidence-band-grad)"
                  stroke="#06B6D4"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  strokeOpacity="0.4"
                />
              )}

              {/* Area Gradient Fill */}
              <path
                d={areaFillPath}
                fill={viewMode === 'CUMULATIVE' ? 'url(#cumulative-area-grad)' : 'url(#revenue-area-grad)'}
              />

              {/* Main Line Trajectory */}
              <path
                d={mainLinePath}
                fill="none"
                stroke={viewMode === 'CUMULATIVE' ? '#10B981' : '#E7CB58'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Point Dots */}
              {forecastData.map((d, i) => {
                const val = viewMode === 'CUMULATIVE' ? d.cumulativeRevenue : d.projectedRevenue;
                const x = getX(i);
                const y = getY(val);
                const isSelected = d.dayNumber === selectedDayNumber;
                const isHovered = hoveredDay?.dayNumber === d.dayNumber;
                const isSpecial = d.isFestive || (d.isWeekend && d.dayShort === 'Sun');

                return (
                  <g
                    key={`dot-${i}`}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedDayNumber(d.dayNumber)}
                    onMouseEnter={() => setHoveredDay(d)}
                  >
                    {/* Invisible larger hover catchment target */}
                    <circle cx={x} cy={y} r="14" fill="transparent" />

                    {/* Outer ring for selected or hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="none"
                        stroke={viewMode === 'CUMULATIVE' ? '#34D399' : '#FEF08A'}
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected || isHovered ? 5.5 : isSpecial ? 4 : 3}
                      fill={
                        d.isFestive
                          ? '#EF4444'
                          : isSpecial
                          ? '#E7CB58'
                          : viewMode === 'CUMULATIVE'
                          ? '#10B981'
                          : '#F59E0B'
                      }
                      stroke="#10121A"
                      strokeWidth="1.5"
                      filter={isSpecial || isSelected ? 'url(#node-glow)' : 'none'}
                    />
                  </g>
                );
              })}

              {/* X-Axis Date Labels & Tick Marks */}
              {forecastData.map((d, i) => {
                // Show labels every 2 days for clarity
                if (i % 2 !== 0 && i !== 29) return null;
                const x = getX(i);
                const isWeekend = d.isWeekend;
                const isFestive = d.isFestive;

                return (
                  <g key={`x-tick-${i}`}>
                    <line
                      x1={x}
                      y1={paddingTop + plotHeight}
                      x2={x}
                      y2={paddingTop + plotHeight + 5}
                      stroke="#ffffff"
                      strokeOpacity="0.2"
                    />
                    <text
                      x={x}
                      y={paddingTop + plotHeight + 18}
                      fill={isFestive ? '#F87171' : isWeekend ? '#C084FC' : '#9CA3AF'}
                      fontSize="9"
                      fontWeight={isWeekend || isFestive ? 'bold' : 'normal'}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      D{d.dayNumber}
                    </text>
                    <text
                      x={x}
                      y={paddingTop + plotHeight + 30}
                      fill="#6B7280"
                      fontSize="8"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {d.dayShort}
                    </text>
                  </g>
                );
              })}

              {/* Hover Line Guideline */}
              {hoveredDay && (
                <g className="pointer-events-none">
                  {(() => {
                    const idx = hoveredDay.dayNumber - 1;
                    const x = getX(idx);
                    const val = viewMode === 'CUMULATIVE' ? hoveredDay.cumulativeRevenue : hoveredDay.projectedRevenue;
                    const y = getY(val);
                    return (
                      <>
                        <line
                          x1={x}
                          y1={paddingTop}
                          x2={x}
                          y2={paddingTop + plotHeight}
                          stroke="#E7CB58"
                          strokeWidth="1.2"
                          strokeDasharray="4,4"
                          strokeOpacity="0.75"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="6.5"
                          fill="#FFFFFF"
                          stroke="#E7CB58"
                          strokeWidth="2.5"
                        />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>

          {/* Active / Hovered Day Telemetry Card */}
          {(() => {
            const displayDay = hoveredDay || activeDayData;
            return (
              <div className="bg-black/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#E7CB58] text-[10px] font-bold">
                      Day {displayDay.dayNumber} of 30
                    </span>
                    <span className="text-white font-bold text-sm">
                      {displayDay.dateStr}
                    </span>
                    {displayDay.isFestive && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/40">
                        DIWALI FESTIVE SURGE
                      </span>
                    )}
                    {displayDay.isWeekend && !displayDay.isFestive && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        WEEKEND TRAFFIC
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Primary Corridor Driver: <strong className="text-white">{displayDay.primaryDriver}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Daily Income */}
                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Projected Daily Revenue</span>
                    <span className="text-base font-bold text-[#E7CB58]">
                      {formatINR(displayDay.projectedRevenue)}
                    </span>
                  </div>

                  {/* Conservative - Optimistic Range */}
                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Confidence Interval</span>
                    <span className="text-xs font-bold text-cyan-400">
                      {formatLakhsExact(displayDay.conservativeRevenue)} – {formatLakhsExact(displayDay.optimisticRevenue)}
                    </span>
                  </div>

                  {/* Cumulative Total to Day */}
                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Cumulative Run-Rate</span>
                    <span className="text-base font-bold text-emerald-400">
                      {formatINR(displayDay.cumulativeRevenue)}
                    </span>
                  </div>

                  {/* Estimated Occupancy */}
                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Estimated Fleet Fill</span>
                    <span className="text-base font-bold text-white">
                      {displayDay.occupancyEstimatePct}%
                    </span>
                  </div>

                </div>

              </div>
            );
          })()}

        </div>

        {/* SECTION 3: Deep Analytical Insights & Revenue Growth Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Velocity Multiplier</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Advance booking velocity is pacing <strong className="text-white">+18.4% faster</strong> than the seasonal 90-day baseline. High-density corridors (Coimbatore ⇄ Bengaluru) reach 85%+ fill rate 96 hours before scheduled departure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#E7CB58] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Holiday Yield Surge Window</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Festive travel between Day 20 and Day 24 generates an incremental <strong className="text-white">₹1.42 Crores</strong> (20.8% of total 30-day revenue), capturing premium dynamic fare multipliers (1.35x).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Yield Optimization Directive</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Recommends adding <strong className="text-white">8 standby sleeper coaches</strong> to Friday evening schedules (Bengaluru, Chennai, Coimbatore) to absorb ~₹14.2 Lakhs of unserved weekend spillover demand.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
