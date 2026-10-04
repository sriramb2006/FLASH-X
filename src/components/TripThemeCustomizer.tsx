import React from 'react';
import { Sparkles, Palette, Sun, Moon, Mountain, Building2, Trees, Landmark, Feather, Compass, Check } from 'lucide-react';

export type TripVibeThemeId = 'auto' | 'tropical' | 'urban' | 'alpine' | 'heritage' | 'minimalist' | 'cosmic';

export interface TripVibeTheme {
  id: TripVibeThemeId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  bgGradient: string;
  cardBorder: string;
  accentColor: string;
  accentText: string;
  accentBg: string;
  pathStroke: string;
  busColor: string;
  soundscape: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  patternType: 'palm' | 'grid' | 'peaks' | 'mandala' | 'dots' | 'stars';
}

export const TRIP_VIBE_THEMES: Record<TripVibeThemeId, TripVibeTheme> = {
  auto: {
    id: 'auto',
    name: 'Smart Auto-Detect',
    emoji: '✨',
    tagline: 'AI Destination Match',
    description: 'Dynamically adapts aesthetics according to geographic destination character and climate profile.',
    bgGradient: 'from-[#16181F] via-[#1a1b26] to-[#12131a]',
    cardBorder: 'border-amber-500/30',
    accentColor: '#E7CB58',
    accentText: 'text-[#E7CB58]',
    accentBg: 'bg-[#E7CB58]/10',
    pathStroke: '#E7CB58',
    busColor: '#E7CB58',
    soundscape: 'Adaptive Generative Soundscapes',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    patternType: 'grid',
  },
  tropical: {
    id: 'tropical',
    name: 'Tropical Oasis',
    emoji: '🌴',
    tagline: 'Coastal & Palm Grove Vibe',
    description: 'Emerald turquoise coastlines, golden beach sun warmth, soothing sea breeze motifs.',
    bgGradient: 'from-[#062c24] via-[#0b3b33] to-[#041a15]',
    cardBorder: 'border-emerald-500/40',
    accentColor: '#10B981',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    pathStroke: '#34D399',
    busColor: '#10B981',
    soundscape: 'Coastal Monsoon Rain & Tropical Waves',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-400/40',
    patternType: 'palm',
  },
  urban: {
    id: 'urban',
    name: 'Cyber Metropolis',
    emoji: '🏙️',
    tagline: 'High-Tech Urban Neon',
    description: 'Neon cyan, electric violet matrix grids, sleek aerodynamic night skyline vibe.',
    bgGradient: 'from-[#09152e] via-[#111c38] to-[#070d1f]',
    cardBorder: 'border-cyan-500/40',
    accentColor: '#06B6D4',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/15',
    pathStroke: '#22D3EE',
    busColor: '#06B6D4',
    soundscape: 'Lo-Fi Cyber Lounge & Midnight Highways',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40',
    patternType: 'grid',
  },
  alpine: {
    id: 'alpine',
    name: 'Alpine Mist',
    emoji: '🏔️',
    tagline: 'Mountain Elevation & Forest',
    description: 'Crisp mountain mist, frosty indigo slopes, tranquil pine valley air.',
    bgGradient: 'from-[#141b2b] via-[#1d273d] to-[#0f1422]',
    cardBorder: 'border-blue-400/40',
    accentColor: '#60A5FA',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    pathStroke: '#93C5FD',
    busColor: '#60A5FA',
    soundscape: 'Pine Whispers & Mountain Stream',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400/40',
    patternType: 'peaks',
  },
  heritage: {
    id: 'heritage',
    name: 'Heritage Royalty',
    emoji: '🏛️',
    tagline: 'Royal Temple & Cultural Grandeur',
    description: 'Deep royal terracotta, antique brass gold filigree, historic temple corridor opulence.',
    bgGradient: 'from-[#2d120a] via-[#3d1a0d] to-[#1c0a05]',
    cardBorder: 'border-amber-600/40',
    accentColor: '#F59E0B',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    pathStroke: '#FBBF24',
    busColor: '#F59E0B',
    soundscape: 'Acoustic Sitar & Temple Bells Meditation',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/40',
    patternType: 'mandala',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist Zen',
    emoji: '⚪',
    tagline: 'Titanium & Precision Clean',
    description: 'Monochrome precision, stark high-contrast typography, distraction-free clarity.',
    bgGradient: 'from-[#121214] via-[#18181b] to-[#09090b]',
    cardBorder: 'border-gray-500/40',
    accentColor: '#E5E7EB',
    accentText: 'text-gray-200',
    accentBg: 'bg-white/10',
    pathStroke: '#FFFFFF',
    busColor: '#FFFFFF',
    soundscape: 'Pure White Noise & Deep Focus Tone',
    badgeBg: 'bg-white/10',
    badgeText: 'text-gray-200',
    badgeBorder: 'border-white/30',
    patternType: 'dots',
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    emoji: '🌌',
    tagline: 'Deep Starlight & Aurora',
    description: 'Ultraviolet galaxies, starlight glimmer, celestial navigation aesthetics.',
    bgGradient: 'from-[#1e0e33] via-[#2c134d] to-[#120822]',
    cardBorder: 'border-purple-500/40',
    accentColor: '#A855F7',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/15',
    pathStroke: '#C084FC',
    busColor: '#A855F7',
    soundscape: 'Binaural Cosmic Pulse & Aurora Waves',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/40',
    patternType: 'stars',
  },
};

