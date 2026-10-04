import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
  RefreshCw,
  Activity,
  MapPin,
  FileSearch,
  ArrowRight
} from 'lucide-react';

interface RouteAnomaly {
  id: string;
  routeCorridor: string;
  hubName: string;
  anomalyType: 'TRANSIT_DELAY' | 'DEMAND_SURGE' | 'FUEL_INEFFICIENCY' | 'TERMINAL_IDLE';
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE';
  deviationMetric: string; // e.g. "+42 mins vs historical avg"
  historicalAverage: string;
  currentValue: string;
  rootCauseAnalysis: string;
  status: 'ACTIVE_FLAG' | 'MITIGATION_DISPATCHED' | 'RESOLVED';
}

const INITIAL_ANOMALIES: RouteAnomaly[] = [
  {
    id: 'anom-01',
    routeCorridor: 'Coimbatore ⇄ Bengaluru (NH544)',
    hubName: 'Coimbatore Gandhipuram',
    anomalyType: 'TRANSIT_DELAY',
    severity: 'CRITICAL',
    deviationMetric: '+42 mins vs historical average',
    historicalAverage: '6h 45m',
    currentValue: '7h 27m',
    rootCauseAnalysis: 'Western Ghats heavy precipitation and landslide clearance near Salem toll plaza causing bottleneck.',
    status: 'ACTIVE_FLAG',
  },
  {
    id: 'anom-02',
    routeCorridor: 'Bengaluru ⇄ Chennai (NH48)',
    hubName: 'Bengaluru Kempegowda (KBS)',
    anomalyType: 'DEMAND_SURGE',
    severity: 'CRITICAL',
    deviationMetric: '+38% passenger volume vs 30d mean',
    historicalAverage: '220 pax/hr',
    currentValue: '304 pax/hr',
    rootCauseAnalysis: 'Friday weekend exodus compounded by IT corridor shift release; terminal boarding queues exceeding capacity.',
    status: 'ACTIVE_FLAG',
  },
  {
    id: 'anom-03',
    routeCorridor: 'Hyderabad ⇄ Bengaluru (NH44)',
    hubName: 'Hyderabad MGBS',
    anomalyType: 'FUEL_INEFFICIENCY',
    severity: 'WARNING',
    deviationMetric: '+18% fuel burn per km on 3 coaches',
    historicalAverage: '4.7 km/L',
    currentValue: '3.9 km/L',
    rootCauseAnalysis: 'Suboptimal turbocharger thermal regulation and aggressive idling during Kurnool rest stops.',
    status: 'ACTIVE_FLAG',
  },
  {
    id: 'anom-04',
    routeCorridor: 'Chennai ⇄ Madurai (NH45)',
    hubName: 'Chennai Koyambedu (CMBT)',
    anomalyType: 'TERMINAL_IDLE',
    severity: 'NOTICE',
    deviationMetric: '+25 mins turnaround delay',
    historicalAverage: '20 mins',
    currentValue: '45 mins',
    rootCauseAnalysis: 'Delayed baggage loading and manual ticketing verification bottlenecks at Bay 12.',
    status: 'ACTIVE_FLAG',
  },
  {
    id: 'anom-05',
    routeCorridor: 'Bengaluru ⇄ Mysuru (NH275)',
    hubName: 'Mysuru Suburban Stand',
    anomalyType: 'DEMAND_SURGE',
    severity: 'NOTICE',
    deviationMetric: '+22% passenger volume spike',
    historicalAverage: '160 pax/hr',
    currentValue: '195 pax/hr',
    rootCauseAnalysis: 'Heritage festival tourism surge; additional shuttle dispatch required.',
    status: 'RESOLVED',
  },
];

