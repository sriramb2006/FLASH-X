import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Compass, Navigation, Clock, CheckCircle2, AlertTriangle, MapPin, Eye } from 'lucide-react';
import { api } from '../lib/api';

export const FamilyTrackPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSharedTrack() {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await api.getFamilyTrack(token);
        setData(res);
      } catch (err: any) {
        setErrorMsg('This shared travel monitor link has expired, was revoked by the traveler, or is invalid.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSharedTrack();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101114] flex items-center justify-center text-white">
        <div className="text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7CB58] border-t-transparent animate-spin mx-auto" />
          <span>Connecting to Family Travel Monitor™ Live Telemetry...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-display font-bold">Shared Tracking Link Inactive</h2>
        <p className="text-xs text-gray-400 max-w-sm mt-1">{errorMsg}</p>
        <Link to="/" className="mt-4 px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold">
          Return to FLASHX OS
        </Link>
      </div>
    );
  }

  const depDate = new Date(data.departureTime);
  const arrDate = new Date(data.arrivalTime);

  return (
    <div className="min-h-screen bg-[#101114] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Privacy Shield Header */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-mono">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-bold">Family Travel Monitor™ (Privacy Shield Active)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
            READ-ONLY VIEW
          </span>
        </div>

        {/* Tracking Card */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Traveler Corridor Status</span>
              <h2 className="text-2xl font-display font-bold text-white">
                {data.sourceCity} → {data.destCity}
              </h2>
              <div className="text-xs text-amber-300 font-mono mt-0.5">{data.busName} • {data.operatorName}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Reference</span>
              <span className="text-xs font-mono font-bold text-white">{data.bookingReference}</span>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-black/40 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Departure</span>
              <div className="text-base font-bold text-white">
                {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-gray-400 text-[11px] truncate mt-0.5">{data.boardingPoint}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase">Estimated Arrival</span>
              <div className="text-base font-bold text-white">
                {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-gray-400 text-[11px] truncate mt-0.5">{data.droppingPoint}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>Departed: {data.sourceCity}</span>
              <span className="text-emerald-400 font-semibold">Corridor Progress (45%)</span>
              <span>Destination: {data.destCity}</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-purple-500 to-[#E7CB58] w-[45%]" />
            </div>
          </div>

          {/* Verified Stop Milestones */}
          {data.stops && data.stops.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Corridor Route Milestones:
              </span>
              <div className="space-y-2 text-xs font-mono">
                {data.stops.map((stop: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#E7CB58]" />
                      <span className="text-white">{stop.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase">{stop.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Disclaimer */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400 flex items-start space-x-2">
            <Eye className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>
              Family Safety View: Passenger personal identification, payment instruments, and digital ticket QR codes are intentionally redacted to maintain security while traveling.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
