import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Navigation, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { role } = useAuth();
  return (
    <footer className="bg-[#0C0D10] border-t border-white/10 text-gray-400 text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/40 p-0.5 overflow-hidden shadow-lg shadow-amber-500/10 flex items-center justify-center shrink-0">
                <img
                  src="/flashx_os_logo.jpg"
                  alt="FLASH-X Logo"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-bold text-white text-base tracking-wider">FLASH-X</span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Autonomous Travel Intelligence</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Autonomous Travel Intelligence Platform for intercity passenger mobility, dynamic predictive yields, and autonomous fleet routing.
            </p>
            <div className="pt-2 text-[11px] text-[#E7CB58] font-mono font-medium">
              "Beyond Booking. Beyond Navigation. Beyond Travel."
            </div>
          </div>

          {/* Connected Modules */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">Intelligence Engine</h4>
            <ul className="space-y-2">
              <li><Link to="/intelligence" className="hover:text-amber-300 transition-colors">FlashMind — Predictive Itineraries</Link></li>
              <li><Link to="/safety" className="hover:text-pink-300 transition-colors">FlashGuardian — Risk & SOS Shield</Link></li>
              <li><Link to="/dashboard" className="hover:text-purple-300 transition-colors">FlashDNA — Traveler Preferences</Link></li>
              <li><Link to="/search" className="hover:text-cyan-300 transition-colors">FlashRoute — Multi-Leg Transfers</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-300 transition-colors">FlashTimeline — Milestone Schedule</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-300 transition-colors">FlashReplay — Journey Memory & CO2</Link></li>
            </ul>
          </div>

          {/* Active Corridors */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">Key Corridors</h4>
            <ul className="space-y-2">
              <li><Link to="/search?source=Coimbatore&destination=Bengaluru" className="hover:text-white transition-colors">Coimbatore ⇄ Bengaluru (NH544)</Link></li>
              <li><Link to="/search?source=Bengaluru&destination=Chennai" className="hover:text-white transition-colors">Bengaluru ⇄ Chennai (NH48)</Link></li>
              <li><Link to="/search?source=Chennai&destination=Madurai" className="hover:text-white transition-colors">Chennai ⇄ Madurai (NH45)</Link></li>
              <li><Link to="/search?source=Coimbatore&destination=Kochi" className="hover:text-white transition-colors">Coimbatore ⇄ Kochi (Palakkad Gap)</Link></li>
              <li><Link to="/search?source=Bengaluru&destination=Hyderabad" className="hover:text-white transition-colors">Bengaluru ⇄ Hyderabad (NH44 Express)</Link></li>
            </ul>
          </div>

          {/* Operations & Integrity */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">System Integrity</h4>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE TELEMETRY STREAM ACTIVE</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Real-time Indian interstate coach telemetry, GPS sync, automated bay scheduling, and predictive Gemini AI routing.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-3 text-xs">
              {role === 'ADMIN' ? (
                <Link to="/admin" className="text-cyan-400 hover:text-cyan-300 font-mono underline">
                  Admin Command Telemetry & Audit
                </Link>
              ) : role === 'OPERATOR' ? (
                <Link to="/operator" className="text-purple-400 hover:text-purple-300 font-mono underline">
                  Fleet Operations Telemetry
                </Link>
              ) : (
                <Link to="/safety" className="text-gray-400 hover:text-white font-mono underline">
                  Safety & Fleet Protocols
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-[11px]">
          <div>
            © 2026 FLASH-X Mobility Architecture. Beyond Booking. Beyond Navigation. Beyond Travel.
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono">
            <span>PCI-DSS ENCRYPTED</span>
            <span>•</span>
            <span>WOMEN SAFETY SHIELD ACTIVE</span>
            <span>•</span>
            <span>CONCURRENCY-SAFE INVENTORY</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