export const AnomalyDetectionWidget: React.FC = () => {
  const [anomalies, setAnomalies] = useState<RouteAnomaly[]>(INITIAL_ANOMALIES);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<RouteAnomaly | null>(INITIAL_ANOMALIES[0]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredAnomalies = useMemo(() => {
    if (filterType === 'ALL') return anomalies;
    if (filterType === 'CRITICAL') return anomalies.filter(a => a.severity === 'CRITICAL');
    if (filterType === 'ACTIVE') return anomalies.filter(a => a.status === 'ACTIVE_FLAG');
    if (filterType === 'RESOLVED') return anomalies.filter(a => a.status === 'RESOLVED');
    return anomalies;
  }, [anomalies, filterType]);

  const handleMitigate = (anomalyId: string, actionName: string) => {
    setAnomalies(prev => prev.map(a => {
      if (a.id === anomalyId) {
        return { ...a, status: 'MITIGATION_DISPATCHED' };
      }
      return a;
    }));

    const target = anomalies.find(a => a.id === anomalyId)?.routeCorridor;
    setActionSuccessMsg(`Mitigation directive '${actionName}' successfully deployed for route ${target}. Telemetry anomaly under re-calibration.`);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center font-display font-bold shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Route Anomaly Detection & Inefficiency Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>HISTORICAL DEVIATION AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Continuously compares live intercity corridor telemetry against 30-day historical moving averages to flag hidden inefficiencies.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Anomalies (' + anomalies.length + ')' },
            { id: 'CRITICAL', label: 'Critical Severity' },
            { id: 'ACTIVE', label: 'Active Flags' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === f.id
                  ? 'bg-red-500 text-black font-bold shadow-lg shadow-red-500/20'
                  : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Anomalies List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredAnomalies.map(item => {
            const isSelected = selectedAnomaly?.id === item.id;
            const isCritical = item.severity === 'CRITICAL';
            const isActive = item.status === 'ACTIVE_FLAG';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedAnomaly(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono text-xs space-y-3 ${
                  isSelected
                    ? 'bg-red-950/30 border-red-500/60 shadow-xl ring-1 ring-red-500/30'
                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-display font-bold text-white">{item.routeCorridor}</div>
                      <div className="text-[10px] text-gray-400">{item.hubName}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    item.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                      : item.severity === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 uppercase text-[9px]">Anomaly Deviation</span>
                    <span className="text-red-400 font-bold">{item.deviationMetric}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-white/5">
                    <span className="text-gray-400">Historical Avg: <strong className="text-white">{item.historicalAverage}</strong></span>
                    <span className="text-gray-400">Current Value: <strong className="text-white">{item.currentValue}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Compass className="w-3 h-3 text-[#E7CB58]" />
                    <span>Type: {item.anomalyType.replace('_', ' ')}</span>
                  </span>
                  <span className={`font-bold ${item.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Anomaly Inspector & Root Cause Analysis (5 Cols) */}
        {selectedAnomaly && (
          <div className="lg:col-span-5 bg-black/60 border border-white/10 rounded-2xl p-5 space-y-5 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Anomaly Inspector</span>
                  <h3 className="text-base font-display font-bold text-white">{selectedAnomaly.routeCorridor}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  {selectedAnomaly.severity}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-gray-400 text-[10px] uppercase">Deviation Summary</div>
                  <div className="text-red-400 font-bold text-sm">{selectedAnomaly.deviationMetric}</div>
                  <div className="text-[10px] text-gray-400">Hub Catchment: {selectedAnomaly.hubName}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>30-Day Historical Mean:</span>
                    <span className="font-bold text-white">{selectedAnomaly.historicalAverage}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 pt-1 border-t border-white/5">
                    <span>Live Telemetry Reading:</span>
                    <span className="font-bold text-red-400">{selectedAnomaly.currentValue}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase text-red-400 font-bold">
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>AI Root Cause Analysis</span>
                  </div>
                  <p className="text-xs text-gray-200 font-sans leading-relaxed">
                    {selectedAnomaly.rootCauseAnalysis}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Automated Inefficiency Mitigation</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMitigate(selectedAnomaly.id, 'Deploy Bypass Route')}
                  className="py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold border border-red-500/40 transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  <span>Deploy Bypass Route</span>
                </button>
                <button
                  onClick={() => handleMitigate(selectedAnomaly.id, 'Audit Terminal Operations')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Terminal Ops</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
