import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  Printer,
  Share2,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Download,
  Copy,
  ExternalLink,
  Smartphone,
  Star,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { api } from '../lib/api';
import { Booking, Schedule } from '../../shared/types';
import { TicketQrCodeGenerator } from '../components/TicketQrCodeGenerator';
import { exportTripSummaryPdf } from '../lib/pdfExport';

export const TicketPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareRecipient, setShareRecipient] = useState<'spouse' | 'parents' | 'friend' | 'colleague'>('spouse');
  const [tokenRevoked, setTokenRevoked] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ refundAmount: number } | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Passenger Feedback states
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [punctualityScore, setPunctualityScore] = useState(5);
  const [cleanlinessScore, setCleanlinessScore] = useState(5);
  const [comfortScore, setComfortScore] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Digital Scrapbook states
  const [scrapbookNote, setScrapbookNote] = useState('');
  const [scrapbookPhotoUrl, setScrapbookPhotoUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800');
  const [isSavingScrapbook, setIsSavingScrapbook] = useState(false);
  const [scrapbookSuccess, setScrapbookSuccess] = useState('');

  const handleSaveScrapbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !scrapbookNote.trim()) return;

    setIsSavingScrapbook(true);
    setScrapbookSuccess('');
    try {
      const res = await api.addScrapbookEntry(booking.id, scrapbookNote.trim(), scrapbookPhotoUrl);
      if (res.success && res.booking) {
        setBooking(res.booking);
        setScrapbookNote('');
        setScrapbookSuccess('Memory successfully saved to your Digital Scrapbook & PassengerHub history!');
        setTimeout(() => setScrapbookSuccess(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed saving scrapbook entry:', err);
    } finally {
      setIsSavingScrapbook(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.getReviews();
      setReviews(res || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bookingId]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      await api.submitReview({
        bookingId: booking.id,
        busId: schedule?.busId || 'bus-fx-hyperline-01',
        rating,
        punctualityScore,
        cleanlinessScore,
        comfortScore,
        comment,
        tags: selectedTags.length > 0 ? selectedTags : ['Verified Journey'],
      });

      setReviewSubmitted(true);
      setComment('');
      setSelectedTags([]);
      // Reload reviews to reflect submission instantly
      await loadReviews();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      setIsLoading(true);
      try {
        const res = await api.getBooking(bookingId);
        setBooking(res.booking);
        if (res.schedule) setSchedule(res.schedule);
      } catch (err) {
        console.error('Error loading ticket:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  const handleVerifyTicket = async () => {
    if (!booking) return;
    setIsVerifying(true);
    try {
      const res = await api.verifyTicket(booking.ticketQrPayload);
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyFamilyLink = () => {
    if (!booking?.familyShareToken || tokenRevoked) return;
    const shareUrl = `${window.location.origin}/track/${booking.familyShareToken}`;
    const customMsg = getPresetMessage(shareUrl);
    navigator.clipboard.writeText(customMsg);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 3000);
  };

  const handleRevokeFamilyLink = async () => {
    if (!booking?.familyShareToken) return;
    const confirm = window.confirm('Are you sure you want to revoke live tracking access? Family members or friends currently tracking your trip will be disconnected immediately.');
    if (!confirm) return;

    setIsRevoking(true);
    try {
      await api.revokeFamilyToken(booking.familyShareToken);
      setTokenRevoked(true);
      setRevokeSuccess(true);
      setTimeout(() => setRevokeSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to revoke token:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  const getPresetMessage = (url: string) => {
    const routeStr = `${booking?.sourceCity} ➔ ${booking?.destCity}`;
    if (shareRecipient === 'spouse') {
      return `Hey honey! Follow my live bus travel progress (${routeStr}) here: ${url}. Drive safely!`;
    }
    if (shareRecipient === 'parents') {
      return `Hi Mom & Dad! Follow my bus trip live (${routeStr}) using this secure link, so you know exactly when I arrive: ${url}`;
    }
    if (shareRecipient === 'friend') {
      return `Hey! Tracking my ride (${routeStr}) in real-time. Catch my ETA here: ${url}`;
    }
    return `Hello. You can monitor my professional intercity travel transit (${routeStr}) via this secure link: ${url}`;
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      const res = await api.cancelBooking(booking.id, booking.userId);
      setCancelResult(res);
      // Reload booking to reflect cancelled state
      const updated = await api.getBooking(booking.id);
      setBooking(updated.booking);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!booking) return;
    setIsExportingPdf(true);
    try {
      exportTripSummaryPdf(booking, schedule);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Failed generating trip summary PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101114] flex items-center justify-center text-white">
        <div className="text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7CB58] border-t-transparent animate-spin mx-auto" />
          <span>Retrieving Cryptographic Ticket Ledger...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h2 className="text-lg font-bold">Booking Not Found</h2>
        <p className="text-xs text-gray-400 mt-1">This ticket reference could not be verified.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-xl bg-[#E7CB58] text-black text-xs font-semibold"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const depDate = new Date(booking.departureTime);
  const arrDate = new Date(booking.arrivalTime);
  const hoursToDep = (depDate.getTime() - Date.now()) / (1000 * 60 * 60);

  return (
    <div className="min-h-screen bg-[#101114] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Action Bar (No-Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#16181F] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {booking.status === 'CANCELLED' ? 'TICKET CANCELLED & REFUNDED' : 'CONFIRMED E-TICKET'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#E7CB58] hover:bg-[#F2DA75] text-black text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              title="Export complete journey details as an offline PDF document using jsPDF"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download Trip Summary (PDF)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>

            {booking.familyShareToken && (
              <button
                onClick={handleCopyFamilyLink}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shareLinkCopied ? 'Tracking Link Copied!' : 'Family Share'}</span>
              </button>
            )}

            {booking.status === 'CONFIRMED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel / Refund
              </button>
            )}
          </div>
        </div>

        {/* PDF Download Success Alert Banner */}
        {pdfSuccess && (
          <div className="no-print p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Trip Summary PDF generated and downloaded to your device for offline travel access.</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">READY OFFLINE</span>
          </div>
        )}

        {/* ========================================================
            THE CINEMATIC DIGITAL BOARDING PASS
           ======================================================== */}
        <div className="bg-[#16181F] border-2 border-[#E7CB58]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle gold gradient header stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58]" />

          {/* Ticket Header */}
          <div className="flex flex-wrap items-start justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#E7CB58] text-black font-display font-extrabold flex items-center justify-center text-sm">
                  FX
                </div>
                <span className="font-display font-bold text-lg text-white tracking-wider">FLASHX OS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  VERIFIED PASS
                </span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                Autonomous Intercity Mobility Reservation
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Booking Reference</span>
              <div className="text-2xl font-mono font-extrabold text-[#E7CB58] tracking-wider">
                {booking.bookingReference}
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                Issued: {new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Route & Times */}
          <div className="py-6 border-b border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            <div className="sm:col-span-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Boarding Station</span>
              <div className="text-xl sm:text-2xl font-display font-bold text-white">
                {booking.sourceCity}
              </div>
              <div className="text-xs text-amber-300 font-medium truncate mt-0.5">
                {booking.boardingPoint}
              </div>
              <div className="text-sm font-mono font-bold text-white mt-2">
                {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {depDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="sm:col-span-4 text-center space-y-1">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Transit Telemetry</span>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-0.5 w-12 bg-white/20" />
                <Compass className="w-4 h-4 text-[#E7CB58]" />
                <div className="h-0.5 w-12 bg-white/20" />
              </div>
              <span className="text-xs font-mono text-emerald-400 block font-semibold">
                Direct Highway Coach
              </span>
            </div>

            <div className="sm:col-span-4 sm:text-right">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Dropping Terminal</span>
              <div className="text-xl sm:text-2xl font-display font-bold text-white">
                {booking.destCity}
              </div>
              <div className="text-xs text-cyan-300 font-medium truncate mt-0.5">
                {booking.droppingPoint}
              </div>
              <div className="text-sm font-mono font-bold text-white mt-2">
                {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {arrDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>

          </div>

          {/* Coach & Assigned Seats */}
          <div className="py-6 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Coach Equipment</span>
              <div className="text-sm font-bold text-white">{booking.busName}</div>
              <span className="text-[10px] text-gray-500">{booking.operatorName}</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Berths Assigned</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {booking.passengers.map(p => (
                  <span key={p.seatNumber} className="px-2 py-0.5 rounded bg-[#E7CB58] text-black font-bold text-xs">
                    {p.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Payment Status</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {booking.paymentStatus === 'PAID' ? 'PAID IN FULL' : booking.paymentStatus}
              </div>
              <span className="text-[10px] text-gray-500">Txn: {booking.transactionId.slice(0, 14)}...</span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase block">Total Fare Paid</span>
              <div className="text-lg font-bold text-[#E7CB58]">₹{booking.fareBreakdown.totalFare}</div>
              <span className="text-[10px] text-gray-500">GST 5% & Fees Incl.</span>
            </div>
          </div>

          {/* Passenger Manifest Table */}
          <div className="py-6 border-b border-white/10 space-y-3">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider block">
              Passenger Manifest
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                    <th className="pb-2">Traveler Name</th>
                    <th className="pb-2">Age / Gender</th>
                    <th className="pb-2">Seat #</th>
                    <th className="pb-2 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {booking.passengers.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 capitalize">{p.age} yrs • {p.gender}</td>
                      <td className="py-2.5 text-[#E7CB58] font-bold">{p.seatNumber}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-semibold">Ready for Boarding</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Digital Checkpoint QR & Mobile Boarding Pass Module */}
          <div className="pt-6 space-y-4">
            <TicketQrCodeGenerator
              booking={booking}
              schedule={schedule}
              onVerifyTicket={handleVerifyTicket}
            />

            {/* Offline Travel Pass PDF Export Box */}
            <div className="no-print p-4 rounded-2xl bg-black/40 border border-[#E7CB58]/30 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#E7CB58]/10 text-[#E7CB58]">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Offline Trip Summary Document (PDF)</span>
                  <span className="text-[11px] text-gray-400">Includes complete passenger manifest, boarding times, carrier telemetry & safety hotline.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 rounded-xl bg-[#E7CB58] hover:bg-[#F2DA75] text-black font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'Exporting...' : 'Download PDF Summary'}</span>
              </button>
            </div>
          </div>

          {/* Gate Verification Result Popup Banner */}
          {verificationResult && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono space-y-1 animate-in fade-in">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TICKET VERIFIED AT STATION TERMINAL GATE</span>
              </div>
              <p>Reference: {verificationResult.bookingReference} • Status: {verificationResult.status} • Route: {verificationResult.route}</p>
              <p>Timestamp: {new Date(verificationResult.verifiedAt).toLocaleTimeString()}</p>
            </div>
          )}

        </div>

        {/* ========================================================
            DYNAMIC JOURNEY TIMELINE & STATION STOPS
           ======================================================== */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Journey Route Timeline & Station Stops™</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Visual route progress and estimated station arrival times</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E7CB58]/40 space-y-6 font-mono text-xs">
              
              {/* Origin Station */}
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[35px] top-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#16181F]" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">{booking.sourceCity} (Boarding Terminal)</div>
                  <span className="text-[11px] text-amber-300 font-semibold">{depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-gray-400 text-[11px] mt-0.5">{booking.boardingPoint}</div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 mt-1.5 inline-block">Departed On-Time</span>
              </div>

              {/* Midway Stop 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[35px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-[#16181F] animate-pulse" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">Salem Highway Expressway Refreshment Hub</div>
                  <span className="text-[11px] text-cyan-300 font-semibold">{new Date(depDate.getTime() + 1000 * 60 * 120).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-gray-400 text-[11px] mt-0.5">Midway rest stop, charging station & hot filter coffee audit</div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 mt-1.5 inline-block">Active Corridor Milestone</span>
              </div>

              {/* Midway Stop 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[35px] top-1 w-4 h-4 rounded-full bg-white/20 ring-4 ring-[#16181F]" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">Interstate Electronic FastTag Gate</div>
                  <span className="text-[11px] text-gray-400 font-semibold">{new Date(depDate.getTime() + 1000 * 60 * 240).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-gray-400 text-[11px] mt-0.5">Automated barrier clearance & telemetry sensor verification</div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-gray-400 mt-1.5 inline-block">Scheduled Stop</span>
              </div>

              {/* Destination Station */}
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[35px] top-1 w-4 h-4 rounded-full bg-purple-400 ring-4 ring-[#16181F]" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">{booking.destCity} (Dropping Terminal)</div>
                  <span className="text-[11px] text-purple-300 font-semibold">{arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-gray-400 text-[11px] mt-0.5">{booking.droppingPoint}</div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 mt-1.5 inline-block">Final Destination Arrival</span>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================
            SECURE LIVE TRIP TRACKER SHARING PORTAL
           ======================================================== */}
        {booking.familyShareToken && (
          <div className="no-print bg-[#14161F] border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Ambient neon track highlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base flex items-center space-x-1.5">
                    <span>Secure Live Trip Share™</span>
                    <span className="text-[9px] px-2 py-0.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded font-mono uppercase font-bold tracking-wider">Consent-Safe</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">Generate password-free live tracking dispatch for family & friends</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${tokenRevoked ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wide">
                  {tokenRevoked ? 'Tracking Offline' : 'Tracking Token Active'}
                </span>
              </div>
            </div>

            {tokenRevoked ? (
              <div className="p-6 text-center border border-dashed border-red-500/20 rounded-2xl bg-red-950/5 space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">Access Token Revoked</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Your secure sharing link has been purged and deactivated from the FLASH-X travel telemetry servers. No one can track your trip unless you register a new pass.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left controls: Select who is tracking */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-mono text-gray-400 uppercase block tracking-wider">1. Select Recipient Context</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {([
                      { id: 'spouse', label: 'Spouse / Partner', icon: '❤️' },
                      { id: 'parents', label: 'Parents / Family', icon: '👨‍👩‍👧' },
                      { id: 'friend', label: 'Friend / Guest', icon: '🤝' },
                      { id: 'colleague', label: 'Colleague', icon: '💼' }
                    ] as const).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setShareRecipient(r.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                          shareRecipient === r.id
                            ? 'bg-purple-950/20 border-purple-500 text-purple-300 shadow'
                            : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{r.icon}</span>
                        <span className="font-bold text-[10px]">{r.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Security Clearance Alert */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-300 font-mono uppercase">
                      <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Security & Expiry Schedule</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                      * No user registration required for viewer.<br />
                      * Token auto-expires 48 hrs post-arrival.<br />
                      * Consent-safe: hides seat numbers & payment history.
                    </p>
                  </div>
                </div>

                {/* Right controls: Preview and copy link */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-[11px] font-mono text-gray-400 uppercase block tracking-wider">2. Share Preview Message</span>
                  
                  <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-2xl relative">
                    <textarea
                      readOnly
                      value={getPresetMessage(`${window.location.origin}/track/${booking.familyShareToken}`)}
                      className="w-full h-20 bg-transparent text-xs text-gray-200 border-none outline-none resize-none focus:ring-0 font-mono"
                    />
                    
                    {/* Secure link input display */}
                    <div className="flex items-center space-x-2 bg-[#121318] p-1.5 rounded-xl border border-white/10">
                      <span className="text-[8px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">SECURE LINK</span>
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/track/${booking.familyShareToken}`}
                        className="bg-transparent border-none text-[10px] font-mono text-gray-300 w-full outline-none focus:ring-0 select-all"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyFamilyLink}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 hover:scale-[1.01]"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{shareLinkCopied ? 'Copying Completed!' : 'Copy Dispatch Message'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRevokeFamilyLink}
                      disabled={isRevoking}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5"
                    >
                      {isRevoking ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Revoking...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>Revoke Access</span>
                        </>
                      )}
                    </button>
                  </div>

                  {revokeSuccess && (
                    <p className="text-[10px] font-mono text-emerald-400 text-center animate-pulse">
                      ✓ Security Clearance Checked: Tracking link revoked successfully.
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Passenger Feedback & Coach Quality Audit Module (No-Print) */}
        <div className="no-print bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[#E7CB58]" />
              <h3 className="font-display font-bold text-white text-base">Passenger Feedback & Coach Quality</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7CB58]/10 text-[#E7CB58] border border-[#E7CB58]/30 font-mono font-medium">
              LIVE CORRIDOR AUDIT
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Submit New Review Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                Submit Quality Review
              </h4>

              {reviewSubmitted ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 text-center animate-in zoom-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="space-y-1">
                    <h5 className="font-display font-bold text-white text-sm">Thank you for your feedback!</h5>
                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                      Your stars and telemetry review have been registered directly into our Autonomous Coach Quality ledger.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black text-xs font-bold font-mono transition-colors"
                  >
                    Submit Another Review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                  
                  {/* Star Rating Grids */}
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Overall Rating:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${num <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Punctuality:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setPunctualityScore(num)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${num <= punctualityScore ? 'text-purple-400 fill-purple-400' : 'text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Cleanliness:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCleanlinessScore(num)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${num <= cleanlinessScore ? 'text-cyan-400 fill-cyan-400' : 'text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Coach Comfort:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setComfortScore(num)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${num <= comfortScore ? 'text-emerald-400 fill-emerald-400' : 'text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback comment */}
                  <div>
                    <label className="block text-gray-400 mb-1.5 uppercase text-[10px] tracking-wide">
                      Share your experience
                    </label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Share details about punctuality, staff service, climate control, HEPA purification, or smooth transit..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/40"
                    />
                  </div>

                  {/* Tag Pill Selector */}
                  <div className="space-y-1.5">
                    <span className="block text-gray-400 uppercase text-[10px] tracking-wide">
                      Feedback Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Punctual Journey',
                        'Clean Berths',
                        'Whisper Silent EV',
                        'Comfortable Suspension',
                        'HEPA Fresh Cabin',
                        'Polite Crew',
                        'Smart AI Assistant',
                      ].map(tag => {
                        const isSel = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer font-mono border ${
                              isSel
                                ? 'bg-[#E7CB58]/20 text-[#E7CB58] border-[#E7CB58]/50 font-bold'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {reviewError && (
                    <div className="text-red-400 text-[11px] font-semibold">{reviewError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold font-mono transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <span>{isSubmittingReview ? 'Registering Feedback...' : 'Submit Verified Feedback'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Other Passenger Reviews / Live Feed */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Traveler Ledger</span>
                <span className="text-[10px] text-gray-500 lowercase font-normal">
                  {reviews.length} reviews stored
                </span>
              </h4>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
                    No logs recorded. Be the first to audit this corridor!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2.5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span>{rev.userName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                              Verified
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-white font-mono">{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-mono">
                        "{rev.comment}"
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {rev.tags?.map((tag: string) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-gray-400 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            DIGITAL SCRAPBOOK MEMORY MODULE
           ======================================================== */}
        <div className="no-print bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Digital Scrapbook™</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Attach photos & personal notes to preserve your journey memories in PassengerHub</p>
            </div>
          </div>

          {/* Add Memory Form */}
          <form onSubmit={handleSaveScrapbook} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-gray-400 uppercase text-[10px] block mb-1">Journey Memory Note:</label>
              <textarea
                rows={3}
                value={scrapbookNote}
                onChange={(e) => setScrapbookNote(e.target.value)}
                placeholder="e.g. Beautiful sunrise over the Krishnagiri highway corridor, smooth sleeper berth and amazing filter coffee at the rest stop..."
                className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#E7CB58]"
              />
            </div>

            <div>
              <label className="text-gray-400 uppercase text-[10px] block mb-1">Attach Photo URL or Preset Memory:</label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={scrapbookPhotoUrl}
                  onChange={(e) => setScrapbookPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E7CB58]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🌅 Highway Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
                  { label: '☕ Rest Stop Chai', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' },
                  { label: '🌙 Terminal Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setScrapbookPhotoUrl(preset.url)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] border border-white/5 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {scrapbookSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                ✓ {scrapbookSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingScrapbook}
              className="w-full py-3 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold font-mono transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSavingScrapbook ? 'Saving Memory...' : 'Save to Digital Scrapbook & PassengerHub'}
            </button>
          </form>

          {/* Display Saved Scrapbook Memories */}
          {booking?.scrapbook && booking.scrapbook.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                Saved Memories ({booking.scrapbook.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.scrapbook.map((entry, idx) => (
                  <div key={idx} className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden space-y-2 p-3 font-mono">
                    {entry.photoUrl && (
                      <img
                        src={entry.photoUrl}
                        alt="Scrapbook Memory"
                        className="w-full h-36 object-cover rounded-xl border border-white/5"
                      />
                    )}
                    <p className="text-xs text-gray-200 leading-relaxed italic">
                      "{entry.note}"
                    </p>
                    <span className="text-[9px] text-gray-500 block">
                      Saved on {new Date(entry.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Post-Booking Next Step Links (No-Print) */}
        <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to={`/dashboard`}
            className="p-4 rounded-2xl bg-[#16181F] border border-white/10 hover:border-[#E7CB58]/40 transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-semibold text-white">Passenger Hub & Telemetry</div>
              <div className="text-gray-400 text-[11px]">Track live route progression and safety check-ins</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#E7CB58]" />
          </Link>

          <Link
            to={booking.familyShareToken ? `/track/${booking.familyShareToken}` : '#'}
            className="p-4 rounded-2xl bg-[#16181F] border border-white/10 hover:border-purple-500/40 transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-semibold text-white">Family Travel Monitor™ View</div>
              <div className="text-gray-400 text-[11px]">Preview what family members see on the tracking link</div>
            </div>
            <ExternalLink className="w-4 h-4 text-purple-400" />
          </Link>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#16181F] border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-white text-base">Confirm Trip Cancellation</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-2">
                <div className="text-gray-300">
                  Hours before departure: <b className="text-white">{hoursToDep > 0 ? Math.round(hoursToDep) : 0} hrs</b>
                </div>
                <div className="text-emerald-400">
                  {hoursToDep >= 6
                    ? 'Eligible for 100% Full Refund (> 6 hours window)'
                    : hoursToDep >= 2
                    ? 'Eligible for 50% Partial Refund (2 to 6 hours window)'
                    : 'Non-refundable (< 2 hours window)'}
                </div>
                <div className="text-[11px] text-gray-400">
                  Fare paid: ₹{booking.fareBreakdown.totalFare}. Refund will be credited to original payment instrument immediately.
                </div>
              </div>

              {cancelResult && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  ✓ Cancellation Confirmed. Refund amount: ₹{cancelResult.refundAmount}. Berths released back to inventory.
                </div>
              )}

              {cancelError && (
                <div className="text-xs text-red-400 font-mono">
                  {cancelError}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Close
                </button>
                {!cancelResult && (
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={handleCancelBooking}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
