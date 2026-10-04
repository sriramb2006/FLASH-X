import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Shield,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  AlertCircle,
  Clock,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';
import { InsuranceToggle } from '../components/InsuranceToggle';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Schedule, BookingPassenger } from '../../shared/types';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, sessionToken } = useAuth();

  const scheduleId = searchParams.get('scheduleId') || '';
  const seatNums = (searchParams.get('seats') || '').split(',').filter(Boolean);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  
  // Passenger inputs
  const [passengers, setPassengers] = useState<BookingPassenger[]>(() => {
    return seatNums.map((seatNum, idx) => ({
      name: idx === 0 ? (user?.name || '') : `Passenger ${idx + 1}`,
      age: idx === 0 ? 28 : 25,
      gender: 'male',
      seatNumber: seatNum,
      seatId: `${scheduleId}-${seatNum}`,
    }));
  });

  const [passengerEmail, setPassengerEmail] = useState(user?.email || '');
  const [passengerMobile, setPassengerMobile] = useState(user?.mobile || '');
  const [womenSafetyOptIn, setWomenSafetyOptIn] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const initialPromo = searchParams.get('promo') || 'FLASHX2026';
  const [promoInput, setPromoInput] = useState(initialPromo);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'gateway'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSchedule() {
      if (!scheduleId) return;
      try {
        const res = await api.searchBuses({});
        const target = res.schedules.find(s => s.id === scheduleId);
        if (target) {
          setSchedule(target);
          if (target.route.stops.length > 0) {
            setBoardingPoint(target.route.stops[0].name);
            setDroppingPoint(target.route.stops[target.route.stops.length - 1].name);
          }
        }
      } catch (err) {
        console.error('Failed to load schedule for checkout:', err);
      }
    }
    loadSchedule();
  }, [scheduleId]);

  // Fare calculations
  const baseFareTotal = (schedule?.baseFare || 1200) * seatNums.length;
  const taxesGst = Math.round(baseFareTotal * 0.05);
  const platformFee = 25;
  const insurancePremium = insuranceSelected ? Math.round(baseFareTotal * 0.05) : 0;
  let discount = 0;
  if (appliedPromo.startsWith('FXMILES300')) discount = 300;
  else if (appliedPromo.startsWith('FXFREETRIP')) discount = 1500;
  else if (appliedPromo.startsWith('FXFOODBOX')) discount = 200;
  else if (appliedPromo.startsWith('FXMILES150') || appliedPromo.startsWith('FXWELCOME150')) discount = 150;
  else if (appliedPromo.startsWith('FXZEROCANCEL')) discount = 100;
  else if (appliedPromo === 'FLASHX2026') discount = 150;
  else if (appliedPromo === 'EARLYBIRD') discount = 100;
  else if (appliedPromo === 'FIRSTTRIP') discount = 200;
  else if (appliedPromo.startsWith('FX')) discount = 150;

  const totalPayable = Math.max(0, baseFareTotal + taxesGst + platformFee + insurancePremium - discount);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (
      ['FLASHX2026', 'EARLYBIRD', 'FIRSTTRIP'].includes(code) ||
      code.startsWith('FX') ||
      code.startsWith('FXMILES') ||
      code.startsWith('FXWELCOME')
    ) {
      setAppliedPromo(code);
    } else {
      setPromoError('Invalid coupon code. Try FLASHX2026, FXMILES150 or redeem in Loyalty Hub.');
    }
  };

  const handleConfirmPaymentAndBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passengers.some(p => !p.name.trim())) {
      setErrorMsg('Please enter name for all passengers.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const payload = {
        userId: user?.id || (passengerEmail ? `usr-${passengerEmail.replace(/[^a-zA-Z0-9]/g, '')}` : 'usr-traveler'),
        passengerEmail,
        passengerMobile,
        scheduleId,
        passengers,
        boardingPoint,
        droppingPoint,
        sessionToken,
        promoCode: appliedPromo || undefined,
        womenSafetyOptIn,
        insuranceOptIn: insuranceSelected,
        paymentMethod: paymentMethod === 'upi' ? 'FLASHX Instant UPI Gateway' : 'Encrypted PCI Cards / Netbanking',
      };

      const res = await api.checkoutBooking(payload);
      if (res.success && res.booking) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E7CB58', '#8B5CF6', '#06B6D4'],
        });

        setTimeout(() => {
          navigate(`/tickets/${res.booking.id}`);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment or seat reservation failed. Please check seat status.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Step indicator header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seat Map</span>
          </button>
          
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <span className="text-[#E7CB58] font-bold">1. Seats Locked</span>
            <span>→</span>
            <span className="text-[#E7CB58] font-bold">2. Traveler Details</span>
            <span>→</span>
            <span>3. Digital Ticket</span>
          </div>
        </div>

        {/* Coach Summary Banner */}
        {schedule && (
          <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-gray-400">{schedule.bus.operatorName}</div>
              <h2 className="text-lg font-display font-bold text-white">{schedule.bus.busName}</h2>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                {schedule.route.sourceCity} → {schedule.route.destCity} • {new Date(schedule.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-gray-400">Berths:</span>
              {seatNums.map(n => (
                <span key={n} className="px-2.5 py-1 rounded bg-[#E7CB58] text-black font-mono font-bold text-xs">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmPaymentAndBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Passenger & Payment Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Boarding & Dropping Point Selectors */}
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>1. Boarding & Dropping Points</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-1">
                    Boarding Point
                  </label>
                  <select
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                  >
                    {schedule?.route.stops.filter(s => s.type === 'boarding').map(stop => (
                      <option key={stop.id} value={stop.name}>
                        {stop.name} ({stop.landmark})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-1">
                    Dropping Point
                  </label>
                  <select
                    value={droppingPoint}
                    onChange={(e) => setDroppingPoint(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                  >
                    {schedule?.route.stops.filter(s => s.type === 'dropping').map(stop => (
                      <option key={stop.id} value={stop.name}>
                        {stop.name} ({stop.landmark})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Passenger Details */}
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                2. Traveler Manifest ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})
              </h3>

              <div className="space-y-4">
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-semibold">Traveler {idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-[#E7CB58]/20 text-[#E7CB58] font-bold">
                        Berth {p.seatNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...passengers];
                            updated[idx].name = e.target.value;
                            setPassengers(updated);
                          }}
                          placeholder="e.g. Arjun Swaminathan"
                          className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Age</label>
                        <input
                          type="number"
                          min="1"
                          max="110"
                          required
                          value={p.age}
                          onChange={(e) => {
                            const updated = [...passengers];
                            updated[idx].age = parseInt(e.target.value, 10) || 25;
                            setPassengers(updated);
                          }}
                          className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => {
                            const updated = [...passengers];
                            updated[idx].gender = e.target.value as any;
                            setPassengers(updated);
                          }}
                          className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-Ticket Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-1 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile SMS Alerts</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={passengerMobile}
                    onChange={(e) => setPassengerMobile(e.target.value)}
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E7CB58]/50"
                  />
                </div>
              </div>

              {/* Women Safety Mode Opt-in */}
              <div className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/30 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="wsm"
                  checked={womenSafetyOptIn}
                  onChange={(e) => setWomenSafetyOptIn(e.target.checked)}
                  className="mt-0.5 rounded bg-black border-pink-500 text-pink-500 focus:ring-0"
                />
                <label htmlFor="wsm" className="text-xs cursor-pointer">
                  <span className="font-semibold text-pink-300 block">
                    Opt-in to Women Safety Mode™ (Recommended for solo female travelers)
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Enables automated SMS ping to emergency contacts upon boarding, discreet nocturnal check-in heartbeats, and 24/7 operator escalation.
                  </span>
                </label>
              </div>

              {/* Insurance Toggle */}
              <InsuranceToggle 
                fare={baseFareTotal}
                selected={insuranceSelected}
                onToggle={setInsuranceSelected}
              />

            </div>

            {/* 3. Payment Gateway */}
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#E7CB58]" />
                  <span>3. Payment Gateway (UPI / Cards)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  256-BIT ENCRYPTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-[#E7CB58]/15 border-[#E7CB58] text-white shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">Instant UPI / QR Sandbox</div>
                  <div className="text-[11px] text-gray-400">Zero surcharge • Auto-verified approval</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#E7CB58]/15 border-[#E7CB58] text-white shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">Cards / Netbanking Sandbox</div>
                  <div className="text-[11px] text-gray-400">Simulated 3D Secure verification</div>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-gray-400 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Simulated Transaction Mode: No real financial charges occur. Idempotent test ledger active.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Breakdown & Confirmation CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 space-y-5 sticky top-24">
              
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Payment Ledger
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  Verified Fare Computation
                </span>
              </div>

              {/* Promo Code Input */}
              <div>
                <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-[#E7CB58]" />
                  <span>Promo Code</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="FLASHX2026"
                    className="flex-1 bg-[#101114] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#E7CB58]/50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                    ✓ Applied: {appliedPromo} (-₹{discount})
                  </span>
                )}
                {promoError && (
                  <span className="text-[10px] text-red-400 font-mono block mt-1">
                    {promoError}
                  </span>
                )}
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-xs pt-3 border-t border-white/10 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Base Fare ({seatNums.length} Seats)</span>
                  <span>₹{baseFareTotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST (5%)</span>
                  <span>₹{taxesGst}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Comfort & Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promotional Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>Final Payable</span>
                  <span className="text-xl text-[#E7CB58]">₹{totalPayable}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:scale-[1.02] active:scale-[0.99] text-black font-display font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Issuing Cryptographic Digital Ticket...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Pay ₹{totalPayable} & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

              <div className="text-[10px] text-gray-500 text-center font-mono">
                Free cancellation up to 6 hours before departure (100% refund).
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
