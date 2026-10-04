import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Flame,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  TrendingUp,
  Compass,
  AlertTriangle,
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Sliders,
  Maximize2,
  MapPin,
  Users,
  Calendar,
  Download,
  CloudRain,
  Sun,
  Thermometer,
  Crosshair,
  Target,
  History,
  GitCompare
} from 'lucide-react';
import { ProjectedDemandTrends, SEVEN_DAY_FORECAST, DailyProjection } from './ProjectedDemandTrends';
import { DemandMapLegend } from './DemandMapLegend';

interface CityHub {
  id: string;
  name: string;
  state: string;
  regionId: string;
  coordinates: [number, number]; // [lng, lat]
  demandScore: number; // 0 - 100
  dailyDemandPax: number;
  availableCapacityPax: number;
  activeCoaches: number;
  peakWindow: string;
  status: 'CRITICAL_SURGE' | 'HIGH_DEMAND' | 'OPTIMAL' | 'SURPLUS';
  recommendedAction: string;
}

interface CityWeather {
  tempC: number;
  condition: 'Heavy Rain' | 'Thunderstorm' | 'Sunny & Clear' | 'Monsoon Showers' | 'Overcast & Humid' | 'Moderate Rain';
  precipPct: number;
  demandImpactPct: number;
}

const CITY_WEATHER_MAP: Record<string, CityWeather> = {
  blr: { tempC: 28, condition: 'Monsoon Showers', precipPct: 78, demandImpactPct: 18 },
  maa: { tempC: 34, condition: 'Overcast & Humid', precipPct: 45, demandImpactPct: 10 },
  cbe: { tempC: 26, condition: 'Heavy Rain', precipPct: 88, demandImpactPct: 24 },
  hyd: { tempC: 32, condition: 'Sunny & Clear', precipPct: 10, demandImpactPct: 0 },
  mdr: { tempC: 35, condition: 'Sunny & Clear', precipPct: 15, demandImpactPct: 0 },
  tpt: { tempC: 30, condition: 'Moderate Rain', precipPct: 62, demandImpactPct: 14 },
  kochi: { tempC: 27, condition: 'Thunderstorm', precipPct: 95, demandImpactPct: 30 },
  slm: { tempC: 31, condition: 'Overcast & Humid', precipPct: 40, demandImpactPct: 8 },
  try: { tempC: 33, condition: 'Sunny & Clear', precipPct: 20, demandImpactPct: 2 },
  tvm: { tempC: 28, condition: 'Heavy Rain', precipPct: 90, demandImpactPct: 26 },
};

interface TravelCorridor {
  id: string;
  sourceId: string;
  destId: string;
  highwayCode: string;
  distanceKm: number;
  densityIndex: number; // 0 - 100
  paxDaily: number;
  coachesDeployed: number;
  loadFactorPct: number;
  deficitCoaches: number;
  surgeMultiplier: number;
  recommendedFleetAction: string;
}

interface TerritorialRegion {
  id: string;
  name: string;
  state: string;
  shortCode: string;
  centroid: [number, number]; // [lng, lat]
  polygon: [number, number][]; // boundary polygon
  baseDailyDemandPax: number;
  baseCapacityPax: number;
  baseActiveCoaches: number;
  peakWindow: string;
  keyHighways: string[];
  description: string;
  recommendedDirective: string;
}

interface MapTooltipData {
  type: 'CITY' | 'CORRIDOR' | 'REGION';
  title: string;
  subtitle: string;
  category: string;
  exactDemandPax: number;
  capacityPax: number;
  deficitPax?: number;
  activeBuses?: number;
  loadFactorPct?: number;
  peakWindow?: string;
  surgeStatus: string;
  surgeColor: string;
  surgeMultiplier?: number;
  recommendation?: string;
  keyRoutes?: string[];
  isProjectedMode?: boolean;
  forecastDayName?: string;
  forecastDeltaPct?: number;
  weatherCondition?: string;
  temperatureC?: number;
  precipitationPct?: number;
  weatherImpactPct?: number;
  compareMode?: 'OFF' | 'LAST_WEEK' | 'LAST_YEAR';
  historicalDemandPax?: number;
  growthDeltaPax?: number;
  growthDeltaPct?: number;
  x: number;
  y: number;
}

// Regional boundaries for South India mesh (simplified polygon for crisp high-performance D3 rendering)
const SOUTH_INDIA_OUTLINE: [number, number][] = [
  [74.0, 15.8], // Goa/North Karnataka border
  [74.5, 14.5], // Karwar
  [74.8, 13.3], // Udupi
  [75.0, 12.5], // Mangaluru
  [75.5, 11.5], // Kannur
  [75.8, 10.8], // Kozhikode
  [76.2, 9.9],  // Kochi
  [76.5, 9.0],  // Alappuzha/Kollam
  [77.0, 8.3],  // Thiruvananthapuram
  [77.5, 8.1],  // Kanyakumari (Southern tip)
  [78.0, 8.8],  // Tirunelveli/Tuticorin
  [78.8, 9.3],  // Rameswaram
  [79.8, 10.8], // Nagapattinam
  [80.0, 11.9], // Pondicherry
  [80.3, 13.1], // Chennai coast
  [80.3, 14.2], // Nellore
  [80.6, 15.8], // Ongole/Guntur
  [80.5, 16.5], // Vijayawada
  [79.2, 17.5], // Warangal
  [78.5, 17.4], // Hyderabad
  [77.5, 16.0], // Raichur
  [76.0, 15.5], // Ballari
  [75.0, 16.0], // Belagavi
  [74.0, 15.8], // Close polygon
];

// Defined Territorial Catchment Regions across South India
const TERRITORIAL_REGIONS: TerritorialRegion[] = [
  {
    id: 'reg-kongu',
    name: 'Kongu & Western Ghats Region',
    state: 'Tamil Nadu',
    shortCode: 'TN-WEST',
    centroid: [77.3, 11.2],
    polygon: [
      [76.4, 11.8],
      [78.2, 12.0],
      [78.6, 11.0],
      [77.6, 10.4],
      [76.5, 10.7],
    ],
    baseDailyDemandPax: 15400,
    baseCapacityPax: 13800,
    baseActiveCoaches: 330,
    peakWindow: '19:30 – 23:45 IST',
    keyHighways: ['NH544', 'NH81', 'NH47'],
    description: 'Textile, engineering, and manufacturing belt spanning Coimbatore, Tirupur, Erode, and Salem.',
    recommendedDirective: 'Transfer 4 surplus idle sleeper coaches from Salem terminal yard to Gandhipuram hub for peak weekend Bengaluru runs.',
  },
  {
    id: 'reg-blr-plateau',
    name: 'Bengaluru Capital & Mysore Plateau',
    state: 'Karnataka',
    shortCode: 'KA-SOUTH',
    centroid: [77.2, 12.8],
    polygon: [
      [75.8, 13.6],
      [78.4, 13.6],
      [78.5, 12.3],
      [76.4, 11.8],
      [75.6, 12.4],
    ],
    baseDailyDemandPax: 21200,
    baseCapacityPax: 17600,
    baseActiveCoaches: 435,
    peakWindow: '17:30 – 23:30 IST',
    keyHighways: ['NH48', 'NH44', 'NH275'],
    description: 'High-density tech metropolis & economic spine generating intense weekend intercity travel spikes.',
    recommendedDirective: 'Surge Deficit: Authorize 12 special supplemental night departures towards Coimbatore, Chennai, and Madurai.',
  },
  {
    id: 'reg-chennai-north',
    name: 'Chennai Megapolis & Northern Coast',
    state: 'Tamil Nadu & AP',
    shortCode: 'TN-NORTH',
    centroid: [79.8, 13.1],
    polygon: [
      [78.6, 13.9],
      [80.6, 14.1],
      [80.4, 12.4],
      [78.6, 12.4],
    ],
    baseDailyDemandPax: 18800,
    baseCapacityPax: 16200,
    baseActiveCoaches: 425,
    peakWindow: '18:00 – 23:00 IST',
    keyHighways: ['NH48', 'NH16', 'NH716'],
    description: 'Coastal financial capital, educational centers, and Tirupati pilgrim corridor.',
    recommendedDirective: 'Deploy 6 additional sleeper units from Koyambedu terminal to address 16% unmet passenger demand on southern trunk lines.',
  },
  {
    id: 'reg-central-delta',
    name: 'Central Plains & Southern Delta',
    state: 'Tamil Nadu',
    shortCode: 'TN-SOUTH',
    centroid: [78.4, 10.2],
    polygon: [
      [77.4, 10.6],
      [79.2, 11.0],
      [80.0, 9.8],
      [77.6, 8.8],
      [77.0, 9.6],
    ],
    baseDailyDemandPax: 13600,
    baseCapacityPax: 12200,
    baseActiveCoaches: 265,
    peakWindow: '21:00 – 01:00 IST',
    keyHighways: ['NH45', 'NH44', 'NH83'],
    description: 'Historic cultural centers and agricultural hubs centered around Madurai, Trichy, Dindigul, and Tirunelveli.',
    recommendedDirective: 'Shift 3 multi-axle units from day schedules to nocturnal express sleeper runs towards Chennai and Bengaluru.',
  },
  {
    id: 'reg-kerala-coast',
    name: 'Malabar & Central Kerala Belt',
    state: 'Kerala',
    shortCode: 'KL-COAST',
    centroid: [76.3, 10.3],
    polygon: [
      [75.4, 11.8],
      [76.6, 11.2],
      [76.9, 9.8],
      [76.2, 8.8],
      [75.8, 10.4],
    ],
    baseDailyDemandPax: 11400,
    baseCapacityPax: 10100,
    baseActiveCoaches: 215,
    peakWindow: '18:30 – 22:30 IST',
    keyHighways: ['NH66', 'NH544', 'NH85'],
    description: 'High-frequency coastal commerce spine spanning Kochi, Thrissur, Palakkad, and Kozhikode.',
    recommendedDirective: 'Capacity steady. Recommend converting 1 daytime semi-sleeper into full AC sleeper for interstate night travelers.',
  },
  {
    id: 'reg-hyderabad-deccan',
    name: 'Telangana Deccan Metropolitan',
    state: 'Telangana',
    shortCode: 'TG-DECCAN',
    centroid: [78.5, 17.2],
    polygon: [
      [77.4, 17.8],
      [79.6, 17.8],
      [79.4, 16.0],
      [77.4, 16.2],
    ],
    baseDailyDemandPax: 14500,
    baseCapacityPax: 12900,
    baseActiveCoaches: 260,
    peakWindow: '19:00 – 23:00 IST',
    keyHighways: ['NH44', 'NH65', 'NH163'],
    description: 'Deccan plateau industrial hub with major long-haul nocturnal volumes connecting Bengaluru and Chennai.',
    recommendedDirective: 'Deploy 4 premium luxury Volvo 9600s along NH44 to absorb high-yield corporate travelers.',
  },
];

