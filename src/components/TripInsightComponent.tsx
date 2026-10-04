import React, { useState } from 'react';
import { Sparkles, Package, CloudSun, Loader2, CheckSquare, Square, Plus, Thermometer, Clock, ShieldCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  packed: boolean;
}

interface TripInsightData {
  weatherForecast: {
    temp: string;
    condition: string;
    precipitation: string;
    advice: string;
  };
  tripDurationHours: string;
  checklist: ChecklistItem[];
}

export const TripInsightComponent: React.FC<{ schedule: any }> = ({ schedule }) => {
  const [insightData, setInsightData] = useState<TripInsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Clothing');

  const generateInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/trip-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: schedule.sourceCity,
          destination: schedule.destCity,
          departureTime: schedule.departureTime,
        }),
      });
      const data = await response.json();
      setInsightData(data);
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePacked = (id: string) => {
    if (!insightData) return;
    const updated = insightData.checklist.map(item =>
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    setInsightData({ ...insightData, checklist: updated });
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !insightData) return;
    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      category: newItemCategory,
      item: newItemText.trim(),
      packed: false,
    };
    setInsightData({
      ...insightData,
      checklist: [...insightData.checklist, newItem],
    });
    setNewItemText('');
  };

  const packedCount = insightData?.checklist?.filter(i => i.packed).length || 0;
  const totalCount = insightData?.checklist?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-[#16181F] border border-[#E7CB58]/30 rounded-3xl p-6 space-y-6 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2.5 text-[#E7CB58]">
          <div className="p-2 rounded-xl bg-[#E7CB58]/10 text-[#E7CB58]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">FlashTrip AI Insight & Dynamic Packing List™</h3>
            <p className="text-[11px] text-gray-400">Weather-adaptive checklist & transit duration intelligence</p>
          </div>
        </div>

        <button
          onClick={generateInsight}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          <span>{loading ? 'Analyzing...' : insightData ? 'Regenerate Briefing' : 'Get Weather & Packing List'}</span>
        </button>
      </div>

      {insightData && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Weather & Duration Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Weather Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <CloudSun className="w-4 h-4" />
                  <span>{schedule.destCity} Weather</span>
                </div>
                <span className="text-sm font-bold text-white flex items-center space-x-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{insightData.weatherForecast?.temp}</span>
                </span>
              </div>
              <div className="text-gray-300 font-mono text-[11px]">
                {insightData.weatherForecast?.condition} • <span className="text-amber-300">{insightData.weatherForecast?.precipitation}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed italic pt-1 border-t border-white/5">
                "{insightData.weatherForecast?.advice}"
              </p>
            </div>

            {/* Trip Duration Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-purple-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Estimated Transit Duration</span>
                </div>
                <span className="text-sm font-bold text-white">{insightData.tripDurationHours}</span>
              </div>
              <div className="text-gray-300 font-mono text-[11px]">
                Route: {schedule.sourceCity} ➔ {schedule.destCity}
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed pt-1 border-t border-white/5 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Includes rest stop buffer & expressway telemetry speed locks.</span>
              </p>
            </div>

          </div>

          {/* Dynamic Checklist Section */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                Interactive Packing Checklist ({packedCount}/{totalCount} Packed)
              </span>
              <div className="w-36 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#E7CB58] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {insightData.checklist?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePacked(item.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.packed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-400 line-through'
                      : 'bg-black/30 border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.packed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <span className="text-xs">{item.item}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Custom Packing Item Form */}
            <form onSubmit={addCustomItem} className="flex items-center space-x-2 pt-2">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#E7CB58]"
              >
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Documents">Documents</option>
                <option value="Comfort">Comfort</option>
              </select>

              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add custom packing item..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E7CB58]"
              />

              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E7CB58] text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

          </div>

        </div>
      )}
    </div>
  );
};
