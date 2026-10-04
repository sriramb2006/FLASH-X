import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Zap,
  Gift,
  Ticket,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Shield,
  Coffee,
  Crown,
  Lock,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Compass,
  Mic,
  Star,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';
import { LoyaltyAccount, LoyaltyReward, LoyaltyMission } from '../../shared/types';
import { api } from '../lib/api';
import { LoyaltyMilestoneChart } from './LoyaltyMilestoneChart';

interface LoyaltyRewardsSectionProps {
  userId?: string;
  onVoucherApplied?: (code: string) => void;
}

export const LoyaltyRewardsSection: React.FC<LoyaltyRewardsSectionProps> = ({
  userId,
  onVoucherApplied,
}) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [catalog, setCatalog] = useState<LoyaltyReward[]>([]);
  const [activeTab, setActiveTab] = useState<'REWARDS' | 'MISSIONS' | 'TIERS' | 'LEDGER'>('REWARDS');
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getLoyaltyData(userId);
      setAccount(data.account);
      setCatalog(data.catalog);
    } catch (err) {
      console.error('Failed loading loyalty data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (!account) return;
    if (account.balance < reward.costMiles) {
      setFeedbackMsg({
        type: 'error',
        text: `Insufficient FlashMiles balance. You need ${reward.costMiles - account.balance} more FlashMiles.`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    setIsRedeeming(reward.id);
    try {
      const res = await api.redeemLoyaltyReward(reward.id, userId);
      setAccount(res.account);
      setFeedbackMsg({
        type: 'success',
        text: `Successfully redeemed "${reward.title}"! Voucher Code ${res.voucher.code} is now available in your active wallet.`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to redeem reward',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsRedeeming(null);
    }
  };

  const handleClaimMission = async (mission: LoyaltyMission) => {
    if (mission.isClaimed) return;
    setIsClaiming(mission.id);
    try {
      const res = await api.claimLoyaltyMission(mission.id, userId);
      setAccount(res.account);
      setFeedbackMsg({
        type: 'success',
        text: `Mission Accomplished! +${res.rewardMiles} FlashMiles credited to your account.`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to claim mission',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsClaiming(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleUseVoucher = (code: string) => {
    if (onVoucherApplied) {
      onVoucherApplied(code);
    }
    navigate(`/search?promo=${code}`);
  };

  if (isLoading || !account) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#16181F] border border-white/10 space-y-3 font-mono text-xs text-gray-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#E7CB58] border-t-transparent animate-spin mx-auto" />
        <p>Loading FlashMiles™ Loyalty Ledger & Rewards Hub...</p>
      </div>
    );
  }

  const isPlatinum = account.tier === 'PLATINUM_SOVEREIGN';
  const isGold = account.tier === 'GOLD_VOYAGER';

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* ========================================================
          TIER STATUS & FLASHMILES DATA VISUALIZATION RADAR
         ======================================================== */}
      <LoyaltyMilestoneChart
        account={account}
        onExploreMissions={() => setActiveTab('MISSIONS')}
        onViewTiers={() => setActiveTab('TIERS')}
      />

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs animate-in fade-in flex items-center space-x-2.5 ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            : 'bg-red-950/40 border-red-500/50 text-red-300'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ========================================================
          ACTIVE VOUCHERS WALLET STRIP
         ======================================================== */}
      {account.activeVouchers.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#16181F] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#E7CB58] font-bold text-xs uppercase">
              <Gift className="w-4 h-4 text-[#E7CB58]" />
              <span>My Active Claimed Vouchers ({account.activeVouchers.length})</span>
            </div>
            <span className="text-[10px] text-gray-400">Ready to apply during checkout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {account.activeVouchers.map((v, idx) => (
              <div
                key={`${v.code}-${idx}`}
                className="p-3.5 rounded-2xl bg-black/40 border border-[#E7CB58]/30 hover:border-[#E7CB58] transition-all flex flex-col justify-between space-y-2 relative group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">{v.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      SAVE ₹{v.discountValue}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Expires: {new Date(v.expiresAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center space-x-1 font-mono font-bold text-[#E7CB58] bg-white/5 px-2 py-1 rounded-lg">
                    <span>{v.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(v.code)}
                      className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode === v.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUseVoucher(v.code)}
                    className="px-2.5 py-1 rounded-lg bg-[#E7CB58] hover:bg-amber-400 text-black font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Apply on Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          LOYALTY HUB TABS
         ======================================================== */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'REWARDS', label: 'Rewards Store Catalog', icon: Gift },
          { id: 'MISSIONS', label: 'Earn FlashMiles (Missions)', icon: Zap },
          { id: 'TIERS', label: 'Tier Perks & Privileges', icon: Crown },
          { id: 'LEDGER', label: 'Miles Transaction Ledger', icon: TrendingUp },
        ].map(t => {
          const Icon = t.icon;
          const isSel = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                isSel
                  ? 'bg-[#E7CB58] text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: REWARDS STORE CATALOG
         ======================================================== */}
      {activeTab === 'REWARDS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Redeem your FlashMiles for instantly usable vouchers and VIP privileges:</span>
            <span className="text-[#E7CB58] font-bold">Balance: {account.balance} Miles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map(r => {
              const canAfford = account.balance >= r.costMiles;
              const isProcessing = isRedeeming === r.id;

              return (
                <div
                  key={r.id}
                  className={`bg-[#16181F] border rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all hover:border-white/30 relative overflow-hidden ${
                    r.isPopular ? 'border-[#E7CB58]/40 shadow-lg shadow-amber-500/5' : 'border-white/10'
                  }`}
                >
                  {r.isPopular && (
                    <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-2xl bg-[#E7CB58] text-black text-[9px] font-black uppercase tracking-wider">
                      ★ POPULAR
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#E7CB58]/15 text-[#E7CB58] border border-[#E7CB58]/30 flex items-center justify-center font-bold">
                      {r.icon === 'Coffee' ? (
                        <Coffee className="w-5 h-5" />
                      ) : r.icon === 'ShieldCheck' ? (
                        <Shield className="w-5 h-5" />
                      ) : r.icon === 'Sparkles' ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <Ticket className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-display font-bold text-white">{r.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Required</span>
                      <span className="text-sm font-bold text-[#E7CB58] flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{r.costMiles} FlashMiles</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeem(r)}
                      disabled={!canAfford || isProcessing}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                        canAfford
                          ? 'bg-[#E7CB58] hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                          : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>{isProcessing ? 'Claiming...' : canAfford ? 'Redeem Voucher' : 'Need More Miles'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: MISSIONS & EARNING BADGES
         ======================================================== */}
      {activeTab === 'MISSIONS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 flex items-center space-x-3">
            <Zap className="w-5 h-5 text-purple-400 shrink-0" />
            <p className="text-xs leading-relaxed">
              Complete autonomous travel milestones to earn bonus FlashMiles and accelerate your promotion to <strong>Platinum Sovereign Tier</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {account.missions.map(m => {
              const isClaimingThis = isClaiming === m.id;
              return (
                <div
                  key={m.id}
                  className="p-5 rounded-3xl bg-[#16181F] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-display font-bold text-white">{m.title}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{m.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#E7CB58] block">+{m.rewardMiles}</span>
                      <span className="text-[9px] text-gray-500">FlashMiles</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-gray-400">
                      Status: {m.isClaimed ? (
                        <span className="text-emerald-400 font-bold">✓ Reward Claimed</span>
                      ) : m.isCompleted ? (
                        <span className="text-[#E7CB58] font-bold">Ready to Claim!</span>
                      ) : (
                        <span>In Progress ({m.progress}/{m.target})</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimMission(m)}
                      disabled={m.isClaimed || !m.isCompleted || isClaimingThis}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        m.isClaimed
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : m.isCompleted
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-black shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse'
                          : 'bg-white/5 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isClaimingThis ? 'Claiming...' : m.isClaimed ? 'Claimed' : m.isCompleted ? 'Claim +Miles' : 'Locked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: TIER PRIVILEGES COMPARISON MATRIX
         ======================================================== */}
      {activeTab === 'TIERS' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#16181F]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/50 border-b border-white/10 text-gray-400 text-[10px] uppercase">
                <tr>
                  <th className="p-4">Membership Privilege</th>
                  <th className="p-4">Silver Cruiser (0 - 1.4k)</th>
                  <th className="p-4 text-amber-300">Gold Voyager (1.5k - 3.9k)</th>
                  <th className="p-4 text-purple-300">Platinum Sovereign (4k+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr>
                  <td className="p-4 font-bold text-white">Mile Earning Multiplier</td>
                  <td className="p-4">1.0x (1 Mile / ₹1)</td>
                  <td className="p-4 text-amber-300 font-bold">1.25x (1.25 Miles / ₹1)</td>
                  <td className="p-4 text-purple-300 font-bold">1.50x (1.50 Miles / ₹1)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Sleeper Berth Selection</td>
                  <td className="p-4">Standard</td>
                  <td className="p-4 text-emerald-400">✓ Free Lower Berth Lock</td>
                  <td className="p-4 text-emerald-400">✓ Premium Deck Allocation</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Cancellation Waiver</td>
                  <td className="p-4 text-gray-500">Standard Policy</td>
                  <td className="p-4 text-emerald-400">✓ 1 Free Waiver / Month</td>
                  <td className="p-4 text-emerald-400">✓ Unlimited Free Reschedule</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Highway Refreshment Box</td>
                  <td className="p-4 text-gray-500">—</td>
                  <td className="p-4">10% Off Rest Stop Cafe</td>
                  <td className="p-4 text-emerald-400">✓ Complimentary Highway Box</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">VIP Terminal Bay Boarding</td>
                  <td className="p-4 text-gray-500">—</td>
                  <td className="p-4 text-emerald-400">✓ Priority Boarding Gate</td>
                  <td className="p-4 text-emerald-400">✓ VIP Conductor Greeting</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: TRANSACTION LEDGER
         ======================================================== */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-3">
          {account.history.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#16181F] border border-white/10 text-gray-400">
              No transactions recorded yet.
            </div>
          ) : (
            account.history.map(tx => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#16181F] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-xs">{tx.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{tx.description}</div>
                </div>

                <div className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Miles
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
