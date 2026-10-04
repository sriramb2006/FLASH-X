import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface InsuranceToggleProps {
  fare: number;
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

export const InsuranceToggle: React.FC<InsuranceToggleProps> = ({ fare, selected, onToggle }) => {
  const premiumRate = 0.05; // 5% of fare
  const premium = Math.round(fare * premiumRate);

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-[#E7CB58]/20 text-[#E7CB58]' : 'bg-white/5 text-gray-500'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Add Travel Insurance</h4>
          <p className="text-xs text-gray-400">Coverage for your journey: ₹{premium}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(!selected)}
        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
          selected 
            ? 'bg-[#E7CB58] text-black hover:bg-amber-400' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {selected ? 'Added' : 'Add'}
      </button>
    </div>
  );
};