export function resolveDestinationVibe(destinationCity: string, selectedTheme: TripVibeThemeId): TripVibeTheme {
  if (selectedTheme !== 'auto') {
    return TRIP_VIBE_THEMES[selectedTheme];
  }

  const d = (destinationCity || '').toLowerCase();
  if (d.includes('kochi') || d.includes('cochin') || d.includes('goa') || d.includes('chennai') || d.includes('kerala') || d.includes('pondicherry') || d.includes('alappuzha')) {
    return TRIP_VIBE_THEMES.tropical;
  }
  if (d.includes('wayanad') || d.includes('ooty') || d.includes('munnar') || d.includes('coorg') || d.includes('kodaikanal') || d.includes('shimla') || d.includes('manali')) {
    return TRIP_VIBE_THEMES.alpine;
  }
  if (d.includes('madurai') || d.includes('mysore') || d.includes('varanasi') || d.includes('jaipur') || d.includes('thanjavur') || d.includes('hampi')) {
    return TRIP_VIBE_THEMES.heritage;
  }
  if (d.includes('bengaluru') || d.includes('bangalore') || d.includes('hyderabad') || d.includes('mumbai') || d.includes('pune') || d.includes('delhi')) {
    return TRIP_VIBE_THEMES.urban;
  }

  return TRIP_VIBE_THEMES.tropical;
}

interface TripThemeCustomizerProps {
  currentTheme: TripVibeThemeId;
  destinationCity: string;
  onSelectTheme: (themeId: TripVibeThemeId) => void;
}

export const TripThemeCustomizer: React.FC<TripThemeCustomizerProps> = ({
  currentTheme,
  destinationCity,
  onSelectTheme,
}) => {
  const activeResolvedTheme = resolveDestinationVibe(destinationCity, currentTheme);

  return (
    <div className="bg-[#111218] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Destination Aesthetic Vibe</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeResolvedTheme.badgeBg} ${activeResolvedTheme.badgeText} ${activeResolvedTheme.badgeBorder} font-bold flex items-center space-x-1`}>
            <span>{activeResolvedTheme.emoji}</span>
            <span>{activeResolvedTheme.name}</span>
          </span>
        </div>

        <span className="text-[10px] text-gray-400">
          Target: <strong className="text-white">{destinationCity || 'Destination'}</strong>
        </span>
      </div>

      {/* Theme Options Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-1">
        {Object.values(TRIP_VIBE_THEMES).map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? `bg-white/10 ${theme.cardBorder} shadow-lg ring-1 ring-white/30 scale-[1.02]`
                  : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{theme.emoji}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-400 font-bold" />}
              </div>
              <div className="mt-1">
                <div className="text-[11px] font-bold text-white truncate group-hover:text-[#E7CB58] transition-colors">
                  {theme.name}
                </div>
                <div className="text-[9px] text-gray-400 truncate mt-0.5">
                  {theme.tagline.split(' ')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Ambiance & Soundscape pill */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5 gap-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Vibe Atmosphere: <span className="text-white font-semibold">{activeResolvedTheme.description}</span></span>
        </div>
        <div className="text-right text-gray-400">
          🎵 <span className="text-gray-300">{activeResolvedTheme.soundscape}</span>
        </div>
      </div>
    </div>
  );
};
