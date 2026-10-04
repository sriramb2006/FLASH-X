import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Vote,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  Copy,
  ArrowRight,
  Shield,
  Coffee,
  Zap,
  Bed,
  Utensils,
  Compass,
  AlertCircle
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: 'Lead Planner' | 'Contributor' | 'Traveler';
  status: 'online' | 'idle';
  color: string;
}

interface StopoverOption {
  id: string;
  name: string;
  category: 'FOOD' | 'SCENIC' | 'CHARGING' | 'CULTURE';
  proposedBy: string;
  votes: string[]; // user IDs
  downvotes: string[];
  description: string;
  estimatedDurationMin: number;
}

interface PreferencePoll {
  id: string;
  title: string;
  category: 'DEPARTURE_TIME' | 'COACH_CLASS' | 'AMENITIES';
  options: {
    id: string;
    label: string;
    description: string;
    votes: string[]; // list of collaborator IDs
  }[];
}

interface DiscussionMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

interface ItineraryDraft {
  id: string;
  title: string;
  corridor: { origin: string; destination: string };
  targetDate: string;
  collaborators: Collaborator[];
  stopovers: StopoverOption[];
  polls: PreferencePoll[];
  messages: DiscussionMessage[];
  status: 'DRAFTING' | 'CONSENSUS_REACHED' | 'LOCKED';
}

const INITIAL_COLLABORATORS: Collaborator[] = [
  { id: 'usr-1', name: 'Sriram B. (You)', avatar: 'SB', role: 'Lead Planner', status: 'online', color: 'bg-amber-500' },
  { id: 'usr-2', name: 'Ananya Rao', avatar: 'AR', role: 'Contributor', status: 'online', color: 'bg-purple-500' },
  { id: 'usr-3', name: 'Vikram Mehta', avatar: 'VM', role: 'Contributor', status: 'online', color: 'bg-cyan-500' },
  { id: 'usr-4', name: 'Divya Kumar', avatar: 'DK', role: 'Traveler', status: 'idle', color: 'bg-emerald-500' },
];

const INITIAL_STOPOVERS: StopoverOption[] = [
  {
    id: 'stop-1',
    name: 'Salem Highway Oasis (Filter Coffee & Dosa)',
    category: 'FOOD',
    proposedBy: 'Ananya Rao',
    votes: ['usr-1', 'usr-2', 'usr-3'],
    downvotes: [],
    description: 'Renowned 24/7 highway stop with pristine restrooms, charging bays, and authentic South Indian breakfast.',
    estimatedDurationMin: 25,
  },
  {
    id: 'stop-2',
    name: 'Dharmapuri Green Valley Scenic Viewpoint',
    category: 'SCENIC',
    proposedBy: 'Vikram Mehta',
    votes: ['usr-3'],
    downvotes: ['usr-2'],
    description: 'Quick photo stop overlooking the sunset hills along the Western Ghats corridor.',
    estimatedDurationMin: 15,
  },
  {
    id: 'stop-3',
    name: 'Krishnagiri Superfast EV Charging Hub',
    category: 'CHARGING',
    proposedBy: 'Sriram B. (You)',
    votes: ['usr-1', 'usr-2', 'usr-4'],
    downvotes: [],
    description: '350kW DC hyperchargers, air-conditioned lounge, and zero-delay turnaround.',
    estimatedDurationMin: 20,
  }
];

const INITIAL_POLLS: PreferencePoll[] = [
  {
    id: 'poll-departure',
    title: 'Preferred Corridor Departure Window',
    category: 'DEPARTURE_TIME',
    options: [
      { id: 'opt-morning', label: 'Early Dawn Express (06:00 - 07:30)', description: 'Reach destination for lunchtime meetings and day sightseeing', votes: ['usr-2'] },
      { id: 'opt-evening', label: 'Sunset Highway Cruiser (17:30 - 19:00)', description: 'Scenic drive with dinner stop at highway oasis', votes: ['usr-3'] },
      { id: 'opt-night', label: 'Midnight Sovereign Red-Eye (22:30 - 23:45)', description: 'Full night sleep in luxury AC berth, arrive refreshed at 06:00', votes: ['usr-1', 'usr-4'] }
    ]
  },
  {
    id: 'poll-coach',
    title: 'Coach & Berth Configuration',
    category: 'COACH_CLASS',
    options: [
      { id: 'opt-sleeper', label: 'Electric Sovereign Sleeper 2+1', description: 'Individual private berths with memory foam mattresses and charging pods', votes: ['usr-1', 'usr-2', 'usr-4'] },
      { id: 'opt-exec', label: 'Executive Semi-Sleeper Panoramic', description: 'Wide reclining plush leather seats with leg rests', votes: ['usr-3'] }
    ]
  },
  {
    id: 'poll-amenities',
    title: 'Priority Cabin Amenities',
    category: 'AMENITIES',
    options: [
      { id: 'opt-wifi', label: 'High-Speed 5G Starlink Satellite WiFi', description: 'Seamless remote working and HD video streaming on highways', votes: ['usr-1', 'usr-2', 'usr-3'] },
      { id: 'opt-food', label: 'Pre-ordered Gourmet Meal Box & Filter Coffee', description: 'Delivered directly to berth at scheduled rest checkpoints', votes: ['usr-1', 'usr-4'] }
    ]
  }
];

