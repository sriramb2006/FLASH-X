import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Plus,
  Compass,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Filter,
  Layers,
  Wrench,
  Radio,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Bus, Schedule, BusRoute } from '../../shared/types';

export const OperatorCenter: React.FC = () => {
  const { user, role, token } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<any>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [manifests, setManifests] = useState<Record<string, any[]>>({});
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'buses' | 'schedules' | 'manifest' | 'addBus'>('buses');
  const [isLoading, setIsLoading] = useState(true);

  // New Bus Form state
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newBusName, setNewBusName] = useState('');
  const [newCategory, setNewCategory] = useState('Electric Hyperliner');
  const [newType, setNewType] = useState<'AC Sleeper (2+1)' | 'AC Seater (2+2)'>('AC Sleeper (2+1)');
  const [newSeats, setNewSeats] = useState(30);
  const [newDeckCount, setNewDeckCount] = useState<1 | 2>(2);
  const [addBusSuccess, setAddBusSuccess] = useState('');

  // Dispatch schedule form state
  const [dispatchBusId, setDispatchBusId] = useState('');
  const [dispatchRouteId, setDispatchRouteId] = useState('');
  const [dispatchDepTime, setDispatchDepTime] = useState('');
  const [dispatchBaseFare, setDispatchBaseFare] = useState('1300');
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [opData, searchRes] = await Promise.all([
          api.getOperatorOverview(token || undefined),
          api.searchBuses({}),
        ]);
        setOverview(opData);
        setBuses(opData.buses || []);
        setSchedules(opData.schedules || []);
        setManifests(opData.manifests || {});
        if (opData.schedules && opData.schedules.length > 0) {
          setSelectedScheduleId(opData.schedules[0].id);
        }
        if (searchRes.schedules.length > 0) {
          const uniqueRoutes = Array.from(new Map(searchRes.schedules.map(s => [s.route.id, s.route])).values());
          setRoutes(uniqueRoutes as any);
          if (uniqueRoutes.length > 0) setDispatchRouteId(uniqueRoutes[0].id);
        }
        if (opData.buses && opData.buses.length > 0) {
          setDispatchBusId(opData.buses[0].id);
        }
      } catch (err) {
        console.error('Failed loading operator overview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Access guard for passenger role
  if (role === 'PASSENGER') {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-white">Access Restricted: Operator Role Required</h2>
        <p className="text-xs text-gray-400 max-w-sm mt-1">
          You are currently signed in as a Passenger. Fleet dispatch and coach configuration require Fleet Operator or System Admin credentials.
        </p>
        <div className="flex items-center space-x-3 mt-6">
          <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono">
            Return to Passenger Hub
          </Link>
          <Link to="/login?role=OPERATOR" className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold font-mono">
            Log In as Operator
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddBusSuccess('');
    try {
      const created = await api.createOperatorBus({
        busNumber: newBusNumber,
        busName: newBusName,
        category: newCategory,
        type: newType,
        totalSeats: newSeats,
        deckCount: newDeckCount,
      }, token || undefined);

      setBuses(prev => [...prev, created]);
      setAddBusSuccess(`Coach ${created.busNumber} (${created.busName}) added to fleet registry.`);
      setNewBusNumber('');
      setNewBusName('');
      setTimeout(() => setAddBusSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add coach');
    }
  };

  const handleToggleBusStatus = async (bus: Bus) => {
    try {
      const updated = await api.updateOperatorBus(bus.id, { isActive: !bus.isActive }, token || undefined);
      setBuses(buses.map(b => (b.id === bus.id ? { ...b, isActive: updated.bus.isActive } : b)));
    } catch (err: any) {
      alert(err.message || 'Failed updating status');
    }
  };

  const handleDispatchSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchBusId || !dispatchRouteId || !dispatchDepTime) return;
    try {
      await api.createOperatorSchedule({
        busId: dispatchBusId,
        routeId: dispatchRouteId,
        departureTime: dispatchDepTime,
        baseFare: dispatchBaseFare,
      });
      setDispatchSuccess('Departure schedule deployed to live passenger booking inventory.');
      setTimeout(() => setDispatchSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedManifest = manifests[selectedScheduleId] || [];
  const selectedScheduleObj = schedules.find(s => s.id === selectedScheduleId);

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-black border border-amber-500/40 p-0.5 overflow-hidden shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <img
                src="/flashx_os_logo.jpg"
                alt="FLASHX OS Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Fleet Operator Command
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-[#E7CB58] font-mono border border-amber-500/40">
                  FLASHX-OS FLEET
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Autonomous Travel Intelligence Operating System • Authorized fleet maintenance and dispatch.
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-gray-400">
            <div>Signed in: <b className="text-white">{user?.name}</b></div>
            <div className="text-[10px] text-gray-500">Fleet ID: op-flashx-sovereign</div>
          </div>
        </div>

        {/* Fleet Metrics Strip (Only bus & schedule stats, no admin revenue) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Assigned Coaches</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {buses.length} Coaches
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {buses.filter(b => b.isActive).length} Operational
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Fleet Capacity</span>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
              {buses.reduce((sum, b) => sum + b.totalSeats, 0)} Berths
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Across 2-deck fleet</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Active Dispatches</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {schedules.length} Departures
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Scheduled intercity runs</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Depot Maintenance</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {buses.filter(b => !b.isActive).length} Coaches
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Scheduled inspection</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs font-mono">
          {[
            { id: 'buses', label: `Fleet Coaches (${buses.length})`, icon: Layers },
            { id: 'schedules', label: `Deploy Departures (${schedules.length})`, icon: Plus },
            { id: 'manifest', label: 'Seat Manifest Inspector', icon: Users },
            { id: 'addBus', label: '+ Add Coach to Fleet', icon: Wrench },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  isSel
                    ? 'bg-[#E7CB58] text-black font-bold shadow-lg shadow-amber-500/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: FLEET COACHES LIST
           ======================================================== */}
        {activeTab === 'buses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Authorized Fleet Inventory
              </h3>
              <button
                onClick={() => setActiveTab('addBus')}
                className="px-3 py-1.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs flex items-center space-x-1 font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Coach</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buses.map(bus => (
                <div
                  key={bus.id}
                  className="bg-[#16181F] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block">{bus.busNumber}</span>
                      <h4 className="text-base font-display font-bold text-white">{bus.busName}</h4>
                      <span className="text-xs text-[#E7CB58] font-mono">{bus.category}</span>
                    </div>

                    <button
                      onClick={() => handleToggleBusStatus(bus)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-full font-bold transition-colors ${
                        bus.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {bus.isActive ? 'OPERATIONAL' : 'IN DEPOT'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Configuration</span>
                      <span className="text-white">{bus.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Capacity</span>
                      <span className="text-white">{bus.totalSeats} Berths ({bus.deckCount} Decks)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Equipment & Amenities:</span>
                    <div className="flex flex-wrap gap-1">
                      {bus.amenities.map((am, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: DEPLOY DEPARTURES
           ======================================================== */}
        {activeTab === 'schedules' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Deploy Schedule Departure
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Assign a coach to an active intercity corridor with fare and departure timing.
              </p>
            </div>

            <form onSubmit={handleDispatchSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Select Coach</label>
                <select
                  value={dispatchBusId}
                  onChange={(e) => setDispatchBusId(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.busName} ({b.busNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Corridor Route</label>
                <select
                  value={dispatchRouteId}
                  onChange={(e) => setDispatchRouteId(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.sourceCity} ⇄ {r.destCity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={dispatchDepTime}
                  onChange={(e) => setDispatchDepTime(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Base Fare (₹)</label>
                <input
                  type="number"
                  required
                  value={dispatchBaseFare}
                  onChange={(e) => setDispatchBaseFare(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors"
                >
                  Deploy Schedule Run
                </button>
                {dispatchSuccess && (
                  <span className="text-emerald-400 text-xs font-mono ml-4">
                    ✓ {dispatchSuccess}
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: PASSENGER MANIFEST INSPECTOR
           ======================================================== */}
        {activeTab === 'manifest' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Passenger Seat Manifest Inspector
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Select an active departure to view assigned passengers and boarding points.
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.route.sourceCity} → {s.route.destCity} • {new Date(s.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(s.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.bus.busName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedScheduleObj && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Assigned Coach</span>
                  <div className="font-bold text-white">{selectedScheduleObj.bus.busName} ({selectedScheduleObj.bus.busNumber})</div>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Occupancy</span>
                  <div className="text-[#E7CB58] font-bold">
                    {selectedManifest.length} / {selectedScheduleObj.bus.totalSeats} Berths Reserved
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Departure</span>
                  <div className="text-emerald-400 font-bold">
                    {new Date(selectedScheduleObj.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}

            {selectedManifest.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-black/20 text-gray-400 text-xs font-mono">
                No booked passengers on this departure yet. Available berths are listed in the live search inventory.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                      <th className="pb-3">Berth #</th>
                      <th className="pb-3">Passenger Name</th>
                      <th className="pb-3">Age / Gender</th>
                      <th className="pb-3">Boarding Stop</th>
                      <th className="pb-3">Reference</th>
                      <th className="pb-3 text-right">Mobile Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {selectedManifest.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-[#E7CB58]">{item.seatNumber}</td>
                        <td className="py-2.5 text-white font-semibold">{item.passengerName}</td>
                        <td className="py-2.5 capitalize">{item.age} yrs • {item.gender}</td>
                        <td className="py-2.5 text-cyan-300">{item.boardingPoint}</td>
                        <td className="py-2.5 text-gray-400">{item.bookingReference}</td>
                        <td className="py-2.5 text-right text-gray-300">{item.contactMobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: ADD COACH TO FLEET
           ======================================================== */}
        {activeTab === 'addBus' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Register New Coach into Fleet
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Configure bus chassis specifications, deck count, and berth layout.
              </p>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN-38-FX-9988"
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Coach Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Glider EV 3.0"
                    value={newBusName}
                    onChange={(e) => setNewBusName(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Electric Hyperliner">Electric Hyperliner</option>
                    <option value="Volvo Multi-Axle B11R">Volvo Multi-Axle B11R</option>
                    <option value="IntrCity SmartBus AC">IntrCity SmartBus AC</option>
                    <option value="Scania Metrolink HD">Scania Metrolink HD</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Layout Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                    <option value="AC Seater (2+2)">AC Seater (2+2)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Total Seats / Decks</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={newSeats}
                      onChange={(e) => setNewSeats(parseInt(e.target.value, 10))}
                      className="w-1/2 bg-[#101114] border border-white/10 rounded-xl px-2 py-2 text-white"
                    />
                    <select
                      value={newDeckCount}
                      onChange={(e) => setNewDeckCount(parseInt(e.target.value, 10) as any)}
                      className="w-1/2 bg-[#101114] border border-white/10 rounded-xl px-2 py-2 text-white"
                    >
                      <option value={1}>1 Deck</option>
                      <option value={2}>2 Decks</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors"
              >
                Register Coach to Fleet
              </button>

              {addBusSuccess && (
                <span className="text-emerald-400 text-xs font-mono ml-4">
                  ✓ {addBusSuccess}
                </span>
              )}
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