// Rich data for major South Indian mobility hubs
const CITY_HUBS: CityHub[] = [
  {
    id: 'blr',
    name: 'Bengaluru',
    state: 'Karnataka',
    regionId: 'reg-blr-plateau',
    coordinates: [77.5946, 12.9716],
    demandScore: 98,
    dailyDemandPax: 14200,
    availableCapacityPax: 11800,
    activeCoaches: 340,
    peakWindow: '18:00 – 23:30 IST',
    status: 'CRITICAL_SURGE',
    recommendedAction: 'Surge Deficit: Inject 12 reserve Volvo multi-axle sleepers towards Coimbatore & Chennai corridors.',
  },
  {
    id: 'maa',
    name: 'Chennai',
    state: 'Tamil Nadu',
    regionId: 'reg-chennai-north',
    coordinates: [80.2707, 13.0827],
    demandScore: 94,
    dailyDemandPax: 12500,
    availableCapacityPax: 10900,
    activeCoaches: 295,
    peakWindow: '19:00 – 23:00 IST',
    status: 'CRITICAL_SURGE',
    recommendedAction: 'Deploy 6 additional night-run coaches towards Madurai & Trichy to curb 22% unmet Friday demand.',
  },
  {
    id: 'cbe',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    regionId: 'reg-kongu',
    coordinates: [76.9558, 11.0168],
    demandScore: 92,
    dailyDemandPax: 8900,
    availableCapacityPax: 7800,
    activeCoaches: 210,
    peakWindow: '20:30 – 23:45 IST',
    status: 'HIGH_DEMAND',
    recommendedAction: 'Reroute 4 empty returning coaches from Salem yard to fulfill Gandhipuram hub evening surge.',
  },
  {
    id: 'mdu',
    name: 'Madurai',
    state: 'Tamil Nadu',
    regionId: 'reg-central-delta',
    coordinates: [78.1198, 9.9252],
    demandScore: 86,
    dailyDemandPax: 6400,
    availableCapacityPax: 5900,
    activeCoaches: 155,
    peakWindow: '21:00 – 01:00 IST',
    status: 'HIGH_DEMAND',
    recommendedAction: 'Add 2 AC Sleeper special departures towards Bengaluru via Dindigul highway.',
  },
  {
    id: 'cok',
    name: 'Kochi',
    state: 'Kerala',
    regionId: 'reg-kerala-coast',
    coordinates: [76.2673, 9.9312],
    demandScore: 84,
    dailyDemandPax: 5800,
    availableCapacityPax: 5200,
    activeCoaches: 140,
    peakWindow: '18:30 – 22:00 IST',
    status: 'OPTIMAL',
    recommendedAction: 'Maintain current schedule; consider converting 1 seater into sleeper for weekend passenger load.',
  },
  {
    id: 'hyd',
    name: 'Hyderabad',
    state: 'Telangana',
    regionId: 'reg-hyderabad-deccan',
    coordinates: [78.4867, 17.3850],
    demandScore: 89,
    dailyDemandPax: 11000,
    availableCapacityPax: 9800,
    activeCoaches: 260,
    peakWindow: '19:30 – 23:00 IST',
    status: 'HIGH_DEMAND',
    recommendedAction: 'High nocturnal booking velocity along NH44 corridor; boost Bengaluru-bound sleeper capacity.',
  },
  {
    id: 'slm',
    name: 'Salem',
    state: 'Tamil Nadu',
    regionId: 'reg-kongu',
    coordinates: [78.1460, 11.6643],
    demandScore: 78,
    dailyDemandPax: 4100,
    availableCapacityPax: 4600,
    activeCoaches: 120,
    peakWindow: '22:00 – 02:00 IST',
    status: 'SURPLUS',
    recommendedAction: 'Yard capacity available: Re-assign 3 idling coaches to Coimbatore or Bengaluru origin points.',
  },
  {
    id: 'try',
    name: 'Trichy',
    state: 'Tamil Nadu',
    regionId: 'reg-central-delta',
    coordinates: [78.7047, 10.7905],
    demandScore: 82,
    dailyDemandPax: 4800,
    availableCapacityPax: 4400,
    activeCoaches: 110,
    peakWindow: '21:30 – 01:00 IST',
    status: 'OPTIMAL',
    recommendedAction: 'Optimal load factor. Buffer capacity ready for weekend festival departures.',
  },
  {
    id: 'mys',
    name: 'Mysuru',
    state: 'Karnataka',
    regionId: 'reg-blr-plateau',
    coordinates: [76.6394, 12.2958],
    demandScore: 75,
    dailyDemandPax: 3600,
    availableCapacityPax: 3900,
    activeCoaches: 95,
    peakWindow: '17:00 – 20:30 IST',
    status: 'OPTIMAL',
    recommendedAction: 'Daytime express services performing at 84% occupancy. Night sleeper demand steady.',
  },
  {
    id: 'tpt',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    regionId: 'reg-chennai-north',
    coordinates: [79.4192, 13.6288],
    demandScore: 85,
    dailyDemandPax: 5200,
    availableCapacityPax: 4700,
    activeCoaches: 130,
    peakWindow: '05:00 – 08:30 IST & 18:00 – 21:00 IST',
    status: 'HIGH_DEMAND',
    recommendedAction: 'Pilgrim influx surge: Deploy morning express multi-axle coaches from Bengaluru and Chennai.',
  },
];

// Major Highway Corridors connecting hubs
const TRAVEL_CORRIDORS: TravelCorridor[] = [
  {
    id: 'cbe-blr',
    sourceId: 'cbe',
    destId: 'blr',
    highwayCode: 'NH544',
    distanceKm: 365,
    densityIndex: 96,
    paxDaily: 4850,
    coachesDeployed: 62,
    loadFactorPct: 94.2,
    deficitCoaches: 6,
    surgeMultiplier: 1.25,
    recommendedFleetAction: 'High passenger spillover. Dispatch 4 supplemental sleeper coaches for 21:45 & 22:30 slots.',
  },
  {
    id: 'blr-maa',
    sourceId: 'blr',
    destId: 'maa',
    highwayCode: 'NH48',
    distanceKm: 348,
    densityIndex: 93,
    paxDaily: 5120,
    coachesDeployed: 70,
    loadFactorPct: 91.8,
    deficitCoaches: 5,
    surgeMultiplier: 1.2,
    recommendedFleetAction: 'Tech corridor surge. Deploy high-capacity electric hyperliners for 18:00 – 20:00 departures.',
  },
  {
    id: 'maa-mdu',
    sourceId: 'maa',
    destId: 'mdu',
    highwayCode: 'NH45',
    distanceKm: 462,
    densityIndex: 88,
    paxDaily: 3400,
    coachesDeployed: 48,
    loadFactorPct: 89.5,
    deficitCoaches: 3,
    surgeMultiplier: 1.15,
    recommendedFleetAction: 'High demand for lower sleeper berths. Shift 2 multi-axle coaches from day to night schedule.',
  },
  {
    id: 'cbe-cok',
    sourceId: 'cbe',
    destId: 'cok',
    highwayCode: 'NH544',
    distanceKm: 190,
    densityIndex: 82,
    paxDaily: 2200,
    coachesDeployed: 34,
    loadFactorPct: 84.6,
    deficitCoaches: 1,
    surgeMultiplier: 1.05,
    recommendedFleetAction: 'Steady cross-border commerce flow. Introduce 1 late afternoon express coach.',
  },
  {
    id: 'blr-hyd',
    sourceId: 'blr',
    destId: 'hyd',
    highwayCode: 'NH44',
    distanceKm: 570,
    densityIndex: 89,
    paxDaily: 3950,
    coachesDeployed: 54,
    loadFactorPct: 90.4,
    deficitCoaches: 4,
    surgeMultiplier: 1.22,
    recommendedFleetAction: 'Long-haul overnight corridor operating near ceiling. Deploy premium 2+1 AC sleepers.',
  },
  {
    id: 'blr-mys',
    sourceId: 'blr',
    destId: 'mys',
    highwayCode: 'NH275',
    distanceKm: 145,
    densityIndex: 76,
    paxDaily: 3100,
    coachesDeployed: 42,
    loadFactorPct: 79.2,
    deficitCoaches: 0,
    surgeMultiplier: 1.0,
    recommendedFleetAction: 'Capacity balanced. Maintain 30-minute interval shuttle fleet frequency.',
  },
  {
    id: 'slm-cbe',
    sourceId: 'slm',
    destId: 'cbe',
    highwayCode: 'NH544',
    distanceKm: 168,
    densityIndex: 80,
    paxDaily: 2400,
    coachesDeployed: 36,
    loadFactorPct: 82.0,
    deficitCoaches: 1,
    surgeMultiplier: 1.05,
    recommendedFleetAction: 'Feeder corridor. Reposition vacant berths to cater to through-passengers.',
  },
  {
    id: 'maa-try',
    sourceId: 'maa',
    destId: 'try',
    highwayCode: 'NH45',
    distanceKm: 330,
    densityIndex: 85,
    paxDaily: 2900,
    coachesDeployed: 40,
    loadFactorPct: 86.5,
    deficitCoaches: 2,
    surgeMultiplier: 1.12,
    recommendedFleetAction: 'Delta corridor surge. Additional departures needed for educational and business travel.',
  },
  {
    id: 'blr-tpt',
    sourceId: 'blr',
    destId: 'tpt',
    highwayCode: 'NH69',
    distanceKm: 250,
    densityIndex: 84,
    paxDaily: 2800,
    coachesDeployed: 38,
    loadFactorPct: 87.2,
    deficitCoaches: 2,
    surgeMultiplier: 1.15,
    recommendedFleetAction: 'Weekend pilgrim peak. Add early morning 05:00 express departures.',
  },
];

