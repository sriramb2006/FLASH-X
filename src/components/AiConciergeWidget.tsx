import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, MapPin, Building, Car, CheckCircle2, Star, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface AiConciergeWidgetProps {
  userEmail?: string;
  userId?: string;
  destinationCity?: string;
}

export const AiConciergeWidget: React.FC<AiConciergeWidgetProps> = ({
  userEmail,
  userId = 'usr-traveler',
  destinationCity = 'Bengaluru',
}) => {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'ai',
      text: `Hello! I am your FLASHX AI Concierge 🤖. I see you're planning your transit. Would you like me to curate and instantly bundle local EV transfers or destination hotels for your trip to ${destinationCity}?`,
      options: [
        { type: 'TRANSFER', name: '⚡ Electric Airport Shuttle', price: 850, desc: 'Instant EV pickup from dropping terminal to your hotel' },
        { type: 'HOTEL', name: '🏨 Taj West End Luxury Pod', price: 4500, desc: '5-star smartpod with breakfast & high-speed fiber WiFi' },
        { type: 'HOTEL', name: '🏢 Courtyard Business Suite', price: 2800, desc: 'Prime location near tech parks & metro interchange' }
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bundles, setBundles] = useState<any[]>([]);

  const loadBundles = async () => {
    try {
      const res = await fetch(`/api/ai/concierge/bundles/${userId}`);
      const data = await res.json();
      setBundles(data || []);
    } catch (err) {
      console.error('Failed loading bundles:', err);
    }
  };

  useEffect(() => {
    loadBundles();
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = `I've analyzed your request for "${userText}". Here are the best verified local options available in ${destinationCity} right now:`;
      let options = [
        { type: 'TRANSFER', name: '🚗 Executive Chauffeur SUV', price: 1400, desc: 'Private AC sedan transfer with professional driver' },
        { type: 'HOTEL', name: '✨ Novotel Tech Park Hotel', price: 3400, desc: 'Includes rooftop pool, gym, and express laundry' }
      ];

      if (userText.toLowerCase().includes('hotel') || userText.toLowerCase().includes('stay')) {
        aiReply = `Here are the top-rated hotel accommodations in ${destinationCity} matched to your Travel DNA profile:`;
        options = [
          { type: 'HOTEL', name: '🏨 Grand Hyatt Luxury Suites', price: 5200, desc: 'Spacious workspace & biometric check-in' },
          { type: 'HOTEL', name: '🛌 Capsule Pod Express', price: 1600, desc: 'Affordable quiet pods with capsule charging' }
        ];
      } else if (userText.toLowerCase().includes('transfer') || userText.toLowerCase().includes('cab') || userText.toLowerCase().includes('car')) {
        aiReply = `Here are secure, verified transfer options in ${destinationCity}:`;
        options = [
          { type: 'TRANSFER', name: '⚡ Autonomous EV Shuttle', price: 750, desc: 'Zero-emission electric transit straight to your doorstep' },
          { type: 'TRANSFER', name: '🏎️ Premium Sedan VIP', price: 1250, desc: 'Direct point-to-point priority transit' }
        ];
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply, options }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleBookBundleItem = async (item: { type: 'HOTEL' | 'TRANSFER'; name: string; price: number }) => {
    try {
      const res = await fetch('/api/ai/concierge/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemType: item.type,
          itemName: item.name,
          price: item.price,
          destination: destinationCity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBundles(prev => [...prev, data.bundleItem]);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `✓ Success! "${item.name}" (₹${item.price}) has been dynamically booked and securely linked to your FLASHX traveler session. You can manage this in your active travel bundle below!`
          }
        ]);
      }
    } catch (err) {
      console.error('Failed booking concierge item:', err);
    }
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base flex items-center space-x-2">
              <span>AI Travel Concierge™</span>
              <span className="text-[9px] px-2 py-0.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded font-mono font-bold uppercase">Gemini 3.5 AI</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Dynamic local transfers & hotel bundling for {destinationCity}</p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-gray-400">Linked Session:</span>
          <div className="text-emerald-400 font-bold">Active & Secure</div>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar font-mono text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 space-y-3 ${
              m.sender === 'user'
                ? 'bg-[#E7CB58] text-black font-semibold'
                : 'bg-black/50 border border-white/10 text-gray-200'
            }`}>
              <p className="leading-relaxed">{m.text}</p>

              {/* Actionable Bundle Options */}
              {m.options && m.options.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Recommended Options (1-Click Bundle):</span>
                  <div className="space-y-2">
                    {m.options.map((opt: any, optIdx: number) => (
                      <div key={optIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-[#E7CB58]/40 transition-all">
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            {opt.type === 'HOTEL' ? <Building className="w-3.5 h-3.5 text-amber-400" /> : <Car className="w-3.5 h-3.5 text-cyan-400" />}
                            <span>{opt.name}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</div>
                          <div className="text-xs font-bold text-[#E7CB58] mt-1">₹{opt.price.toLocaleString()}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookBundleItem(opt)}
                          className="px-3.5 py-2 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold font-mono text-xs transition-transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer shadow-md"
                        >
                          Book & Bundle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#E7CB58]/20 border border-[#E7CB58]/40 flex items-center justify-center text-[#E7CB58] shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex space-x-3 items-center text-gray-400 italic">
            <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI Concierge is curating local options...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2 border-t border-white/10">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask for hotels, EV transfers, or restaurant recommendations..."
          className="flex-1 bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#E7CB58]"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-bold font-mono text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-lg"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Active Bundled Bookings Summary */}
      {bundles.length > 0 && (
        <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Destination Travel Bundles ({bundles.length})</span>
            </span>
            <span className="text-[10px] text-gray-400">Linked to Session</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bundles.map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{b.itemName}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
                    {b.itemType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>Dest: {b.destination}</span>
                  <span className="text-[#E7CB58] font-bold">₹{b.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
