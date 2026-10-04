import React from 'react';
import { Layers, Filter, CheckCircle2, AlertTriangle, Shield, Zap } from 'lucide-react';

interface LegendProps {
  currentFilter: 'ALL' | 'NORMAL' | 'OPTIMAL' | 'HIGH' | 'CRITICAL';
  onSelectFilter: (filter: 'ALL' | 'NORMAL' | 'OPTIMAL' | 'HIGH' | 'CRITICAL') => void;
  counts: {
    normal: number;
    optimal: number;
    high: number;
    critical: number;
    total: number;
  };
}

export const DemandMapLegend: React.FC<LegendProps> = ({
  currentFilter,
  onSelectFilter,
  counts,
}) => {
  return (
    <div className="bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl font-mono text-xs space-y-3 z-20">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#E7CB58]" />
          <span className="font-bold uppercase tracking-wider text-white">
            D3 Map Legend & Intensity Filter
          </span>
        </div>
        {currentFilter !== 'ALL' && (
          <button
            onClick={() => onSelectFilter('ALL')}
            className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#E7CB58] font-bold transition-colors"
          >
            Reset Filter ({counts.total})
          </button>
        )}
      </div>

      {/* Legend Items / Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        
        {/* All Levels */}
        <button
          onClick={() => onSelectFilter('ALL')}
          className={`p-2.5 rounded-xl text-left transition-all border ${
            currentFilter === 'ALL'
              ? 'bg-[#E7CB58] text-black font-bold border-[#E7CB58] shadow-md shadow-amber-500/20'
              : 'bg-black/40 hover:bg-white/5 text-gray-300 border-white/5'
          }`}
        >
          <div className="text-[10px] uppercase opacity-80">View All</div>
          <div className="text-sm font-display font-bold mt-0.5">{counts.total} Entities</div>
        </button>

        {/* Normal / Surplus */}
        <button
          onClick={() => onSelectFilter('NORMAL')}
          className={`p-2.5 rounded-xl text-left transition-all border ${
            currentFilter === 'NORMAL'
              ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase font-bold">&lt;75% Normal</span>
          </div>
          <div className="text-xs font-bold mt-1">{counts.normal} Regions/Hubs</div>
        </button>

        {/* Optimal */}
        <button
          onClick={() => onSelectFilter('OPTIMAL')}
          className={`p-2.5 rounded-xl text-left transition-all border ${
            currentFilter === 'OPTIMAL'
              ? 'bg-cyan-400 text-black font-bold border-cyan-300 shadow-md shadow-cyan-500/20'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[10px] uppercase font-bold">75–85% Optimal</span>
          </div>
          <div className="text-xs font-bold mt-1">{counts.optimal} Entities</div>
        </button>

        {/* High Demand */}
        <button
          onClick={() => onSelectFilter('HIGH')}
          className={`p-2.5 rounded-xl text-left transition-all border ${
            currentFilter === 'HIGH'
              ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] uppercase font-bold">85–92% High</span>
          </div>
          <div className="text-xs font-bold mt-1">{counts.high} Entities</div>
        </button>

        {/* Critical Surge */}
        <button
          onClick={() => onSelectFilter('CRITICAL')}
          className={`p-2.5 rounded-xl text-left transition-all border ${
            currentFilter === 'CRITICAL'
              ? 'bg-red-500 text-white font-bold border-red-400 shadow-md shadow-red-500/30'
              : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/40'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] uppercase font-bold">&gt;92% Surge</span>
          </div>
          <div className="text-xs font-bold mt-1">{counts.critical} Hotspots</div>
        </button>

      </div>
    </div>
  );
};
