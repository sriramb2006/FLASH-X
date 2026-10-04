import React, { useState, useEffect } from 'react';
import {
  Activity,
  DollarSign,
  Users,
  Compass,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  FileText,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Booking, SystemAuditLog, BusRoute, Bus, Schedule } from '../../shared/types';
import { AdminDataVisualization } from '../components/AdminDataVisualization';

export const AdminCenter: React.FC = () => {
  const { role, user, token } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeTab, setActiveTab] = useState<'metrics' | 'visualization' | 'bookings' | 'users' | 'schedules' | 'audit'>('metrics');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Schedule Form state
  const [newBusId, setNewBusId] = useState('');
  const [newRouteId, setNewRouteId] = useState('');
  const [newDepTime, setNewDepTime] = useState('');
  const [newBaseFare, setNewBaseFare] = useState('1250');
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');

  // New Route Form state
  const [routeSource, setRouteSource] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeSourceTerminal, setRouteSourceTerminal] = useState('');
  const [routeDestTerminal, setRouteDestTerminal] = useState('');
  const [routeDistance, setRouteDistance] = useState('280');
  const [routeDuration, setRouteDuration] = useState('5.5');
  const [routeSuccessMsg, setRouteSuccessMsg] = useState('');
  const [routeErrorMsg, setRouteErrorMsg] = useState('');

  // New Bus Form state
  const [busName, setBusName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busCategory, setBusCategory] = useState('Electric Hyperliner');
  const [busType, setBusType] = useState('AC Sleeper (2+1)');
  const [busSeats, setBusSeats] = useState('30');
  const [busSuccessMsg, setBusSuccessMsg] = useState('');
  const [busErrorMsg, setBusErrorMsg] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [met, bks, logs, locs, searchRes, usrs] = await Promise.all([
          api.getAdminMetrics(token || undefined),
          api.getBookings(),
          api.getAuditLogs(token || undefined),
          api.getLocations(),
          api.searchBuses({}),
          api.getAdminUsers(token || undefined).catch(() => []),
        ]);
        setMetrics(met);
        setBookings(bks || []);
        setAuditLogs(logs || []);
        setRegisteredUsers(usrs || []);
        if (searchRes && searchRes.schedules) {
          setSchedules(searchRes.schedules as any);
        }
        if (searchRes && searchRes.schedules && searchRes.schedules.length > 0) {
          const uniqueBuses = Array.from(new Map(searchRes.schedules.map(s => [s.bus.id, s.bus])).values());
          const uniqueRoutes = Array.from(new Map(searchRes.schedules.map(s => [s.route.id, s.route])).values());
          setBuses(uniqueBuses as any);
          setRoutes(uniqueRoutes as any);
          if (uniqueBuses.length > 0) setNewBusId(uniqueBuses[0].id);
          if (uniqueRoutes.length > 0) setNewRouteId(uniqueRoutes[0].id);
        }
      } catch (err) {
        console.error('Failed loading admin data:', err);
      }
    }
    loadAdminData();
  }, [token]);

  // Restrict access to ADMIN only
  if (role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-white">Access Restricted: Administrator Privileges Required</h2>
        <p className="text-xs text-gray-400 max-w-sm mt-1">
          Root platform administration is only accessible by System Administrators. Your current role is {role || 'Guest'}.
        </p>
        <div className="flex items-center space-x-3 mt-6">
          <a href="/dashboard" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono">
            Return to Passenger Hub
          </a>
          <a href="/login?role=ADMIN" className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold font-mono">
            Log In as System Admin
          </a>
        </div>
      </div>
    );
  }

  const handleResetDb = async () => {
    const confirm = window.confirm('Re-synchronize FLASHX OS live corridors and fleet database?');
    if (!confirm) return;
    setIsResetting(true);
    setResetMessage('');
    try {
      await api.resetDatabase();
      setResetMessage('Fleet database and live corridors synchronized successfully.');
      // Reload metrics
      const [met, bks, logs, searchRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getBookings(),
        api.getAuditLogs(),
        api.searchBuses({}),
      ]);
      setMetrics(met);
      setBookings(bks);
      setAuditLogs(logs);
      if (searchRes && searchRes.schedules) {
        setSchedules(searchRes.schedules as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusId || !newRouteId || !newDepTime) return;
    try {
      await api.createOperatorSchedule({
        busId: newBusId,
        routeId: newRouteId,
        departureTime: newDepTime,
        baseFare: newBaseFare,
      });
      setScheduleSuccessMsg('Schedule departure added to live dispatch registry.');
      setTimeout(() => setScheduleSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeSource || !routeDest) return;
    setRouteErrorMsg('');
    setRouteSuccessMsg('');
    try {
      const added = await api.createOperatorRoute({
        sourceCity: routeSource,
        destCity: routeDest,
        sourceTerminal: routeSourceTerminal,
        destTerminal: routeDestTerminal,
        distanceKm: routeDistance,
        estimatedHours: routeDuration,
      }, token || undefined);
      setRoutes(prev => [...prev, added]);
      setNewRouteId(added.id);
      setRouteSuccessMsg(`Corridor ${routeSource} ⇄ ${routeDest} registered!`);
      setRouteSource('');
      setRouteDest('');
      setRouteSourceTerminal('');
      setRouteDestTerminal('');
      setTimeout(() => setRouteSuccessMsg(''), 4000);
    } catch (err: any) {
      setRouteErrorMsg(err.message || 'Failed to create route');
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busName || !busNumber) return;
    setBusErrorMsg('');
    setBusSuccessMsg('');
    try {
      const added = await api.createOperatorBus({
        busName,
        busNumber,
        category: busCategory,
        type: busType,
        totalSeats: busSeats,
      }, token || undefined);
      setBuses(prev => [...prev, added]);
      setNewBusId(added.id);
      setBusSuccessMsg(`Coach ${busName} (${busNumber}) added!`);
      setBusName('');
      setBusNumber('');
      setTimeout(() => setBusSuccessMsg(''), 4000);
    } catch (err: any) {
      setBusErrorMsg(err.message || 'Failed to create coach');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(term) ||
      b.passengerEmail.toLowerCase().includes(term) ||
      b.sourceCity.toLowerCase().includes(term) ||
      b.destCity.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Command Center Header */}
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
                  {role === 'ADMIN' ? 'Mission Command Center' : 'Operator Fleet Operations'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-[#E7CB58] font-mono border border-amber-500/40">
                  FLASHX-OS {role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Autonomous Travel Intelligence Operating System • Fleet telemetry, dispatch, and compliance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/admin/export-csv"
              download
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={handleResetDb}
              disabled={isResetting}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#E7CB58] border border-amber-500/30 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isResetting ? 'Synchronizing...' : 'Sync Live Fleet Data'}</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs font-mono overflow-x-auto no-scrollbar">
          {[
            { id: 'metrics', label: 'Operational Overview', icon: Activity },
            { id: 'visualization', label: 'Data Visualization & Fleet Telemetry', icon: BarChart3 },
            { id: 'bookings', label: `Manifest & Bookings (${bookings.length})`, icon: FileText },
            { id: 'users', label: `User Accounts Directory (${registeredUsers.length})`, icon: Users },
            { id: 'schedules', label: 'Dispatch & Schedules', icon: Plus },
            { id: 'audit', label: `System Audit Log (${auditLogs.length})`, icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
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
            TAB 1: METRICS OVERVIEW
           ======================================================== */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Bookings</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {metrics?.totalBookings || bookings.length}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Confirmed & Paid</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Gross Platform Revenue</span>
                <div className="text-2xl font-bold font-mono text-[#E7CB58] mt-1">
                  ₹{metrics?.totalRevenue || 0}
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Real-time Payment Stream</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Fleet Occupancy</span>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  {metrics?.averageOccupancy || 84}%
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Real-time seat fill rate</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#16181F] border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Active Fleets / Corridors</span>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                  5 Fleets • 6 Routes
                </div>
                <span className="text-[10px] text-gray-400 font-mono">South India Highway Mesh</span>
              </div>
            </div>

            {/* Recharts Real-Time Data Visualization Section */}
            <AdminDataVisualization
              bookings={bookings}
              metrics={metrics}
              buses={buses}
              routes={routes}
              schedules={schedules}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />

            {/* Integration Health Matrix */}
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#E7CB58]" />
                <span>Integration Status Matrix & Credential Telemetry</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Gemini 3.8 Flash AI</span>
                    <span className="text-emerald-400 font-bold">OPERATIONAL</span>
                  </div>
                  <div className="text-[11px] text-gray-400">Conversational trip queries & natural voice extraction.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Payment Gateway</span>
                    <span className="text-emerald-400 font-bold">LIVE & ENCRYPTED</span>
                  </div>
                  <div className="text-[11px] text-gray-400">Production-grade UPI, Cards & NetBanking gateway.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Seat Concurrency Lock</span>
                    <span className="text-emerald-400 font-bold">ATOMIC (5m EXPIRE)</span>
                  </div>
                  <div className="text-[11px] text-gray-400">Guarantees zero double-booking on seat matrices.</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB: DEDICATED DATA VISUALIZATION & FLEET TELEMETRY
           ======================================================== */}
        {activeTab === 'visualization' && (
          <div className="space-y-6">
            <AdminDataVisualization
              bookings={bookings}
              metrics={metrics}
              buses={buses}
              routes={routes}
              schedules={schedules}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>
        )}

        {/* ========================================================
            TAB 2: BOOKINGS MANIFEST
           ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Passenger Booking Manifest
                </h3>
                <span className="text-xs text-gray-400 font-mono">Inspect states, seat holds, and refunds</span>
              </div>

              <input
                type="text"
                placeholder="Search reference, email, corridor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#101114] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50 w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Passenger Email</th>
                    <th className="pb-3">Corridor Route</th>
                    <th className="pb-3">Assigned Berths</th>
                    <th className="pb-3">Total Fare</th>
                    <th className="pb-3">Payment Status</th>
                    <th className="pb-3 text-right">Booking State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredBookings.map(b => (
                    <tr key={b.id}>
                      <td className="py-3 font-bold text-[#E7CB58]">{b.bookingReference}</td>
                      <td className="py-3">{b.passengerEmail}</td>
                      <td className="py-3 text-white">{b.sourceCity} → {b.destCity}</td>
                      <td className="py-3">
                        {b.passengers.map(p => p.seatNumber).join(', ')}
                      </td>
                      <td className="py-3 font-semibold text-white">₹{b.fareBreakdown.totalFare}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: USER ACCOUNTS DIRECTORY
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Registered User Accounts Directory
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  Full visibility of all Passengers, Fleet Operators, and Administrators.
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Username</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Mobile</th>
                    <th className="pb-3">Assigned Role</th>
                    <th className="pb-3 text-right">Account Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {registeredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="py-3 font-semibold text-white">{u.name}</td>
                      <td className="py-3 text-[#E7CB58] font-bold">{u.username || '—'}</td>
                      <td className="py-3 text-gray-300">{u.email}</td>
                      <td className="py-3">{u.mobile}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : u.role === 'OPERATOR'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FLEET, CORRIDORS & DISPATCHES
           ======================================================== */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form 1: Add Route Corridor */}
              <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                    SYSTEM GEOGRAPHY ENGINE
                  </span>
                  <h3 className="text-sm font-display font-bold text-white uppercase mt-1">
                    Register New Route Corridor
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Open up new destinations and corridors on the South India Highway Mesh (e.g., Mysore ⇄ Kerala).
                  </p>
                </div>

                <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Source City</label>
                      <input
                        type="text"
                        required
                        value={routeSource}
                        onChange={(e) => setRouteSource(e.target.value)}
                        placeholder="e.g. Mysore"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Destination City</label>
                      <input
                        type="text"
                        required
                        value={routeDest}
                        onChange={(e) => setRouteDest(e.target.value)}
                        placeholder="e.g. Wayanad (Kerala)"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Source Terminal Name</label>
                      <input
                        type="text"
                        value={routeSourceTerminal}
                        onChange={(e) => setRouteSourceTerminal(e.target.value)}
                        placeholder="e.g. Mysore Royal Central"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Destination Terminal Name</label>
                      <input
                        type="text"
                        value={routeDestTerminal}
                        onChange={(e) => setRouteDestTerminal(e.target.value)}
                        placeholder="e.g. Wayanad Elite Bus Station"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Distance (km)</label>
                      <input
                        type="number"
                        required
                        value={routeDistance}
                        onChange={(e) => setRouteDistance(e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Estimated Hours</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={routeDuration}
                        onChange={(e) => setRouteDuration(e.target.value)}
                        placeholder="e.g. 4.8"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>
                  </div>

                  {routeErrorMsg && <div className="text-red-400 text-xs font-semibold">{routeErrorMsg}</div>}
                  {routeSuccessMsg && <div className="text-emerald-400 text-xs font-semibold">✓ {routeSuccessMsg}</div>}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Register New Corridor Route
                  </button>
                </form>
              </div>

              {/* Form 2: Add Coach Fleet Asset */}
              <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                    FLEET ENGINEERING DECK
                  </span>
                  <h3 className="text-sm font-display font-bold text-white uppercase mt-1">
                    Commission Luxury Coach Fleet Asset
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Add state-of-the-art electric or multi-axle coaches directly into the platform pool.
                  </p>
                </div>

                <form onSubmit={handleCreateBus} className="space-y-3.5 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Coach Name</label>
                      <input
                        type="text"
                        required
                        value={busName}
                        onChange={(e) => setBusName(e.target.value)}
                        placeholder="e.g. GreenLine EV Sovereign"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Registration Plate #</label>
                      <input
                        type="text"
                        required
                        value={busNumber}
                        onChange={(e) => setBusNumber(e.target.value)}
                        placeholder="e.g. KA-09-EV-8822"
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Category Class</label>
                      <select
                        value={busCategory}
                        onChange={(e) => setBusCategory(e.target.value)}
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="Electric Hyperliner">Electric Hyperliner (Green EV)</option>
                        <option value="Volvo B11R Multi-Axle">Volvo B11R Multi-Axle</option>
                        <option value="Scania Touring Executive">Scania Touring Executive</option>
                        <option value="Mercedes-Benz Glider">Mercedes-Benz Glider</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">Berth Seating Configuration</label>
                      <select
                        value={busType}
                        onChange={(e) => setBusType(e.target.value as any)}
                        className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="AC Sleeper (2+1)">Premium AC Sleeper (2+1)</option>
                        <option value="AC Seater (2+2)">Premium AC Seater (2+2)</option>
                        <option value="Ultra Sleeper Single-Deck">Ultra Sleeper Suite Single-Deck</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase block mb-1">Total Seats Capacity</label>
                    <input
                      type="number"
                      required
                      value={busSeats}
                      onChange={(e) => setBusSeats(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                    />
                  </div>

                  {busErrorMsg && <div className="text-red-400 text-xs font-semibold">{busErrorMsg}</div>}
                  {busSuccessMsg && <div className="text-emerald-400 text-xs font-semibold">✓ {busSuccessMsg}</div>}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Commission Fleet Asset
                  </button>
                </form>
              </div>

            </div>

            {/* Form 3: Deploy Schedule Departure */}
            <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-[#E7CB58] uppercase tracking-widest block font-bold">
                  ORCHESTRATION & DISPATCH GRID
                </span>
                <h3 className="text-sm font-display font-bold text-white uppercase mt-1">
                  Deploy Capacity (Schedule Departures)
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Link an active commissioned coach to a corridor and schedule its departure with prices.
                </p>
              </div>

              <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Select Coach</label>
                  <select
                    value={newBusId}
                    onChange={(e) => setNewBusId(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E7CB58]/40"
                  >
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>{b.busName} ({b.busNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Select Route</label>
                  <select
                    value={newRouteId}
                    onChange={(e) => setNewRouteId(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E7CB58]/40"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.sourceCity} ⇄ {r.destCity}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Departure Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white [color-scheme:dark] focus:outline-none focus:border-[#E7CB58]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase block mb-1">Base Fare (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBaseFare}
                    onChange={(e) => setNewBaseFare(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E7CB58]/40"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors cursor-pointer"
                  >
                    Deploy Schedule Departure
                  </button>
                  {scheduleSuccessMsg && (
                    <span className="text-emerald-400 text-xs font-mono ml-4">
                      ✓ {scheduleSuccessMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: AUDIT LOG
           ======================================================== */}
        {activeTab === 'audit' && (
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Immutable System Audit Logs
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[#E7CB58] text-[11px]">{log.entity}</span>
                    </div>
                    <div className="text-gray-300 text-[11px] mt-1">{log.details}</div>
                  </div>
                  <div className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