export const DemandHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Top 3 High Priority Hotspot Focus state
  const [autoHighlightTop3, setAutoHighlightTop3] = useState<boolean>(true);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);

  // Flow Simulation (Animated particle flow) state
  const [flowSimulationEnabled, setFlowSimulationEnabled] = useState<boolean>(true);
  const [flowSpeedMultiplier, setFlowSpeedMultiplier] = useState<'1x' | '1.5x' | '2x'>('1.5x');

  // Historical Demand Comparison Overlay ('OFF' | 'LAST_WEEK' | 'LAST_YEAR')
  const [compareMode, setCompareMode] = useState<'OFF' | 'LAST_WEEK' | 'LAST_YEAR'>('OFF');

  // Filter and simulation states
  const [selectedScenario, setSelectedScenario] = useState<'FRIDAY_PEAK' | 'WEEKDAY' | 'SUNDAY_RETURN' | 'FESTIVAL_SURGE'>('FRIDAY_PEAK');
  const [timeWindow, setTimeWindow] = useState<'NIGHT' | 'EVENING' | 'MORNING' | 'ALL_DAY'>('EVENING');
  const [activeLayer, setActiveLayer] = useState<'HEATMAP' | 'FLOW_PRESSURE' | 'DEFICIT_SURGE' | 'ALL'>('ALL');
  const [showProjectedTrends, setShowProjectedTrends] = useState<boolean>(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // Default to Day 2 (Friday Exodus Peak)
  const [appliedDirectives, setAppliedDirectives] = useState<number[]>([]);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(false);

  const [selectedEntity, setSelectedEntity] = useState<{ type: 'CITY' | 'CORRIDOR' | 'REGION'; data: any } | null>({
    type: 'CORRIDOR',
    data: TRAVEL_CORRIDORS[0],
  });
  const [hoveredTooltip, setHoveredTooltip] = useState<MapTooltipData | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Active simulated forecast day
  const activeForecastDay = useMemo(() => {
    return SEVEN_DAY_FORECAST[selectedDayIndex] || SEVEN_DAY_FORECAST[0];
  }, [selectedDayIndex]);

  // Dynamic factor multiplier based on scenario
  const scenarioMultiplier = useMemo(() => {
    switch (selectedScenario) {
      case 'FRIDAY_PEAK': return 1.25;
      case 'FESTIVAL_SURGE': return 1.45;
      case 'SUNDAY_RETURN': return 1.2;
      case 'WEEKDAY': return 0.95;
      default: return 1.0;
    }
  }, [selectedScenario]);

  // Dynamic factor based on time window
  const timeWindowMultiplier = useMemo(() => {
    switch (timeWindow) {
      case 'EVENING': return 1.2;
      case 'NIGHT': return 1.28;
      case 'MORNING': return 0.9;
      case 'ALL_DAY': return 1.0;
      default: return 1.0;
    }
  }, [timeWindow]);

  // Effective multiplier adapts whether live snapshot or projected 7-day forecast mode is active
  const effectiveMultiplier = useMemo(() => {
    if (showProjectedTrends) {
      return activeForecastDay.surgeMultiplier;
    }
    return scenarioMultiplier;
  }, [showProjectedTrends, activeForecastDay, scenarioMultiplier]);

  // Computed territorial regions with scenario factors
  const computedRegions = useMemo(() => {
    return TERRITORIAL_REGIONS.map(reg => {
      const adjustedDemand = Math.round(reg.baseDailyDemandPax * effectiveMultiplier * timeWindowMultiplier);
      const adjustedCapacity = Math.round(reg.baseCapacityPax * (0.95 + effectiveMultiplier * 0.05));
      const loadFactor = Math.min(99.6, Math.round((adjustedDemand / adjustedCapacity) * 88 * 10) / 10);
      const adjustedCoaches = Math.round(reg.baseActiveCoaches * (1 + (effectiveMultiplier - 1) * 0.3));
      const status: 'CRITICAL_SURGE' | 'HIGH_DEMAND' | 'OPTIMAL' | 'SURPLUS' =
        loadFactor >= 92 ? 'CRITICAL_SURGE' : loadFactor >= 82 ? 'HIGH_DEMAND' : loadFactor >= 74 ? 'OPTIMAL' : 'SURPLUS';

      return {
        ...reg,
        dailyDemandPax: adjustedDemand,
        capacityPax: adjustedCapacity,
        activeCoaches: adjustedCoaches,
        loadFactorPct: loadFactor,
        status,
      };
    });
  }, [effectiveMultiplier, timeWindowMultiplier]);

  // Computed hubs with scenario factors
  const computedHubs = useMemo(() => {
    return CITY_HUBS.map(hub => {
      const adjustedDemand = Math.min(100, Math.round(hub.demandScore * (effectiveMultiplier * 0.5 + timeWindowMultiplier * 0.5)));
      const adjustedPax = Math.round(hub.dailyDemandPax * effectiveMultiplier * timeWindowMultiplier);
      
      return {
        ...hub,
        demandScore: adjustedDemand,
        dailyDemandPax: adjustedPax,
        status: adjustedDemand >= 92 ? 'CRITICAL_SURGE' : adjustedDemand >= 82 ? 'HIGH_DEMAND' : adjustedDemand >= 75 ? 'OPTIMAL' : 'SURPLUS',
      };
    });
  }, [effectiveMultiplier, timeWindowMultiplier]);

  // Automatically computed Top 3 High-Priority Demand Hotspots
  const top3Hotspots = useMemo(() => {
    return [...computedHubs]
      .sort((a, b) => {
        if (b.demandScore !== a.demandScore) return b.demandScore - a.demandScore;
        return b.dailyDemandPax - a.dailyDemandPax;
      })
      .slice(0, 3);
  }, [computedHubs]);

  // Computed corridors with scenario factors
  const computedCorridors = useMemo(() => {
    return TRAVEL_CORRIDORS.map(c => {
      const adjustedDensity = Math.min(100, Math.round(c.densityIndex * (effectiveMultiplier * 0.5 + timeWindowMultiplier * 0.5)));
      const adjustedPax = Math.round(c.paxDaily * effectiveMultiplier * timeWindowMultiplier);
      const loadFactor = Math.min(99.4, Math.round(c.loadFactorPct * (effectiveMultiplier * 0.4 + timeWindowMultiplier * 0.6) * 10) / 10);
      const deficit = Math.max(0, Math.round((adjustedPax - (c.coachesDeployed * 40)) / 40));

      return {
        ...c,
        densityIndex: adjustedDensity,
        paxDaily: adjustedPax,
        loadFactorPct: loadFactor,
        deficitCoaches: deficit,
        surgeMultiplier: Math.round(c.surgeMultiplier * effectiveMultiplier * 100) / 100,
      };
    });
  }, [effectiveMultiplier, timeWindowMultiplier]);

  // Total passenger transit volume across corridors for flow simulation
  const totalSimulatedTransitPax = useMemo(() => {
    return computedCorridors.reduce((sum, c) => sum + c.paxDaily, 0);
  }, [computedCorridors]);

  // Helper for Hub Historical Baseline Computation
  const getHubHistoricalData = (hubId: string, currentPax: number, mode: 'LAST_WEEK' | 'LAST_YEAR') => {
    const wowFactors: Record<string, number> = {
      cbe: 0.89, blr: 0.92, maa: 0.93, hyd: 0.94, kochi: 0.88, mdr: 0.92, slm: 0.95, try: 0.93, mys: 0.94, tpt: 0.90
    };
    const yoyFactors: Record<string, number> = {
      cbe: 0.74, blr: 0.78, maa: 0.82, hyd: 0.80, kochi: 0.72, mdr: 0.81, slm: 0.85, try: 0.82, mys: 0.84, tpt: 0.75
    };

    const factor = mode === 'LAST_WEEK' ? (wowFactors[hubId] || 0.92) : (yoyFactors[hubId] || 0.78);
    const historicalPax = Math.round(currentPax * factor);
    const deltaPax = currentPax - historicalPax;
    const deltaPct = Math.round(((currentPax - historicalPax) / historicalPax) * 1000) / 10;

    return { historicalPax, deltaPax, deltaPct };
  };

  // Helper for Corridor Historical Baseline Computation
  const getCorridorHistoricalData = (corridorId: string, currentPax: number, mode: 'LAST_WEEK' | 'LAST_YEAR') => {
    const wowFactor = 0.91;
    const yoyFactor = 0.76;
    const factor = mode === 'LAST_WEEK' ? wowFactor : yoyFactor;
    const historicalPax = Math.round(currentPax * factor);
    const deltaPax = currentPax - historicalPax;
    const deltaPct = Math.round(((currentPax - historicalPax) / historicalPax) * 1000) / 10;

    return { historicalPax, deltaPax, deltaPct };
  };

  // Aggregate Comparative Telemetry Metrics
  const comparativeSummary = useMemo(() => {
    if (compareMode === 'OFF') return null;
    const label = compareMode === 'LAST_WEEK' ? 'Same Day Last Week (-7d Baseline)' : 'Same Day Last Year (-365d YoY Baseline)';
    const currentTotal = computedHubs.reduce((sum, h) => sum + h.dailyDemandPax, 0);
    const historicalTotal = computedHubs.reduce((sum, h) => {
      const { historicalPax } = getHubHistoricalData(h.id, h.dailyDemandPax, compareMode);
      return sum + historicalPax;
    }, 0);
    const deltaPax = currentTotal - historicalTotal;
    const deltaPct = Math.round((deltaPax / historicalTotal) * 1000) / 10;

    return {
      label,
      currentTotal,
      historicalTotal,
      deltaPax,
      deltaPct,
      fastestHub: compareMode === 'LAST_WEEK' ? 'Coimbatore Hub (+12.4% WoW)' : 'Coimbatore & Western Ghats (+35.1% YoY)',
      topCorridor: compareMode === 'LAST_WEEK' ? 'Coimbatore ⇄ Bengaluru (+9.9% WoW)' : 'Coimbatore ⇄ Bengaluru (+32.4% YoY)',
      insight: compareMode === 'LAST_WEEK'
        ? 'Short-term demand acceleration (+8.9% WoW) driven by Friday IT corridor evening exodus and early weekend departures.'
        : 'Structural YoY passenger expansion (+28.2% YoY) reflects successful fleet transition to multi-axle luxury sleepers on trunk corridors.'
    };
  }, [compareMode, computedHubs]);

  // Intensity Filter state for Interactive Legend
  const [intensityFilter, setIntensityFilter] = useState<'ALL' | 'NORMAL' | 'OPTIMAL' | 'HIGH' | 'CRITICAL'>('ALL');

  const filteredRegions = useMemo(() => {
    if (intensityFilter === 'ALL') return computedRegions;
    return computedRegions.filter(r => {
      if (intensityFilter === 'CRITICAL') return r.loadFactorPct >= 92;
      if (intensityFilter === 'HIGH') return r.loadFactorPct >= 85 && r.loadFactorPct < 92;
      if (intensityFilter === 'OPTIMAL') return r.loadFactorPct >= 75 && r.loadFactorPct < 85;
      if (intensityFilter === 'NORMAL') return r.loadFactorPct < 75;
      return true;
    });
  }, [computedRegions, intensityFilter]);

  const filteredHubs = useMemo(() => {
    if (intensityFilter === 'ALL') return computedHubs;
    return computedHubs.filter(h => {
      const load = Math.min(99.6, Math.round((h.dailyDemandPax / h.availableCapacityPax) * 92));
      if (intensityFilter === 'CRITICAL') return load >= 92 || h.status === 'CRITICAL_SURGE';
      if (intensityFilter === 'HIGH') return (load >= 85 && load < 92) || h.status === 'HIGH_DEMAND';
      if (intensityFilter === 'OPTIMAL') return (load >= 75 && load < 85) || h.status === 'OPTIMAL';
      if (intensityFilter === 'NORMAL') return load < 75 || h.status === 'SURPLUS';
      return true;
    });
  }, [computedHubs, intensityFilter]);

  const filteredCorridors = useMemo(() => {
    if (intensityFilter === 'ALL') return computedCorridors;
    return computedCorridors.filter(c => {
      if (intensityFilter === 'CRITICAL') return c.loadFactorPct >= 92;
      if (intensityFilter === 'HIGH') return c.loadFactorPct >= 85 && c.loadFactorPct < 92;
      if (intensityFilter === 'OPTIMAL') return c.loadFactorPct >= 75 && c.loadFactorPct < 85;
      if (intensityFilter === 'NORMAL') return c.loadFactorPct < 75;
      return true;
    });
  }, [computedCorridors, intensityFilter]);

  const legendCounts = useMemo(() => {
    let normal = 0, optimal = 0, high = 0, critical = 0;
    computedRegions.forEach(r => {
      if (r.loadFactorPct >= 92) critical++;
      else if (r.loadFactorPct >= 85) high++;
      else if (r.loadFactorPct >= 75) optimal++;
      else normal++;
    });
    computedHubs.forEach(h => {
      const load = Math.min(99.6, Math.round((h.dailyDemandPax / h.availableCapacityPax) * 92));
      if (load >= 92) critical++;
      else if (load >= 85) high++;
      else if (load >= 75) optimal++;
      else normal++;
    });
    computedCorridors.forEach(c => {
      if (c.loadFactorPct >= 92) critical++;
      else if (c.loadFactorPct >= 85) high++;
      else if (c.loadFactorPct >= 75) optimal++;
      else normal++;
    });
    return {
      normal,
      optimal,
      high,
      critical,
      total: computedRegions.length + computedHubs.length + computedCorridors.length,
    };
  }, [computedRegions, computedHubs, computedCorridors]);

  // Helper map for quick coordinates lookup
  const hubCoordsMap = useMemo(() => {
    const map = new Map<string, [number, number]>();
    computedHubs.forEach(h => map.set(h.id, h.coordinates));
    return map;
  }, [computedHubs]);

  // D3 Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean slate

    const width = 800;
    const height = 650;

    // Define Mercator Projection calibrated specifically to South India
    const projection = d3.geoMercator()
      .center([78.0, 13.0]) // Centered over Tamil Nadu/Karnataka/AP highway crossroad
      .scale(3200)
      .translate([width / 2, height / 2]);

    // Root zoom container
    const g = svg.append('g').attr('class', 'main-zoom-group');

    // Setup D3 Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 4.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Add SVG Gradients & Filters
    const defs = svg.append('defs');

    // Heat Glow Filter (Gaussian blur for realistic radiant thermal map)
    const glowFilter = defs.append('filter')
      .attr('id', 'heat-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '14')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Intense Surge Core Filter
    const surgeFilter = defs.append('filter')
      .attr('id', 'surge-core')
      .attr('x', '-80%')
      .attr('y', '-80%')
      .attr('width', '260%')
      .attr('height', '260%');
    surgeFilter.append('feGaussianBlur')
      .attr('stdDeviation', '22')
      .attr('result', 'blur');
    const surgeMerge = surgeFilter.append('feMerge');
    surgeMerge.append('feMergeNode').attr('in', 'blur');
    surgeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Particle Flow Glow Filter
    const particleGlow = defs.append('filter')
      .attr('id', 'particle-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    particleGlow.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'blur');
    const particleMerge = particleGlow.append('feMerge');
    particleMerge.append('feMergeNode').attr('in', 'blur');
    particleMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial Gradients for Heatmap Kernels
    const heatGradients = [
      { id: 'grad-critical', core: '#EF4444', outer: 'rgba(239, 68, 68, 0)' },
      { id: 'grad-high', core: '#F59E0B', outer: 'rgba(245, 158, 11, 0)' },
      { id: 'grad-optimal', core: '#06B6D4', outer: 'rgba(6, 182, 212, 0)' },
      { id: 'grad-surplus', core: '#10B981', outer: 'rgba(16, 185, 129, 0)' },
    ];

    heatGradients.forEach(hg => {
      const rad = defs.append('radialGradient')
        .attr('id', hg.id)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      rad.append('stop').attr('offset', '0%').attr('stop-color', hg.core).attr('stop-opacity', 0.85);
      rad.append('stop').attr('offset', '45%').attr('stop-color', hg.core).attr('stop-opacity', 0.35);
      rad.append('stop').attr('offset', '100%').attr('stop-color', hg.outer).attr('stop-opacity', 0);
    });

    // Highway Corridor Stroke Gradients
    const corridorGrad = defs.append('linearGradient')
      .attr('id', 'corridor-flow')
      .attr('gradientUnits', 'userSpaceOnUse');
    corridorGrad.append('stop').attr('offset', '0%').attr('stop-color', '#E7CB58');
    corridorGrad.append('stop').attr('offset', '50%').attr('stop-color', '#EF4444');
    corridorGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06B6D4');

    // Tooltip position helper
    const handleMapPointerMove = (event: MouseEvent, tooltipData: Omit<MapTooltipData, 'x' | 'y'>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = event.clientX - rect.left;
      const rawY = event.clientY - rect.top;
      // Clamp coordinates to stay completely visible inside the card
      const x = Math.max(140, Math.min(rect.width - 140, rawX));
      const y = Math.max(60, Math.min(rect.height - 30, rawY));
      setHoveredTooltip({
        ...tooltipData,
        isProjectedMode: showProjectedTrends,
        forecastDayName: showProjectedTrends ? activeForecastDay.dayName : undefined,
        forecastDeltaPct: showProjectedTrends ? Math.round((activeForecastDay.surgeMultiplier - 1) * 100) : undefined,
        x,
        y,
      });
    };

    // 1. Futuristic Lat/Lng Geographic Grid Lines
    const gridLinesGroup = g.append('g').attr('class', 'geo-grid-lines').attr('opacity', 0.15);
    for (let lng = 74; lng <= 81; lng += 1) {
      const p1 = projection([lng, 8.0]) || [0, 0];
      const p2 = projection([lng, 18.0]) || [0, 0];
      gridLinesGroup.append('line')
        .attr('x1', p1[0]).attr('y1', p1[1])
        .attr('x2', p2[0]).attr('y2', p2[1])
        .attr('stroke', '#E7CB58')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', '2,6');
    }
    for (let lat = 8; lat <= 18; lat += 1) {
      const p1 = projection([73.5, lat]) || [0, 0];
      const p2 = projection([81.5, lat]) || [0, 0];
      gridLinesGroup.append('line')
        .attr('x1', p1[0]).attr('y1', p1[1])
        .attr('x2', p2[0]).attr('y2', p2[1])
        .attr('stroke', '#06B6D4')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', '2,6');
    }

    // 2. Regional Landmass Boundary
    const projectedOutline: [number, number][] = SOUTH_INDIA_OUTLINE.map(coord => {
      const p = projection(coord);
      return p ? [p[0], p[1]] : [0, 0];
    });
    const lineGen = d3.line<[number, number]>().curve(d3.curveCardinalClosed.tension(0.4));
    
    g.append('path')
      .attr('d', lineGen(projectedOutline) || '')
      .attr('fill', '#12141C')
      .attr('stroke', '#282F3F')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '6,3');

    // 2B. INTERACTIVE TERRITORIAL REGION CATCHMENT SECTORS
    const territoryGroup = g.append('g').attr('class', 'territories-layer');

    filteredRegions.forEach(reg => {
      const projCoords: [number, number][] = reg.polygon.map(coord => {
        const p = projection(coord);
        return p ? [p[0], p[1]] : [0, 0];
      });

      const polyPath = d3.line<[number, number]>().curve(d3.curveCardinalClosed.tension(0.45))(projCoords);
      if (!polyPath) return;

      const surgeColor = reg.status === 'CRITICAL_SURGE'
        ? '#EF4444'
        : reg.status === 'HIGH_DEMAND'
        ? '#F59E0B'
        : '#06B6D4';

      const regionSector = territoryGroup.append('path')
        .attr('d', polyPath)
        .attr('fill', surgeColor)
        .attr('fill-opacity', 0.07)
        .attr('stroke', surgeColor)
        .attr('stroke-opacity', 0.25)
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4')
        .attr('class', 'cursor-pointer transition-all duration-150');

      // Region label at centroid
      const centroidPt = projection(reg.centroid);
      if (centroidPt) {
        territoryGroup.append('text')
          .attr('x', centroidPt[0])
          .attr('y', centroidPt[1] - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', '#6B7280')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .attr('letter-spacing', '0.05em')
          .attr('class', 'pointer-events-none select-none')
          .text(reg.shortCode);
      }

      // Hover interactions on regional territory
      regionSector
        .on('mouseenter', function (event: MouseEvent) {
          d3.select(this)
            .attr('fill-opacity', 0.2)
            .attr('stroke-opacity', 0.8)
            .attr('stroke-width', 2);

          handleMapPointerMove(event, {
            type: 'REGION',
            title: reg.name,
            subtitle: `${reg.state} Territorial Catchment Zone`,
            category: 'Regional Catchment Demand',
            exactDemandPax: reg.dailyDemandPax,
            capacityPax: reg.capacityPax,
            deficitPax: Math.max(0, reg.dailyDemandPax - reg.capacityPax),
            activeBuses: reg.activeCoaches,
            loadFactorPct: reg.loadFactorPct,
            peakWindow: reg.peakWindow,
            surgeStatus: reg.status,
            surgeColor: surgeColor,
            keyRoutes: reg.keyHighways,
            recommendation: reg.description,
          });
        })
        .on('mousemove', function (event: MouseEvent) {
          handleMapPointerMove(event, {
            type: 'REGION',
            title: reg.name,
            subtitle: `${reg.state} Territorial Catchment Zone`,
            category: 'Regional Catchment Demand',
            exactDemandPax: reg.dailyDemandPax,
            capacityPax: reg.capacityPax,
            deficitPax: Math.max(0, reg.dailyDemandPax - reg.capacityPax),
            activeBuses: reg.activeCoaches,
            loadFactorPct: reg.loadFactorPct,
            peakWindow: reg.peakWindow,
            surgeStatus: reg.status,
            surgeColor: surgeColor,
            keyRoutes: reg.keyHighways,
            recommendation: reg.description,
          });
        })
        .on('mouseleave', function () {
          d3.select(this)
            .attr('fill-opacity', 0.07)
            .attr('stroke-opacity', 0.25)
            .attr('stroke-width', 1.2);
          setHoveredTooltip(null);
        })
        .on('click', () => {
          setSelectedEntity({ type: 'REGION', data: reg });
        });
    });

    // Secondary subtle state boundary division lines
    const stateBorders: [number, number][][] = [
      [[74.5, 12.0], [77.0, 11.5], [77.3, 10.5], [77.0, 8.3]], // Kerala border
      [[77.5, 12.8], [78.2, 12.5], [79.8, 13.0]], // TN/Karnataka/AP border
      [[77.5, 13.8], [78.5, 15.0], [80.0, 14.5]], // AP border
    ];

    stateBorders.forEach(sb => {
      const proj: [number, number][] = sb.map(c => {
        const p = projection(c);
        return p ? [p[0], p[1]] : [0, 0];
      });
      g.append('path')
        .attr('d', d3.line<[number, number]>().curve(d3.curveBasis)(proj) || '')
        .attr('fill', 'none')
        .attr('stroke', '#1E2330')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4');
    });

    // 3. LAYER: Density Heatmap Radial Kernels (Underlay)
    if (activeLayer === 'HEATMAP' || activeLayer === 'ALL') {
      const heatGroup = g.append('g').attr('class', 'heatmap-layer');

      computedHubs.forEach(hub => {
        const coords = projection(hub.coordinates);
        if (!coords) return;

        // Radius scales with daily demand
        const baseRadius = 45 + (hub.demandScore / 100) * 55;
        const gradId = hub.status === 'CRITICAL_SURGE' ? 'grad-critical' : hub.status === 'HIGH_DEMAND' ? 'grad-high' : 'grad-optimal';
        const surgeColor = hub.status === 'CRITICAL_SURGE' ? '#EF4444' : hub.status === 'HIGH_DEMAND' ? '#F59E0B' : '#06B6D4';

        // Outer ambient glow
        const outerCircle = heatGroup.append('circle')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', baseRadius * 1.5)
          .attr('fill', `url(#${gradId})`)
          .attr('filter', 'url(#heat-glow)')
          .attr('opacity', 0.6)
          .attr('class', 'cursor-pointer');

        // Core thermal concentration
        const coreCircle = heatGroup.append('circle')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', baseRadius * 0.8)
          .attr('fill', `url(#${gradId})`)
          .attr('filter', 'url(#surge-core)')
          .attr('opacity', 0.85)
          .attr('class', 'cursor-pointer');

        // Interactive hover on thermal kernels showing exact demand count
        [outerCircle, coreCircle].forEach(c => {
          c.on('mouseenter', (event: MouseEvent) => {
            handleMapPointerMove(event, {
              type: 'CITY',
              title: `${hub.name} Hub Terminal`,
              subtitle: `${hub.state} Mobility Cluster`,
              category: 'City Terminal Demand Cluster',
              exactDemandPax: hub.dailyDemandPax,
              capacityPax: hub.availableCapacityPax,
              deficitPax: Math.max(0, hub.dailyDemandPax - hub.availableCapacityPax),
              activeBuses: hub.activeCoaches,
              loadFactorPct: Math.min(99.6, Math.round((hub.dailyDemandPax / hub.availableCapacityPax) * 92)),
              peakWindow: hub.peakWindow,
              surgeStatus: hub.status,
              surgeColor: surgeColor,
              recommendation: hub.recommendedAction,
            });
          })
          .on('mousemove', (event: MouseEvent) => {
            handleMapPointerMove(event, {
              type: 'CITY',
              title: `${hub.name} Hub Terminal`,
              subtitle: `${hub.state} Mobility Cluster`,
              category: 'City Terminal Demand Cluster',
              exactDemandPax: hub.dailyDemandPax,
              capacityPax: hub.availableCapacityPax,
              deficitPax: Math.max(0, hub.dailyDemandPax - hub.availableCapacityPax),
              activeBuses: hub.activeCoaches,
              loadFactorPct: Math.min(99.6, Math.round((hub.dailyDemandPax / hub.availableCapacityPax) * 92)),
              peakWindow: hub.peakWindow,
              surgeStatus: hub.status,
              surgeColor: surgeColor,
              recommendation: hub.recommendedAction,
            });
          })
          .on('mouseleave', () => {
            setHoveredTooltip(null);
          })
          .on('click', () => {
            setSelectedEntity({ type: 'CITY', data: hub });
          });
        });
      });
    }

    // 4. LAYER: Highway Travel Corridors & Density Arteries
    const corridorGroup = g.append('g').attr('class', 'corridors-layer');

    filteredCorridors.forEach(corr => {
      const sourceCoords = hubCoordsMap.get(corr.sourceId);
      const destCoords = hubCoordsMap.get(corr.destId);
      if (!sourceCoords || !destCoords) return;

      const pSource = projection(sourceCoords);
      const pDest = projection(destCoords);
      if (!pSource || !pDest) return;

      // Calculate slight natural parabolic curve for highway aesthetic
      const dx = pDest[0] - pSource[0];
      const dy = pDest[1] - pSource[1];
      const cx = (pSource[0] + pDest[0]) / 2 - dy * 0.12;
      const cy = (pSource[1] + pDest[1]) / 2 + dx * 0.12;
      const pathStr = `M ${pSource[0]} ${pSource[1]} Q ${cx} ${cy} ${pDest[0]} ${pDest[1]}`;

      const sourceName = CITY_HUBS.find(h => h.id === corr.sourceId)?.name || corr.sourceId;
      const destName = CITY_HUBS.find(h => h.id === corr.destId)?.name || corr.destId;

      // Color based on density and deficit
      const strokeColor = corr.densityIndex >= 90
        ? '#EF4444' // Critical
        : corr.densityIndex >= 80
        ? '#F59E0B' // High
        : '#06B6D4'; // Optimal

      const strokeWidth = 2 + (corr.densityIndex / 100) * 5;

      // Base corridor highway track
      corridorGroup.append('path')
        .attr('d', pathStr)
        .attr('fill', 'none')
        .attr('stroke', '#1E2330')
        .attr('stroke-width', strokeWidth + 2)
        .attr('stroke-linecap', 'round');

      // Active illuminated density artery
      const activePath = corridorGroup.append('path')
        .attr('d', pathStr)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-opacity', 0.75)
        .attr('stroke-linecap', 'round')
        .attr('class', 'cursor-pointer hover:stroke-white transition-colors')
        .on('mouseenter', function (event: MouseEvent) {
          d3.select(this).attr('stroke-width', strokeWidth + 3).attr('stroke-opacity', 1);
          const histCorr = compareMode !== 'OFF' ? getCorridorHistoricalData(corr.id, corr.paxDaily, compareMode) : undefined;
          handleMapPointerMove(event, {
            type: 'CORRIDOR',
            title: `${sourceName} ⇄ ${destName} (${corr.highwayCode})`,
            subtitle: `${corr.distanceKm} km Intercity Route Artery`,
            category: 'Highway Corridor Telemetry',
            exactDemandPax: corr.paxDaily,
            capacityPax: corr.coachesDeployed * 40,
            deficitPax: corr.deficitCoaches * 40,
            activeBuses: corr.coachesDeployed,
            loadFactorPct: corr.loadFactorPct,
            surgeStatus: corr.densityIndex >= 90 ? 'CRITICAL_SURGE' : corr.densityIndex >= 80 ? 'HIGH_DEMAND' : 'OPTIMAL',
            surgeColor: strokeColor,
            surgeMultiplier: corr.surgeMultiplier,
            recommendation: corr.recommendedFleetAction,
            compareMode,
            historicalDemandPax: histCorr?.historicalPax,
            growthDeltaPax: histCorr?.deltaPax,
            growthDeltaPct: histCorr?.deltaPct,
          });
        })
        .on('mousemove', function (event: MouseEvent) {
          const histCorr = compareMode !== 'OFF' ? getCorridorHistoricalData(corr.id, corr.paxDaily, compareMode) : undefined;
          handleMapPointerMove(event, {
            type: 'CORRIDOR',
            title: `${sourceName} ⇄ ${destName} (${corr.highwayCode})`,
            subtitle: `${corr.distanceKm} km Intercity Route Artery`,
            category: 'Highway Corridor Telemetry',
            exactDemandPax: corr.paxDaily,
            capacityPax: corr.coachesDeployed * 40,
            deficitPax: corr.deficitCoaches * 40,
            activeBuses: corr.coachesDeployed,
            loadFactorPct: corr.loadFactorPct,
            surgeStatus: corr.densityIndex >= 90 ? 'CRITICAL_SURGE' : corr.densityIndex >= 80 ? 'HIGH_DEMAND' : 'OPTIMAL',
            surgeColor: strokeColor,
            surgeMultiplier: corr.surgeMultiplier,
            recommendation: corr.recommendedFleetAction,
            compareMode,
            historicalDemandPax: histCorr?.historicalPax,
            growthDeltaPax: histCorr?.deltaPax,
            growthDeltaPct: histCorr?.deltaPct,
          });
        })
        .on('mouseleave', function () {
          d3.select(this).attr('stroke-width', strokeWidth).attr('stroke-opacity', 0.75);
          setHoveredTooltip(null);
        })
        .on('click', () => {
          setSelectedEntity({ type: 'CORRIDOR', data: corr });
        });

      // Animated travel flow dashes along high density corridors
      if (activeLayer === 'FLOW_PRESSURE' || activeLayer === 'ALL') {
        corridorGroup.append('path')
          .attr('d', pathStr)
          .attr('fill', 'none')
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', Math.max(1.8, strokeWidth * 0.4))
          .attr('stroke-dasharray', '8,16')
          .attr('stroke-linecap', 'round')
          .attr('class', 'animate-dash-flow pointer-events-none opacity-80');
      }

      // Animated Passenger Transit Volume Particle Flow Simulation
      if (flowSimulationEnabled) {
        const flowParticleGroup = corridorGroup.append('g').attr('class', 'corridor-flow-particles pointer-events-none');
        // Particle count scaled directly to actual passenger transit volume
        const particleCount = Math.max(3, Math.min(8, Math.round(corr.paxDaily / 620)));
        const speedFactor = flowSpeedMultiplier === '2x' ? 2 : flowSpeedMultiplier === '1.5x' ? 1.5 : 1.0;
        const baseDuration = Math.max(1.8, Math.min(5.2, (corr.distanceKm / 110) / speedFactor));
        const pathStrRev = `M ${pDest[0]} ${pDest[1]} Q ${cx} ${cy} ${pSource[0]} ${pSource[1]}`;

        for (let i = 0; i < particleCount; i++) {
          const isForward = i % 2 === 0;
          const targetPath = isForward ? pathStr : pathStrRev;
          const beginTime = ((i / particleCount) * baseDuration).toFixed(2) + 's';
          const pColor = corr.densityIndex >= 90 ? '#EF4444' : corr.densityIndex >= 80 ? '#F59E0B' : '#38BDF8';
          const pRadius = corr.densityIndex >= 90 ? 3.5 : 2.7;

          const particle = flowParticleGroup.append('circle')
            .attr('r', pRadius)
            .attr('fill', pColor)
            .attr('filter', 'url(#particle-glow)')
            .attr('opacity', 0.9);

          particle.append('animateMotion')
            .attr('dur', `${baseDuration.toFixed(2)}s`)
            .attr('repeatCount', 'indefinite')
            .attr('begin', beginTime)
            .attr('path', targetPath);

          particle.append('animate')
            .attr('attributeName', 'opacity')
            .attr('values', '0.25;1;0.9;0.25')
            .attr('dur', `${baseDuration.toFixed(2)}s`)
            .attr('repeatCount', 'indefinite')
            .attr('begin', beginTime);
        }
      }

      // Highway label pill at midpoint
      const midX = (pSource[0] + pDest[0] + cx) / 3;
      const midY = (pSource[1] + pDest[1] + cy) / 3;

      const labelGroup = corridorGroup.append('g')
        .attr('transform', `translate(${midX}, ${midY})`)
        .attr('class', 'cursor-pointer select-none')
        .on('mouseenter', (event: MouseEvent) => {
          handleMapPointerMove(event, {
            type: 'CORRIDOR',
            title: `${sourceName} ⇄ ${destName} (${corr.highwayCode})`,
            subtitle: `${corr.distanceKm} km Intercity Route Artery`,
            category: 'Highway Corridor Telemetry',
            exactDemandPax: corr.paxDaily,
            capacityPax: corr.coachesDeployed * 40,
            deficitPax: corr.deficitCoaches * 40,
            activeBuses: corr.coachesDeployed,
            loadFactorPct: corr.loadFactorPct,
            surgeStatus: corr.densityIndex >= 90 ? 'CRITICAL_SURGE' : corr.densityIndex >= 80 ? 'HIGH_DEMAND' : 'OPTIMAL',
            surgeColor: strokeColor,
            surgeMultiplier: corr.surgeMultiplier,
            recommendation: corr.recommendedFleetAction,
          });
        })
        .on('mousemove', (event: MouseEvent) => {
          handleMapPointerMove(event, {
            type: 'CORRIDOR',
            title: `${sourceName} ⇄ ${destName} (${corr.highwayCode})`,
            subtitle: `${corr.distanceKm} km Intercity Route Artery`,
            category: 'Highway Corridor Telemetry',
            exactDemandPax: corr.paxDaily,
            capacityPax: corr.coachesDeployed * 40,
            deficitPax: corr.deficitCoaches * 40,
            activeBuses: corr.coachesDeployed,
            loadFactorPct: corr.loadFactorPct,
            surgeStatus: corr.densityIndex >= 90 ? 'CRITICAL_SURGE' : corr.densityIndex >= 80 ? 'HIGH_DEMAND' : 'OPTIMAL',
            surgeColor: strokeColor,
            surgeMultiplier: corr.surgeMultiplier,
            recommendation: corr.recommendedFleetAction,
          });
        })
        .on('mouseleave', () => {
          setHoveredTooltip(null);
        })
        .on('click', () => {
          setSelectedEntity({ type: 'CORRIDOR', data: corr });
        });

      labelGroup.append('rect')
        .attr('x', -26)
        .attr('y', -10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 6)
        .attr('fill', '#101114')
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.95);

      labelGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '3.5')
        .attr('fill', '#FFFFFF')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${corr.loadFactorPct}%`);
    });

    // 5. LAYER: City Hub Density Nodes & Pulse Rings
    const hubGroup = g.append('g').attr('class', 'hubs-layer');

    filteredHubs.forEach(hub => {
      const coords = projection(hub.coordinates);
      if (!coords) return;

      const isCritical = hub.status === 'CRITICAL_SURGE';
      const isHigh = hub.status === 'HIGH_DEMAND';
      const themeColor = isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#06B6D4';
      const weather = CITY_WEATHER_MAP[hub.id] || { tempC: 30, condition: 'Sunny & Clear', precipPct: 15, demandImpactPct: 0 };

      const hubNode = hubGroup.append('g')
        .attr('transform', `translate(${coords[0]}, ${coords[1]})`)
        .attr('class', 'cursor-pointer group')
        .on('mouseenter', function (event: MouseEvent) {
          d3.select(this).select('.inner-node-dot').attr('r', 8).attr('fill', '#FFFFFF');
          const histHub = compareMode !== 'OFF' ? getHubHistoricalData(hub.id, hub.dailyDemandPax, compareMode) : undefined;
          handleMapPointerMove(event, {
            type: 'CITY',
            title: `${hub.name} Terminal Hub`,
            subtitle: `${hub.state} Interstate Passenger Terminal`,
            category: 'City Hub Telemetry',
            exactDemandPax: hub.dailyDemandPax,
            capacityPax: hub.availableCapacityPax,
            deficitPax: Math.max(0, hub.dailyDemandPax - hub.availableCapacityPax),
            activeBuses: hub.activeCoaches,
            loadFactorPct: Math.min(99.6, Math.round((hub.dailyDemandPax / hub.availableCapacityPax) * 92)),
            peakWindow: hub.peakWindow,
            surgeStatus: hub.status,
            surgeColor: themeColor,
            recommendation: hub.recommendedAction,
            weatherCondition: weather.condition,
            temperatureC: weather.tempC,
            precipitationPct: weather.precipPct,
            weatherImpactPct: weather.demandImpactPct,
            compareMode,
            historicalDemandPax: histHub?.historicalPax,
            growthDeltaPax: histHub?.deltaPax,
            growthDeltaPct: histHub?.deltaPct,
          });
        })
        .on('mousemove', function (event: MouseEvent) {
          const histHub = compareMode !== 'OFF' ? getHubHistoricalData(hub.id, hub.dailyDemandPax, compareMode) : undefined;
          handleMapPointerMove(event, {
            type: 'CITY',
            title: `${hub.name} Terminal Hub`,
            subtitle: `${hub.state} Interstate Passenger Terminal`,
            category: 'City Hub Telemetry',
            exactDemandPax: hub.dailyDemandPax,
            capacityPax: hub.availableCapacityPax,
            deficitPax: Math.max(0, hub.dailyDemandPax - hub.availableCapacityPax),
            activeBuses: hub.activeCoaches,
            loadFactorPct: Math.min(99.6, Math.round((hub.dailyDemandPax / hub.availableCapacityPax) * 92)),
            peakWindow: hub.peakWindow,
            surgeStatus: hub.status,
            surgeColor: themeColor,
            recommendation: hub.recommendedAction,
            weatherCondition: weather.condition,
            temperatureC: weather.tempC,
            precipitationPct: weather.precipPct,
            weatherImpactPct: weather.demandImpactPct,
            compareMode,
            historicalDemandPax: histHub?.historicalPax,
            growthDeltaPax: histHub?.deltaPax,
            growthDeltaPct: histHub?.deltaPct,
          });
        })
        .on('mouseleave', function () {
          d3.select(this).select('.inner-node-dot').attr('r', 6).attr('fill', themeColor);
          setHoveredTooltip(null);
        })
        .on('click', () => {
          setSelectedEntity({ type: 'CITY', data: hub });
        });

      // Animated pulsating outer radar wave for surge hotspots
      if (isCritical || isHigh) {
        hubNode.append('circle')
          .attr('r', 18)
          .attr('fill', 'none')
          .attr('stroke', themeColor)
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6)
          .attr('class', 'animate-ping origin-center pointer-events-none');
      }

      // Outer status ring
      hubNode.append('circle')
        .attr('r', 11)
        .attr('fill', '#101114')
        .attr('stroke', themeColor)
        .attr('stroke-width', 2.2);

      // Automatic Highlighting for Top 3 High-Priority Zones
      const top3Index = top3Hotspots.findIndex(th => th.id === hub.id);
      const isTop3 = top3Index !== -1;
      const topRank = top3Index + 1;

      if (autoHighlightTop3 && isTop3) {
        const beacon = hubNode.append('g').attr('class', 'top3-hotspot-beacon pointer-events-none');
        
        // Outer pulsing ring
        beacon.append('circle')
          .attr('r', 28)
          .attr('fill', 'rgba(239, 68, 68, 0.16)')
          .attr('stroke', '#EF4444')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,3')
          .attr('opacity', 0.9);

        beacon.append('circle')
          .attr('r', 36)
          .attr('fill', 'none')
          .attr('stroke', '#F59E0B')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6)
          .attr('class', 'animate-pulse');

        // Priority Rank Badge above the hub node
        const rankPill = beacon.append('g')
          .attr('transform', 'translate(0, -25)');

        rankPill.append('rect')
          .attr('x', -26)
          .attr('y', -8)
          .attr('width', 52)
          .attr('height', 16)
          .attr('rx', 8)
          .attr('fill', '#EF4444')
          .attr('stroke', '#FEF08A')
          .attr('stroke-width', 1.2);

        rankPill.append('text')
          .attr('x', 0)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#FFFFFF')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(`TOP #${topRank}`);
      }

      // Inner core node
      hubNode.append('circle')
        .attr('r', 6)
        .attr('fill', themeColor)
        .attr('class', 'inner-node-dot transition-all');

      // City Name & Demand Score Badge
      const isEastCoast = hub.id === 'maa' || hub.id === 'tpt';
      const labelOffset = isEastCoast ? 16 : -16;
      const textAnchor = isEastCoast ? 'start' : 'end';

      const label = hubNode.append('g')
        .attr('transform', `translate(${labelOffset}, -3)`);

      label.append('text')
        .attr('text-anchor', textAnchor)
        .attr('fill', '#FFFFFF')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('font-family', 'sans-serif')
        .text(hub.name);

      label.append('text')
        .attr('text-anchor', textAnchor)
        .attr('y', 13)
        .attr('fill', themeColor)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${hub.demandScore} DENSITY • ${hub.activeCoaches} BUSES`);

      // Weather Badge if weather overlay is enabled
      if (showWeatherOverlay) {
        const weatherGroup = hubNode.append('g')
          .attr('transform', `translate(${isEastCoast ? 16 : -16}, 26)`);

        weatherGroup.append('rect')
          .attr('x', isEastCoast ? 0 : -92)
          .attr('y', 0)
          .attr('width', 92)
          .attr('height', 16)
          .attr('rx', 4)
          .attr('fill', '#0B132B')
          .attr('stroke', '#06B6D4')
          .attr('stroke-width', 1);

        weatherGroup.append('text')
          .attr('x', isEastCoast ? 6 : -86)
          .attr('y', 12)
          .attr('fill', '#22D3EE')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .text(`🌧️ ${weather.tempC}°C • ${weather.precipPct}%`);
      }

      // Historical Comparison Visual Overlay (when compareMode is active)
      if (compareMode !== 'OFF') {
        const { deltaPct } = getHubHistoricalData(hub.id, hub.dailyDemandPax, compareMode);
        const compGroup = hubNode.append('g').attr('class', 'compare-mode-badge pointer-events-none');

        // Historical footprint ghost circumference
        compGroup.append('circle')
          .attr('r', 16)
          .attr('fill', 'none')
          .attr('stroke', '#10B981')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.75);

        // Growth percentage pill badge
        const badgeY = showWeatherOverlay ? 44 : 26;
        const badgeGroup = compGroup.append('g')
          .attr('transform', `translate(${isEastCoast ? 16 : -16}, ${badgeY})`);

        badgeGroup.append('rect')
          .attr('x', isEastCoast ? 0 : -88)
          .attr('y', 0)
          .attr('width', 88)
          .attr('height', 16)
          .attr('rx', 4)
          .attr('fill', '#064E3B')
          .attr('stroke', '#34D399')
          .attr('stroke-width', 1);

        badgeGroup.append('text')
          .attr('x', isEastCoast ? 6 : -82)
          .attr('y', 11)
          .attr('fill', '#A7F3D0')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(`▲ +${deltaPct}% ${compareMode === 'LAST_WEEK' ? 'WoW' : 'YoY'}`);
      }
    });

  }, [filteredHubs, filteredCorridors, filteredRegions, activeLayer, hubCoordsMap, showProjectedTrends, activeForecastDay, intensityFilter, showWeatherOverlay, top3Hotspots, autoHighlightTop3, flowSimulationEnabled, flowSpeedMultiplier, compareMode]);

  // Zoom control helpers
  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (zoomRef.current) {
      svg.transition().duration(350).call(zoomRef.current.scaleBy as any, factor);
    } else {
      svg.transition().duration(350).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, factor);
    }
  };

  const handleResetZoom = () => {
    setFocusedHotspotId(null);
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (zoomRef.current) {
      svg.transition().duration(500).call(zoomRef.current.transform as any, d3.zoomIdentity);
    } else {
      svg.transition().duration(500).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
    }
  };

  // High Priority Hotspot Center & Focus Animation
  const handleFocusHotspot = (coordinates: [number, number], entity?: { type: 'CITY' | 'CORRIDOR' | 'REGION'; data: any }) => {
    if (!svgRef.current) return;
    const width = 800;
    const height = 650;
    const projection = d3.geoMercator()
      .center([78.0, 13.0])
      .scale(3200)
      .translate([width / 2, height / 2]);

    const projectedPoint = projection(coordinates);
    const [x, y] = projectedPoint || [width / 2, height / 2];
    const targetScale = 2.4;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-x, -y);

    const svg = d3.select(svgRef.current);
    if (zoomRef.current) {
      svg.transition()
        .duration(850)
        .ease(d3.easeCubicInOut)
        .call(zoomRef.current.transform as any, transform);
    } else {
      svg.transition()
        .duration(850)
        .ease(d3.easeCubicInOut)
        .call(d3.zoom<SVGSVGElement, unknown>().transform as any, transform);
    }

    if (entity) {
      setSelectedEntity(entity);
    }
  };

  // Action: Apply recommended fleet optimization
  const handleApplyRecommendation = (recId: string) => {
    if (!appliedRecommendations.includes(recId)) {
      setAppliedRecommendations(prev => [...prev, recId]);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  const handleApplyDirective = (dayIndex: number) => {
    if (!appliedDirectives.includes(dayIndex)) {
      setAppliedDirectives(prev => [...prev, dayIndex]);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  const handleExportCSV = () => {
    let csv = '=== FLASHX OS GEOSPATIAL TRAVEL DEMAND EXPORT ===\n';
    csv += `Exported At: ${new Date().toISOString()}\n`;
    csv += `Mode: ${showProjectedTrends ? `7-Day Forecast (${activeForecastDay.dayName})` : `Live Telemetry (${selectedScenario})`}\n`;
    csv += `Density Multiplier: ${effectiveMultiplier}x\n\n`;

    csv += '--- 1. TERRITORIAL REGIONS CATCHMENT DEMAND ---\n';
    csv += 'Region ID,Name,State,Daily Demand Pax,Capacity Pax,Active Coaches,Load Factor (%),Status\n';
    computedRegions.forEach(r => {
      csv += `"${r.id}","${r.name}","${r.state}",${r.dailyDemandPax},${r.capacityPax},${r.activeCoaches},${r.loadFactorPct},"${r.status}"\n`;
    });

    csv += '\n--- 2. CITY TERMINAL HUBS TELEMETRY ---\n';
    csv += 'Hub ID,Name,State,Demand Score,Daily Demand Pax,Capacity Pax,Active Coaches,Peak Window,Status\n';
    computedHubs.forEach(h => {
      csv += `"${h.id}","${h.name}","${h.state}",${h.demandScore},${h.dailyDemandPax},${h.availableCapacityPax},${h.activeCoaches},"${h.peakWindow}","${h.status}"\n`;
    });

    csv += '\n--- 3. TRAVEL CORRIDORS FLOW PRESSURES ---\n';
    csv += 'Corridor ID,Source,Destination,Highway Code,Distance (km),Density Index,Daily Pax,Coaches Deployed,Load Factor (%),Deficit Coaches,Surge Multiplier\n';
    computedCorridors.forEach(c => {
      csv += `"${c.id}","${c.sourceId}","${c.destId}","${c.highwayCode}",${c.distanceKm},${c.densityIndex},${c.paxDaily},${c.coachesDeployed},${c.loadFactorPct},${c.deficitCoaches},${c.surgeMultiplier}\n`;
    });

    if (compareMode !== 'OFF') {
      csv += `\n--- 4. HISTORICAL DEMAND COMPARISON (${compareMode === 'LAST_WEEK' ? 'LAST WEEK BASELINE' : 'YEAR-OVER-YEAR BASELINE'}) ---\n`;
      csv += 'Hub ID,Name,Current Pax,Historical Pax,Delta Pax,Growth (%)\n';
      computedHubs.forEach(h => {
        const { historicalPax, deltaPax, deltaPct } = getHubHistoricalData(h.id, h.dailyDemandPax, compareMode);
        csv += `"${h.id}","${h.name}",${h.dailyDemandPax},${historicalPax},${deltaPax},${deltaPct}%\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flashx_demand_metrics_${showProjectedTrends ? activeForecastDay.dayShort.toLowerCase() : selectedScenario.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Header & Mission Banner with 7-Day Forecast Mode Toggle */}
      <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Geospatial Travel Demand Heatmap
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-mono font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span>D3.JS TOPOLOGY ENGINE</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Overlays passenger reservation density, travel corridor flow pressures, and automated fleet re-allocation intelligence.
              </p>
            </div>
          </div>

          {/* Quick Real-Time Status & 7-Day Horizon Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Button Group: Live Snapshot vs 7-Day Projected Trends */}
            <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => setShowProjectedTrends(false)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  !showProjectedTrends
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${!showProjectedTrends ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                <span>Live Snapshot</span>
              </button>
              <button
                onClick={() => setShowProjectedTrends(true)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  showProjectedTrends
                    ? 'bg-[#E7CB58] text-black font-bold shadow-lg shadow-amber-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>7-Day Surge Forecast</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  showProjectedTrends ? 'bg-black/40 text-amber-200' : 'bg-white/10 text-gray-300'
                }`}>
                  Simulated
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-gray-400 border-l border-white/10 pl-3">
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block uppercase">
                  {showProjectedTrends ? 'Forecast Horizon' : 'Telemetry Feed'}
                </span>
                <span className="text-white font-bold">
                  {showProjectedTrends ? activeForecastDay.dayShort + ' (' + activeForecastDay.dateStr + ')' : `${lastUpdated} (Active)`}
                </span>
              </div>
              <div className="text-right border-l border-white/10 pl-3">
                <span className="text-[10px] text-gray-500 block uppercase">Density Surge</span>
                <span className="text-[#E7CB58] font-bold">{effectiveMultiplier}x Factor</span>
              </div>
              <div className="pl-3 border-l border-white/10 flex items-center space-x-2">
                {/* Historical Comparison Mode Selector */}
                <div className="flex items-center space-x-1 bg-black/50 p-1 rounded-xl border border-white/10 font-mono text-xs">
                  <span className="text-[10px] text-gray-400 uppercase px-1.5 flex items-center space-x-1">
                    <History className="w-3.5 h-3.5 text-[#E7CB58]" />
                    <span>Compare:</span>
                  </span>
                  {(['OFF', 'LAST_WEEK', 'LAST_YEAR'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCompareMode(mode)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        compareMode === mode
                          ? 'bg-[#E7CB58] text-black shadow-md'
                          : 'text-gray-400 hover:text-white bg-white/5'
                      }`}
                      title={
                        mode === 'OFF'
                          ? 'Real-Time Telemetry Mode'
                          : mode === 'LAST_WEEK'
                          ? 'Overlay Same Day Last Week (-7 Days) Baseline'
                          : 'Overlay Same Day Last Year (-365 Days) YoY Growth Baseline'
                      }
                    >
                      {mode === 'OFF' ? 'Current' : mode === 'LAST_WEEK' ? 'Last Week (-7d)' : 'Last Year (YoY)'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setFlowSimulationEnabled(!flowSimulationEnabled)}
                  className={`px-3 py-2 rounded-xl font-mono text-xs transition-all flex items-center space-x-1.5 border shadow-md cursor-pointer ${
                    flowSimulationEnabled
                      ? 'bg-amber-500/20 text-[#E7CB58] border-amber-500/50 font-bold shadow-amber-500/20'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border-white/15'
                  }`}
                  title="Toggle Animated Passenger Flow Simulation across Major Corridors"
                >
                  <Zap className={`w-3.5 h-3.5 ${flowSimulationEnabled ? 'text-[#E7CB58] fill-current animate-pulse' : 'text-gray-400'}`} />
                  <span>Flow Sim: {flowSimulationEnabled ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
                  className={`px-3 py-2 rounded-xl font-mono text-xs transition-all flex items-center space-x-1.5 border shadow-md ${
                    showWeatherOverlay
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-cyan-500/20'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border-white/15'
                  }`}
                  title="Toggle Environmental Weather Overlay & Demand Correlation"
                >
                  <CloudRain className={`w-3.5 h-3.5 ${showWeatherOverlay ? 'text-cyan-400 animate-bounce' : 'text-gray-400'}`} />
                  <span>Weather: {showWeatherOverlay ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-all flex items-center space-x-1.5 border border-white/15 shadow-md"
                  title="Export Raw Demand Metrics as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#E7CB58]" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Demand Comparison & Long-Term Growth Trends Banner */}
        {compareMode !== 'OFF' && comparativeSummary && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#151d18] to-[#16181F] border border-emerald-500/40 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-display font-bold text-white">Historical Demand Overlay & Growth Analysis</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                    <History className="w-3 h-3 text-emerald-400" />
                    <span>{comparativeSummary.label.toUpperCase()}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-mono mt-0.5">
                  {comparativeSummary.insight}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-black/50 px-3.5 py-2.5 rounded-2xl border border-white/10 text-gray-300 space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase block">Network Demand Delta:</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
                  <span>▲ +{comparativeSummary.deltaPct}% ({comparativeSummary.deltaPax > 0 ? `+${comparativeSummary.deltaPax.toLocaleString()}` : comparativeSummary.deltaPax.toLocaleString()} Pax)</span>
                </span>
              </div>

              <div className="bg-black/50 px-3.5 py-2.5 rounded-2xl border border-white/10 text-gray-300 space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase block">Fastest Growth Hub:</span>
                <span className="text-sm font-bold text-[#E7CB58]">{comparativeSummary.fastestHub}</span>
              </div>

              <div className="bg-black/50 px-3.5 py-2.5 rounded-2xl border border-white/10 text-gray-300 space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase block">Top Growth Highway:</span>
                <span className="text-sm font-bold text-cyan-400">{comparativeSummary.topCorridor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Flow Simulation & Passenger Transit Volume Telemetry Banner */}
        {flowSimulationEnabled && (
          <div className="bg-gradient-to-r from-amber-950/50 via-[#181A24] to-cyan-950/40 border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-[#E7CB58] flex items-center justify-center">
                <Zap className="w-6 h-6 animate-pulse fill-current" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-display font-bold text-white">Peak Hour Passenger Flow Simulation</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-[#E7CB58] text-[10px] font-mono font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7CB58] animate-ping" />
                    <span>LIVE PARTICLE STREAMING</span>
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-mono mt-0.5">
                  Particle density along highway arteries represents live passenger volume ({totalSimulatedTransitPax.toLocaleString()} travelers flowing across South Indian corridors).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="bg-black/50 px-3.5 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 text-gray-300">
                <span className="text-[10px] text-gray-400 uppercase">Speed:</span>
                <div className="flex items-center space-x-1">
                  {(['1x', '1.5x', '2x'] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => setFlowSpeedMultiplier(speed)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        flowSpeedMultiplier === speed
                          ? 'bg-[#E7CB58] text-black shadow-sm'
                          : 'text-gray-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/50 px-4 py-2.5 rounded-2xl border border-amber-500/25 text-[#E7CB58]">
                <span>Corridor Transit: <strong className="text-white">{totalSimulatedTransitPax.toLocaleString()} Pax/Day</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Weather & Environmental Correlation Banner */}
        {showWeatherOverlay && (
          <div className="bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-[#16181F] border border-cyan-500/30 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <CloudRain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-display font-bold text-white">Environmental & Precipitation Demand Correlation</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-300 text-[10px] font-mono font-bold">
                    LIVE METEOROLOGICAL CORRELATION
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-mono mt-0.5">
                  Heavy rainfall across Western Ghats & Coastal corridors (Coimbatore, Kochi, Trivandrum) drives a <span className="text-cyan-400 font-bold">+18% to +30% surge</span> in express coach bookings as two-wheelers and personal cars shift to high-capacity transit.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-cyan-300 bg-black/50 px-4 py-2.5 rounded-2xl border border-cyan-500/25">
              <div>Avg Temp: <strong className="text-white">29.6°C</strong></div>
              <div className="border-l border-white/10 pl-3">Active Rain Corridors: <strong className="text-cyan-400">4 Routes</strong></div>
              <div className="border-l border-white/10 pl-3">Precipitation Impact: <strong className="text-amber-400">+19.2% Surge</strong></div>
            </div>
          </div>
        )}

        {/* Top Interactive Controls Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs border-t border-white/10">
          
          {/* Scenario Selector */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase block mb-1.5">
              {showProjectedTrends ? 'Baseline Scenario Anchor' : 'Travel Demand Scenario'}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'FRIDAY_PEAK', label: 'Friday Weekend Exodus' },
                { id: 'SUNDAY_RETURN', label: 'Sunday Return Wave' },
                { id: 'WEEKDAY', label: 'Mid-Week Regular' },
                { id: 'FESTIVAL_SURGE', label: 'Festival / Holiday Surge' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id as any)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all text-[11px] truncate ${
                    selectedScenario === s.id
                      ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                      : 'bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time-of-Day Window */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase block mb-1.5">Departure Time Window</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'EVENING', label: 'Evening Peak (17:00–21:00)' },
                { id: 'NIGHT', label: 'Nocturnal Sleeper (21:00–02:00)' },
                { id: 'MORNING', label: 'Morning Commute (06:00–10:00)' },
                { id: 'ALL_DAY', label: '24-Hour Diurnal Overview' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeWindow(t.id as any)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all text-[11px] truncate ${
                    timeWindow === t.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visualization Layer Toggles */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase block mb-1.5">Visual Overlay Layers</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'ALL', label: 'Full Topology Mesh' },
                { id: 'HEATMAP', label: 'Thermal Density Glow' },
                { id: 'FLOW_PRESSURE', label: 'Corridor Flow Arteries' },
                { id: 'DEFICIT_SURGE', label: 'Surge Deficit Alerts' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id as any)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all text-[11px] truncate ${
                    activeLayer === l.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                      : 'bg-black/40 text-gray-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 7-DAY PROJECTED DEMAND TRENDS VISUALIZATION (Visible when toggle is active) */}
      {showProjectedTrends && (
        <ProjectedDemandTrends
          selectedDayIndex={selectedDayIndex}
          onSelectDay={setSelectedDayIndex}
          onApplyDirective={handleApplyDirective}
          appliedDirectives={appliedDirectives}
        />
      )}

      {/* Main Interactive Map & Intelligence Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* D3 Map Canvas (8 Columns) */}
        <div
          ref={containerRef}
          className="lg:col-span-8 bg-[#16181F] border border-white/10 rounded-3xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between min-h-[580px] shadow-2xl"
        >
          {/* Map Top Bar with Legend, Live Status, and Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            {/* Color Scale Legend */}
            <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[11px]">
              <span className="text-gray-400 uppercase text-[10px]">Density:</span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>&lt;75% Normal</span>
              </span>
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>75–85% Optimal</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>85–92% High</span>
              </span>
              <span className="flex items-center space-x-1 text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>&gt;92% Surge</span>
              </span>
            </div>

            {/* Hover Guidance Badge & Projected Horizon Indicator */}
            {showProjectedTrends ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-white font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-[#E7CB58]" />
                <span className="font-bold text-[#E7CB58]">Day {selectedDayIndex + 1}: {activeForecastDay.dayShort}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{activeForecastDay.eventLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  activeForecastDay.deficitCoaches > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {activeForecastDay.deficitCoaches > 0 ? `+${activeForecastDay.deficitCoaches} coach deficit` : 'Balanced'}
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#E7CB58] font-mono text-[11px]">
                <Users className="w-3.5 h-3.5" />
                <span>Hover anywhere on map to view exact passenger demand</span>
              </div>
            )}

            {/* D3 Zoom Controls */}
            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={() => handleZoom(1.3)}
                title="Zoom In"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(0.7)}
                title="Zoom Out"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset View"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#E7CB58] flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top 3 High-Priority Hotspots Quick Focus Ribbon */}
          <div className="my-2.5 z-10 bg-gradient-to-r from-red-950/40 via-amber-950/25 to-black/60 border border-red-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Top 3 High-Priority Surge Hotspots</span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">
                    (Auto-Ranked • {effectiveMultiplier}x Factor)
                  </span>
                </h4>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <button
                  onClick={() => setAutoHighlightTop3(!autoHighlightTop3)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] transition-all border ${
                    autoHighlightTop3
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle Visual Aura & Beacon Highlight on Map"
                >
                  Map Highlight: {autoHighlightTop3 ? 'ACTIVE' : 'OFF'}
                </button>
                {focusedHotspotId && (
                  <button
                    onClick={handleResetZoom}
                    className="px-2.5 py-1 rounded-lg text-[10px] bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors"
                  >
                    Reset Map View
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              {top3Hotspots.map((hotspot, idx) => {
                const isFocused = focusedHotspotId === hotspot.id;
                return (
                  <div
                    key={hotspot.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isFocused
                        ? 'bg-red-950/70 border-red-500 ring-1 ring-red-500/50 shadow-lg shadow-red-500/20'
                        : 'bg-black/50 border-white/10 hover:border-red-500/40'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-red-500 text-white font-bold text-[9px]">
                          #{idx + 1}
                        </span>
                        <span className="font-display font-bold text-white text-xs truncate">
                          {hotspot.name}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate">({hotspot.state})</span>
                      </div>
                      <div className="text-[10px] text-gray-300 flex items-center space-x-1.5">
                        <span className="text-[#E7CB58] font-bold">{hotspot.demandScore} Density</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">{hotspot.dailyDemandPax.toLocaleString()} Pax</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFocusedHotspotId(hotspot.id);
                        handleFocusHotspot(hotspot.coordinates, { type: 'CITY', data: hotspot });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
                        isFocused
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                          : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 hover:text-white'
                      }`}
                      title={`Center and focus map directly on ${hotspot.name} hotspot`}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{isFocused ? 'Focused' : 'Focus'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Legend & Intensity Filter Component */}
          <div className="my-3 z-10">
            <DemandMapLegend
              currentFilter={intensityFilter}
              onSelectFilter={setIntensityFilter}
              counts={legendCounts}
            />
          </div>

          {/* SVG Map Container */}
          <div className="w-full flex-1 flex items-center justify-center my-2 cursor-crosshair">
            <svg
              ref={svgRef}
              viewBox="0 0 800 650"
              className="w-full h-auto max-h-[520px] select-none"
            />
          </div>

          {/* FLOATING INTERACTIVE HOVER TOOLTIP */}
          {hoveredTooltip && (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
              style={{
                left: `${hoveredTooltip.x}px`,
                top: `${hoveredTooltip.y}px`,
                transform: hoveredTooltip.y < 190 ? 'translate(-50%, 15px)' : 'translate(-50%, -105%)',
              }}
            >
              <div className="bg-[#10121A]/95 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl font-mono text-xs text-white min-w-[270px] max-w-[330px] ring-1 ring-black/80">
                {/* Tooltip Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                  <div className="pr-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                      {hoveredTooltip.category}
                    </span>
                    <h4 className="text-sm font-display font-bold text-white leading-tight">
                      {hoveredTooltip.title}
                    </h4>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap border shrink-0"
                    style={{
                      backgroundColor: `${hoveredTooltip.surgeColor}20`,
                      color: hoveredTooltip.surgeColor,
                      borderColor: `${hoveredTooltip.surgeColor}40`,
                    }}
                  >
                    {hoveredTooltip.surgeStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Primary Metric: Exact Passenger Demand Count / 7-Day Projected Demand */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-transparent border border-amber-500/30 mb-2.5">
                  <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
                    <span>{hoveredTooltip.isProjectedMode ? `Projected Demand (${hoveredTooltip.forecastDayName})` : 'Exact Passenger Demand'}</span>
                    <span className={`${hoveredTooltip.isProjectedMode ? 'text-[#E7CB58]' : 'text-emerald-400'} font-bold flex items-center`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hoveredTooltip.isProjectedMode ? 'bg-[#E7CB58]' : 'bg-emerald-400'} animate-pulse mr-1`} />
                      {hoveredTooltip.isProjectedMode ? '7D FORECAST' : 'LIVE FEED'}
                    </span>
                  </div>
                  <div className="text-2xl font-display font-bold text-[#E7CB58] mt-0.5">
                    {hoveredTooltip.exactDemandPax.toLocaleString()}
                    <span className="text-xs font-mono font-normal text-gray-300 ml-1.5">Passengers</span>
                  </div>
                  {hoveredTooltip.isProjectedMode && hoveredTooltip.forecastDeltaPct !== undefined && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Baseline Trend Delta:</span>
                      <span className={hoveredTooltip.forecastDeltaPct >= 0 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                        {hoveredTooltip.forecastDeltaPct >= 0 ? `+${hoveredTooltip.forecastDeltaPct}% Surge` : `${hoveredTooltip.forecastDeltaPct}% Normal`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Historical Comparison Overlay in Tooltip */}
                {hoveredTooltip.compareMode && hoveredTooltip.compareMode !== 'OFF' && hoveredTooltip.historicalDemandPax && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 mb-2.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                      <span className="flex items-center space-x-1.5">
                        <History className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{hoveredTooltip.compareMode === 'LAST_WEEK' ? 'Last Week Baseline' : 'YoY Last Year Baseline'}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">▲ +{hoveredTooltip.growthDeltaPct}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 border-t border-emerald-500/20 pt-1">
                      <span>Historical Baseline:</span>
                      <strong className="text-white">{hoveredTooltip.historicalDemandPax.toLocaleString()} Pax</strong>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 pt-0.5">
                      <span>Net Structural Growth:</span>
                      <strong className="text-emerald-400">+{hoveredTooltip.growthDeltaPax?.toLocaleString()} Pax</strong>
                    </div>
                  </div>
                )}

                {/* Weather & Environmental Correlation Card */}
                {hoveredTooltip.weatherCondition && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 mb-2.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-cyan-300 font-bold mb-0.5">
                      <span className="flex items-center space-x-1.5">
                        <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{hoveredTooltip.weatherCondition}</span>
                      </span>
                      <span>{hoveredTooltip.temperatureC}°C ({hoveredTooltip.precipitationPct}% Precip)</span>
                    </div>
                    <div className="text-[10px] text-gray-300 flex items-center justify-between border-t border-cyan-500/20 pt-1 mt-1">
                      <span>Weather Demand Impact:</span>
                      <strong className="text-amber-400">+{hoveredTooltip.weatherImpactPct}% Surge</strong>
                    </div>
                  </div>
                )}

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5 text-gray-300">
                  <div className="p-2 rounded-lg bg-black/50 border border-white/5">
                    <span className="text-gray-400 block text-[9px] uppercase">Available Capacity</span>
                    <span className="font-bold text-white text-xs">{hoveredTooltip.capacityPax.toLocaleString()} Seats</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/50 border border-white/5">
                    <span className="text-gray-400 block text-[9px] uppercase">
                      {hoveredTooltip.deficitPax !== undefined && hoveredTooltip.deficitPax > 0 ? 'Surge Deficit' : 'Active Fleet'}
                    </span>
                    <span className={`font-bold text-xs ${hoveredTooltip.deficitPax && hoveredTooltip.deficitPax > 0 ? 'text-red-400' : 'text-cyan-400'}`}>
                      {hoveredTooltip.deficitPax !== undefined && hoveredTooltip.deficitPax > 0
                        ? `+${hoveredTooltip.deficitPax.toLocaleString()} Pax`
                        : `${hoveredTooltip.activeBuses || 0} Coaches`}
                    </span>
                  </div>
                </div>

                {/* Auxiliary Details */}
                <div className="space-y-1 text-[10px] text-gray-400 border-t border-white/10 pt-2 font-mono">
                  {hoveredTooltip.loadFactorPct !== undefined && (
                    <div className="flex justify-between">
                      <span>Fleet Load Factor:</span>
                      <span className="font-bold text-cyan-400">{hoveredTooltip.loadFactorPct}%</span>
                    </div>
                  )}
                  {hoveredTooltip.peakWindow && (
                    <div className="flex justify-between">
                      <span>Peak Hours:</span>
                      <span className="font-bold text-white">{hoveredTooltip.peakWindow}</span>
                    </div>
                  )}
                  {hoveredTooltip.surgeMultiplier && (
                    <div className="flex justify-between">
                      <span>Dynamic Multiplier:</span>
                      <span className="font-bold text-[#E7CB58]">{hoveredTooltip.surgeMultiplier}x Base Fare</span>
                    </div>
                  )}
                  {hoveredTooltip.keyRoutes && (
                    <div className="flex justify-between">
                      <span>Key Highway Arteries:</span>
                      <span className="font-bold text-white">{hoveredTooltip.keyRoutes.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 text-[9px] text-gray-500 text-center uppercase tracking-wider border-t border-white/5 pt-1.5">
                  Click to pin fleet routing strategy
                </div>
              </div>
            </div>
          )}

          {/* Bottom Map Footnote */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 border-t border-white/5 pt-3 z-10">
            <span className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E7CB58]" />
              <span>Hover anywhere over regions, hubs, or highway arteries for live passenger demand telemetry.</span>
            </span>
            <span className="text-gray-500">D3.js Mercator 3200x • Real-time Demand Topology</span>
          </div>
        </div>

        {/* Fleet Optimization & Inspection Intelligence Drawer (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Selected Entity Card */}
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#E7CB58]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  {selectedEntity?.type === 'CITY'
                    ? 'Hub Terminal Intel'
                    : selectedEntity?.type === 'REGION'
                    ? 'Regional Territory Intel'
                    : 'Highway Corridor Intel'}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                (selectedEntity?.data?.demandScore || selectedEntity?.data?.densityIndex || selectedEntity?.data?.loadFactorPct) >= 90
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {selectedEntity?.data?.status || (selectedEntity?.data?.loadFactorPct >= 90 ? 'CRITICAL SURGE' : 'OPTIMAL')}
              </span>
            </div>

            {selectedEntity?.type === 'REGION' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-xl font-display font-bold text-white">{selectedEntity.data.name}</div>
                  <div className="text-xs text-gray-400">{selectedEntity.data.state} Territorial Catchment Zone</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Exact Region Demand</span>
                    <span className="text-lg font-bold text-[#E7CB58]">{selectedEntity.data.dailyDemandPax.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 block">Pax / 24h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Regional Capacity</span>
                    <span className="text-lg font-bold text-cyan-400">{selectedEntity.data.capacityPax.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 block">Available Berths</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Total Coaches:</span>
                    <span className="text-white font-bold">{selectedEntity.data.activeCoaches} Active Buses</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Regional Load Factor:</span>
                    <span className="text-cyan-400 font-bold">{selectedEntity.data.loadFactorPct}%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Highways:</span>
                    <span className="text-[#E7CB58] font-bold">{selectedEntity.data.keyHighways.join(', ')}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#E7CB58] block">Territorial Fleet Directive</span>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    {selectedEntity.data.recommendedDirective}
                  </p>
                  <button
                    onClick={() => handleApplyRecommendation(selectedEntity.data.id)}
                    disabled={appliedRecommendations.includes(selectedEntity.data.id)}
                    className={`w-full mt-2 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                      appliedRecommendations.includes(selectedEntity.data.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#E7CB58] hover:bg-[#F2DA75] text-black shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {appliedRecommendations.includes(selectedEntity.data.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Territorial Directive Enacted</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Enact Territorial Directive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedEntity?.type === 'CITY' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-xl font-display font-bold text-white">{selectedEntity.data.name}</div>
                  <div className="text-xs text-gray-400">{selectedEntity.data.state} Regional Terminal Hub</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Passenger Demand</span>
                    <span className="text-lg font-bold text-[#E7CB58]">{selectedEntity.data.dailyDemandPax.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 block">Pax / 24h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Active Fleet</span>
                    <span className="text-lg font-bold text-cyan-400">{selectedEntity.data.activeCoaches}</span>
                    <span className="text-[10px] text-gray-500 block">Coaches Assigned</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="text-gray-400 text-[10px] uppercase">Diurnal Peak Window</div>
                  <div className="text-white font-bold flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{selectedEntity.data.peakWindow}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#E7CB58] block">Autonomous Fleet Routing Recommendation</span>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    {selectedEntity.data.recommendedAction}
                  </p>
                  <button
                    onClick={() => handleApplyRecommendation(selectedEntity.data.id)}
                    disabled={appliedRecommendations.includes(selectedEntity.data.id)}
                    className={`w-full mt-2 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                      appliedRecommendations.includes(selectedEntity.data.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#E7CB58] hover:bg-[#F2DA75] text-black shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {appliedRecommendations.includes(selectedEntity.data.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reallocation Dispatched</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Execute Fleet Re-allocation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedEntity?.type === 'CORRIDOR' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[#E7CB58] font-bold">
                      {selectedEntity.data.highwayCode}
                    </span>
                    <span className="text-xs text-gray-400">{selectedEntity.data.distanceKm} km Intercity Route</span>
                  </div>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {CITY_HUBS.find(h => h.id === selectedEntity.data.sourceId)?.name} ⇄ {CITY_HUBS.find(h => h.id === selectedEntity.data.destId)?.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Load Factor</span>
                    <span className="text-lg font-bold text-cyan-400">{selectedEntity.data.loadFactorPct}%</span>
                    <span className="text-[10px] text-gray-500 block">Fleet Berth Fill</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 block text-[10px] uppercase">Capacity Deficit</span>
                    <span className="text-lg font-bold text-red-400">+{selectedEntity.data.deficitCoaches} Coaches</span>
                    <span className="text-[10px] text-gray-500 block">Unmet Passenger Load</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Daily Travelers:</span>
                    <span className="text-white font-bold">{selectedEntity.data.paxDaily.toLocaleString()} Pax</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Deployed Coaches:</span>
                    <span className="text-white font-bold">{selectedEntity.data.coachesDeployed} Trips / day</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Dynamic Surge Factor:</span>
                    <span className="text-[#E7CB58] font-bold">{selectedEntity.data.surgeMultiplier}x Base Fare</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#E7CB58] block">Corridor Optimization Dispatch</span>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    {selectedEntity.data.recommendedFleetAction}
                  </p>
                  <button
                    onClick={() => handleApplyRecommendation(selectedEntity.data.id)}
                    disabled={appliedRecommendations.includes(selectedEntity.data.id)}
                    className={`w-full mt-2 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                      appliedRecommendations.includes(selectedEntity.data.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#E7CB58] hover:bg-[#F2DA75] text-black shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {appliedRecommendations.includes(selectedEntity.data.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Extra Schedule Injected</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Inject Special Departure</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Autonomous Fleet Optimization Recommendations Summary */}
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Fleet Balancing Directives
              </h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-[11px]">Coimbatore ⇄ BLR (NH544)</span>
                  <span className="text-red-400 font-bold text-[10px]">+6 COACH DEFICIT</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Divert 2 sleeper units from Salem yard; projected extra yield: ₹1,85,000.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-[11px]">Bengaluru ⇄ MAA (NH48)</span>
                  <span className="text-amber-400 font-bold text-[10px]">+5 COACH DEFICIT</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Friday evening tech exodus; 91.8% load factor across 70 daily departures.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-[11px]">Salem Hub (Terminal Yard)</span>
                  <span className="text-emerald-400 font-bold text-[10px]">SURPLUS CAPACITY</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  3 coaches idling; re-deploy to Gandhipuram terminal for night departures.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
