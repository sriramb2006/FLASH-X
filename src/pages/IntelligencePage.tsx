import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Sparkles,
  Shield,
  Heart,
  TrendingUp,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Flame,
  Layers,
  MapPin,
  Target
} from 'lucide-react';
import { api } from '../lib/api';
import { DemandHeatmap } from '../components/DemandHeatmap';
import { FleetHealthWidget } from '../components/FleetHealthWidget';
import { IntelligenceSummaryPanel } from '../components/IntelligenceSummaryPanel';
import { PerformanceKPIsWidget } from '../components/PerformanceKPIsWidget';
import { AnomalyDetectionWidget } from '../components/AnomalyDetectionWidget';
import { CompetitiveIntelligenceWidget } from '../components/CompetitiveIntelligenceWidget';
import { TripInsightComponent } from '../components/TripInsightComponent';
import { AiConciergeWidget } from '../components/AiConciergeWidget';
import { DestinationSnapshotWidget } from '../components/DestinationSnapshotWidget';
import { SharedTripPlanner } from '../components/SharedTripPlanner';

export const IntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HEATMAP' | 'CORRIDOR_EVAL' | 'FLEET_HEALTH' | 'COMPETITIVE' | 'CONCIERGE' | 'SNAPSHOT' | 'PLANNER' | 'ALL'>('ALL');
  const [selectedCorridor, setSelectedCorridor] = useState('cbe-blr');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await api.searchBuses({
        source: selectedCorridor === 'cbe-blr' ? 'Coimbatore' : selectedCorridor === 'blr-maa' ? 'Bengaluru' : 'Chennai',
        destination: selectedCorridor === 'cbe-blr' ? 'Bengaluru' : selectedCorridor === 'blr-maa' ? 'Chennai' : 'Madurai',
      });
      setSchedules(res.schedules || []);
      if (res.schedules.length > 0) {
        setActiveAnalysis(res.schedules[0]);
      }
    }
    loadData();
  }, [selectedCorridor]);

  return (
    <div className="min-h-screen bg-[#101114] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>FLASHX OS INTELLIGENCE CORE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            Autonomous Travel Intelligence
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
            Geospatial passenger density heatmaps, corridor telemetry, explainable Journey Success Scoring, and autonomous fleet routing optimization.
          </p>
        </div>

        {/* Section View Switcher */}
        <div className="flex justify-center">
          <div className="bg-[#16181F] border border-white/10 p-1 rounded-2xl flex flex-wrap items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'ALL'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Intelligence Suite</span>
            </button>
            <button
              onClick={() => setActiveTab('HEATMAP')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'HEATMAP'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Demand Heatmap & 7-Day Surge Forecast (D3.js)</span>
            </button>
            <button
              onClick={() => setActiveTab('CORRIDOR_EVAL')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'CORRIDOR_EVAL'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Corridor Telemetry Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('FLEET_HEALTH')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'FLEET_HEALTH'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fleet Health & Diagnostics</span>
            </button>
            <button
              onClick={() => setActiveTab('COMPETITIVE')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'COMPETITIVE'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Competitive Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('CONCIERGE')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'CONCIERGE'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>🤖 AI Travel Concierge</span>
            </button>
            <button
              onClick={() => setActiveTab('SNAPSHOT')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'SNAPSHOT'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>🗺️ Destination Snapshot</span>
            </button>
            <button
              onClick={() => setActiveTab('PLANNER')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'PLANNER'
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>👥 Shared Trip Planner</span>
            </button>
          </div>
        </div>

        {/* Standalone SECTION for Shared Trip Planner */}
        {activeTab === 'PLANNER' && (
          <div className="space-y-4 pt-2">
            <SharedTripPlanner />
          </div>
        )}

        {/* Standalone SECTION for Destination Snapshot */}
        {activeTab === 'SNAPSHOT' && (
          <div className="space-y-4 pt-2">
            <DestinationSnapshotWidget />
          </div>
        )}

        {/* Standalone SECTION for AI Concierge */}
        {activeTab === 'CONCIERGE' && (
          <div className="space-y-4 pt-2">
            <AiConciergeWidget userId="usr-traveler" destinationCity="Bengaluru" />
          </div>
        )}

        {/* SECTION 1: Geospatial Travel Demand Heatmap, Shared Trip Planner & Destination Snapshot */}
        {(activeTab === 'ALL' || activeTab === 'HEATMAP') && (
          <div className="space-y-6">
            {/* Collaborative Shared Trip Planner */}
            <SharedTripPlanner />

            {/* Real-time Destination Snapshot Telemetry Widget */}
            <DestinationSnapshotWidget />

            {/* Intelligence Summary & Strategic Briefing Panel */}
            <IntelligenceSummaryPanel />

            {/* Performance KPIs & Yield Analytics Widget */}
            <PerformanceKPIsWidget />

            {/* Route Anomaly Detection & Inefficiency Engine */}
            <AnomalyDetectionWidget />

            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-display font-bold text-white tracking-wide">
                  Geospatial Travel Demand & Fleet Routing Optimization
                </h2>
              </div>
              <DemandHeatmap />
            </div>

            {/* Competitive Intelligence & Dynamic Market Position */}
            <CompetitiveIntelligenceWidget />
          </div>
        )}

        {/* Standalone SECTION for Competitive Intelligence if selected directly via tab */}
        {activeTab === 'COMPETITIVE' && (
          <div className="space-y-4 pt-2">
            <CompetitiveIntelligenceWidget />
          </div>
        )}

        {/* SECTION 1.5: Fleet Health & Vehicle Diagnostics Widget */}
        {(activeTab === 'ALL' || activeTab === 'FLEET_HEALTH') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                Real-Time Fleet Health & Demand Zone Linkage Monitor
              </h2>
            </div>
            <FleetHealthWidget />
          </div>
        )}

        {/* SECTION 2: Corridor Telemetry Sandbox & Evaluated Coaches */}
        {(activeTab === 'ALL' || activeTab === 'CORRIDOR_EVAL') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                Deterministic Corridor Telemetry Sandbox
              </h2>
            </div>

            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Interactive Telemetry Sandbox</span>
                  <h3 className="text-base font-display font-bold text-white">Select Intercity Corridor to Evaluate</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'cbe-blr', label: 'Coimbatore ⇄ Bengaluru (NH544)' },
                    { id: 'blr-maa', label: 'Bengaluru ⇄ Chennai (NH48)' },
                    { id: 'maa-mdu', label: 'Chennai ⇄ Madurai (NH45)' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCorridor(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        selectedCorridor === c.id
                          ? 'bg-[#E7CB58] text-black font-bold'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeAnalysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <TripInsightComponent schedule={activeAnalysis} />
                  
                  {/* Card 1: Journey Success Score Breakdown */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Journey Success Score™</span>
                      </span>
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {activeAnalysis.journeySuccessScore} / 100
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-gray-300">
                        <span>Punctuality Index (30%)</span>
                        <span>{activeAnalysis.journeyScoreFactors?.punctualityIndex}%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Weather & Road Safety (20%)</span>
                        <span>{activeAnalysis.journeyScoreFactors?.weatherSafetyIndex}%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Operator Fleet Reliability (25%)</span>
                        <span>{activeAnalysis.journeyScoreFactors?.operatorReliability}%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Comfort Equipment (15%)</span>
                        <span>{activeAnalysis.journeyScoreFactors?.comfortEquipScore}%</span>
                      </div>
                    </div>
                    <div className="pt-2 text-[11px] text-gray-400 border-t border-white/5">
                      Label: <b className="text-white">Estimated journey suitability</b> (Transparent deterministic model)
                    </div>
                  </div>

                  {/* Card 2: AI Delay Predictor */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>AI Delay Predictor™</span>
                      </span>
                      <span className="text-xl font-bold font-mono text-cyan-300">
                        {activeAnalysis.delayPrediction?.estimatedDelayMin === 0 ? '0m Delay' : `+${activeAnalysis.delayPrediction?.estimatedDelayMin}m Delay`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      {activeAnalysis.delayPrediction?.factors?.join('. ') || 'Smooth nocturnal highway cruise.'}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/5 text-[11px] font-mono text-gray-400 space-y-1">
                      <div>Traffic Density: <b className="text-white">{activeAnalysis.delayPrediction?.trafficLevel || 'Low'}</b></div>
                      <div>Weather: <b className="text-white">{activeAnalysis.delayPrediction?.weatherStatus || 'Clear asphalt'}</b></div>
                      <div>Confidence: <b className="text-emerald-400">{activeAnalysis.delayPrediction?.confidencePct || 88}%</b></div>
                    </div>
                  </div>

                  {/* Card 3: Smart Seat Intelligence */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-[#E7CB58]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#E7CB58] flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Smart Seat Intelligence™</span>
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E7CB58]/20 text-[#E7CB58]">
                        Sleeper 2+1
                      </span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-white font-bold block">Berth L1A (Lower Window)</span>
                        <span className="text-[11px] text-gray-400">Positioned behind front axle for minimal motion nausea.</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-white font-bold block">Berth L3B (Lower Center)</span>
                        <span className="text-[11px] text-gray-400">Mid-wheelbase eliminates 42% of highway road vibration.</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/search?source=${selectedCorridor === 'cbe-blr' ? 'Coimbatore' : 'Bengaluru'}&destination=${selectedCorridor === 'cbe-blr' ? 'Bengaluru' : 'Chennai'}`}
                  className="px-5 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors flex items-center space-x-2"
                >
                  <span>Book Evaluated Coaches</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

