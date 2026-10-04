import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Compass,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Target,
  BarChart2,
  Award,
  Download
} from 'lucide-react';

interface CompetitorData {
  id: string;
  name: string;
  brandColor: string;
  isSelf?: boolean;
  busType: string;
  avgFare: number;
  occupancyPct: number;
  activeTrips: number;
  rating: number;
  marketSharePct: number;
  pricingStrategy: 'PREMIUM_DYNAMIC' | 'AGGRESSIVE_DISCOUNT' | 'STATE_SUBSIDIZED' | 'FIXED_RACK_RATE';
}

interface CorridorCompetitorMarket {
  corridorId: string;
  corridorName: string;
  highwayCode: string;
  distanceKm: number;
  marketPositionScore: number; // 0 - 100
  marketPositionGrade: 'DOMINANT_LEADER' | 'COMPETITIVE_STRONG' | 'YIELD_OPPORTUNITY' | 'PRICE_VULNERABLE';
  marketPositionSummary: string;
  competitors: CompetitorData[];
  recommendedStrategy: {
    title: string;
    action: string;
    projectedRevenueImpact: string;
    suggestedFare: number;
  };
}

const CORRIDOR_MARKETS: CorridorCompetitorMarket[] = [
  {
    corridorId: 'cbe-blr',
    corridorName: 'Coimbatore ⇄ Bengaluru',
    highwayCode: 'NH544',
    distanceKm: 365,
    marketPositionScore: 92,
    marketPositionGrade: 'DOMINANT_LEADER',
    marketPositionSummary: 'FlashX holds the highest occupancy (94.2%) while commanding an 8% pricing premium over state transport, driven by superior on-time departure and live coach telemetry.',
    competitors: [
      {
        id: 'flashx',
        name: 'FlashX Express (Your Fleet)',
        brandColor: '#E7CB58',
        isSelf: true,
        busType: 'Volvo 9600 Multi-Axle Sleeper',
        avgFare: 1180,
        occupancyPct: 94.2,
        activeTrips: 22,
        rating: 4.88,
        marketSharePct: 36.4,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
      {
        id: 'ksrtc',
        name: 'KSRTC (Ambari Dream Class)',
        brandColor: '#EF4444',
        busType: 'Volvo B11R AC Sleeper',
        avgFare: 1040,
        occupancyPct: 88.5,
        activeTrips: 18,
        rating: 4.52,
        marketSharePct: 27.2,
        pricingStrategy: 'STATE_SUBSIDIZED',
      },
      {
        id: 'srs',
        name: 'SRS Travels',
        brandColor: '#3B82F6',
        busType: 'Scania Metrolink HD',
        avgFare: 1250,
        occupancyPct: 81.0,
        activeTrips: 12,
        rating: 4.25,
        marketSharePct: 18.5,
        pricingStrategy: 'FIXED_RACK_RATE',
      },
      {
        id: 'kpn',
        name: 'KPN Speed Travels',
        brandColor: '#10B981',
        busType: 'Ashok Leyland 225HP Sleeper',
        avgFare: 990,
        occupancyPct: 84.0,
        activeTrips: 10,
        rating: 4.15,
        marketSharePct: 12.1,
        pricingStrategy: 'AGGRESSIVE_DISCOUNT',
      },
      {
        id: 'orange',
        name: 'Orange Tours',
        brandColor: '#F97316',
        busType: 'Mercedes-Benz SHD',
        avgFare: 1310,
        occupancyPct: 76.5,
        activeTrips: 6,
        rating: 4.38,
        marketSharePct: 5.8,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
    ],
    recommendedStrategy: {
      title: 'Selective Surge Extraction on 21:00–23:00 Departures',
      action: 'Competitors have exhausted lower berths on night departures. Enact +₹75 surge pricing on remaining berths to capture ₹33,000 incremental margin without dampening conversion.',
      projectedRevenueImpact: '+₹33,000 / day (+6.4% net yield)',
      suggestedFare: 1255,
    },
  },
  {
    corridorId: 'blr-maa',
    corridorName: 'Bengaluru ⇄ Chennai',
    highwayCode: 'NH48',
    distanceKm: 348,
    marketPositionScore: 88,
    marketPositionGrade: 'COMPETITIVE_STRONG',
    marketPositionSummary: 'High volume corridor with aggressive price competition from state and private operators. FlashX retains top NPS and 91.8% load factor through fast e-toll clearance.',
    competitors: [
      {
        id: 'flashx',
        name: 'FlashX Express (Your Fleet)',
        brandColor: '#E7CB58',
        isSelf: true,
        busType: 'Volvo B11R 14.5m Sleeper',
        avgFare: 980,
        occupancyPct: 91.8,
        activeTrips: 26,
        rating: 4.85,
        marketSharePct: 32.0,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
      {
        id: 'ksrtc',
        name: 'KSRTC (Airavat Club Class)',
        brandColor: '#EF4444',
        busType: 'Volvo Multi-Axle Club Class',
        avgFare: 890,
        occupancyPct: 90.2,
        activeTrips: 24,
        rating: 4.58,
        marketSharePct: 30.5,
        pricingStrategy: 'STATE_SUBSIDIZED',
      },
      {
        id: 'setc',
        name: 'SETC Tamil Nadu',
        brandColor: '#8B5CF6',
        busType: 'Ultra Deluxe Non-AC / AC',
        avgFare: 620,
        occupancyPct: 92.0,
        activeTrips: 16,
        rating: 3.95,
        marketSharePct: 19.0,
        pricingStrategy: 'AGGRESSIVE_DISCOUNT',
      },
      {
        id: 'srs',
        name: 'SRS Travels',
        brandColor: '#3B82F6',
        busType: 'Scania 13.7m Sleeper',
        avgFare: 1050,
        occupancyPct: 83.5,
        activeTrips: 11,
        rating: 4.22,
        marketSharePct: 12.5,
        pricingStrategy: 'FIXED_RACK_RATE',
      },
      {
        id: 'jabbar',
        name: 'Jabbar Travels',
        brandColor: '#EC4899',
        busType: 'Mercedes-Benz Multi-Axle',
        avgFare: 1120,
        occupancyPct: 79.0,
        activeTrips: 6,
        rating: 4.30,
        marketSharePct: 6.0,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
    ],
    recommendedStrategy: {
      title: 'Premium Tiered Seat Pricing (Single Lower Berth Premium)',
      action: 'KSRTC has no single berths available for tonight. Reprice single lower berths to ₹1,120 while keeping double berths at ₹980 to capture business solo traveler surplus.',
      projectedRevenueImpact: '+₹24,500 / day (+4.8% net yield)',
      suggestedFare: 1040,
    },
  },
  {
    corridorId: 'hyd-blr',
    corridorName: 'Hyderabad ⇄ Bengaluru',
    highwayCode: 'NH44',
    distanceKm: 570,
    marketPositionScore: 84,
    marketPositionGrade: 'COMPETITIVE_STRONG',
    marketPositionSummary: 'Overnight trunk route with heavy sleeper reliance. Competitors are discounting early evening slots while late night departures sell at premium.',
    competitors: [
      {
        id: 'flashx',
        name: 'FlashX Express (Your Fleet)',
        brandColor: '#E7CB58',
        isSelf: true,
        busType: 'Scania Metrolink HD 14.5m',
        avgFare: 1420,
        occupancyPct: 89.4,
        activeTrips: 18,
        rating: 4.82,
        marketSharePct: 28.5,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
      {
        id: 'tsrtc',
        name: 'TSRTC (Lahari AC Sleeper)',
        brandColor: '#EF4444',
        busType: 'Volvo AC Sleeper',
        avgFare: 1280,
        occupancyPct: 91.5,
        activeTrips: 16,
        rating: 4.45,
        marketSharePct: 25.0,
        pricingStrategy: 'STATE_SUBSIDIZED',
      },
      {
        id: 'morningstar',
        name: 'Morning Star Travels',
        brandColor: '#F59E0B',
        busType: 'Mercedes-Benz Multi-Axle',
        avgFare: 1480,
        occupancyPct: 84.0,
        activeTrips: 12,
        rating: 4.40,
        marketSharePct: 20.0,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
      {
        id: 'orange',
        name: 'Orange Tours',
        brandColor: '#F97316',
        busType: 'Scania Metrolink',
        avgFare: 1520,
        occupancyPct: 82.5,
        activeTrips: 10,
        rating: 4.35,
        marketSharePct: 16.5,
        pricingStrategy: 'FIXED_RACK_RATE',
      },
      {
        id: 'vrl',
        name: 'VRL Logistics (Travels)',
        brandColor: '#10B981',
        busType: 'Isuzu Multi-Axle Sleeper',
        avgFare: 1350,
        occupancyPct: 86.0,
        activeTrips: 8,
        rating: 4.28,
        marketSharePct: 10.0,
        pricingStrategy: 'FIXED_RACK_RATE',
      },
    ],
    recommendedStrategy: {
      title: 'Dynamic Pre-Midnight Window Optimization',
      action: 'TSRTC has full capacity utilization for 22:00 departures. Adjust FlashX 22:30 departure from ₹1,420 to ₹1,490 to capture spillover demand without seat spoilage.',
      projectedRevenueImpact: '+₹29,000 / day (+5.2% net yield)',
      suggestedFare: 1490,
    },
  },
  {
    corridorId: 'kochi-blr',
    corridorName: 'Kochi ⇄ Bengaluru',
    highwayCode: 'NH544',
    distanceKm: 560,
    marketPositionScore: 79,
    marketPositionGrade: 'YIELD_OPPORTUNITY',
    marketPositionSummary: 'Monsoon weather conditions have elevated intercity bus demand by +26%. Competitors are experiencing high load factors; FlashX can optimize yield on Ghats transit sections.',
    competitors: [
      {
        id: 'flashx',
        name: 'FlashX Express (Your Fleet)',
        brandColor: '#E7CB58',
        isSelf: true,
        busType: 'Volvo 9400 B11R Sleeper',
        avgFare: 1360,
        occupancyPct: 92.4,
        activeTrips: 14,
        rating: 4.86,
        marketSharePct: 26.0,
        pricingStrategy: 'PREMIUM_DYNAMIC',
      },
      {
        id: 'keralartc',
        name: 'KSRTC SWIFT (Gajaraj Sleeper)',
        brandColor: '#EF4444',
        busType: 'Volvo B11R Sleeper',
        avgFare: 1220,
        occupancyPct: 95.0,
        activeTrips: 15,
        rating: 4.60,
        marketSharePct: 29.5,
        pricingStrategy: 'STATE_SUBSIDIZED',
      },
      {
        id: 'kallada',
        name: 'Suresh Kallada Travels',
        brandColor: '#3B82F6',
        busType: 'Scania Multi-Axle HD',
        avgFare: 1450,
        occupancyPct: 83.0,
        activeTrips: 10,
        rating: 4.10,
        marketSharePct: 21.0,
        pricingStrategy: 'FIXED_RACK_RATE',
      },
      {
        id: 'evacay',
        name: 'Evacay Bus',
        brandColor: '#10B981',
        busType: 'BharatBenz AC Sleeper',
        avgFare: 1290,
        occupancyPct: 87.5,
        activeTrips: 8,
        rating: 4.35,
        marketSharePct: 15.0,
        pricingStrategy: 'AGGRESSIVE_DISCOUNT',
      },
      {
        id: 'kalyani',
        name: 'Kalyani Travels',
        brandColor: '#A855F7',
        busType: 'Ashok Leyland AC',
        avgFare: 1180,
        occupancyPct: 80.0,
        activeTrips: 5,
        rating: 4.05,
        marketSharePct: 8.5,
        pricingStrategy: 'AGGRESSIVE_DISCOUNT',
      },
    ],
    recommendedStrategy: {
      title: 'Weather-Adjusted Monsoon Reliability Surge',
      action: 'Torrential rains along Palakkad gap have reduced two-wheeler / taxi transit. Position FlashX all-weather Volvo sleeper fleet at ₹1,440 with complimentary hot beverage service.',
      projectedRevenueImpact: '+₹21,800 / day (+4.5% net yield)',
      suggestedFare: 1440,
    },
  },
];

export const CompetitiveIntelligenceWidget: React.FC = () => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('cbe-blr');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastScrapedTime, setLastScrapedTime] = useState<string>('Just now');
  const [appliedStrategyMsg, setAppliedStrategyMsg] = useState<string | null>(null);
  const [adjustedFares, setAdjustedFares] = useState<Record<string, number>>({});

  const activeMarket = useMemo(() => {
    return CORRIDOR_MARKETS.find(m => m.corridorId === selectedCorridorId) || CORRIDOR_MARKETS[0];
  }, [selectedCorridorId]);

  const flashXData = useMemo(() => {
    return activeMarket.competitors.find(c => c.isSelf) || activeMarket.competitors[0];
  }, [activeMarket]);

  const competitorMedianFare = useMemo(() => {
    const others = activeMarket.competitors.filter(c => !c.isSelf);
    if (others.length === 0) return 1000;
    const total = others.reduce((sum, c) => sum + c.avgFare, 0);
    return Math.round(total / others.length);
  }, [activeMarket]);

  const competitorMedianOccupancy = useMemo(() => {
    const others = activeMarket.competitors.filter(c => !c.isSelf);
    if (others.length === 0) return 85;
    const total = others.reduce((sum, c) => sum + c.occupancyPct, 0);
    return Math.round((total / others.length) * 10) / 10;
  }, [activeMarket]);

  const currentFlashXFare = adjustedFares[activeMarket.corridorId] || flashXData.avgFare;

  const handleSimulateScrape = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      setLastScrapedTime(new Date().toLocaleTimeString());
      setAppliedStrategyMsg('OTA and aggregator APIs scraped successfully (redBus, AbhiBus, state RTC feeds). Dynamic Market Position recalculated.');
      setTimeout(() => setAppliedStrategyMsg(null), 4000);
    }, 1100);
  };

  const handleApplyPricingStrategy = (newFare: number) => {
    setAdjustedFares(prev => ({
      ...prev,
      [activeMarket.corridorId]: newFare,
    }));
    setAppliedStrategyMsg(`Dynamic pricing strategy applied! FlashX fare updated to ₹${newFare} on ${activeMarket.corridorName}. Inventory yield engine updated.`);
    setTimeout(() => setAppliedStrategyMsg(null), 4500);
  };

  const handleExportCompetitiveData = () => {
    let csv = `=== FLASHX COMPETITIVE INTELLIGENCE BENCHMARK ===\n`;
    csv += `Exported At: ${new Date().toISOString()}\n`;
    csv += `Corridor: ${activeMarket.corridorName} (${activeMarket.highwayCode})\n`;
    csv += `Market Position Score: ${activeMarket.marketPositionScore}/100 (${activeMarket.marketPositionGrade})\n\n`;
    csv += `Operator,Bus Type,Avg Fare (INR),Occupancy (%),Active Trips,Rating,Market Share (%),Pricing Strategy\n`;
    
    activeMarket.competitors.forEach(c => {
      const fare = c.isSelf ? currentFlashXFare : c.avgFare;
      csv += `"${c.name}","${c.busType}",${fare},${c.occupancyPct},${c.activeTrips},${c.rating},${c.marketSharePct},"${c.pricingStrategy}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `competitive_intelligence_${activeMarket.corridorId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header with Live Scrape Simulation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold shadow-lg shadow-amber-500/15">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Competitive Intelligence & Market Position Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#E7CB58] text-[10px] font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E7CB58] animate-ping" />
                <span>REAL-TIME OTA BENCHMARKING</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Tracks real-time competitor fares, occupancy rates, and market share across OTA channels to calculate dynamic Market Position scores.
            </p>
          </div>
        </div>

        {/* Live Scrape Action Buttons */}
        <div className="flex items-center space-x-2.5 font-mono text-xs">
          <button
            onClick={handleExportCompetitiveData}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center space-x-1.5"
            title="Export competitive benchmark data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#E7CB58]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleSimulateScrape}
            disabled={isScraping}
            className="px-4 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping OTA Feeds...' : 'Scrape Live Fares'}</span>
          </button>
        </div>
      </div>

      {/* Corridor Selector Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 font-mono text-xs">
        <span className="text-gray-400 text-[11px] px-2 uppercase">Corridor Market:</span>
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {CORRIDOR_MARKETS.map(market => (
            <button
              key={market.corridorId}
              onClick={() => setSelectedCorridorId(market.corridorId)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                selectedCorridorId === market.corridorId
                  ? 'bg-amber-500/20 text-[#E7CB58] border border-amber-500/40 font-bold shadow-md'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{market.corridorName}</span>
              <span className="text-[10px] opacity-70">({market.highwayCode})</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-400 px-2 flex items-center space-x-1">
          <span>Feed sync:</span>
          <strong className="text-white">{lastScrapedTime}</strong>
        </div>
      </div>

      {appliedStrategyMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{appliedStrategyMsg}</span>
        </div>
      )}

      {/* Market Position Score Banner & Telemetry KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        
        {/* Dynamic Market Position Score Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/15 via-[#13151D] to-black/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Dynamic Market Position Score</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              {activeMarket.marketPositionGrade.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <div className="text-5xl font-display font-bold text-white tracking-tight">
              {activeMarket.marketPositionScore}
              <span className="text-xl text-gray-500 font-mono font-normal">/100</span>
            </div>
            <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2 pts vs 7d avg</span>
            </div>
          </div>

          {/* Score Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-[#E7CB58] to-emerald-400 transition-all duration-700"
                style={{ width: `${activeMarket.marketPositionScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Price Vulnerable</span>
              <span>Competitive Strong</span>
              <span className="text-[#E7CB58] font-bold">Dominant Leader</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-sans leading-relaxed pt-1 border-t border-white/5">
            {activeMarket.marketPositionSummary}
          </p>
        </div>

        {/* Competitor Delta Metrics (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Price Premium Metric */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Avg Fare vs Market</span>
              <DollarSign className="w-4 h-4 text-[#E7CB58]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-display font-bold text-white">
                ₹{currentFlashXFare}
              </div>
              <div className="text-[11px] text-[#E7CB58] font-bold">
                {currentFlashXFare >= competitorMedianFare ? `+₹${currentFlashXFare - competitorMedianFare} (+${Math.round(((currentFlashXFare - competitorMedianFare) / competitorMedianFare) * 100)}%)` : `-₹${competitorMedianFare - currentFlashXFare}`}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
              Competitor Median: <strong className="text-white">₹{competitorMedianFare}</strong>
            </div>
          </div>

          {/* Occupancy Lead Metric */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Seat Occupancy Lead</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-display font-bold text-white">
                {flashXData.occupancyPct}%
              </div>
              <div className="text-[11px] text-emerald-400 font-bold">
                +{Math.round((flashXData.occupancyPct - competitorMedianOccupancy) * 10) / 10}% vs Rivals
              </div>
            </div>
            <div className="text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
              Rival Median: <strong className="text-white">{competitorMedianOccupancy}%</strong>
            </div>
          </div>

          {/* Market Share Dominance */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Corridor Market Share</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-display font-bold text-white">
                {flashXData.marketSharePct}%
              </div>
              <div className="text-[11px] text-cyan-400 font-bold">
                Rank #1 on Route
              </div>
            </div>
            <div className="text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
              Active Trips: <strong className="text-white">{flashXData.activeTrips} Daily</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Real-time Competitor Benchmark Table */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-[#E7CB58]" />
            <span>Live Competitor Pricing & Telemetry Matrix ({activeMarket.corridorName})</span>
          </h3>
          <span className="text-[10px] text-gray-400">Scraped across redBus, AbhiBus & direct channels</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Operator & Fleet</th>
                <th className="py-3 px-4">Coach Specification</th>
                <th className="py-3 px-4">Dynamic Avg Fare</th>
                <th className="py-3 px-4">Seat Occupancy</th>
                <th className="py-3 px-4">Active Trips</th>
                <th className="py-3 px-4">Passenger Rating</th>
                <th className="py-3 px-4">Market Share</th>
                <th className="py-3 px-4">Yield Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeMarket.competitors.map(competitor => {
                const isFlashX = competitor.isSelf;
                const fare = isFlashX ? currentFlashXFare : competitor.avgFare;
                return (
                  <tr
                    key={competitor.id}
                    className={`transition-colors ${
                      isFlashX
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 font-bold text-white'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center space-x-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: competitor.brandColor }}
                      />
                      <div>
                        <div className="font-display font-bold text-white flex items-center space-x-1.5">
                          <span>{competitor.name}</span>
                          {isFlashX && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 text-[11px]">
                      {competitor.busType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-sm font-bold ${isFlashX ? 'text-[#E7CB58]' : 'text-white'}`}>
                        ₹{fare}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{competitor.occupancyPct}%</span>
                        <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              competitor.occupancyPct >= 90
                                ? 'bg-emerald-400'
                                : competitor.occupancyPct >= 80
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                            }`}
                            style={{ width: `${competitor.occupancyPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {competitor.activeTrips} departures
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#E7CB58] font-bold">★ {competitor.rating}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {competitor.marketSharePct}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        competitor.pricingStrategy === 'PREMIUM_DYNAMIC'
                          ? 'bg-amber-500/20 text-[#E7CB58] border-amber-500/30'
                          : competitor.pricingStrategy === 'AGGRESSIVE_DISCOUNT'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : competitor.pricingStrategy === 'STATE_SUBSIDIZED'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-white/10 text-gray-300 border-white/15'
                      }`}>
                        {competitor.pricingStrategy.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Pricing Action Recommendation Card */}
      <div className="bg-gradient-to-r from-amber-500/15 via-[#1a1c25] to-black border border-amber-500/30 rounded-2xl p-5 space-y-3 font-mono shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center space-x-2 text-[#E7CB58] font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>AI Dynamic Pricing Recommendation for {activeMarket.corridorName}</span>
          </div>
          <span className="text-emerald-400 text-xs font-bold">
            Projected Impact: {activeMarket.recommendedStrategy.projectedRevenueImpact}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-1.5">
            <h4 className="text-sm font-display font-bold text-white">
              {activeMarket.recommendedStrategy.title}
            </h4>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {activeMarket.recommendedStrategy.action}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
            <button
              onClick={() => handleApplyPricingStrategy(activeMarket.recommendedStrategy.suggestedFare)}
              className="px-4 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Apply Recommended Fare (₹{activeMarket.recommendedStrategy.suggestedFare})</span>
            </button>
            <button
              onClick={() => handleApplyPricingStrategy(competitorMedianFare)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-all flex items-center justify-center space-x-1"
            >
              <span>Match Market Median (₹{competitorMedianFare})</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
