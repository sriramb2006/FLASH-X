import React from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { LoyaltyAccount } from '../../shared/types';

interface LoyaltyMilestoneChartProps {
  account: LoyaltyAccount;
  onExploreMissions?: () => void;
  onViewTiers?: () => void;
}

export const LoyaltyMilestoneChart: React.FC<LoyaltyMilestoneChartProps> = ({
  account,
  onExploreMissions,
  onViewTiers,
}) => {
  const currentMiles = account.lifetimeMiles || account.balance || 0;
  const isPlatinum = account.tier === 'PLATINUM_SOVEREIGN';
  const isGold = account.tier === 'GOLD_VOYAGER';

  // Tier Milestones
  const TIERS = [
    {
      id: 'SILVER_CRUISER',
      name: 'Silver Cruiser',
      threshold: 0,
      maxThreshold: 1500,
      multiplier: '1.0x',
      color: '#94A3B8',
      accent: 'from-slate-500 to-slate-400',
      perk: 'Standard seat selection, instant trip SMS alerts',
      icon: '🥉',
    },
    {
      id: 'GOLD_VOYAGER',
      name: 'Gold Voyager',
      threshold: 1500,
      maxThreshold: 4000,
      multiplier: '1.25x',
      color: '#E7CB58',
      accent: 'from-amber-400 to-[#E7CB58]',
      perk: 'Free lower sleeper berth locks, 1 free monthly cancellation waiver',
      icon: '🥈',
    },
    {
      id: 'PLATINUM_SOVEREIGN',
      name: 'Platinum Sovereign',
      threshold: 4000,
      maxThreshold: 10000,
      multiplier: '1.50x',
      color: '#C084FC',
      accent: 'from-purple-400 to-indigo-500',
      perk: 'Complimentary highway dining box, unlimited free reschedule, VIP lounge access',
      icon: '🥇',
    },
  ];

  // Current Target Tier
  const nextTier = isPlatinum
    ? TIERS[2]
    : isGold
    ? TIERS[2]
    : TIERS[1];

  const currentTierObj = isPlatinum
    ? TIERS[2]
    : isGold
    ? TIERS[1]
    : TIERS[0];

  // Radial chart data computation
  const targetThreshold = nextTier.threshold;
  const milesNeeded = isPlatinum ? 0 : Math.max(0, targetThreshold - currentMiles);
  const progressPercent = isPlatinum
    ? 100
    : isGold
    ? Math.min(100, Math.round(((currentMiles - 1500) / (4000 - 1500)) * 100))
    : Math.min(100, Math.round((currentMiles / 1500) * 100));

  const radialData = [
    {
      name: 'Background',
      value: 100,
      fill: '#1F222E',
    },
    {
      name: 'Completed',
      value: Math.min(progressPercent, 100),
      fill: isPlatinum ? '#A855F7' : isGold ? '#E7CB58' : '#38BDF8',
    },
  ];

  // Trajectory projection chart data
  const trajectoryData = [
    { month: 'Start', miles: Math.max(0, currentMiles - 1200), target: 500 },
    { month: 'Jul', miles: Math.max(0, currentMiles - 800), target: 1000 },
    { month: 'Aug', miles: Math.max(0, currentMiles - 400), target: 1500 },
    { month: 'Sep', miles: Math.max(0, currentMiles - 100), target: 2000 },
    { month: 'Oct (Now)', miles: currentMiles, target: isPlatinum ? 4000 : 1500 },
    { month: 'Nov (Est)', miles: currentMiles + 650, target: isPlatinum ? 5000 : 2500 },
    { month: 'Dec (Est)', miles: currentMiles + 1400, target: 4000 },
  ];

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden font-mono">
      
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#E7CB58]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E7CB58]/15 text-[#E7CB58] border border-[#E7CB58]/30 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>FLASHMILES™ MILESTONE RADAR</span>
            </span>
            <span className="text-[10px] text-gray-400">Real-Time Progression Matrix</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center space-x-2">
            <span>Next Milestone:</span>
            <span className={isPlatinum ? 'text-purple-300' : 'text-[#E7CB58]'}>
              {isPlatinum ? 'Platinum Elite Status Retained' : nextTier.name}
            </span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {onExploreMissions && (
            <button
              type="button"
              onClick={onExploreMissions}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <Zap className="w-3.5 h-3.5 text-[#E7CB58]" />
              <span>Earn Mission Miles</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Visualization Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Interactive Radial Gauge & Stats */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          
          {/* Radial Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: progressPercent, fill: isPlatinum ? '#A855F7' : isGold ? '#E7CB58' : '#38BDF8' },
                    { value: 100 - progressPercent, fill: '#1F222E' },
                  ]}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={54}
                  outerRadius={68}
                  stroke="none"
                  paddingAngle={2}
                >
                  <Cell fill={isPlatinum ? '#A855F7' : isGold ? '#E7CB58' : '#38BDF8'} />
                  <Cell fill="#222530" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <Crown className={`w-5 h-5 mb-0.5 ${isPlatinum ? 'text-purple-400' : isGold ? 'text-[#E7CB58]' : 'text-cyan-400'}`} />
              <div className="text-xl font-display font-extrabold text-white leading-none">
                {progressPercent}%
              </div>
              <span className="text-[9px] text-gray-400 uppercase tracking-tighter mt-0.5">
                Completed
              </span>
            </div>
          </div>

          {/* Progress Metrics & Milestone Target */}
          <div className="space-y-3 flex-1 text-left">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Current Balance</span>
              <div className="text-2xl font-display font-bold text-white">
                {currentMiles.toLocaleString()} <span className="text-xs text-[#E7CB58] font-normal font-mono">Miles</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                {isPlatinum ? 'Target Status' : 'Remaining to Milestone'}
              </span>
              <div className={`text-base font-bold ${isPlatinum ? 'text-purple-300' : 'text-emerald-400'}`}>
                {isPlatinum ? '🏆 Elite Unlocked' : `${milesNeeded.toLocaleString()} FlashMiles to go`}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 bg-white/5 p-2 rounded-xl border border-white/5">
              Active Tier: <strong className="text-white">{currentTierObj.name}</strong> ({currentTierObj.multiplier})
            </div>
          </div>

        </div>

        {/* Right: Milestone Trajectory Chart & Velocity */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-semibold flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>FlashMiles Accrual Velocity & Projection</span>
            </span>
            <span className="text-[10px] text-gray-400">NH Corridor Travel Activity</span>
          </div>

          <div className="h-44 w-full bg-black/40 border border-white/5 rounded-2xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="milesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E7CB58" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E7CB58" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
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
                  tickFormatter={v => `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#16181F',
                    borderColor: '#3F3F46',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any, name: any) => [
                    `${val} Miles`,
                    name === 'miles' ? 'Earned Miles' : 'Milestone Target',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="miles"
                  stroke="#E7CB58"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#milesGradient)"
                  name="miles"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#targetGradient)"
                  name="target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* ========================================================
          TIER STEPPER ROADMAP (VISUAL MILESTONES TRACK)
         ======================================================== */}
      <div className="space-y-3 pt-2">
        <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
          Tier Milestones Roadmap
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIERS.map((tier, idx) => {
            const isAchieved = currentMiles >= tier.threshold;
            const isCurrent = account.tier === tier.id;
            const isNext = !isAchieved && (idx === 0 || currentMiles >= TIERS[idx - 1].threshold);

            return (
              <div
                key={tier.id}
                className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'bg-[#E7CB58]/10 border-[#E7CB58] shadow-lg shadow-amber-500/10'
                    : isAchieved
                    ? 'bg-black/40 border-white/15'
                    : 'bg-black/20 border-white/5 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base">{tier.icon}</span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#E7CB58] text-black font-bold text-[9px]">
                        ACTIVE TIER
                      </span>
                    ) : isAchieved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-[9px] flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{tier.threshold} MILES</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-display font-bold text-white mt-1">{tier.name}</h4>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Threshold: {tier.threshold === 0 ? '0' : tier.threshold.toLocaleString()}+ Miles • {tier.multiplier} Earning
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] text-gray-300 leading-snug">
                  {tier.perk}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlock Perks Callout */}
      {!isPlatinum && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#16181F] border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-purple-200">
            <Target className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Unlocking <strong>{nextTier.name}</strong> will grant you <strong>{nextTier.perk}</strong>!
            </span>
          </div>

          <div className="text-[#E7CB58] font-bold text-[11px] flex items-center space-x-1">
            <span>Just {milesNeeded} more miles needed</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

    </div>
  );
};
