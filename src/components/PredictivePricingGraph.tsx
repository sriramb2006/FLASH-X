import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Scale,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { PredictivePricingAnalysis } from '../../shared/types';

interface PredictivePricingGraphProps {
  data: PredictivePricingAnalysis;
  onBookNowClick?: () => void;
}

export const PredictivePricingGraph: React.FC<PredictivePricingGraphProps> = ({
  data,
  onBookNowClick,
}) => {
  const [showInsights, setShowInsights] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'demand'>('price');

  const {
    currentFare,
    predictedPeakFare,
    predictedLowestFare,
    recommendation,
    recommendationTitle,
    recommendationReason,
    priceUrgency,
    seatsRemaining,
    occupancySurgeRiskPct,
    priceTrend,
    historicalAverageFare,
    savingsVsPeak,
    demandFactor,
  } = data;

  const isBookNow = recommendation === 'BOOK_NOW';
  const isFairPrice = recommendation === 'FAIR_PRICE';

  const minPrice = Math.min(...priceTrend.map(p => p.price)) - 50;
  const maxPrice = Math.max(...priceTrend.map(p => p.price)) + 80;

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden font-mono text-xs">
      
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBookNow ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      {/* Header with Predictive Recommendation */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase flex items-center space-x-1 border ${
                isBookNow
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : isFairPrice
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {isBookNow ? (
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              ) : (
                <Scale className="w-3 h-3 text-emerald-400" />
              )}
              <span>{recommendationTitle}</span>
            </span>

            <span className="text-[10px] text-gray-400">AI Predictive Pricing Engine</span>
          </div>

          <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center space-x-2">
            <span>Historical Fare Trajectory & Surge Forecast</span>
          </h3>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            {recommendationReason}
          </p>
        </div>

        {/* Action / Urgency Badge */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border flex items-center space-x-1 ${
            priceUrgency === 'HIGH'
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : priceUrgency === 'MODERATE'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            <Zap className="w-3 h-3" />
            <span>Urgency: {priceUrgency}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {demandFactor}
          </span>
        </div>
      </div>

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Current Base Fare</span>
          <div className="text-xl font-display font-bold text-[#E7CB58]">
            ₹{currentFare}
          </div>
          <span className="text-[9px] text-gray-500">Live baseline price</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Predicted Peak Fare</span>
          <div className="text-xl font-display font-bold text-red-400 flex items-center space-x-1">
            <span>₹{predictedPeakFare}</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-amber-400/90 font-bold">
            +₹{savingsVsPeak} expected surge
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Surge Probability</span>
          <div className="text-xl font-display font-bold text-white">
            {occupancySurgeRiskPct}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${
                occupancySurgeRiskPct > 75 ? 'bg-red-500' : 'bg-[#E7CB58]'
              }`}
              style={{ width: `${occupancySurgeRiskPct}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Remaining Berths</span>
          <div className="text-xl font-display font-bold text-white">
            {seatsRemaining} <span className="text-xs font-normal text-gray-400">Left</span>
          </div>
          <span className="text-[9px] text-emerald-400">
            {seatsRemaining <= 8 ? 'High velocity selling' : 'Normal booking pace'}
          </span>
        </div>
      </div>

      {/* Chart View Mode Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-400">View Dimension:</span>
          <button
            type="button"
            onClick={() => setSelectedMetric('price')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
              selectedMetric === 'price'
                ? 'bg-[#E7CB58] text-black shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Fare Price (₹)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('demand')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
              selectedMetric === 'demand'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Demand Index (0-100)
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-4 text-[10px] text-gray-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Historical Fares</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E7CB58] inline-block animate-pulse" />
            <span>Current Live Price</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span>AI Projected Peak</span>
          </span>
        </div>
      </div>

      {/* ========================================================
          RECHARTS PRICE TREND GRAPH
         ======================================================== */}
      <div className="h-56 sm:h-64 w-full bg-black/40 border border-white/5 rounded-2xl p-3 relative">
        
        {/* Timeline Divider Label */}
        <div className="absolute top-4 right-6 text-[10px] text-amber-300/80 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 font-bold pointer-events-none">
          {selectedMetric === 'price' ? '⚡ Surge Curve Active' : '📊 Demand Curve'}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={priceTrend}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fareGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E7CB58" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#E7CB58" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="timeOffset"
              stroke="#52525B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#52525B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={selectedMetric === 'price' ? [minPrice, maxPrice] : [0, 100]}
              tickFormatter={v => (selectedMetric === 'price' ? `₹${v}` : `${v}%`)}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#16181F',
                borderColor: '#3F3F46',
                borderRadius: '14px',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(val: any, name: any, item: any) => {
                const point = item.payload;
                if (name === 'price') {
                  return [`₹${val}`, `Fare Price (${point.type})`];
                }
                if (name === 'demandIndex') {
                  return [`${val}/100`, `Corridor Demand Index`];
                }
                return [val, name];
              }}
              labelFormatter={(label) => `Timeline: ${label}`}
            />

            {/* Reference Line for Current Price */}
            {selectedMetric === 'price' && (
              <ReferenceLine
                y={currentFare}
                stroke="#E7CB58"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{
                  value: `Now: ₹${currentFare}`,
                  fill: '#E7CB58',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
            )}

            {/* Area Line */}
            {selectedMetric === 'price' ? (
              <Area
                type="monotone"
                dataKey="price"
                stroke="#E7CB58"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#fareGradient)"
                name="price"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="demandIndex"
                stroke="#A855F7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#demandGradient)"
                name="demandIndex"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Historical Intelligence Drawer */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowInsights(!showInsights)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-xs">
            <Sparkles className="w-4 h-4 text-[#E7CB58]" />
            <span className="font-bold">Historical Corridor Demand Insights & Fare Logic</span>
          </div>
          {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showInsights && (
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">30-Day Median Fare</span>
                <div className="text-base font-bold text-white">₹{historicalAverageFare}</div>
                <p className="text-[10px] text-gray-400">Baseline fare across last 140 coach departures on this corridor.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Surge Window Interval</span>
                <div className="text-base font-bold text-amber-300">T-18 to T-4 Hours</div>
                <p className="text-[10px] text-gray-400">Dynamic algorithmic repricing triggers as coach capacity crosses 75%.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Potential Savings</span>
                <div className="text-base font-bold text-emerald-400">Save ₹{savingsVsPeak} per ticket</div>
                <p className="text-[10px] text-gray-400">Locking current seat hold guarantees current fare without surge penalty.</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 border-t border-white/5 pt-2 leading-relaxed">
              <strong>Engine Note:</strong> FLASHX OS calculates predictive pricing using real-time seat hold concurrency, historical weekend rush vectors along NH44/NH544, and multi-operator route capacity telemetry.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
