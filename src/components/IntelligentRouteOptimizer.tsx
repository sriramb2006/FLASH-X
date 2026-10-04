import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Sparkles, Zap, Shield, Compass, TrendingUp, Clock, RefreshCw } from 'lucide-react';

interface RouteOption {
  title: string;
  route: string;
  travelTime: string;
  cost: string;
  trafficPattern: string;
  recommendationReason: string;
}

interface IntelligentRouteOptimizerProps {
  sourceCity: string;
  destCity: string;
}

export const IntelligentRouteOptimizer: React.FC<IntelligentRouteOptimizerProps> = ({ sourceCity, destCity }) => {
  const [options, setOptions] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimizedRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.optimizeRoute(sourceCity, destCity);
      if (res.success && res.options) {
        setOptions(res.options);
      } else {
        setError('No smart alternative corridors found.');
      }
    } catch (err: any) {
      console.error(err);
      setError('FlashMind AI corridor scan timed out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizedRoutes();
  }, [sourceCity, destCity]);

  return (
    <div className="bg-[#16181F] border border-purple-500/25 rounded-2xl p-5 mb-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              FlashMind™ Intelligent Route Optimizer
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">
              Real-time multi-modal alternative travel corridor advisor
            </p>
          </div>
        </div>

        <button
          onClick={fetchOptimizedRoutes}
          disabled={loading}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Recalculate route optimizations"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-[11px] font-mono text-gray-400">Scanning satellite traffic matrices & multi-modal databases...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}

      {/* Result Cards */}
      {!loading && !error && options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((opt, idx) => {
            // Pick corresponding icon
            const Icon = idx === 0 ? Zap : idx === 1 ? TrendingUp : Compass;
            const badgeColor = idx === 0 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : idx === 1 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
              <div 
                key={idx} 
                className="bg-black/30 border border-white/5 hover:border-purple-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold uppercase tracking-wider ${badgeColor}`}>
                      {opt.title}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase">Optimized Corridor</span>
                    <span className="text-white text-xs font-semibold font-mono leading-tight block">
                      {opt.route}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-y border-white/5 py-1.5">
                    <div>
                      <span className="text-gray-500 text-[9px] block">EST. DURATION</span>
                      <span className="text-white font-bold">{opt.travelTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[9px] block">EST. FARE</span>
                      <span className="text-amber-400 font-bold">{opt.cost}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">Radar Congestion Status</span>
                    <span className="text-gray-300 text-[11px] leading-relaxed block font-mono">
                      {opt.trafficPattern}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 bg-purple-500/5 -mx-4 -mb-4 p-3 rounded-b-xl">
                  <p className="text-[10px] text-gray-300 italic leading-normal">
                    &ldquo;{opt.recommendationReason}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
