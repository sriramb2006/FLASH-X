import React from 'react';
import { Sparkles, ArrowRight, Zap, Bus, CheckCircle2, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface RouteOptimizationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: (optimizationId: string) => void;
  appliedOptimizations: string[];
}

interface OptimizationVector {
  id: string;
  title: string;
  sourceHub: string;
  destHub: string;
  surplusPax: number;
  deficitPax: number;
  recommendedCoaches: number;
  corridorHighway: string;
  estimatedTimeSavedHrs: number;
  status: 'READY' | 'DEPLOYED';
}

const OPTIMIZATION_VECTORS: OptimizationVector[] = [
  {
    id: 'opt-1',
    title: 'Bengaluru ⇄ Chennai Express Shuttle Bypass',
    sourceHub: 'Bengaluru',
    destHub: 'Chennai',
    surplusPax: 1420,
    deficitPax: 1850,
    recommendedCoaches: 8,
    corridorHighway: 'NH-48 Golden Quadrilateral',
    estimatedTimeSavedHrs: 1.8,
    status: 'READY',
  },
  {
    id: 'opt-2',
    title: 'Coimbatore ⇄ Bengaluru Tech-Corridor Reinforcement',
    sourceHub: 'Coimbatore',
    destHub: 'Bengaluru',
    surplusPax: 890,
    deficitPax: 1340,
    recommendedCoaches: 6,
    corridorHighway: 'NH-44 Corridor',
    estimatedTimeSavedHrs: 1.4,
    status: 'READY',
  },
  {
    id: 'opt-3',
    title: 'Madurai ⇄ Chennai Overnight Sleeper Bridge',
    sourceHub: 'Madurai',
    destHub: 'Chennai',
    surplusPax: 760,
    deficitPax: 1120,
    recommendedCoaches: 5,
    corridorHighway: 'NH-38 Eastern Arterial',
    estimatedTimeSavedHrs: 2.1,
    status: 'READY',
  },
  {
    id: 'opt-4',
    title: 'Tirupati ⇄ Bengaluru Pilgrim Express Loop',
    sourceHub: 'Tirupati',
    destHub: 'Bengaluru',
    surplusPax: 650,
    deficitPax: 980,
    recommendedCoaches: 4,
    corridorHighway: 'NH-71 Regional Connector',
    estimatedTimeSavedHrs: 1.2,
    status: 'READY',
  },
];

export const RouteOptimizationOverlay: React.FC<RouteOptimizationOverlayProps> = ({
  isOpen,
  onClose,
  onApplyOptimization,
  appliedOptimizations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn font-mono text-xs text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              AI Route Optimization & Fleet Re-Allocation Vectors
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              Derived from high-demand cluster surge deficits and surplus terminal nodes.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-bold transition-colors"
        >
          Close Overlay
        </button>
      </div>

      {/* Vectors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {OPTIMIZATION_VECTORS.map(vec => {
          const isApplied = appliedOptimizations.includes(vec.id);
          return (
            <div
              key={vec.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isApplied
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-[#16181F]/90 border-white/10 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {vec.corridorHighway}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  isApplied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isApplied ? 'DEPLOYS APPLIED' : `${vec.recommendedCoaches} Coaches Needed`}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-display font-bold text-white">
                  {vec.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  <span className="text-[#E7CB58] font-bold">{vec.sourceHub}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[#E7CB58] font-bold">{vec.destHub}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Absorbs Surplus</span>
                  <span className="font-bold text-cyan-400">+{vec.surplusPax} Pax</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Transit Time Saved</span>
                  <span className="font-bold text-emerald-400">~{vec.estimatedTimeSavedHrs} hrs</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-400 font-mono">
                  Impact: Restores 99.4% Corridor SLA
                </span>
                <button
                  onClick={() => onApplyOptimization(vec.id)}
                  disabled={isApplied}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
                    isApplied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-[#E7CB58] hover:bg-[#d4b748] text-black shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Shuttles Dispatched</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Deploy Re-Allocation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs text-gray-300 mt-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-purple-400" />
          <span>Deploying route re-allocation instantly syncs active depot dispatch queues across South India terminals.</span>
        </div>
        <span className="text-[#E7CB58] font-bold shrink-0">
          {appliedOptimizations.length} / {OPTIMIZATION_VECTORS.length} Vectors Active
        </span>
      </div>
    </div>
  );
};