const INITIAL_MESSAGES: DiscussionMessage[] = [
  {
    id: 'msg-1',
    userId: 'usr-2',
    userName: 'Ananya Rao',
    userAvatar: 'AR',
    text: 'Hey team! I propose we definitely take the Salem highway oasis stop for dinner, the food and hygiene are top-notch.',
    timestamp: '10:14 AM'
  },
  {
    id: 'msg-2',
    userId: 'usr-1',
    userName: 'Sriram B. (You)',
    userAvatar: 'SB',
    text: 'Agreed! Just voted for the Salem stop and the 22:30 Red-Eye sleeper. That way we avoid peak city traffic.',
    timestamp: '10:16 AM'
  },
  {
    id: 'msg-3',
    userId: 'usr-3',
    userName: 'Vikram Mehta',
    userAvatar: 'VM',
    text: 'The 2+1 Sleeper has 5G Starlink WiFi, so we can work during the first hour before sleeping. Perfect!',
    timestamp: '10:19 AM'
  }
];

export const SharedTripPlanner: React.FC = () => {
  const currentUserId = 'usr-1'; // Local user
  const [draft, setDraft] = useState<ItineraryDraft>({
    id: 'draft-fx-blr-cbe-2026',
    title: 'Weekend Group Expedition: Bengaluru ⇄ Coimbatore',
    corridor: { origin: 'Bengaluru', destination: 'Coimbatore' },
    targetDate: '2026-10-18',
    collaborators: INITIAL_COLLABORATORS,
    stopovers: INITIAL_STOPOVERS,
    polls: INITIAL_POLLS,
    messages: INITIAL_MESSAGES,
    status: 'DRAFTING'
  });

  const [activeTab, setActiveTab] = useState<'STOPOVERS' | 'POLLS' | 'DISCUSS' | 'TIMELINE'>('STOPOVERS');
  const [newStopName, setNewStopName] = useState('');
  const [newStopDesc, setNewStopDesc] = useState('');
  const [newStopCategory, setNewStopCategory] = useState<'FOOD' | 'SCENIC' | 'CHARGING' | 'CULTURE'>('FOOD');
  const [newStopDuration, setNewStopDuration] = useState<number>(20);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Voting on Stopovers
  const handleVoteStopover = (stopId: string, isUpvote: boolean) => {
    setDraft(prev => {
      const updatedStopovers = prev.stopovers.map(s => {
        if (s.id !== stopId) return s;
        let newVotes = [...s.votes];
        let newDownvotes = [...s.downvotes];

        if (isUpvote) {
          if (newVotes.includes(currentUserId)) {
            newVotes = newVotes.filter(id => id !== currentUserId);
          } else {
            newVotes.push(currentUserId);
            newDownvotes = newDownvotes.filter(id => id !== currentUserId);
          }
        } else {
          if (newDownvotes.includes(currentUserId)) {
            newDownvotes = newDownvotes.filter(id => id !== currentUserId);
          } else {
            newDownvotes.push(currentUserId);
            newVotes = newVotes.filter(id => id !== currentUserId);
          }
        }

        return { ...s, votes: newVotes, downvotes: newDownvotes };
      });

      return { ...prev, stopovers: updatedStopovers };
    });
  };

  // Voting on Poll Options
  const handleVotePoll = (pollId: string, optionId: string) => {
    setDraft(prev => {
      const updatedPolls = prev.polls.map(p => {
        if (p.id !== pollId) return p;
        const updatedOptions = p.options.map(opt => {
          if (opt.id === optionId) {
            const hasVoted = opt.votes.includes(currentUserId);
            return {
              ...opt,
              votes: hasVoted ? opt.votes.filter(id => id !== currentUserId) : [...opt.votes, currentUserId]
            };
          }
          return opt;
        });
        return { ...p, options: updatedOptions };
      });
      return { ...prev, polls: updatedPolls };
    });
  };

  // Add new stopover proposal
  const handleAddStopover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName.trim()) return;

    const newStop: StopoverOption = {
      id: `stop-${Date.now()}`,
      name: newStopName.trim(),
      description: newStopDesc.trim() || 'Community proposed checkpoint.',
      category: newStopCategory,
      proposedBy: 'Sriram B. (You)',
      votes: [currentUserId],
      downvotes: [],
      estimatedDurationMin: newStopDuration
    };

    setDraft(prev => ({
      ...prev,
      stopovers: [newStop, ...prev.stopovers]
    }));

    setNewStopName('');
    setNewStopDesc('');
    setShowAddStopModal(false);
  };

  // Add discussion message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: 'Sriram B. (You)',
      userAvatar: 'SB',
      text: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDraft(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));

    setNewMessageText('');
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const totalCollaborators = draft.collaborators.length;

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl font-mono relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Itinerary Draft Meta */}
      <div className="flex flex-wrap items-start justify-between pb-5 border-b border-white/10 gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-white text-lg sm:text-xl">
              Shared Trip Planner™
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Live Collaboration Matrix
            </span>
          </div>
          
          <h4 className="text-base sm:text-lg font-display font-extrabold text-[#E7CB58]">
            {draft.title}
          </h4>
          <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Corridor: <b className="text-white">{draft.corridor.origin} ⇄ {draft.corridor.destination}</b></span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Travel Date: <b className="text-white">{draft.targetDate}</b></span>
            </span>
          </div>
        </div>

        {/* Collaborators Avatars & Invite Button */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center space-x-1.5">
            <div className="flex -space-x-2 overflow-hidden py-1">
              {draft.collaborators.map((c) => (
                <div
                  key={c.id}
                  title={`${c.name} (${c.role}) - ${c.status}`}
                  className={`inline-block h-8 w-8 rounded-full ring-2 ring-[#16181F] ${c.color} text-black font-bold text-xs flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform`}
                >
                  {c.avatar}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400 font-bold pl-1.5">{draft.collaborators.length} Planners</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Invite Link Copied!' : 'Share Itinerary Draft'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('STOPOVERS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'STOPOVERS'
              ? 'bg-[#E7CB58] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Stopover & Oasis Proposals ({draft.stopovers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('POLLS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'POLLS'
              ? 'bg-[#E7CB58] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Transit Preference Polls ({draft.polls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'TIMELINE'
              ? 'bg-[#E7CB58] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Draft Consensus Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DISCUSS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'DISCUSS'
              ? 'bg-[#E7CB58] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Planning Chat ({draft.messages.length})</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: STOPOVER & REST-STOP PROPOSALS WITH LIVE VOTING
         ======================================================== */}
      {activeTab === 'STOPOVERS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white">Highway Checkpoints & Rest-Stop Voting</h4>
              <p className="text-xs text-gray-400 font-sans">
                Vote on suggested dining, coffee, and EV charging stops. High-consensus stops are automatically integrated into the master corridor plan.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAddStopModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Propose Stopover</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draft.stopovers.map((stop) => {
              const totalVotes = stop.votes.length;
              const hasVotedUp = stop.votes.includes(currentUserId);
              const hasVotedDown = stop.downvotes.includes(currentUserId);
              const consensusPct = Math.round((totalVotes / totalCollaborators) * 100);
              const isConsensus = consensusPct >= 75;

              return (
                <div
                  key={stop.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                    isConsensus
                      ? 'bg-gradient-to-br from-black/60 to-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          stop.category === 'FOOD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          stop.category === 'CHARGING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {stop.category}
                        </span>

                        {isConsensus && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Consensus Reached ({consensusPct}%)</span>
                          </span>
                        )}
                      </div>

                      <h5 className="font-display font-bold text-white text-sm">
                        {stop.name}
                      </h5>
                    </div>

                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-lg shrink-0">
                      ⏱️ {stop.estimatedDurationMin} min stop
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {stop.description}
                  </p>

                  {/* Voting Action Bar & Voter Avatars */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleVoteStopover(stop.id, true)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all cursor-pointer ${
                          hasVotedUp
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote ({stop.votes.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVoteStopover(stop.id, false)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          hasVotedDown
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                        }`}
                        title="Downvote / Object"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-gray-400">
                      Proposed by <b className="text-gray-200">{stop.proposedBy}</b>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: TRANSIT PREFERENCE POLLS
         ======================================================== */}
      {activeTab === 'POLLS' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Transit Preference Group Polls</h4>
            <p className="text-xs text-gray-400 font-sans">
              Cast your vote on departure departure windows, coach classes, and priority cabin amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {draft.polls.map((poll) => (
              <div
                key={poll.id}
                className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-1 border-b border-white/10 pb-3">
                  <span className="text-[10px] text-[#E7CB58] font-bold uppercase tracking-wider block">
                    Group Decision
                  </span>
                  <h5 className="font-display font-bold text-white text-sm">
                    {poll.title}
                  </h5>
                </div>

                <div className="space-y-2.5">
                  {poll.options.map((opt) => {
                    const hasVoted = opt.votes.includes(currentUserId);
                    const votePct = Math.round((opt.votes.length / totalCollaborators) * 100);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVotePoll(poll.id, opt.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 relative overflow-hidden ${
                          hasVoted
                            ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                            : 'bg-white/5 hover:bg-white/10 border-white/5'
                        }`}
                      >
                        {/* Vote progress fill in background */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-purple-500/10 transition-all duration-500 pointer-events-none"
                          style={{ width: `${votePct}%` }}
                        />

                        <div className="flex items-center justify-between text-xs relative z-10">
                          <span className={`font-bold ${hasVoted ? 'text-purple-300' : 'text-white'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#E7CB58]">
                            {opt.votes.length} Votes ({votePct}%)
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400 font-sans relative z-10 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-gray-500 text-center pt-2">
                  * Click any card option to toggle your vote
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: DRAFT CONSENSUS TIMELINE & INSTANT BOOKING
         ======================================================== */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Synthesized Group Itinerary Blueprint</h4>
              <p className="text-xs text-gray-400 font-sans">
                Real-time synthesis of all group votes, top-rated rest stops, and timing preferences into an actionable booking itinerary.
              </p>
            </div>

            <Link
              to={`/search?source=${draft.corridor.origin}&destination=${draft.corridor.destination}`}
              className="px-5 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-[#F2DA75] text-black font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/15 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Finalize & Book Group Seats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Timeline Sequence */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6 relative pl-8 border-l-2 border-[#E7CB58]/40">
            
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#16181F]" />
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">22:30 PM — Boarding Terminal ({draft.corridor.origin})</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                  Top Voted Schedule
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Assemble at primary bay. Electric Sovereign Sleeper 2+1 cabin check-in with 5G Starlink WiFi initialized.
              </p>
            </div>

            {/* Step 2 (Approved stopovers) */}
            {draft.stopovers.filter(s => s.votes.length >= 2).map((s, idx) => (
              <div key={s.id} className="relative">
                <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#E7CB58] ring-4 ring-[#16181F]" />
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{0 + idx * 2 + 1}:45 AM — {s.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
                    Approved Stopover ({s.votes.length} Votes)
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  {s.description} (Allocated window: {s.estimatedDurationMin} minutes)
                </p>
              </div>
            ))}

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-purple-400 ring-4 ring-[#16181F]" />
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">06:00 AM — Dropping Terminal ({draft.corridor.destination})</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">
                  Final Destination
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Arrival at destination hub. Morning filter coffee station & express baggage carousel retrieval.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: COLLABORATIVE PLANNING CHAT & SUGGESTIONS
         ======================================================== */}
      {activeTab === 'DISCUSS' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Planner Notes & Discussion Room</h4>
            <p className="text-xs text-gray-400 font-sans">
              Leave notes, berth seat coordination requests, and travel suggestions for the group.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 max-h-80 overflow-y-auto">
            {draft.messages.map((m) => {
              const isMe = m.userId === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full text-black font-bold text-[10px] flex items-center justify-center shrink-0 ${
                    isMe ? 'bg-[#E7CB58]' : 'bg-purple-400'
                  }`}>
                    {m.userAvatar}
                  </div>

                  <div className={`p-3 rounded-2xl max-w-lg text-xs space-y-1 ${
                    isMe ? 'bg-[#E7CB58]/15 border border-[#E7CB58]/30 text-amber-100' : 'bg-white/5 border border-white/10 text-gray-200'
                  }`}>
                    <div className="flex items-center justify-between gap-4 text-[10px] text-gray-400">
                      <span className="font-bold text-white">{m.userName}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="font-sans leading-relaxed">{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Drop a note or suggestion for your travel companions..."
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E7CB58]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-[#F2DA75] text-black font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Post Note
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: PROPOSE NEW STOPOVER
         ======================================================== */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#16181F] border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-display font-bold text-white text-base">Propose Stopover / Checkpoint</h4>
              <button
                type="button"
                onClick={() => setShowAddStopModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                [✕]
              </button>
            </div>

            <form onSubmit={handleAddStopover} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Stopover Name</label>
                <input
                  type="text"
                  required
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder="e.g., Salem Highway Filter Coffee Bay"
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Category</label>
                  <select
                    value={newStopCategory}
                    onChange={(e) => setNewStopCategory(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="FOOD">Dining & Food 🍔</option>
                    <option value="CHARGING">EV Hypercharging ⚡</option>
                    <option value="SCENIC">Scenic Viewpoint 🌄</option>
                    <option value="CULTURE">Heritage / Landmark 🏛️</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={newStopDuration}
                    onChange={(e) => setNewStopDuration(parseInt(e.target.value) || 15)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Description / Why you recommend it</label>
                <textarea
                  rows={2}
                  value={newStopDesc}
                  onChange={(e) => setNewStopDesc(e.target.value)}
                  placeholder="Clean restrooms, famous filter coffee, EV fast chargers, etc."
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
