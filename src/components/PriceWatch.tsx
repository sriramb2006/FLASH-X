import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';

interface PriceWatchProps {
  source: string;
  destination: string;
}

export const PriceWatch: React.FC<PriceWatchProps> = ({ source, destination }) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [isSet, setIsSet] = useState(false);

  const handleSetWatch = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;
    
    // Simulate setting the watch
    setIsSet(true);
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Price Watch Set', {
        body: `We'll notify you when tickets from ${source} to ${destination} drop below ₹${targetPrice}.`,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="bg-[#16181F] border border-[#E7CB58]/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-center space-x-2 text-[#E7CB58]">
        <Bell className="w-5 h-5" />
        <h3 className="font-display font-bold">Price Watch™</h3>
      </div>
      
      {!isSet ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Set a target fare. We'll notify you when prices drop.</p>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Target Price (₹)"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="flex-1 bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              onClick={handleSetWatch}
              className="px-4 py-2 rounded-xl bg-[#E7CB58] text-black font-semibold text-xs hover:bg-amber-400 transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono p-2 bg-emerald-500/10 rounded-xl">
          <Check className="w-4 h-4" />
          <span>Watch active for ₹{targetPrice}</span>
        </div>
      )}
    </div>
  );
};
