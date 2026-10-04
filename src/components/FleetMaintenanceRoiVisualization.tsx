import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  Percent,
  Calculator,
  Info,
  Activity,
  Calendar,
  AlertOctagon,
  Clock,
  Bus
} from 'lucide-react';

export interface ComponentCostData {
  id: string;
  name: string;
  system: string;
  corridor: string;
  preventativeCost: number; // in INR
  emergencyCost: number; // in INR
  savingsAmount: number;
  savingsPct: number;
  avertedPerMonth: number;
  preventativeBreakdown: {
    parts: number;
    labor: number;
    towing: number;
    reliefCoach: number;
    downtimeLoss: number;
  };
  emergencyBreakdown: {
    parts: number;
    labor: number;
    towing: number;
    reliefCoach: number;
    downtimeLoss: number;
  };
  failureRiskDriver: string;
  telemetryIndicator: string;
}

export const COMPONENT_COST_DATA: ComponentCostData[] = [
  {
    id: 'turbo',
    name: 'Turbocharger & Thermal Exhaust System',
    system: 'Engine Forced Induction & Thermal Exhaust',
    corridor: 'Bengaluru ⇄ Chennai (NH48 Heavy Heatload)',
    preventativeCost: 32000,
    emergencyCost: 395000,
    savingsAmount: 363000,
    savingsPct: 91.9,
    avertedPerMonth: 3.2,
    preventativeBreakdown: {
      parts: 25000,
      labor: 7000,
      towing: 0,
      reliefCoach: 0,
      downtimeLoss: 0,
    },
    emergencyBreakdown: {
      parts: 165000,
      labor: 35000,
      towing: 38000,
      reliefCoach: 72000,
      downtimeLoss: 85000,
    },
    failureRiskDriver: 'Sustained highway speeds cause bearing oil starvation. Unmonitored failure shatters turbine blades, injecting metal fragments into intercooler and combustion chambers.',
    telemetryIndicator: 'Exhaust temp > 680°C & boost spool delay > 1.2s',
  },
  {
    id: 'transmission',
    name: 'Automated Multi-Axle Transmission & Clutch Pack',
    system: 'Drivetrain & Automated Shift Actuators',
    corridor: 'Coimbatore ⇄ Bengaluru (NH544 Mountain Grades)',
    preventativeCost: 45000,
    emergencyCost: 485000,
    savingsAmount: 440000,
    savingsPct: 90.7,
    avertedPerMonth: 2.1,
    preventativeBreakdown: {
      parts: 36000,
      labor: 9000,
      towing: 0,
      reliefCoach: 0,
      downtimeLoss: 0,
    },
    emergencyBreakdown: {
      parts: 240000,
      labor: 45000,
      towing: 45000,
      reliefCoach: 65000,
      downtimeLoss: 90000,
    },
    failureRiskDriver: 'Pneumatic actuator air seal leakage leads to clutch slippage and eventual catastrophic synchro ring destruction on Thoppur Ghat descent.',
    telemetryIndicator: 'Gear shift latency > 850ms & air pressure drop > 1.5 bar',
  },
  {
    id: 'brakes',
    name: 'Pneumatic Dual-Circuit Braking System & ABS',
    system: 'Air Compressors, ABS Valves & Rotor Friction',
    corridor: 'Coimbatore ⇄ Kochi (Palakkad Gap Rain Slopes)',
    preventativeCost: 18500,
    emergencyCost: 215000,
    savingsAmount: 196500,
    savingsPct: 91.4,
    avertedPerMonth: 3.8,
    preventativeBreakdown: {
      parts: 14000,
      labor: 4500,
      towing: 0,
      reliefCoach: 0,
      downtimeLoss: 0,
    },
    emergencyBreakdown: {
      parts: 65000,
      labor: 25000,
      towing: 30000,
      reliefCoach: 55000,
      downtimeLoss: 40000,
    },
    failureRiskDriver: 'Air dryer desiccant saturation sends moisture into pneumatic valves, causing brake chamber seizure and burning disc rotors en-route.',
    telemetryIndicator: 'Rotor temperature delta > 45°C between left/right wheel hubs',
  },
  {
    id: 'electrical',
    name: 'Dual 24V Heavy Alternator & Power Electronics',
    system: 'Dual High-Output Alternators & Battery Management',
    corridor: 'Hyderabad ⇄ Bengaluru (NH44 Long Haul Sleeper)',
    preventativeCost: 14000,
    emergencyCost: 152000,
    savingsAmount: 138000,
    savingsPct: 90.8,
    avertedPerMonth: 2.4,
    preventativeBreakdown: {
      parts: 11000,
      labor: 3000,
      towing: 0,
      reliefCoach: 0,
      downtimeLoss: 0,
    },
    emergencyBreakdown: {
      parts: 38000,
      labor: 18000,
      towing: 22000,
      reliefCoach: 50000,
      downtimeLoss: 24000,
    },
    failureRiskDriver: 'Voltage regulator diode burnout knocks out cabin air conditioning and charging ports mid-journey at 02:00 AM, triggering passenger emergency stops.',
    telemetryIndicator: 'Alternator voltage ripple > 600mV under full AC load',
  },
  {
    id: 'suspension',
    name: 'Electronically Controlled Air Suspension Bellows',
    system: 'Air Springs, Leveling Sensors & Anti-Roll Bars',
    corridor: 'Chennai ⇄ Madurai (NH45 High-Speed Corridor)',
    preventativeCost: 26000,
    emergencyCost: 288000,
    savingsAmount: 262000,
    savingsPct: 91.0,
    avertedPerMonth: 2.0,
    preventativeBreakdown: {
      parts: 20000,
      labor: 6000,
      towing: 0,
      reliefCoach: 0,
      downtimeLoss: 0,
    },
    emergencyBreakdown: {
      parts: 95000,
      labor: 48000,
      towing: 0,
      reliefCoach: 65000,
      downtimeLoss: 80000,
    },
    failureRiskDriver: 'Micro-punctures in rubber air bellows cause chassis tilt, forcing emergency low-speed limp mode and severe tire scalloping.',
    telemetryIndicator: 'Compressor duty cycle > 65% indicating continuous leak compensation',
  },
];

