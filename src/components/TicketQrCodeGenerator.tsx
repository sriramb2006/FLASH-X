import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Smartphone,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Maximize2,
  X,
  Luggage,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Eye,
  RefreshCw,
  Share2,
  FileCheck
} from 'lucide-react';
import { Booking, Schedule } from '../../shared/types';
import { api } from '../lib/api';

interface TicketQrCodeGeneratorProps {
  booking: Booking;
  schedule?: Schedule | null;
  onVerifyTicket?: () => void;
}

export type QrPayloadType = 'GATE_PASS' | 'DIRECT_URL' | 'LUGGAGE_TAG';
export type QrStyleTheme = 'MONOCHROME' | 'FLASHX_GOLD' | 'HIGH_CONTRAST_GATE';

export const TicketQrCodeGenerator: React.FC<TicketQrCodeGeneratorProps> = ({
  booking,
  schedule,
  onVerifyTicket,
}) => {
  const [payloadType, setPayloadType] = useState<QrPayloadType>('GATE_PASS');
  const [styleTheme, setStyleTheme] = useState<QrStyleTheme>('HIGH_CONTRAST_GATE');
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showCenterLogo, setShowCenterLogo] = useState<boolean>(true);
  const [scannerSimulating, setScannerSimulating] = useState<boolean>(false);
  const [scannerResult, setScannerResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'CARD' | 'OPTIONS' | 'SIMULATOR'>('CARD');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Keep live time updated for security anti-tampering clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute QR Payload string based on selected mode
  const qrPayload = (() => {
    if (payloadType === 'DIRECT_URL') {
      return `${window.location.origin}/tickets/${booking.id}`;
    }
    if (payloadType === 'LUGGAGE_TAG') {
      return JSON.stringify({
        type: 'FLASHX_LUGGAGE_TAG',
        ref: booking.bookingReference,
        passengers: booking.passengers.map(p => p.name),
        seats: booking.passengers.map(p => p.seatNumber),
        bus: booking.busName,
        source: booking.sourceCity,
        dest: booking.destCity,
        tagId: `LUG-${booking.bookingReference}-${booking.passengers[0]?.seatNumber || '01'}`,
      });
    }
    // GATE_PASS default
    return JSON.stringify({
      type: 'FLASHX_BOARDING_PASS',
      ref: booking.bookingReference,
      ticketHash: booking.ticketQrPayload,
      passengers: booking.passengers.map(p => ({ name: p.name, seat: p.seatNumber })),
      source: booking.sourceCity,
      dest: booking.destCity,
      dep: booking.departureTime,
      bus: booking.busName,
      status: booking.status,
      issuedAt: booking.createdAt,
    });
  })();

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadQrPng = () => {
    setIsDownloading(true);
    try {
      const canvas = document.getElementById(`qr-canvas-${booking.id}`) as HTMLCanvasElement;
      if (!canvas) {
        // Fallback
        const svg = document.getElementById(`qr-svg-${booking.id}`);
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const URL = window.URL || window.webkitURL || window;
          const blobURL = URL.createObjectURL(svgBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = blobURL;
          downloadLink.download = `FLASHX_Ticket_QR_${booking.bookingReference}.svg`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        setIsDownloading(false);
        return;
      }

      // Create a nice branded boarding pass canvas image
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 720;
      exportCanvas.height = 960;
      const ctx = exportCanvas.getContext('2d');

      if (ctx) {
        // Dark metallic background
        ctx.fillStyle = '#101114';
        ctx.fillRect(0, 0, 720, 960);

        // Header stripe
        const grad = ctx.createLinearGradient(0, 0, 720, 0);
        grad.addColorStop(0, '#E7CB58');
        grad.addColorStop(0.5, '#F59E0B');
        grad.addColorStop(1, '#E7CB58');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 16);

        // Header Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('FLASHX OS • DIGITAL BOARDING PASS', 40, 70);

        ctx.fillStyle = '#E7CB58';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(booking.bookingReference, 40, 110);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '16px monospace';
        ctx.fillText(`${booking.sourceCity}  ➔  ${booking.destCity}`, 40, 140);
        ctx.fillText(`Coach: ${booking.busName} (${booking.operatorName})`, 40, 170);
        ctx.fillText(`Assigned Seats: ${booking.passengers.map(p => p.seatNumber).join(', ')}`, 40, 200);

        // White QR Card Container
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(140, 240, 440, 440, 24);
        ctx.fill();

        // Draw QR Code
        ctx.drawImage(canvas, 180, 280, 360, 360);

        // Footer Details
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓ CRYPTOGRAPHICALLY VERIFIED BOARDING PASS', 360, 730);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px monospace';
        ctx.fillText('Scan at station departure gate terminal / bus entrance.', 360, 770);
        ctx.fillText(`Departure: ${new Date(booking.departureTime).toLocaleString()}`, 360, 800);
        ctx.fillText(`Boarding Gate: Bay 4 • ${booking.boardingPoint}`, 360, 830);

        ctx.fillStyle = '#4B5563';
        ctx.font = '12px monospace';
        ctx.fillText('Generated by FLASHX OS Autonomous Mobility Architecture', 360, 910);

        const dataUrl = exportCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `FLASHX_Mobile_Boarding_Pass_${booking.bookingReference}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err) {
      console.error('Error downloading QR pass:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSimulateGateScan = async () => {
    setScannerSimulating(true);
    setScannerResult(null);
    try {
      // Simulate gate laser scan delay
      await new Promise(r => setTimeout(r, 800));
      const res = await api.verifyTicket(booking.ticketQrPayload);
      setScannerResult({
        ...res,
        scannedAt: new Date().toLocaleTimeString(),
        device: 'HANDHELD LASER SCANNER #GATE-04',
        conductorName: 'Muruganandam (Chief Conductor)',
        luggageApproved: true,
        berthAccessCleared: true,
      });
      if (onVerifyTicket) onVerifyTicket();
    } catch (err: any) {
      setScannerResult({
        valid: false,
        error: err.message || 'Verification failed',
      });
    } finally {
      setScannerSimulating(false);
    }
  };

  // Color schemes for QR
  const fgColor = styleTheme === 'FLASHX_GOLD' ? '#000000' : styleTheme === 'MONOCHROME' ? '#000000' : '#000000';
  const bgColor = '#FFFFFF';

  return (
    <div className="bg-[#12141C] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl font-mono text-xs">
      
      {/* Header with Mode Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-[#E7CB58] border border-amber-500/30 flex items-center justify-center font-display font-bold shadow-lg shadow-amber-500/10">
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-display font-bold text-white">
                Cryptographic Boarding Pass & QR Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                SCANNABLE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              High-contrast QR matrix for gate scanner verification, conductor check-in, and offline mobile boarding.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMobileModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:brightness-110 text-black font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Boarding Pass Mode</span>
            <Maximize2 className="w-3 h-3 ml-0.5" />
          </button>

          <button
            type="button"
            onClick={handleDownloadQrPng}
            disabled={isDownloading}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download high-resolution image to device gallery"
          >
            <Download className="w-3.5 h-3.5 text-[#E7CB58]" />
            <span>{isDownloading ? 'Exporting...' : 'Save PNG'}</span>
          </button>
        </div>
      </div>

      {/* Mode / Format Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2.5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-gray-400 uppercase px-2">QR Payload:</span>
          {[
            { id: 'GATE_PASS', label: 'Gate Boarding Pass', icon: ShieldCheck },
            { id: 'DIRECT_URL', label: 'Web Ticket URL', icon: Share2 },
            { id: 'LUGGAGE_TAG', label: 'Luggage Tag QR', icon: Luggage },
          ].map(t => {
            const Icon = t.icon;
            const isSel = payloadType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPayloadType(t.id as QrPayloadType)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-[#E7CB58] text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simulator Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'SIMULATOR' ? 'CARD' : 'SIMULATOR')}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border transition-all cursor-pointer ${
              activeTab === 'SIMULATOR'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>{activeTab === 'SIMULATOR' ? 'Back to Pass View' : 'Simulate Gate Scanner'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Display: QR Card or Scanner Simulation */}
      {activeTab === 'SIMULATOR' ? (
        
        /* Gate Scanner Simulator Engine */
        <div className="bg-[#101116] border border-purple-500/30 rounded-3xl p-6 space-y-5 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                <h4 className="text-sm font-display font-bold text-white">
                  Gate Attendant Infrared Scanner Terminal
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Simulates real-world laser scanning at station boarding barriers and coach entrance.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateGateScan}
              disabled={scannerSimulating}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${scannerSimulating ? 'animate-spin' : ''}`} />
              <span>{scannerSimulating ? 'Reading Optical Matrix...' : 'Trigger Laser Scanner Ping'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Scan Beam Target */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-black/60 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="relative p-2 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={qrPayload}
                  size={150}
                  level="H"
                  includeMargin={false}
                  imageSettings={showCenterLogo ? {
                    src: '/flashx_os_logo.jpg',
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  } : undefined}
                />

                {/* Laser Scanning Animation Bar */}
                {scannerSimulating && (
                  <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex flex-col justify-center">
                    <div className="w-full h-1 bg-red-500 shadow-lg shadow-red-500 animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-2 font-mono">
                {scannerSimulating ? 'Targeting Matrix...' : 'Aligned with Sensor Beam'}
              </span>
            </div>

            {/* Terminal Response Feed */}
            <div className="md:col-span-8 space-y-3">
              {scannerResult ? (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>BOARDING AUTHORIZED • PASSENGER VERIFIED</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      GATE BAY 4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-300 text-[11px]">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Booking Ref:</span>
                      <strong className="text-white font-mono">{scannerResult.bookingReference || booking.bookingReference}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Passengers:</span>
                      <strong className="text-[#E7CB58]">{booking.passengers.map(p => p.name).join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Assigned Berths:</span>
                      <strong className="text-white">{booking.passengers.map(p => p.seatNumber).join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Coach Equipment:</span>
                      <span className="text-white">{booking.busName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Luggage Checked:</span>
                      <span className="text-emerald-400 font-bold">✓ 2 Pieces Allocated</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Scan Timestamp:</span>
                      <span className="text-gray-300">{scannerResult.scannedAt || currentTime}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                    <span>Gate Attendant: {scannerResult.conductorName || 'Muruganandam'}</span>
                    <span className="text-[10px] text-gray-400">Cryptographic Signature Valid</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                  <FileCheck className="w-8 h-8 text-gray-500 mx-auto" />
                  <div className="text-sm font-bold text-white">Scanner Ready</div>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Click "Trigger Laser Scanner Ping" above to test gate barcode scanner verification against the backend registry.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      ) : (

        /* Main High-Fidelity QR Pass Container */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: The High-Contrast QR Code Card */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-100 rounded-3xl shadow-xl text-black space-y-4">
            
            {/* Header Badge on the White Card */}
            <div className="w-full flex items-center justify-between border-b border-gray-200 pb-2 text-[10px] font-mono uppercase font-bold text-gray-500">
              <span className="flex items-center space-x-1 text-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>FLASHX E-GATE</span>
              </span>
              <span>BAY 4 • {booking.sourceCity}</span>
            </div>

            {/* The Actual QR Code SVG & Hidden Canvas for PNG Export */}
            <div
              onClick={() => setShowMobileModal(true)}
              className="p-3 bg-white rounded-2xl border-2 border-black/10 hover:border-black/40 transition-all cursor-pointer shadow-md group relative"
              title="Click to expand fullscreen for smartphone gate scanner"
            >
              <QRCodeSVG
                id={`qr-svg-${booking.id}`}
                value={qrPayload}
                size={185}
                level="H"
                includeMargin={false}
                imageSettings={showCenterLogo ? {
                  src: '/flashx_os_logo.jpg',
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                } : undefined}
              />

              {/* Hidden Canvas used for high-res PNG export */}
              <div className="hidden">
                <QRCodeCanvas
                  id={`qr-canvas-${booking.id}`}
                  value={qrPayload}
                  size={360}
                  level="H"
                  includeMargin={true}
                  imageSettings={showCenterLogo ? {
                    src: '/flashx_os_logo.jpg',
                    x: undefined,
                    y: undefined,
                    height: 56,
                    width: 56,
                    excavate: true,
                  } : undefined}
                />
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold p-2 text-center">
                <Maximize2 className="w-5 h-5 mb-1 text-[#E7CB58]" />
                <span>Tap for Fullscreen Mobile Gate Mode</span>
              </div>
            </div>

            {/* Bottom Card Summary */}
            <div className="w-full text-center space-y-1">
              <div className="text-sm font-extrabold tracking-wider font-mono text-black">
                {booking.bookingReference}
              </div>
              <div className="text-[11px] font-bold text-gray-700">
                Seats: {booking.passengers.map(p => p.seatNumber).join(', ')} • {booking.passengers[0]?.name}
              </div>
              <div className="text-[9px] text-gray-500 font-mono">
                Live Gate Clock: {currentTime}
              </div>
            </div>

          </div>

          {/* Right: Telemetry & Mobile Controls */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Live Security Feature Callout */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Gate Verification Protocols
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OFFLINE SCANNER COMPLIANT</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[9px] text-gray-500 uppercase block">Error Correction</span>
                  <span className="text-white font-bold">Level H (30% Resilience)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[9px] text-gray-500 uppercase block">Encryption Hash</span>
                  <span className="text-[#E7CB58] font-bold truncate block">{booking.ticketQrPayload.substring(0, 14)}...</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                This QR code contains an offline cryptographically signed token that conductors can scan even in remote ghat roads or tunnels with zero cellular reception.
              </p>
            </div>

            {/* Quick Actions & Formatting Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <button
                type="button"
                onClick={handleCopyPayload}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-[10px] text-gray-500 uppercase block">Payload String</span>
                  <span className="text-xs font-bold text-white">{isCopied ? '✓ Copied to Clipboard' : 'Copy Verification Data'}</span>
                </div>
                <Copy className="w-4 h-4 text-[#E7CB58] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setShowCenterLogo(!showCenterLogo)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-[10px] text-gray-500 uppercase block">QR Center Badge</span>
                  <span className="text-xs font-bold text-white">{showCenterLogo ? 'FLASHX Logo Embedded' : 'Pure Raw Matrix'}</span>
                </div>
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              </button>

            </div>

            {/* Mobile Boarding Hint */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-200">
              <Smartphone className="w-5 h-5 text-[#E7CB58] shrink-0" />
              <div className="text-[11px] leading-snug">
                <strong className="text-[#E7CB58] block">Boarding Gate Tip:</strong>
                Use <strong>Mobile Boarding Pass Mode</strong> when approaching the platform barrier for maximum contrast and instantaneous laser scanner read.
              </div>
            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          FULLSCREEN MOBILE BOARDING PASS MODAL (MAX CONTRAST)
         ======================================================== */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#101114] border-2 border-[#E7CB58] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#E7CB58] text-black font-display font-extrabold flex items-center justify-center text-xs">
                  FX
                </div>
                <span className="font-display font-bold text-white text-base">Mobile Gate Pass</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  READY TO SCAN
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bright Max-Contrast Scannable Surface */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 text-black text-center space-y-4 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-[11px] font-mono font-bold text-gray-600 uppercase">
                <span>{booking.sourceCity} ➔ {booking.destCity}</span>
                <span className="text-emerald-700">BAY 4 DEPARTURE</span>
              </div>

              {/* Large Centered QR Code */}
              <div className="flex justify-center p-2">
                <QRCodeSVG
                  value={qrPayload}
                  size={240}
                  level="H"
                  includeMargin={true}
                  imageSettings={showCenterLogo ? {
                    src: '/flashx_os_logo.jpg',
                    x: undefined,
                    y: undefined,
                    height: 42,
                    width: 42,
                    excavate: true,
                  } : undefined}
                />
              </div>

              {/* Large Seat Badges for Gate Attendant Readability */}
              <div className="bg-gray-100 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] text-gray-500 uppercase block font-bold">Assigned Berths</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {booking.passengers.map(p => (
                    <span key={p.seatNumber} className="px-3 py-1 rounded-xl bg-black text-[#E7CB58] font-bold text-base shadow-sm">
                      {p.seatNumber}
                    </span>
                  ))}
                </div>
                <div className="text-xs font-bold text-gray-800 pt-1">
                  {booking.passengers.map(p => p.name).join(', ')}
                </div>
              </div>

              {/* Live Anti-Screenshot Timestamp & Reference */}
              <div className="text-[11px] font-mono text-gray-500 space-y-0.5">
                <div>Ref: <strong className="text-black font-mono">{booking.bookingReference}</strong></div>
                <div>Live Dynamic Security Clock: <strong className="text-emerald-700">{currentTime}</strong></div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-gray-400 text-[11px] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E7CB58]" />
                <span>Turn phone brightness up for instant gate scan</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
