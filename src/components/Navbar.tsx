import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Cpu,
  Shield,
  Compass,
  User as UserIcon,
  Mic,
  Activity,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Layers,
  Wrench,
  FileText,
  Users,
  Globe,
  Contrast,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { UserRole } from '../../shared/types';

interface NavbarProps {
  onOpenVoiceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoiceModal }) => {
  const { user, role, logout, switchRole } = useAuth();
  const { highContrast, toggleHighContrast } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}`));

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#101114]/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-black border border-amber-500/40 p-0.5 overflow-hidden shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all flex items-center justify-center shrink-0">
              <img
                src="/flashx_os_logo.jpg"
                alt="FLASH-X"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-lg text-white tracking-wider">FLASH-X</span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Travel Intelligence</span>
            </div>
          </Link>

          {/* Role Status Tag */}
          {role && (
            <div className="hidden lg:flex items-center space-x-1.5 ml-3 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${
                role === 'ADMIN' ? 'bg-cyan-400 animate-pulse' : role === 'OPERATOR' ? 'bg-purple-400' : 'bg-[#E7CB58]'
              }`} />
              <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">
                {role} VIEW
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Navigation according to Role */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-mono">
          
          {/* Default / Passenger View */}
          {(!role || role === 'PASSENGER') && (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/')
                    ? 'text-[#E7CB58] bg-[#E7CB58]/10 border border-[#E7CB58]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t('navbar_home')}</span>
              </Link>
              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/search')
                    ? 'text-[#E7CB58] bg-[#E7CB58]/10 border border-[#E7CB58]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{t('navbar_search')}</span>
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/dashboard')
                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t('navbar_hub')}</span>
                </Link>
              )}
            </>
          )}

          {/* Fleet Operator View */}
          {role === 'OPERATOR' && (
            <>
              <Link
                to="/operator"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/operator')
                    ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Fleet Operations</span>
              </Link>

              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/search')
                    ? 'text-[#E7CB58] bg-[#E7CB58]/10 border border-[#E7CB58]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Live Route Inventory</span>
              </Link>
            </>
          )}

          {/* System Admin View */}
          {role === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Command Center</span>
              </Link>

              <Link
                to="/operator"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/operator')
                    ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Fleet Dispatch</span>
              </Link>

              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/search')
                    ? 'text-[#E7CB58] bg-[#E7CB58]/10 border border-[#E7CB58]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Bus Catalog</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Accessibility, Voice Button & Authentication / Profile Area */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* High Contrast Accessibility Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-label="Toggle High Contrast Mode"
            title={highContrast ? "High Contrast Mode Active (Click to disable)" : "Enable High Contrast Mode (Visual Accessibility)"}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              highContrast
                ? 'bg-[#FFFF00] text-black border-[#FFFF00] font-extrabold shadow-md shadow-yellow-400/25 ring-2 ring-yellow-400'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-gray-300 hover:text-white'
            }`}
          >
            <Contrast className={`w-3.5 h-3.5 ${highContrast ? 'text-black' : 'text-[#E7CB58]'}`} />
            <span className="hidden sm:inline">{highContrast ? 'Contrast: ON' : 'Contrast'}</span>
          </button>

          {/* Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 text-xs transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono uppercase">{i18n.language}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-24 rounded-xl bg-[#181A20] border border-white/15 shadow-2xl p-1 z-50 text-xs font-mono">
                {['en', 'ta', 'hi'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10"
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice to Journey CTA */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#E7CB58]/15 border border-white/10 hover:border-[#E7CB58]/40 text-gray-200 hover:text-[#E7CB58] text-xs font-medium transition-all group"
            title="Voice-to-Journey speech trip planner"
          >
            <Mic className="w-3.5 h-3.5 text-[#E7CB58] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-mono text-[11px]">Voice Plan</span>
          </button>

          {/* User Logged In Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white transition-colors"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  role === 'ADMIN' ? 'bg-cyan-500/20 text-cyan-400' : role === 'OPERATOR' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#E7CB58] text-black'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-semibold text-white truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[9px] text-gray-400 font-mono tracking-wider">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#181A20] border border-white/15 shadow-2xl p-2 z-50 text-xs font-mono">
                  
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <span className="text-[10px] text-gray-400 uppercase block">Signed in identity:</span>
                    <span className="text-white font-bold block truncate">{user.name}</span>
                    <span className="text-[10px] text-amber-300 block">{user.email}</span>
                  </div>

                  {/* Settings & Accessibility section in profile menu */}
                  <div className="py-2 px-3 border-b border-white/10 space-y-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Display & Accessibility</span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Contrast className="w-3.5 h-3.5 text-[#E7CB58]" />
                        <span className="text-white text-[11px]">High Contrast Mode</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleHighContrast}
                        aria-pressed={highContrast}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                          highContrast ? 'bg-[#FFFF00] justify-end' : 'bg-white/20 justify-start'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          highContrast ? 'bg-black' : 'bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* Logged Out Actions */
            <div className="flex items-center space-x-2 font-mono text-xs">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center space-x-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E7CB58]" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-[#E7CB58] text-black font-semibold hover:bg-amber-400 transition-colors items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