export const MONTHLY_TRAJECTORY_DATA = [
  { month: 'Jan', emergencyCost: 38.5, preventativeCost: 4.2, savings: 34.3, incidents: 11 },
  { month: 'Feb', emergencyCost: 74.2, preventativeCost: 8.5, savings: 65.7, incidents: 21 },
  { month: 'Mar', emergencyCost: 112.8, preventativeCost: 12.8, savings: 100.0, incidents: 32 },
  { month: 'Apr', emergencyCost: 154.5, preventativeCost: 17.1, savings: 137.4, incidents: 44 },
  { month: 'May', emergencyCost: 198.2, preventativeCost: 21.6, savings: 176.6, incidents: 56 },
  { month: 'Jun', emergencyCost: 236.4, preventativeCost: 25.8, savings: 210.6, incidents: 67 },
  { month: 'Jul', emergencyCost: 275.1, preventativeCost: 30.2, savings: 244.9, incidents: 78 },
  { month: 'Aug', emergencyCost: 315.6, preventativeCost: 34.6, savings: 281.0, incidents: 89 },
  { month: 'Sep', emergencyCost: 358.4, preventativeCost: 39.1, savings: 319.3, incidents: 101 },
  { month: 'Oct', emergencyCost: 404.2, preventativeCost: 43.8, savings: 360.4, incidents: 114 },
  { month: 'Nov', emergencyCost: 442.8, preventativeCost: 48.2, savings: 394.6, incidents: 125 },
  { month: 'Dec', emergencyCost: 486.5, preventativeCost: 52.8, savings: 433.7, incidents: 138 },
];

