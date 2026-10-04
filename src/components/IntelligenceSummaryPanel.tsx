import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldAlert,
  Flame,
  Compass
} from 'lucide-react';

interface IntelligenceSummaryPanelProps {
  currentScenario?: string;
  isProjectedMode?: boolean;
  activeForecastDayName?: string;
  effectiveMultiplier?: number;
}

export const IntelligenceSummaryPanel: React.FC<IntelligenceSummaryPanelProps> = ({
  currentScenario = 'FRIDAY_PEAK',
  isProjectedMode = true,
  activeForecastDayName = 'Friday (Exodus Peak)',
  effectiveMultiplier = 1.25
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisVersion, setAnalysisVersion] = useState<number>(1);

  const handleRefreshAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisVersion(prev => prev + 1);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-br from-[#16181F] via-[#10121A] to-[#16181F] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold shadow-lg shadow-amber-500/20">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Neural Intelligence Summary & Strategic Briefing
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#E7CB58] text-[10px] font-mono font-bold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#E7CB58]" />
                <span>AI-POWERED OMNI SYNTHESIS</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Natural language synthesis of live D3 geospatial heatmaps, weather overlays, and fleet diagnostics to guide operator action.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#E7CB58] font-mono text-xs font-bold transition-all flex items-center space-x-2 border border-amber-500/40 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Synthesizing Telemetry...' : 'Refresh Neural Synthesis'}</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="space-y-6 relative z-10 font-mono text-xs">
        
        {/* Executive Summary Narrative */}
        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-white/5 pb-2">
            <span className="flex items-center space-x-1.5 text-[#E7CB58] font-bold">
              <Cpu className="w-4 h-4" />
              <span>EXECUTIVE OPERATIONAL BRIEFING (SYNTHESIS V{analysisVersion}.{Math.floor(Math.random() * 90) + 10})</span>
            </span>
            <span className="text-emerald-400 font-bold">Confidence: 99.4%</span>
          </div>

          <p className="text-sm text-gray-200 font-sans leading-relaxed">
            {isProjectedMode ? (
              <>
                Analysis of the <strong className="text-white">{activeForecastDayName}</strong> surge horizon indicates severe passenger density concentration across the <strong className="text-[#E7CB58]">Coimbatore ⇄ Bengaluru (NH544)</strong> and <strong className="text-[#E7CB58]">Bengaluru ⇄ Chennai (NH48)</strong> corridors. With network-wide demand multiplier operating at <strong className="text-cyan-400">{effectiveMultiplier}x baseline</strong> and active monsoon precipitation in the Western Ghats boosting express coach preference, immediate capacity intervention is required to prevent terminal congestion.
              </>
            ) : (
              <>
                Live telemetry feed under <strong className="text-[#E7CB58]">{currentScenario}</strong> shows high terminal utilization in Coimbatore and Bengaluru KBS. Fleet load factors are averaging <strong className="text-cyan-400">89.2%</strong>, with an aggregate deficit of 14 coaches across key intercity highways.
              </>
            )}
          </p>
        </div>

        {/* Strategic Recommendations Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-display font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-[#E7CB58]" />
            <span>Recommended Strategic Action Plan for Today</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold text-[11px]">Action 1: Fleet Reallocation</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">HIGH PRIORITY</span>
              </div>
              <p className="text-gray-300 font-sans text-xs leading-relaxed">
                Reposition 3 surplus Volvo sleeper coaches from the Salem yard terminal to Gandhipuram (Coimbatore) ahead of the 16:00 peak surge window.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold text-[11px]">Action 2: Weather Mitigation</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">MONSOON ALERT</span>
              </div>
              <p className="text-gray-300 font-sans text-xs leading-relaxed">
                Heavy rainfall along Kochi and Coimbatore corridors is increasing passenger reliance by +24%. Ensure tarp seals and wiper diagnostics on all active units.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-[11px]">Action 3: Fare & Yield Balance</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">OPTIMIZED</span>
              </div>
              <p className="text-gray-300 font-sans text-xs leading-relaxed">
                Maintain 1.22x dynamic surge multiplier on Bengaluru-Hyderabad overnight sleepers to balance passenger load and incentivize off-peak departures.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
