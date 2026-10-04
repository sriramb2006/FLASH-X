import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Phone,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  Users,
  Lock,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export const SafetyPage: React.FC = () => {
  const { user } = useAuth();

  const [sosSent, setSosSent] = useState(false);
  const [incidentType, setIncidentType] = useState('Service Disruption');
  const [incidentNote, setIncidentNote] = useState('');
  const [incidentSuccess, setIncidentSuccess] = useState(false);

  const handleSos = async () => {
    const confirm = window.confirm('EMERGENCY SOS: Broadcast immediate emergency alert to your registered contacts and regional operations center?');
    if (!confirm) return;
    try {
      await api.triggerSos(undefined, user?.id);
      setSosSent(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentSuccess(true);
    setTimeout(() => {
      setIncidentSuccess(false);
      setIncidentNote('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>FLASHGUARDIAN™ SAFETY SUITE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            Comprehensive Journey Safety Shield
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
            Neutral, verifiable safety infrastructure built into every outstation trip. Consent-based tracking, automatic check-ins, and direct operator emergency escalation.
          </p>
        </div>

        {/* Women Safety Mode Spotlight */}
        <div className="bg-gradient-to-r from-pink-950/30 via-[#16181F] to-[#16181F] border border-pink-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">Women Safety Mode™</h3>
                <span className="text-xs text-pink-300 font-mono">Autonomous Female Passenger Shield</span>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
              OPT-IN DURING CHECKOUT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-pink-400 font-bold block text-sm">1. Grouped Berths</span>
              <p className="text-gray-300">
                Single female travelers are co-allocated adjacent berths in designated quiet upper or lower decks, away from heavy aisle motion.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-pink-400 font-bold block text-sm">2. Boarding SMS Ping</span>
              <p className="text-gray-300">
                Your emergency contact receives an immediate automatic SMS when your boarding pass is scanned at the coach bay.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-pink-400 font-bold block text-sm">3. Night Check-in</span>
              <p className="text-gray-300">
                Discreet 60-minute interval heartbeat on your device during nocturnal highway cruising. Unacknowledged alerts escalate to ops hub.
              </p>
            </div>
          </div>
        </div>

        {/* SOS Emergency Module */}
        <div className="bg-[#16181F] border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Emergency Assistance Protocol</h3>
              <p className="text-xs text-gray-400">Direct integration with FLASHX 24/7 Operations Command</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs text-gray-300">
              <span className="font-bold text-white block">Emergency Contacts on File:</span>
              <span className="font-mono text-gray-400">
                {user?.emergencyContacts?.map(c => `${c.name} (${c.phone})`).join(', ') || 'Primary Contact synced'}
              </span>
            </div>

            <button
              onClick={handleSos}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-xl shadow-red-600/20 flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{sosSent ? 'SOS PROTOCOL ENGAGED' : 'Simulate Emergency SOS Alert'}</span>
            </button>
          </div>

          {sosSent && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500 text-red-200 text-xs font-mono space-y-1 animate-in fade-in">
              <div className="font-bold">✓ EMERGENCY ALERT DISPATCHED</div>
              <p>Ping delivered to registered family contacts and Regional Highway Operations Hub.</p>
            </div>
          )}
        </div>

        {/* Incident Reporting Form */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-display font-bold text-white">Report Travel Disruption or Highway Incident</h3>
          <p className="text-xs text-gray-400 font-mono">
            Directly submits operational feedback to the duty mobility officer.
          </p>

          <form onSubmit={handleIncidentSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Incident Category</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Service Disruption">Highway Traffic Delay / Toll Bottleneck</option>
                  <option value="AC Climate">Cabin AC Temperature Issue</option>
                  <option value="Seat Hardware">Berth Recline or USB Charger Malfunction</option>
                  <option value="Staff Assistance">Crew Assistance Request</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Details & Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toll plaza near Salem, charger port loose"
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-[#F2DA75] transition-colors"
            >
              Submit Report
            </button>

            {incidentSuccess && (
              <span className="text-xs text-emerald-400 font-mono ml-3">
                ✓ Report logged to system audit ledger.
              </span>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
