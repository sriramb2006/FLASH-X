import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles, X, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface VoicePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoicePlannerModal: React.FC<VoicePlannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const sampleVoicePrompts = [
    'Find an AC sleeper bus from Coimbatore to Bengaluru for tomorrow night under 1500 rupees',
    'Look for electric buses from Bengaluru to Chennai with 2 passengers',
    'Morning seater bus from Coimbatore to Kochi tomorrow',
    'Sleeper coach from Bengaluru to Hyderabad under 2000 rupees',
  ];

  const handleStartListening = () => {
    setErrorMsg('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processTranscript(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setErrorMsg('Microphone input not detected or permission denied. You can select a test prompt below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Simulate listening state for browsers without Web Speech
      setIsListening(true);
      setTimeout(() => {
        const sample = sampleVoicePrompts[0];
        setTranscript(sample);
        setIsListening(false);
        processTranscript(sample);
      }, 2000);
    }
  };

  const processTranscript = async (text: string) => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await api.parseVoiceIntent(text);
      setParsedData(res);
    } catch (err) {
      setErrorMsg('Failed to extract trip intent from voice. Please refine your phrase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySearch = () => {
    if (!parsedData) return;
    const query = new URLSearchParams({
      source: parsedData.sourceCity || 'Coimbatore',
      destination: parsedData.destCity || 'Bengaluru',
      date: parsedData.travelDate || '',
      category: parsedData.busCategory !== 'Any' ? parsedData.busCategory : '',
      maxPrice: parsedData.maxBudget ? String(parsedData.maxBudget) : '',
    });
    onClose();
    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#16181F] border border-[#E7CB58]/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E7CB58]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#E7CB58]/20 text-[#E7CB58] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Voice-to-Journey™</h3>
              <p className="text-[11px] text-gray-400 font-mono">Autonomous Natural Language Trip Parser</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening Interactive Area */}
        <div className="py-6 flex flex-col items-center text-center">
          <button
            onClick={isListening ? () => setIsListening(false) : handleStartListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 animate-pulse ring-8 ring-red-500/30 shadow-red-500/50 shadow-2xl'
                : 'bg-gradient-to-br from-[#E7CB58] to-amber-600 hover:scale-105 shadow-xl shadow-amber-500/20'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-black" />
            )}
          </button>

          <span className="mt-3 text-xs font-mono uppercase tracking-wider text-gray-300">
            {isListening ? 'Listening to voice stream...' : 'Tap microphone & speak naturally'}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5">
            e.g., "Find an AC sleeper bus from Coimbatore to Bengaluru tomorrow night under 1500"
          </span>
        </div>

        {/* Sample voice test chips */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-2">
            Or test with preset voice phrases:
          </span>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {sampleVoicePrompts.map((sample, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(sample);
                  processTranscript(sample);
                }}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 hover:border-amber-400/30 transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2">{sample}</span>
                <Sparkles className="w-3 h-3 text-[#E7CB58] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center space-x-3 text-xs text-amber-300">
            <span className="w-4 h-4 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
            <span>FLASHX OS Intent Extraction Engine parsing speech...</span>
          </div>
        )}

        {/* Extracted Structured Parameters */}
        {parsedData && !isProcessing && (
          <div className="p-4 rounded-xl bg-[#1A1D26] border border-[#E7CB58]/40 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Extracted Trip Parameters (Editable)</span>
              </span>
              <span className="text-gray-400 text-[10px]">Gemini / Rules Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-black/30 border border-white/10">
                <span className="text-[10px] text-gray-400 block font-mono">Origin</span>
                <input
                  type="text"
                  value={parsedData.sourceCity || ''}
                  onChange={(e) => setParsedData({ ...parsedData, sourceCity: e.target.value })}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none w-full"
                />
              </div>

              <div className="p-2 rounded bg-black/30 border border-white/10">
                <span className="text-[10px] text-gray-400 block font-mono">Destination</span>
                <input
                  type="text"
                  value={parsedData.destCity || ''}
                  onChange={(e) => setParsedData({ ...parsedData, destCity: e.target.value })}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none w-full"
                />
              </div>

              <div className="p-2 rounded bg-black/30 border border-white/10">
                <span className="text-[10px] text-gray-400 block font-mono">Travel Date</span>
                <input
                  type="date"
                  value={parsedData.travelDate || ''}
                  onChange={(e) => setParsedData({ ...parsedData, travelDate: e.target.value })}
                  className="bg-transparent text-white text-xs focus:outline-none w-full"
                />
              </div>

              <div className="p-2 rounded bg-black/30 border border-white/10">
                <span className="text-[10px] text-gray-400 block font-mono">Category / Budget</span>
                <div className="text-white text-xs font-semibold truncate">
                  {parsedData.busCategory} {parsedData.maxBudget ? `• ≤ ₹${parsedData.maxBudget}` : ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleApplySearch}
              className="w-full mt-2 py-2.5 rounded-lg bg-[#E7CB58] hover:bg-[#F2DA75] text-black font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Search Verified Coaches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
};
