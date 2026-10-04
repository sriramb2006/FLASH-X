import React, { useState, useRef, useEffect } from 'react';
import { Cpu, X, Send, Sparkles, Bot, User, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Greetings. I am FLASHX OS Travel Intelligence. Ask me about corridor availability, cancellation policies, Smart Seat choices, or Women Safety Mode.',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.askAiAssistant(textToSend);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'Analysis completed.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Temporary telemetry interruption. FLASHX OS core services remain operational.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'What is the cancellation refund policy?',
    'How does Women Safety Mode work?',
    'Explain Smart Seat Intelligence',
    'Which bus is best from Coimbatore to Bengaluru?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-br from-[#1F222B] to-[#121318] border border-[#E7CB58]/40 shadow-2xl hover:scale-105 transition-all glow-gold flex items-center space-x-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E7CB58] flex items-center justify-center text-black font-display font-bold">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-display font-bold text-white flex items-center space-x-1">
              <span>FlashX AI</span>
              <Sparkles className="w-3 h-3 text-[#E7CB58]" />
            </div>
            <div className="text-[10px] text-gray-400 font-mono">Travel Intelligence</div>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#101114]" />
        </button>
      )}

      {/* Expanded Assistant Panel */}
      {isOpen && (
        <div className="bg-[#16181F] border border-[#E7CB58]/35 rounded-2xl w-[90vw] max-w-sm sm:max-w-md h-[520px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-[#121318] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E7CB58] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="text-xs font-display font-bold text-white flex items-center space-x-1.5">
                  <span>FLASHX OS Intelligence</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    GEMINI 3.8
                  </span>
                </h4>
                <p className="text-[10px] text-gray-400 font-mono">Autonomous Mobility Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded bg-[#E7CB58]/20 text-[#E7CB58] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#E7CB58] text-black font-medium rounded-tr-none'
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div className={`text-[9px] mt-1 text-right font-mono ${m.sender === 'user' ? 'text-black/60' : 'text-gray-500'}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex space-x-2 items-center text-xs text-gray-400 p-2">
                <span className="w-2 h-2 rounded-full bg-[#E7CB58] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#E7CB58] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#E7CB58] animate-bounce delay-200" />
                <span className="text-[11px] font-mono text-gray-400 ml-1">Analyzing schedule database...</span>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="px-3 py-2 bg-black/30 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#121318] border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about buses, stops, refunds, safety..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E7CB58]/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-[#E7CB58] hover:bg-[#F2DA75] text-black disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
