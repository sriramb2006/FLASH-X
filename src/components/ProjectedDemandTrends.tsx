import React, { useState, useEffect, useId } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Bus,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export interface DailyProjection {
  dayIndex: number;
  dateStr: string;
  dayShort: string;
  dayName: string;
  isPeakSurge: boolean;
  eventLabel: string;
  projectedDemandPax: number;
  availableCapacityPax: number;
  deficitCoaches: number;
  avgLoadFactorPct: number;
  surgeMultiplier: number;
  riskStatus: 'OPTIMAL' | 'HIGH_DEMAND' | 'CRITICAL_SURGE';
  corridorSurges: {
    corridorId: string;
    corridorName: string;
    highway: string;
    projectedPax: number;
    loadFactor: number;
    deficit: number;
    status: 'OPTIMAL' | 'HIGH' | 'CRITICAL';
  }[];
  advanceDirective: string;
}

export const SEVEN_DAY_FORECAST: DailyProjection[] = [
  {
    dayIndex: 0,
    dateStr: 'Oct 01',
    dayShort: 'Thu',
    dayName: 'Thursday (Today)',
    isPeakSurge: false,
    eventLabel: 'Regular Mid-Week Dispatch',
    projectedDemandPax: 38450,
    availableCapacityPax: 42000,
    deficitCoaches: 0,
    avgLoadFactorPct: 81.5,
    surgeMultiplier: 1.0,
    riskStatus: 'OPTIMAL',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 4100, loadFactor: 83.2, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 4600, loadFactor: 82.5, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 3100, loadFactor: 79.4, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 2050, loadFactor: 78.1, deficit: 0, status: 'OPTIMAL' },
    ],
    advanceDirective: 'Network in balance. Stage 4 reserve sleeper coaches at Salem yard for upcoming Friday peak.',
  },
  {
    dayIndex: 1,
    dateStr: 'Oct 02',
    dayShort: 'Fri',
    dayName: 'Friday (Exodus Peak)',
    isPeakSurge: true,
    eventLabel: 'Weekend Exodus Surge',
    projectedDemandPax: 58920,
    availableCapacityPax: 45200,
    deficitCoaches: 18,
    avgLoadFactorPct: 96.8,
    surgeMultiplier: 1.38,
    riskStatus: 'CRITICAL_SURGE',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 6850, loadFactor: 98.4, deficit: 8, status: 'CRITICAL' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 7200, loadFactor: 97.6, deficit: 7, status: 'CRITICAL' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 4700, loadFactor: 94.2, deficit: 3, status: 'CRITICAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 2950, loadFactor: 89.5, deficit: 1, status: 'HIGH' },
    ],
    advanceDirective: 'CRITICAL SURGE: Pre-dispatch 8 multi-axle coaches to BLR & CBE depots before 15:00 IST.',
  },
  {
    dayIndex: 2,
    dateStr: 'Oct 03',
    dayShort: 'Sat',
    dayName: 'Saturday (Transit & Leisure)',
    isPeakSurge: false,
    eventLabel: 'Intercity Leisure & Pilgrimage Wave',
    projectedDemandPax: 47600,
    availableCapacityPax: 44000,
    deficitCoaches: 5,
    avgLoadFactorPct: 88.6,
    surgeMultiplier: 1.15,
    riskStatus: 'HIGH_DEMAND',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 4950, loadFactor: 88.2, deficit: 2, status: 'HIGH' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 5300, loadFactor: 87.5, deficit: 2, status: 'HIGH' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 3600, loadFactor: 85.0, deficit: 1, status: 'HIGH' },
      { corridorId: 'blr-tpt', corridorName: 'Bengaluru ⇄ Tirupati', highway: 'NH69', projectedPax: 3800, loadFactor: 94.5, deficit: 3, status: 'CRITICAL' },
    ],
    advanceDirective: 'Pilgrim spike on NH69 (Tirupati corridor); deploy morning express coaches from Bengaluru terminal.',
  },
  {
    dayIndex: 3,
    dateStr: 'Oct 04',
    dayShort: 'Sun',
    dayName: 'Sunday (Return Wave)',
    isPeakSurge: true,
    eventLabel: 'Metropolitan Inflow Surge',
    projectedDemandPax: 61400,
    availableCapacityPax: 45600,
    deficitCoaches: 22,
    avgLoadFactorPct: 98.2,
    surgeMultiplier: 1.44,
    riskStatus: 'CRITICAL_SURGE',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 7300, loadFactor: 99.1, deficit: 9, status: 'CRITICAL' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 7600, loadFactor: 98.8, deficit: 8, status: 'CRITICAL' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 5100, loadFactor: 96.0, deficit: 4, status: 'CRITICAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 3100, loadFactor: 91.2, deficit: 2, status: 'HIGH' },
    ],
    advanceDirective: 'EXTREME SURGE: Mandatory coach turnaround protocols; activate all Tier-1 spare coaches for night runs.',
  },
  {
    dayIndex: 4,
    dateStr: 'Oct 05',
    dayShort: 'Mon',
    dayName: 'Monday (Workweek Start)',
    isPeakSurge: false,
    eventLabel: 'Early Morning Business Inflow',
    projectedDemandPax: 44200,
    availableCapacityPax: 43000,
    deficitCoaches: 3,
    avgLoadFactorPct: 86.4,
    surgeMultiplier: 1.12,
    riskStatus: 'HIGH_DEMAND',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 4600, loadFactor: 86.0, deficit: 1, status: 'HIGH' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 5100, loadFactor: 87.0, deficit: 1, status: 'HIGH' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 3300, loadFactor: 81.0, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 2200, loadFactor: 79.5, deficit: 0, status: 'OPTIMAL' },
    ],
    advanceDirective: 'Morning commuter load peaks between 06:00 and 09:30 IST. Reposition coaches to maintenance bays by noon.',
  },
  {
    dayIndex: 5,
    dateStr: 'Oct 06',
    dayShort: 'Tue',
    dayName: 'Tuesday (Mid-Week)',
    isPeakSurge: false,
    eventLabel: 'Commercial & Student Regular',
    projectedDemandPax: 37900,
    availableCapacityPax: 42500,
    deficitCoaches: 0,
    avgLoadFactorPct: 78.5,
    surgeMultiplier: 0.95,
    riskStatus: 'OPTIMAL',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 3900, loadFactor: 79.0, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 4300, loadFactor: 78.5, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 2900, loadFactor: 76.0, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 1980, loadFactor: 75.0, deficit: 0, status: 'OPTIMAL' },
    ],
    advanceDirective: 'Schedule routine preventive maintenance for 6 Electric Hyperliners at Coimbatore Workshop.',
  },
  {
    dayIndex: 6,
    dateStr: 'Oct 07',
    dayShort: 'Wed',
    dayName: 'Wednesday (Mid-Week)',
    isPeakSurge: false,
    eventLabel: 'Interstate Commercial Freight & Pax',
    projectedDemandPax: 39800,
    availableCapacityPax: 42500,
    deficitCoaches: 0,
    avgLoadFactorPct: 80.2,
    surgeMultiplier: 0.98,
    riskStatus: 'OPTIMAL',
    corridorSurges: [
      { corridorId: 'cbe-blr', corridorName: 'Coimbatore ⇄ Bengaluru', highway: 'NH544', projectedPax: 4150, loadFactor: 81.2, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'blr-maa', corridorName: 'Bengaluru ⇄ Chennai', highway: 'NH48', projectedPax: 4550, loadFactor: 80.8, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'maa-mdu', corridorName: 'Chennai ⇄ Madurai', highway: 'NH45', projectedPax: 3050, loadFactor: 78.2, deficit: 0, status: 'OPTIMAL' },
      { corridorId: 'cbe-cok', corridorName: 'Coimbatore ⇄ Kochi', highway: 'NH544', projectedPax: 2020, loadFactor: 77.0, deficit: 0, status: 'OPTIMAL' },
    ],
    advanceDirective: 'Maintain optimal fleet readiness. Run battery diagnostic cycling on EV sleeper coaches.',
  },
];