interface FleetMaintenanceRoiVisualizationProps {
  onScheduleService?: (componentName: string) => void;
  onReturnToScheduler?: () => void;
}

export const FleetMaintenanceRoiVisualization: React.FC<FleetMaintenanceRoiVisualizationProps> = ({
  onScheduleService,
  onReturnToScheduler,
}) => {
  const [roiTimeframe, setRoiTimeframe] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [roiCoverage, setRoiCoverage] = useState<'CURRENT' | 'FULL_FLEET' | 'LEGACY'>('CURRENT');
  const [selectedCostComponentId, setSelectedCostComponentId] = useState<string>('turbo');
  const [roiVisualType, setRoiVisualType] = useState<'COMPARISON_BARS' | 'TRAJECTORY_CURVE'>('COMPARISON_BARS');
  const [hoveredTrajectoryMonth, setHoveredTrajectoryMonth] = useState<any | null>(null);

  // Helper currency formatters
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return `₹${val.toLocaleString()}`;
  };

  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(1)}L`;

  // Dynamic calculations based on timeframe & coverage scenario
  const timeframeMultiplier = roiTimeframe === 'ANNUAL' ? 12.0 : roiTimeframe === 'QUARTERLY' ? 3.0 : 1.0;
  const coverageMultiplier = roiCoverage === 'FULL_FLEET' ? 1.15 : roiCoverage === 'LEGACY' ? 0.35 : 1.0;

  const baseMonthlyEmergency = COMPONENT_COST_DATA.reduce((sum, c) => sum + (c.emergencyCost * c.avertedPerMonth), 0);
  const baseMonthlyPreventative = COMPONENT_COST_DATA.reduce((sum, c) => sum + (c.preventativeCost * c.avertedPerMonth), 0) + 380000; // includes 3.8L telemetry program

  const totalEmergencySpend = Math.round(baseMonthlyEmergency * timeframeMultiplier * (roiCoverage === 'LEGACY' ? 1.4 : 1.0));
  const totalPreventativeSpend = Math.round(baseMonthlyPreventative * timeframeMultiplier * coverageMultiplier);
  const netSavings = Math.max(0, totalEmergencySpend - totalPreventativeSpend);
  const roiMultiplier = totalPreventativeSpend > 0 ? (totalEmergencySpend / totalPreventativeSpend).toFixed(1) : '1.0';
  const incidentsAverted = Math.round(13.5 * timeframeMultiplier * coverageMultiplier);
  const uptimeHoursPreserved = Math.round(incidentsAverted * 36);

  const activeComponent = useMemo(() => {
    return COMPONENT_COST_DATA.find(c => c.id === selectedCostComponentId) || COMPONENT_COST_DATA[0];
  }, [selectedCostComponentId]);

  // SVG Chart Geometry for 12-Month Trajectory
  const chartWidth = 840;
  const chartHeight = 250;
  const paddingLeft = 65;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const maxSpend = 520; // in Lakhs

  const getX = (index: number) => paddingLeft + (index / (MONTHLY_TRAJECTORY_DATA.length - 1)) * plotWidth;
  const getY = (val: number) => paddingTop + plotHeight - (val / maxSpend) * plotHeight;

  // Path generators
  const emergencyLinePath = MONTHLY_TRAJECTORY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.emergencyCost)}`).join(' ');
  const preventativeLinePath = MONTHLY_TRAJECTORY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.preventativeCost)}`).join(' ');

  const savingsBandPath = (() => {
    const upperPoints = MONTHLY_TRAJECTORY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.emergencyCost)}`).join(' ');
    const lowerPoints = [...MONTHLY_TRAJECTORY_DATA].reverse().map((d, i) => {
      const origIndex = MONTHLY_TRAJECTORY_DATA.length - 1 - i;
      return `L ${getX(origIndex)} ${getY(d.preventativeCost)}`;
    }).join(' ');
    return `${upperPoints} ${lowerPoints} Z`;
  })();

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      
      {/* Top Context & Modeling Controls */}
      <div className="bg-[#12141C] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-display font-bold shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                  Preventative Maintenance vs. Emergency Repairs ROI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  {roiMultiplier}X OPERATIONAL ROI
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Deterministic operations financial model comparing scheduled depot interventions against catastrophic highway breakdowns across 136 interstate coaches.
              </p>
            </div>
          </div>

          {/* Interactive Modeling Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Horizon Filter */}
            <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <span className="text-[10px] text-gray-400 uppercase px-1.5">Horizon:</span>
              {(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setRoiTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    roiTimeframe === tf
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {tf === 'MONTHLY' ? '30-Day' : tf === 'QUARTERLY' ? '90-Day Q4' : 'Annual (12 Mo)'}
                </button>
              ))}
            </div>

            {/* Visual View Mode */}
            <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <span className="text-[10px] text-gray-400 uppercase px-1.5">View:</span>
              <button
                onClick={() => setRoiVisualType('COMPARISON_BARS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  roiVisualType === 'COMPARISON_BARS'
                    ? 'bg-[#E7CB58] text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Component Bars
              </button>
              <button
                onClick={() => setRoiVisualType('TRAJECTORY_CURVE')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  roiVisualType === 'TRAJECTORY_CURVE'
                    ? 'bg-[#E7CB58] text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                12-Mo Trajectory
              </button>
            </div>

            {/* Coverage Scenario */}
            <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <span className="text-[10px] text-gray-400 uppercase px-1.5">Scenario:</span>
              {(['CURRENT', 'FULL_FLEET', 'LEGACY'] as const).map(cov => (
                <button
                  key={cov}
                  onClick={() => setRoiCoverage(cov)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    roiCoverage === cov
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {cov === 'CURRENT' ? '92% AI Fleet' : cov === 'FULL_FLEET' ? '100% Target' : 'Legacy (Run-to-Fail)'}
                </button>
              ))}
            </div>

            {onReturnToScheduler && (
              <button
                onClick={onReturnToScheduler}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs flex items-center space-x-1 transition-all border border-white/10"
              >
                <span>Maintenance Scheduler</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        </div>

        {/* 4-Stat Operations ROI Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-[#161822] to-black border border-emerald-500/40 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Net Operations Cash Saved</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
              {formatINR(netSavings)}
            </div>
            <div className="text-[10px] text-emerald-300 flex items-center space-x-1 pt-0.5">
              <span>93.1% Cost Reduction</span>
              <span className="text-gray-400">• vs Emergency Repairs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Program Operational ROI</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#E7CB58]">
              {roiMultiplier}x
              <span className="text-xs font-normal text-gray-400 ml-1.5">Return Ratio</span>
            </div>
            <div className="text-[10px] text-gray-300 pt-0.5">
              ₹{roiMultiplier} saved per ₹1 spent on sensor telemetry
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Highway Failures Averted</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-cyan-400">
              {incidentsAverted}
              <span className="text-xs font-normal text-gray-400 ml-1.5">Incidents</span>
            </div>
            <div className="text-[10px] text-gray-300 pt-0.5 truncate">
              Zero passenger strandings on NH44 & NH544
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block">Fleet Uptime Preserved</span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">
              +{uptimeHoursPreserved}
              <span className="text-xs font-normal text-gray-400 ml-1.5">Coach Hours</span>
            </div>
            <div className="text-[10px] text-emerald-400 pt-0.5">
              99.4% on-time departure availability
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area based on visual type */}
      {roiVisualType === 'COMPARISON_BARS' ? (
        
        <div className="space-y-6">
          
          {/* Side-by-Side Comparative Component Bars Chart */}
          <div className="bg-[#10121A] border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
              <div>
                <h4 className="text-base font-display font-bold text-white">
                  Component-Level Cost Disparity: Preventative PM vs Emergency Highway Breakdown
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Visualizes catastrophic repair costs (including towing, relief coaches & revenue downtime) against scheduled depot replacement.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>Scheduled PM Cost</span>
                </span>
                <span className="flex items-center space-x-1.5 text-red-400">
                  <span className="w-3 h-3 rounded-md bg-red-500" />
                  <span>Emergency Breakdown Cost</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#E7CB58]">
                  <span className="w-3 h-3 rounded-md bg-[#E7CB58]" />
                  <span>Net Savings Delta</span>
                </span>
              </div>
            </div>

            {/* List of Component Comparisons */}
            <div className="space-y-4">
              {COMPONENT_COST_DATA.map(comp => {
                const isSelected = selectedCostComponentId === comp.id;
                const maxBarCost = 500000;
                const prevPct = Math.max(6, Math.min(100, (comp.preventativeCost / maxBarCost) * 100));
                const emergPct = Math.max(10, Math.min(100, (comp.emergencyCost / maxBarCost) * 100));

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCostComponentId(comp.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold text-sm">{comp.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                            {comp.corridor}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          System: <strong className="text-gray-300">{comp.system}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          ▲ {comp.savingsPct}% Cost Saved
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block uppercase">Net Savings / Incident</span>
                          <span className="text-base font-bold text-[#E7CB58]">{formatINR(comp.savingsAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Bars */}
                    <div className="space-y-2 text-xs font-mono">
                      
                      {/* Emergency Breakdown Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-red-300">
                          <span>Emergency Roadside Catastrophe (Run-to-Failure)</span>
                          <span className="font-bold">{formatINR(comp.emergencyCost)}</span>
                        </div>
                        <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-red-500/20">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-500 shadow-sm shadow-red-500/50"
                            style={{ width: `${emergPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Preventative PM Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-emerald-300">
                          <span>Preventative Scheduled Depot Service (01:00-04:00 AM)</span>
                          <span className="font-bold">{formatINR(comp.preventativeCost)}</span>
                        </div>
                        <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-emerald-500/20">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                            style={{ width: `${prevPct}%` }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Failure Driver Summary & Selection Indicator */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                      <div className="flex items-center space-x-1.5 truncate max-w-xl">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">Telemetry Trigger: <strong className="text-gray-200">{comp.telemetryIndicator}</strong></span>
                      </div>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {isSelected ? '✓ ACTIVE IN INSPECTOR' : 'Click to inspect cost breakdown →'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep-Dive Itemized Expense Comparison Inspector */}
          <div className="bg-[#12141C] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                  Itemized Cost Driver Analysis
                </span>
                <h4 className="text-lg font-display font-bold text-white">
                  {activeComponent.name}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Line-by-line breakdown explaining how preventative maintenance captures <strong className="text-emerald-400">₹{activeComponent.savingsAmount.toLocaleString()}</strong> in net cash conservation per incident.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase block">Incident Savings</span>
                <span className="text-xl font-bold text-[#E7CB58]">
                  {formatINR(activeComponent.savingsAmount)}
                </span>
              </div>
            </div>

            {/* Side-by-Side Category Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Left Column: Preventative Scheduled Maintenance */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Preventative Program (Off-Peak)</span>
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatINR(activeComponent.preventativeCost)}
                  </span>
                </div>

                <div className="space-y-2 text-gray-300 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>OEM Replacement Parts & Seals</span>
                    <strong className="text-white">{formatINR(activeComponent.preventativeBreakdown.parts)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Scheduled Depot Technician Labor (Overnight)</span>
                    <strong className="text-white">{formatINR(activeComponent.preventativeBreakdown.labor)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5 text-gray-500">
                    <span>Highway Towing & Recovery</span>
                    <strong className="text-emerald-400">₹0 (Averted)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5 text-gray-500">
                    <span>Passenger Relief Coach & Care Refund</span>
                    <strong className="text-emerald-400">₹0 (Averted)</strong>
                  </div>
                  <div className="flex justify-between py-1 text-gray-500">
                    <span>Unscheduled Revenue Downtime</span>
                    <strong className="text-emerald-400">₹0 (Scheduled in Depot)</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-gray-300">
                  <strong className="text-emerald-400 block mb-0.5">Zero Passenger Disruption:</strong>
                  Work performed at assigned hub bay between 01:00 AM and 04:00 AM during scheduled layover.
                </div>
              </div>

              {/* Right Column: Emergency Roadside Breakdown */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                  <span className="text-red-400 font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Emergency Roadside Catastrophe</span>
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatINR(activeComponent.emergencyCost)}
                  </span>
                </div>

                <div className="space-y-2 text-gray-300 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Damaged Core Component + Collateral Parts</span>
                    <strong className="text-red-300">{formatINR(activeComponent.emergencyBreakdown.parts)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Emergency Roadside Overtime Labor</span>
                    <strong className="text-red-300">{formatINR(activeComponent.emergencyBreakdown.labor)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Highway Heavy-Duty Flatbed Towing</span>
                    <strong className="text-red-300">{formatINR(activeComponent.emergencyBreakdown.towing)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Relief Bus Dispatch & Passenger Dinner/Refunds</span>
                    <strong className="text-red-300">{formatINR(activeComponent.emergencyBreakdown.reliefCoach)}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>3 to 5 Days Lost Route Revenue Downtime</span>
                    <strong className="text-red-300">{formatINR(activeComponent.emergencyBreakdown.downtimeLoss)}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-[11px] text-gray-300">
                  <strong className="text-red-400 block mb-0.5">Catastrophic Cost Multiplier:</strong>
                  {activeComponent.failureRiskDriver}
                </div>
              </div>

            </div>

            {/* Quick Action Button */}
            {onScheduleService && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onScheduleService(activeComponent.name)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-black" />
                  <span>Schedule Preemptive Depot Service for {activeComponent.name}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      ) : (
        
        /* 12-Month Cumulative Financial Trajectory Chart */
        <div className="bg-[#10121A] border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
            <div>
              <h4 className="text-base font-display font-bold text-white">
                12-Month Cumulative Expense Trajectory: Run-to-Failure vs Preventative Program
              </h4>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Simulates cumulative cash outflow over 12 rolling months across 136 multi-axle luxury coaches in South India.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-red-400">
                <span className="w-3 h-0.5 bg-red-500 rounded" />
                <span>Run-to-Failure (Cumulative Emergency Spend)</span>
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400 rounded" />
                <span>Preventative Telemetry Program</span>
              </span>
              <span className="flex items-center space-x-1.5 text-[#E7CB58]">
                <span className="w-3 h-2 bg-amber-500/20 border border-amber-500/40 rounded-sm" />
                <span>Net Operations Cash Saved (₹4.33 Cr)</span>
              </span>
            </div>
          </div>

          {/* SVG Area/Line Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[700px] select-none cursor-crosshair"
              onMouseLeave={() => setHoveredTrajectoryMonth(null)}
            >
              <defs>
                <linearGradient id="savings-band-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E7CB58" stopOpacity="0.05" />
                </linearGradient>

                <filter id="roi-dot-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const y = paddingTop + plotHeight - frac * plotHeight;
                const valLakhs = frac * maxSpend;
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
                      ₹{(valLakhs / 100).toFixed(1)}Cr
                    </text>
                  </g>
                );
              })}

              {/* Savings Shaded Band */}
              <path
                d={savingsBandPath}
                fill="url(#savings-band-grad)"
              />

              {/* Emergency Spend Red Line */}
              <path
                d={emergencyLinePath}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Preventative Spend Emerald Line */}
              <path
                d={preventativeLinePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots for Months */}
              {MONTHLY_TRAJECTORY_DATA.map((d, i) => {
                const x = getX(i);
                const yEmerg = getY(d.emergencyCost);
                const yPrev = getY(d.preventativeCost);
                const isHovered = hoveredTrajectoryMonth?.month === d.month;

                return (
                  <g
                    key={`point-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTrajectoryMonth(d)}
                  >
                    {/* Invisible Catchment */}
                    <circle cx={x} cy={(yEmerg + yPrev) / 2} r="18" fill="transparent" />

                    {/* Red Emergency Dot */}
                    <circle
                      cx={x}
                      cy={yEmerg}
                      r={isHovered ? 6 : 4}
                      fill="#EF4444"
                      stroke="#10121A"
                      strokeWidth="1.5"
                      filter={isHovered ? 'url(#roi-dot-glow)' : 'none'}
                    />

                    {/* Emerald Preventative Dot */}
                    <circle
                      cx={x}
                      cy={yPrev}
                      r={isHovered ? 6 : 4}
                      fill="#10B981"
                      stroke="#10121A"
                      strokeWidth="1.5"
                      filter={isHovered ? 'url(#roi-dot-glow)' : 'none'}
                    />
                  </g>
                );
              })}

              {/* X-Axis Month Labels */}
              {MONTHLY_TRAJECTORY_DATA.map((d, i) => {
                const x = getX(i);
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
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Hover Line Guideline */}
              {hoveredTrajectoryMonth && (
                <g className="pointer-events-none">
                  {(() => {
                    const idx = MONTHLY_TRAJECTORY_DATA.findIndex(d => d.month === hoveredTrajectoryMonth.month);
                    const x = getX(idx);
                    return (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + plotHeight}
                        stroke="#E7CB58"
                        strokeWidth="1.2"
                        strokeDasharray="4,4"
                        strokeOpacity="0.8"
                      />
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>

          {/* Hovered Month Telemetry Display */}
          {(() => {
            const displayMonth = hoveredTrajectoryMonth || MONTHLY_TRAJECTORY_DATA[MONTHLY_TRAJECTORY_DATA.length - 1];
            return (
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Selected Month Horizon</span>
                  <span className="text-white font-bold text-base">{displayMonth.month} Cumulative Review</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">
                    {displayMonth.incidents} High-Risk Catastrophic Failures Preempted to Date
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-red-400 block uppercase">Run-to-Failure Cost</span>
                    <span className="text-sm font-bold text-red-300">₹{displayMonth.emergencyCost.toFixed(1)} Lakhs</span>
                  </div>

                  <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-emerald-400 block uppercase">Preventative Cost</span>
                    <span className="text-sm font-bold text-emerald-300">₹{displayMonth.preventativeCost.toFixed(1)} Lakhs</span>
                  </div>

                  <div className="bg-emerald-500/20 px-3.5 py-2 rounded-xl border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block uppercase">Net Cash Conserved</span>
                    <span className="text-base font-bold text-[#E7CB58]">₹{displayMonth.savings.toFixed(1)} Lakhs</span>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      )}

      {/* Strategic Operational Guidance for Fleet Leadership */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Off-Peak Bay Scheduling Directive</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            By shifting all component replacements to the 01:00 AM – 04:00 AM window at Coimbatore Gandhipuram and Bengaluru KBS yards, route downtime loss is completely eliminated (<strong className="text-white">₹0 revenue disruption</strong>).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
          <div className="flex items-center space-x-2 text-[#E7CB58] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Avoid Collateral Drivetrain Damage</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            A ₹14,000 alternator regulator swap prevents dead batteries that shut down sleeper berth air-conditioning mid-transit, saving <strong className="text-white">₹72,000</strong> in passenger relief coaches and brand reputation loss.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Sensor Payback Period: 18 Days</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            The full-fleet AI vibration, thermal, and pneumatic sensor suite pays for itself after averting just <strong className="text-white">one single transmission seizure</strong> on the Thoppur Ghats corridor.
          </p>
        </div>
      </div>

    </div>
  );
};
