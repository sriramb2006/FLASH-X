import React, { useState, useMemo } from 'react';
import {
  Activity,
  Fuel,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Bus,
  Zap,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Compass,
  MapPin,
  Flame,
  UserCheck,
  Clock,
  UserX,
  CalendarDays,
  AlertOctagon,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { FleetMaintenanceRoiVisualization } from './FleetMaintenanceRoiVisualization';

interface FleetVehicle {
  id: string;
  registrationNumber: string;
  model: string;
  corridor: string;
  hubName: string;
  fuelLevelPct: number;
  batteryOrVoltage: string;
  engineTempC: number;
  diagnosticsStatus: 'OPTIMAL' | 'WARNING_FUEL' | 'MAINTENANCE_DUE' | 'THERMAL_ALERT';
  currentDemandZone: 'CRITICAL_SURGE' | 'HIGH_DEMAND' | 'OPTIMAL' | 'SURPLUS';
  dailyPaxServed: number;
  lastDiagnosticCheck: string;
  // Driver Shift & Fatigue fields
  driverName: string;
  driverId: string;
  shiftHoursElapsed: number;
  continuousDrivingHours: number;
  fatigueRiskStatus: 'COMPLIANT' | 'FATIGUE_WARNING' | 'REGULATORY_BREACH_RISK';
  lastRestStop: string;
  // Predictive Maintenance fields
  predictedFailureComponent: string;
  failureProbabilityPct: number;
  optimalServiceWindow: string;
  maintenancePriority: 'CRITICAL_FAILURE_RISK' | 'MODERATE_WEAR' | 'OPTIMAL';
  scheduledServiceStatus: 'PENDING' | 'SCHEDULED_TONIGHT' | 'COMPLETED';
}

const FLEET_VEHICLES_DATA: FleetVehicle[] = [
  {
    id: 'bus-101',
    registrationNumber: 'TN-37-N-4912',
    model: 'Volvo 9400 14.5m Multi-Axle AC Sleeper',
    corridor: 'Coimbatore ⇄ Bengaluru (NH544)',
    hubName: 'Coimbatore Gandhipuram',
    fuelLevelPct: 82,
    batteryOrVoltage: '27.4V (Stable)',
    engineTempC: 88,
    diagnosticsStatus: 'OPTIMAL',
    currentDemandZone: 'CRITICAL_SURGE',
    dailyPaxServed: 240,
    lastDiagnosticCheck: '2 mins ago',
    driverName: 'Ramesh Kumar (Senior Lead)',
    driverId: 'DRV-8821',
    shiftHoursElapsed: 5.2,
    continuousDrivingHours: 2.5,
    fatigueRiskStatus: 'COMPLIANT',
    lastRestStop: '1h 15m ago at Salem Plaza',
    predictedFailureComponent: 'Brake Pad Wear (Front Axle)',
    failureProbabilityPct: 18,
    optimalServiceWindow: 'In 3 Days (Scheduled Off-Peak)',
    maintenancePriority: 'OPTIMAL',
    scheduledServiceStatus: 'PENDING',
  },
  {
    id: 'bus-102',
    registrationNumber: 'KA-01-F-8842',
    model: 'Scania Metrolink HD 13.7m',
    corridor: 'Bengaluru ⇄ Chennai (NH48)',
    hubName: 'Bengaluru Kempegowda (KBS)',
    fuelLevelPct: 24,
    batteryOrVoltage: '24.1V (Low)',
    engineTempC: 96,
    diagnosticsStatus: 'WARNING_FUEL',
    currentDemandZone: 'CRITICAL_SURGE',
    dailyPaxServed: 310,
    lastDiagnosticCheck: 'Just now',
    driverName: 'Suresh Vencatesh',
    driverId: 'DRV-4419',
    shiftHoursElapsed: 7.6,
    continuousDrivingHours: 4.3,
    fatigueRiskStatus: 'REGULATORY_BREACH_RISK',
    lastRestStop: '4h ago at Krishnagiri',
    predictedFailureComponent: 'Turbocharger Thermal Stress',
    failureProbabilityPct: 89,
    optimalServiceWindow: 'Tonight 01:00 - 04:00 (KBS Yard)',
    maintenancePriority: 'CRITICAL_FAILURE_RISK',
    scheduledServiceStatus: 'SCHEDULED_TONIGHT',
  },
  {
    id: 'bus-103',
    registrationNumber: 'TS-08-E-1092',
    model: 'Mercedes-Benz SHD 2436',
    corridor: 'Hyderabad ⇄ Bengaluru (NH44)',
    hubName: 'Hyderabad MGBS',
    fuelLevelPct: 68,
    batteryOrVoltage: '26.8V (Stable)',
    engineTempC: 91,
    diagnosticsStatus: 'OPTIMAL',
    currentDemandZone: 'HIGH_DEMAND',
    dailyPaxServed: 285,
    lastDiagnosticCheck: '5 mins ago',
    driverName: 'Anand Murthy',
    driverId: 'DRV-9012',
    shiftHoursElapsed: 6.8,
    continuousDrivingHours: 3.9,
    fatigueRiskStatus: 'FATIGUE_WARNING',
    lastRestStop: '2h 30m ago at Kurnool',
    predictedFailureComponent: 'Alternator Voltage Regulator',
    failureProbabilityPct: 42,
    optimalServiceWindow: 'Tomorrow 03:00 - 06:00 (MGBS Bay)',
    maintenancePriority: 'MODERATE_WEAR',
    scheduledServiceStatus: 'PENDING',
  },
  {
    id: 'bus-104',
    registrationNumber: 'TN-01-AZ-5520',
    model: 'BharatBenz 1623 AC Sleeper',
    corridor: 'Chennai ⇄ Madurai (NH45)',
    hubName: 'Chennai Koyambedu (CMBT)',
    fuelLevelPct: 18,
    batteryOrVoltage: '23.5V (Critical)',
    engineTempC: 102,
    diagnosticsStatus: 'MAINTENANCE_DUE',
    currentDemandZone: 'HIGH_DEMAND',
    dailyPaxServed: 210,
    lastDiagnosticCheck: '1 min ago',
    driverName: 'Karthik Subramanian',
    driverId: 'DRV-1102',
    shiftHoursElapsed: 7.9,
    continuousDrivingHours: 4.4,
    fatigueRiskStatus: 'REGULATORY_BREACH_RISK',
    lastRestStop: '5h ago at Villupuram',
    predictedFailureComponent: 'Transmission Fluid Overheating',
    failureProbabilityPct: 94,
    optimalServiceWindow: 'Tonight 00:30 - 04:30 (CMBT Yard)',
    maintenancePriority: 'CRITICAL_FAILURE_RISK',
    scheduledServiceStatus: 'SCHEDULED_TONIGHT',
  },
  {
    id: 'bus-105',
    registrationNumber: 'KA-51-D-3319',
    model: 'Volvo B11R i-Shift',
    corridor: 'Bengaluru ⇄ Mysuru (NH275)',
    hubName: 'Mysuru Suburban Stand',
    fuelLevelPct: 91,
    batteryOrVoltage: '27.9V (Stable)',
    engineTempC: 85,
    diagnosticsStatus: 'OPTIMAL',
    currentDemandZone: 'OPTIMAL',
    dailyPaxServed: 195,
    lastDiagnosticCheck: '8 mins ago',
    driverName: 'Prabhu Deva',
    driverId: 'DRV-6554',
    shiftHoursElapsed: 3.1,
    continuousDrivingHours: 1.5,
    fatigueRiskStatus: 'COMPLIANT',
    lastRestStop: '30m ago at Bidadi',
    predictedFailureComponent: 'Suspension Air Bellows',
    failureProbabilityPct: 12,
    optimalServiceWindow: 'Next Weekly Cycle',
    maintenancePriority: 'OPTIMAL',
    scheduledServiceStatus: 'PENDING',
  },
  {
    id: 'bus-106',
    registrationNumber: 'KL-01-CA-7712',
    model: 'Scania Interlink HD',
    corridor: 'Kochi ⇄ Bengaluru (NH544)',
    hubName: 'Kochi Vyttila Hub',
    fuelLevelPct: 42,
    batteryOrVoltage: '25.2V (Normal)',
    engineTempC: 98,
    diagnosticsStatus: 'THERMAL_ALERT',
    currentDemandZone: 'CRITICAL_SURGE',
    dailyPaxServed: 270,
    lastDiagnosticCheck: '3 mins ago',
    driverName: 'Manoj Pillai',
    driverId: 'DRV-3310',
    shiftHoursElapsed: 6.9,
    continuousDrivingHours: 4.1,
    fatigueRiskStatus: 'FATIGUE_WARNING',
    lastRestStop: '3h ago at Palakkad',
    predictedFailureComponent: 'Cooling Fan Relay Unit',
    failureProbabilityPct: 76,
    optimalServiceWindow: 'Tonight 02:00 - 05:00 (Vyttila Bay)',
    maintenancePriority: 'MODERATE_WEAR',
    scheduledServiceStatus: 'PENDING',
  },
  {
    id: 'bus-107',
    registrationNumber: 'TN-45-M-9021',
    model: 'Ashok Leyland 225HP AC Sleeper',
    corridor: 'Madurai ⇄ Coimbatore (NH83)',
    hubName: 'Madurai Mattuthavani',
    fuelLevelPct: 75,
    batteryOrVoltage: '26.5V (Stable)',
    engineTempC: 87,
    diagnosticsStatus: 'OPTIMAL',
    currentDemandZone: 'SURPLUS',
    dailyPaxServed: 160,
    lastDiagnosticCheck: '12 mins ago',
    driverName: 'Senthil Nathan',
    driverId: 'DRV-7788',
    shiftHoursElapsed: 2.8,
    continuousDrivingHours: 1.2,
    fatigueRiskStatus: 'COMPLIANT',
    lastRestStop: '15m ago at Dindigul',
    predictedFailureComponent: 'Fuel Injector Nozzle Wear',
    failureProbabilityPct: 22,
    optimalServiceWindow: 'Routine Monthly PM',
    maintenancePriority: 'OPTIMAL',
    scheduledServiceStatus: 'PENDING',
  },
];

export const FleetHealthWidget: React.FC = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(FLEET_VEHICLES_DATA);
  const [viewMode, setViewMode] = useState<'DIAGNOSTICS' | 'DRIVER_STATUS' | 'MAINTENANCE_SCHEDULER' | 'COST_SAVINGS_ROI'>('DIAGNOSTICS');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(FLEET_VEHICLES_DATA[0]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    if (viewMode === 'DIAGNOSTICS') {
      if (filterStatus === 'ALL') return vehicles;
      if (filterStatus === 'WARNING') return vehicles.filter(v => v.fuelLevelPct < 35 || v.diagnosticsStatus === 'WARNING_FUEL');
      if (filterStatus === 'MAINTENANCE') return vehicles.filter(v => v.diagnosticsStatus === 'MAINTENANCE_DUE' || v.diagnosticsStatus === 'THERMAL_ALERT');
      if (filterStatus === 'SURGE') return vehicles.filter(v => v.currentDemandZone === 'CRITICAL_SURGE');
      return vehicles;
    } else if (viewMode === 'DRIVER_STATUS') {
      if (filterStatus === 'ALL') return vehicles;
      if (filterStatus === 'BREACH_RISK') return vehicles.filter(v => v.fatigueRiskStatus === 'REGULATORY_BREACH_RISK');
      if (filterStatus === 'WARNING') return vehicles.filter(v => v.fatigueRiskStatus === 'FATIGUE_WARNING' || v.fatigueRiskStatus === 'REGULATORY_BREACH_RISK');
      if (filterStatus === 'COMPLIANT') return vehicles.filter(v => v.fatigueRiskStatus === 'COMPLIANT');
      return vehicles;
    } else {
      // Maintenance Scheduler view filters
      if (filterStatus === 'ALL') return vehicles;
      if (filterStatus === 'CRITICAL') return vehicles.filter(v => v.maintenancePriority === 'CRITICAL_FAILURE_RISK');
      if (filterStatus === 'MODERATE') return vehicles.filter(v => v.maintenancePriority === 'MODERATE_WEAR');
      if (filterStatus === 'SCHEDULED') return vehicles.filter(v => v.scheduledServiceStatus === 'SCHEDULED_TONIGHT');
      return vehicles;
    }
  }, [vehicles, filterStatus, viewMode]);

  const handleAction = (vehicleId: string, actionType: 'REFUEL' | 'MAINTENANCE' | 'REROUTE' | 'RELIEF_DRIVER' | 'MANDATORY_REST' | 'SCHEDULE_SERVICE' | 'RESOLVE_PM') => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        if (actionType === 'REFUEL') {
          return { ...v, fuelLevelPct: 98, diagnosticsStatus: v.diagnosticsStatus === 'WARNING_FUEL' ? 'OPTIMAL' : v.diagnosticsStatus };
        }
        if (actionType === 'MAINTENANCE') {
          return { ...v, engineTempC: 86, diagnosticsStatus: 'OPTIMAL', maintenancePriority: 'OPTIMAL', scheduledServiceStatus: 'COMPLETED' };
        }
        if (actionType === 'REROUTE') {
          return { ...v, currentDemandZone: 'CRITICAL_SURGE' };
        }
        if (actionType === 'RELIEF_DRIVER') {
          return { ...v, shiftHoursElapsed: 1.2, continuousDrivingHours: 0.8, fatigueRiskStatus: 'COMPLIANT', driverName: `${v.driverName.split(' ')[0]} (Relieved)` };
        }
        if (actionType === 'MANDATORY_REST') {
          return { ...v, shiftHoursElapsed: Math.max(0, v.shiftHoursElapsed - 1.5), continuousDrivingHours: 0.5, fatigueRiskStatus: 'COMPLIANT', lastRestStop: 'Just now at Terminal Rest Stop' };
        }
        if (actionType === 'SCHEDULE_SERVICE') {
          return { ...v, scheduledServiceStatus: 'SCHEDULED_TONIGHT' };
        }
        if (actionType === 'RESOLVE_PM') {
          return { ...v, maintenancePriority: 'OPTIMAL', failureProbabilityPct: 5, scheduledServiceStatus: 'COMPLETED', diagnosticsStatus: 'OPTIMAL' };
        }
      }
      return v;
    }));

    const vName = vehicles.find(v => v.id === vehicleId)?.registrationNumber;
    setActionSuccessMsg(`Successfully executed maintenance action '${actionType}' for vehicle ${vName}. Ops team notified.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header with View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-display font-bold">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Fleet Health, Driver Safety & Predictive Maintenance
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>AI PREDICTIVE TELEMETRY</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Monitors vehicle diagnostics, driver shift safety, and predicts component failures to schedule optimal service windows.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => { setViewMode('DIAGNOSTICS'); setFilterStatus('ALL'); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              viewMode === 'DIAGNOSTICS'
                ? 'bg-cyan-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vehicle Diagnostics</span>
          </button>
          <button
            onClick={() => { setViewMode('DRIVER_STATUS'); setFilterStatus('ALL'); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              viewMode === 'DRIVER_STATUS'
                ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Driver Safety</span>
          </button>
          <button
            onClick={() => { setViewMode('MAINTENANCE_SCHEDULER'); setFilterStatus('ALL'); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              viewMode === 'MAINTENANCE_SCHEDULER'
                ? 'bg-purple-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Automated Maintenance Scheduler</span>
          </button>
          <button
            onClick={() => { setViewMode('COST_SAVINGS_ROI'); setFilterStatus('ALL'); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              viewMode === 'COST_SAVINGS_ROI'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cost Savings & Operations ROI</span>
          </button>
        </div>
      </div>

      {/* Sub-Filters based on active view */}
      {viewMode !== 'COST_SAVINGS_ROI' && (
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs bg-black/40 p-3 rounded-2xl border border-white/5">
          <span className="text-gray-400 text-[11px] uppercase">
            {viewMode === 'DIAGNOSTICS' ? 'Filter Diagnostics:' : viewMode === 'DRIVER_STATUS' ? 'Filter Driver Compliance:' : 'Filter Maintenance Tasks:'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'DIAGNOSTICS' ? (
              <>
                {[
                  { id: 'ALL', label: 'All Fleet (' + vehicles.length + ')' },
                  { id: 'SURGE', label: 'In High-Demand Zones' },
                  { id: 'WARNING', label: 'Low Fuel / Warning' },
                  { id: 'MAINTENANCE', label: 'Maintenance Due' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      filterStatus === f.id
                        ? 'bg-cyan-500 text-black font-bold shadow-md'
                        : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </>
            ) : viewMode === 'DRIVER_STATUS' ? (
              <>
                {[
                  { id: 'ALL', label: 'All Drivers (' + vehicles.length + ')' },
                  { id: 'BREACH_RISK', label: 'Regulatory Breach Risk' },
                  { id: 'WARNING', label: 'Fatigue Warning' },
                  { id: 'COMPLIANT', label: 'Fully Compliant' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      filterStatus === f.id
                        ? 'bg-[#E7CB58] text-black font-bold shadow-md'
                        : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { id: 'ALL', label: 'All Predictions (' + vehicles.length + ')' },
                  { id: 'CRITICAL', label: 'Critical Failure Risk' },
                  { id: 'MODERATE', label: 'Moderate Wear' },
                  { id: 'SCHEDULED', label: 'Scheduled Tonight' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      filterStatus === f.id
                        ? 'bg-purple-500 text-black font-bold shadow-md'
                        : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Maintenance Scheduler ROI Teaser Banner */}
      {viewMode === 'MAINTENANCE_SCHEDULER' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#181A24] to-purple-950/50 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl font-mono text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-sm">Preventative Maintenance Operations ROI</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  93.1% NET COST REDUCTION
                </span>
              </div>
              <p className="text-gray-300 text-[11px] mt-0.5">
                Proactively servicing tonight's flagged coaches is projected to avert <strong className="text-emerald-400">₹14.8 Lakhs</strong> in emergency highway towing, replacement relief buses, and catastrophic mechanical overhauls.
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewMode('COST_SAVINGS_ROI')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <span>Explore Cost Savings & ROI Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area: Either ROI Dashboard or Vehicles List Grid */}
      {viewMode === 'COST_SAVINGS_ROI' ? (
        <FleetMaintenanceRoiVisualization
          onReturnToScheduler={() => setViewMode('MAINTENANCE_SCHEDULER')}
          onScheduleService={(compName) => {
            setViewMode('MAINTENANCE_SCHEDULER');
            setActionSuccessMsg(`Preemptive depot bay allocated for ${compName}. Service window confirmed.`);
            setTimeout(() => setActionSuccessMsg(null), 4000);
          }}
        />
      ) : (
        /* Main Grid: List & Inspector Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredVehicles.map(v => {
            const isSelected = selectedVehicle?.id === v.id;
            const isLowFuel = v.fuelLevelPct < 30;
            const isCriticalZone = v.currentDemandZone === 'CRITICAL_SURGE';
            const isBreach = v.fatigueRiskStatus === 'REGULATORY_BREACH_RISK';
            const isFatigueWarning = v.fatigueRiskStatus === 'FATIGUE_WARNING';
            const isCriticalFailure = v.maintenancePriority === 'CRITICAL_FAILURE_RISK';
            const isModerateWear = v.maintenancePriority === 'MODERATE_WEAR';

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono text-xs space-y-3 ${
                  isSelected
                    ? viewMode === 'DIAGNOSTICS'
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-xl ring-1 ring-cyan-500/30'
                      : viewMode === 'DRIVER_STATUS'
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-xl ring-1 ring-amber-500/30'
                      : 'bg-purple-950/30 border-purple-500/60 shadow-xl ring-1 ring-purple-500/30'
                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      viewMode === 'DIAGNOSTICS'
                        ? isCriticalZone ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : viewMode === 'DRIVER_STATUS'
                        ? isBreach ? 'bg-red-500/20 text-red-400 border border-red-500/40' : isFatigueWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCriticalFailure ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : isModerateWear ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {viewMode === 'DIAGNOSTICS' ? <Bus className="w-4 h-4" /> : viewMode === 'DRIVER_STATUS' ? <UserCheck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-display font-bold text-white">
                        {viewMode === 'DIAGNOSTICS' ? v.registrationNumber : viewMode === 'DRIVER_STATUS' ? v.driverName : v.registrationNumber}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {viewMode === 'DIAGNOSTICS' ? v.model : viewMode === 'DRIVER_STATUS' ? `Coach: ${v.registrationNumber}` : `Component: ${v.predictedFailureComponent}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {viewMode === 'DIAGNOSTICS' ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        v.currentDemandZone === 'CRITICAL_SURGE'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {v.currentDemandZone.replace('_', ' ')}
                      </span>
                    ) : viewMode === 'DRIVER_STATUS' ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        v.fatigueRiskStatus === 'REGULATORY_BREACH_RISK'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                          : v.fatigueRiskStatus === 'FATIGUE_WARNING'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {v.fatigueRiskStatus.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        v.maintenancePriority === 'CRITICAL_FAILURE_RISK'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                          : v.maintenancePriority === 'MODERATE_WEAR'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}>
                        {v.maintenancePriority.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {viewMode === 'DIAGNOSTICS' ? (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Fuel Level</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Fuel className={`w-3.5 h-3.5 ${isLowFuel ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                        <span className={`font-bold ${isLowFuel ? 'text-red-400' : 'text-white'}`}>{v.fuelLevelPct}%</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Engine Temp</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Activity className={`w-3.5 h-3.5 ${v.engineTempC > 95 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
                        <span className="font-bold text-white">{v.engineTempC}°C</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Diagnostics</span>
                      <span className={`font-bold block truncate mt-0.5 ${
                        v.diagnosticsStatus === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {v.diagnosticsStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ) : viewMode === 'DRIVER_STATUS' ? (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Shift Elapsed</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Clock className={`w-3.5 h-3.5 ${v.shiftHoursElapsed >= 7.5 ? 'text-red-400 animate-pulse' : 'text-[#E7CB58]'}`} />
                        <span className={`font-bold ${v.shiftHoursElapsed >= 7.5 ? 'text-red-400' : 'text-white'}`}>{v.shiftHoursElapsed}h / 8.0h</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Continuous Drive</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Activity className={`w-3.5 h-3.5 ${v.continuousDrivingHours >= 4.0 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
                        <span className="font-bold text-white">{v.continuousDrivingHours}h / 4.5h</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Compliance</span>
                      <span className={`font-bold block truncate mt-0.5 ${
                        v.fatigueRiskStatus === 'COMPLIANT' ? 'text-emerald-400' : v.fatigueRiskStatus === 'FATIGUE_WARNING' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {v.fatigueRiskStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-gray-400 block text-[9px] uppercase">Failure Probability</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${v.failureProbabilityPct >= 75 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
                        <span className={`font-bold ${v.failureProbabilityPct >= 75 ? 'text-red-400' : 'text-white'}`}>{v.failureProbabilityPct}% Risk</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 col-span-2">
                      <span className="text-gray-400 block text-[9px] uppercase">Optimal Service Window</span>
                      <span className="font-bold text-purple-300 block truncate mt-0.5">{v.optimalServiceWindow}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#E7CB58]" />
                    <span>{v.corridor}</span>
                  </span>
                  <span className="text-purple-300 font-bold">
                    {viewMode === 'DIAGNOSTICS' ? `${v.dailyPaxServed} Pax Today` : viewMode === 'DRIVER_STATUS' ? `Rest: ${v.lastRestStop}` : `Status: ${v.scheduledServiceStatus}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Inspector Panel (5 Cols) */}
        {selectedVehicle && (
          <div className="lg:col-span-5 bg-black/60 border border-white/10 rounded-2xl p-5 space-y-5 font-mono text-xs flex flex-col justify-between">
            {viewMode === 'DIAGNOSTICS' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Vehicle Diagnostic Inspector</span>
                    <h3 className="text-base font-display font-bold text-white">{selectedVehicle.registrationNumber}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {selectedVehicle.hubName}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-gray-400 text-[10px] uppercase">Assigned Route Corridor</div>
                    <div className="text-white font-bold">{selectedVehicle.corridor}</div>
                    <div className="text-[10px] text-gray-400">Coach Model: {selectedVehicle.model}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Fuel Tank Capacity:</span>
                      <span className={`font-bold ${selectedVehicle.fuelLevelPct < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedVehicle.fuelLevelPct}% Remaining
                      </span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          selectedVehicle.fuelLevelPct < 30 ? 'bg-red-500' : selectedVehicle.fuelLevelPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedVehicle.fuelLevelPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                      <span>Electrical: <strong className="text-white">{selectedVehicle.batteryOrVoltage}</strong></span>
                      <span>Last Check: <strong className="text-white">{selectedVehicle.lastDiagnosticCheck}</strong></span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-red-500/10 to-transparent border border-orange-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase text-orange-400 font-bold">
                      <span className="flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Heatmap Demand Zone Linkage</span>
                      </span>
                      <span>{selectedVehicle.currentDemandZone.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-200 font-sans">
                      This unit is actively operating inside the <strong className="text-white">{selectedVehicle.hubName}</strong> catchment corridor, servicing high-density passenger loads ({selectedVehicle.dailyPaxServed} travelers today).
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold">Fleet Telemetry Dispatch Actions</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'REFUEL')}
                      className="py-2 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 transition-all text-center"
                    >
                      <Fuel className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
                      <span>Refuel Dispatch</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'MAINTENANCE')}
                      className="py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition-all text-center"
                    >
                      <Wrench className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                      <span>Service Engine</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'REROUTE')}
                      className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-all text-center"
                    >
                      <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
                      <span>Surge Reroute</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : viewMode === 'DRIVER_STATUS' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Driver Fatigue & Safety Inspector</span>
                    <h3 className="text-base font-display font-bold text-white">{selectedVehicle.driverName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                    selectedVehicle.fatigueRiskStatus === 'COMPLIANT'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedVehicle.fatigueRiskStatus === 'FATIGUE_WARNING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {selectedVehicle.fatigueRiskStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-gray-400 text-[10px] uppercase">Assigned Coach & ID</div>
                    <div className="text-white font-bold">{selectedVehicle.registrationNumber} ({selectedVehicle.driverId})</div>
                    <div className="text-[10px] text-gray-400">Route: {selectedVehicle.corridor}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Total Shift Elapsed (Max 8.0h):</span>
                      <span className={`font-bold ${selectedVehicle.shiftHoursElapsed >= 7.5 ? 'text-red-400' : 'text-[#E7CB58]'}`}>
                        {selectedVehicle.shiftHoursElapsed}h / 8.0h Limit
                      </span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          selectedVehicle.shiftHoursElapsed >= 7.5 ? 'bg-red-500' : selectedVehicle.shiftHoursElapsed >= 6.5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(selectedVehicle.shiftHoursElapsed / 8.0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Continuous Driving (Max 4.5h):</span>
                      <span className={`font-bold ${selectedVehicle.continuousDrivingHours >= 4.0 ? 'text-red-400' : 'text-cyan-400'}`}>
                        {selectedVehicle.continuousDrivingHours}h / 4.5h Limit
                      </span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          selectedVehicle.continuousDrivingHours >= 4.0 ? 'bg-red-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${(selectedVehicle.continuousDrivingHours / 4.5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] uppercase text-[#E7CB58] font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Federal Safety Regulation Compliance</span>
                    </div>
                    <p className="text-xs text-gray-200 font-sans">
                      Last mandatory rest stop recorded at <strong className="text-white">{selectedVehicle.lastRestStop}</strong>. Exceeding 8 hours shift or 4.5 hours continuous driving incurs OSHA safety penalties.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold">Fatigue Mitigation Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'RELIEF_DRIVER')}
                      className="py-2.5 px-3 rounded-xl bg-[#E7CB58]/20 hover:bg-[#E7CB58]/30 text-[#E7CB58] font-bold border border-[#E7CB58]/40 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#E7CB58]" />
                      <span>Dispatch Relief Driver</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'MANDATORY_REST')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enforce Rest Stop</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Automated Maintenance Scheduler</span>
                    <h3 className="text-base font-display font-bold text-white">{selectedVehicle.registrationNumber}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                    selectedVehicle.maintenancePriority === 'CRITICAL_FAILURE_RISK'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : selectedVehicle.maintenancePriority === 'MODERATE_WEAR'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {selectedVehicle.maintenancePriority.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-gray-400 text-[10px] uppercase">Predicted Component Failure Risk</div>
                    <div className="text-white font-bold text-sm">{selectedVehicle.predictedFailureComponent}</div>
                    <div className="text-[10px] text-purple-300 font-bold">Failure Probability: {selectedVehicle.failureProbabilityPct}% within 48h</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Optimal Service Window:</span>
                      <span className="font-bold text-[#E7CB58]">{selectedVehicle.optimalServiceWindow}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                      <span>Service Bay Status: <strong className="text-white">{selectedVehicle.scheduledServiceStatus}</strong></span>
                      <span>Assigned Hub: <strong className="text-white">{selectedVehicle.hubName}</strong></span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] uppercase text-purple-300 font-bold">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Ops Team High-Priority Task Flag</span>
                    </div>
                    <p className="text-xs text-gray-200 font-sans">
                      Telemetry data indicates accelerated wear on {selectedVehicle.predictedFailureComponent}. Immediate service scheduling prevents en-route breakdown during high-demand surges.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold">Predictive Maintenance Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'SCHEDULE_SERVICE')}
                      className="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                      <span>Schedule Tonight</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedVehicle.id, 'RESOLVE_PM')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      )}

    </div>
  );
};