interface Props {
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  onApplyDirective?: (dayIndex: number) => void;
  appliedDirectives?: number[];
}

export const ProjectedDemandTrends: React.FC<Props> = ({
  selectedDayIndex,
  onSelectDay,
  onApplyDirective,
  appliedDirectives = [],
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<DailyProjection | null>(null);
  const activeDay = SEVEN_DAY_FORECAST[selectedDayIndex] || SEVEN_DAY_FORECAST[0];

  // Auto-scrubber animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onSelectDay((selectedDayIndex + 1) % SEVEN_DAY_FORECAST.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, selectedDayIndex, onSelectDay]);

  // Chart coordinates calculation (SVG Dimensions: 720 x 220)
  const chartWidth = 720;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const minPax = 32000;
  const maxPax = 66000;

  const points = SEVEN_DAY_FORECAST.map((d, i) => {
    const x = paddingX + (i / (SEVEN_DAY_FORECAST.length - 1)) * usableWidth;
    const yDemand = chartHeight - paddingY - ((d.projectedDemandPax - minPax) / (maxPax - minPax)) * usableHeight;
    const yCap = chartHeight - paddingY - ((d.availableCapacityPax - minPax) / (maxPax - minPax)) * usableHeight;
    return { ...d, x, yDemand, yCap };
  });

  // SVG Path for Demand curve
  const demandPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.yDemand}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpx2 = cpx1;
    return `${acc} C ${cpx1},${prev.yDemand} ${cpx2},${p.yDemand} ${p.x},${p.yDemand}`;
  }, '');

  // SVG Path for Capacity line
  const capPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.yCap}`;
    return `${acc} L ${p.x},${p.yCap}`;
  }, '');

  // Closed Area Path for Demand fill
  const areaPath = `${demandPath} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`;

  // Surge Threshold line (90% capacity benchmark approx ~48,000)
  const surgeThresholdPax = 48000;
  const surgeY = chartHeight - paddingY - ((surgeThresholdPax - minPax) / (maxPax - minPax)) * usableHeight;

  return (
    <div className="bg-[#16181F] border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background radiant ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#E7CB58] border border-amber-500/40 text-[10px] font-mono font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-[#E7CB58]" />
              <span>TIME-SERIES SIMULATION ENGINE</span>
            </span>
            <span className="text-gray-400 text-xs font-mono">7-Day Surge Anticipation Horizon</span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold text-white mt-1">
            Projected Passenger Demand Trends (Next 7 Days)
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Simulated daily time-series telemetry to detect fleet capacity deficits and pre-stage reserve coaches.
          </p>
        </div>

        {/* Play / Pause / Reset scrubber controls */}
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Auto-Scrub' : 'Simulate 7-Day Run'}</span>
          </button>
          <button
            onClick={() => onSelectDay(0)}
            title="Reset to Day 1"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Day Quick Scrubber Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative z-10">
        {SEVEN_DAY_FORECAST.map((d, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isCritical = d.riskStatus === 'CRITICAL_SURGE';
          const isHigh = d.riskStatus === 'HIGH_DEMAND';

          return (
            <button
              key={d.dayIndex}
              onClick={() => onSelectDay(idx)}
              className={`p-3 rounded-2xl text-left font-mono transition-all relative border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#E7CB58]/20 to-black/80 border-[#E7CB58] shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-black/40 hover:bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {isCritical && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-500 animate-ping" />
              )}
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-gray-300">{d.dayShort}</span>
                <span className="text-gray-500">{d.dateStr}</span>
              </div>
              <div className={`text-sm font-display font-bold mt-1 ${isSelected ? 'text-[#E7CB58]' : 'text-white'}`}>
                {d.projectedDemandPax.toLocaleString()}
                <span className="text-[9px] font-normal text-gray-400 block">Pax</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px]">
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  isCritical ? 'bg-red-500/20 text-red-400' : isHigh ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {d.avgLoadFactorPct}%
                </span>
                <span className="text-gray-400 font-bold">
                  {d.deficitCoaches > 0 ? `+${d.deficitCoaches} Bus` : 'OK'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Time-Series SVG Chart */}
      <div className="bg-black/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-gray-400 mb-2 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#E7CB58] rounded-full" />
              <span className="text-white font-bold">Projected Demand Curve</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-b border-dashed border-cyan-400" />
              <span className="text-gray-300">Fleet Capacity (Seats)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-red-500 border-b border-dashed border-red-500" />
              <span className="text-red-400 font-bold">Surge Deficit Redline (&gt;90%)</span>
            </span>
          </div>
          <div className="text-[11px] text-gray-500">
            Click any day node or scrubber to update the D3 Map
          </div>
        </div>

        {/* SVG Graphic */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[580px] max-h-[220px] select-none"
          >
            <defs>
              <linearGradient id="demandAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E7CB58" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#E7CB58" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#E7CB58" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[35000, 45000, 55000, 65000].map(val => {
              const y = chartHeight - paddingY - ((val - minPax) / (maxPax - minPax)) * usableHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#6B7280"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val / 1000}k
                  </text>
                </g>
              );
            })}

            {/* Surge Threshold Redline */}
            <line
              x1={paddingX}
              y1={surgeY}
              x2={chartWidth - paddingX}
              y2={surgeY}
              stroke="#EF4444"
              strokeWidth="1.2"
              strokeDasharray="4,4"
              opacity="0.8"
            />
            <text
              x={chartWidth - paddingX}
              y={surgeY - 6}
              textAnchor="end"
              fill="#EF4444"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              CRITICAL CAPACITY SURGE (48,000+ PAX)
            </text>

            {/* Demand Area Fill */}
            <path d={areaPath} fill="url(#demandAreaGrad)" />

            {/* Fleet Capacity Line */}
            <path
              d={capPath}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.7"
            />

            {/* Demand Curve Stroke */}
            <path
              d={demandPath}
              fill="none"
              stroke="#E7CB58"
              strokeWidth="3"
            />

            {/* Day Points */}
            {points.map((p, idx) => {
              const isSelected = selectedDayIndex === idx;
              const isCritical = p.riskStatus === 'CRITICAL_SURGE';
              const dotColor = isCritical ? '#EF4444' : isSelected ? '#E7CB58' : '#F59E0B';

              return (
                <g
                  key={p.dayIndex}
                  className="cursor-pointer"
                  onClick={() => onSelectDay(idx)}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Vertical cursor guide for selected day */}
                  {isSelected && (
                    <line
                      x1={p.x}
                      y1={paddingY}
                      x2={p.x}
                      y2={chartHeight - paddingY}
                      stroke="#E7CB58"
                      strokeWidth="1.5"
                      strokeDasharray="2,4"
                      opacity="0.75"
                    />
                  )}

                  {/* Outer glow ring on surge or select */}
                  {(isSelected || isCritical) && (
                    <circle
                      cx={p.x}
                      cy={p.yDemand}
                      r={isSelected ? 10 : 7}
                      fill="none"
                      stroke={dotColor}
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main dot */}
                  <circle
                    cx={p.x}
                    cy={p.yDemand}
                    r={isSelected ? 6 : 4.5}
                    fill={dotColor}
                    stroke="#101114"
                    strokeWidth="2"
                  />

                  {/* Date text underneath */}
                  <text
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill={isSelected ? '#E7CB58' : '#9CA3AF'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {p.dayShort}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover / Selected Info Strip */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Viewing Day:</span>
            <span className="text-white font-bold">{activeDay.dayName}</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400">{activeDay.eventLabel}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>
              Multiplier: <strong className="text-[#E7CB58]">{activeDay.surgeMultiplier}x</strong>
            </span>
            <span>
              Anticipated Deficit:{' '}
              <strong className={activeDay.deficitCoaches > 0 ? 'text-red-400' : 'text-emerald-400'}>
                {activeDay.deficitCoaches > 0 ? `+${activeDay.deficitCoaches} Coaches` : '0 (Balanced)'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day Corridor Surge Matrix & Fleet Pre-Staging Directive */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
        
        {/* Corridor Breakdown (7 cols) */}
        <div className="md:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Corridor Surge Forecast • {activeDay.dayShort}
            </span>
            <span className="text-[10px] text-cyan-400">Load Factor & Coach Gap</span>
          </div>

          <div className="space-y-2">
            {activeDay.corridorSurges.map(c => {
              const isCrit = c.status === 'CRITICAL';
              const isHi = c.status === 'HIGH';
              const badgeColor = isCrit ? 'bg-red-500/20 text-red-400 border-red-500/30' : isHi ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

              return (
                <div key={c.corridorId} className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#E7CB58] font-bold">
                        {c.highway}
                      </span>
                      <span className="text-white font-bold text-xs">{c.corridorName}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Projected Pax: {c.projectedPax.toLocaleString()} • Deficit: {c.deficit > 0 ? `+${c.deficit} Coaches` : 'None'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${badgeColor}`}>
                      {c.loadFactor}% LOAD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-Staging Directive Card (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs space-y-3">
          <div>
            <div className="flex items-center space-x-1.5 text-[#E7CB58] text-[10px] uppercase font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Advance Fleet Pre-Staging Directive</span>
            </div>
            <h4 className="text-white font-display font-bold text-sm mt-1">
              {activeDay.dayName} Fleet Action
            </h4>
            <p className="text-xs text-gray-300 font-sans mt-2 leading-relaxed">
              {activeDay.advanceDirective}
            </p>
          </div>

          <div>
            {onApplyDirective && (
              <button
                onClick={() => onApplyDirective(activeDay.dayIndex)}
                disabled={appliedDirectives.includes(activeDay.dayIndex)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  appliedDirectives.includes(activeDay.dayIndex)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#E7CB58] hover:bg-[#F2DA75] text-black shadow-lg shadow-amber-500/25'
                }`}
              >
                {appliedDirectives.includes(activeDay.dayIndex) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pre-Allocation Dispatched</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Dispatch Advance Pre-Allocation</span>
                  </>
                )}
              </button>
            )}
            <div className="text-[9px] text-gray-500 text-center mt-1.5">
              Updates routing schedules & depot coach inventory
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
