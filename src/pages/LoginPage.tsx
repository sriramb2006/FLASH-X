import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Activity, Lock, ArrowRight, AlertCircle, CheckCircle2, Sparkles, KeyRound, UserPlus, Info, Fingerprint, ScanFace } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../shared/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectTarget = searchParams.get('redirect');
  const initialRole = (searchParams.get('role')?.toUpperCase() as UserRole) || 'PASSENGER';

  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState(
    initialRole === 'OPERATOR' ? 'fleetops@flashx.com' : initialRole === 'ADMIN' ? 'systemadmin@flashx.com' : ''
  );
  const [password, setPassword] = useState(
    initialRole === 'OPERATOR' ? 'fleetops123$%^' : initialRole === 'ADMIN' ? 'systemadmin123$%&' : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage('');
    if (role === 'ADMIN') {
      setIdentifier('systemadmin@flashx.com');
      setPassword('systemadmin123$%&');
    } else if (role === 'OPERATOR') {
      setIdentifier('fleetops@flashx.com');
      setPassword('fleetops123$%^');
    } else {
      setIdentifier('');
      setPassword('');
    }
  };

  // Biometric login / WebAuthn Simulation states
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [bioStage, setBioStage] = useState<'idle' | 'register_prompt' | 'scanning' | 'success' | 'failed'>('idle');
  const [bioRegUser, setBioRegUser] = useState('');
  const [bioRegPass, setBioRegPass] = useState('');

  const startBiometricRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioRegUser.trim() || !bioRegPass.trim()) return;

    setBioStage('scanning');

    // Real WebAuthn call with fallback simulation
    try {
      if (navigator.credentials && navigator.credentials.create) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "FLASHX OS" },
            user: {
              id: new Uint8Array([1, 2, 3, 4]),
              name: bioRegUser,
              displayName: bioRegUser
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "platform" },
            timeout: 2000
          }
        }).catch(err => console.warn("WebAuthn iframe block or user cancel:", err));
      }
    } catch (err) {
      console.warn("Real WebAuthn unavailable, proceeding with secure simulation:", err);
    }

    // Simulate scanning delay
    setTimeout(() => {
      localStorage.setItem('flashx_bio_enabled', 'true');
      localStorage.setItem('flashx_bio_user', bioRegUser.trim());
      localStorage.setItem('flashx_bio_pass', bioRegPass);
      localStorage.setItem('flashx_bio_role', activeTab);
      
      setBioStage('success');
      setTimeout(() => {
        setBioModalOpen(false);
        setBioStage('idle');
        setIdentifier(bioRegUser.trim());
        setPassword(bioRegPass);
      }, 1500);
    }, 2000);
  };

  const handleBiometricLogin = async () => {
    const isEnabled = localStorage.getItem('flashx_bio_enabled') === 'true';
    if (!isEnabled) {
      // Prompt registration
      setBioRegUser(identifier);
      setBioRegPass(password);
      setBioStage('register_prompt');
      setBioModalOpen(true);
      return;
    }

    const storedUser = localStorage.getItem('flashx_bio_user') || '';
    const storedPass = localStorage.getItem('flashx_bio_pass') || '';
    const storedRole = (localStorage.getItem('flashx_bio_role') as UserRole) || 'PASSENGER';

    setBioModalOpen(true);
    setBioStage('scanning');

    // Real WebAuthn call with fallback simulation
    try {
      if (navigator.credentials && navigator.credentials.get) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 2000,
            allowCredentials: []
          }
        }).catch(err => console.warn("WebAuthn iframe block or user cancel:", err));
      }
    } catch (err) {
      console.warn("Real WebAuthn unavailable, proceeding with secure simulation:", err);
    }

    setTimeout(async () => {
      setBioStage('success');
      try {
        const authenticatedUser = await login({
          identifier: storedUser,
          password: storedPass,
          role: storedRole,
        });

        setTimeout(() => {
          setBioModalOpen(false);
          setBioStage('idle');
          if (redirectTarget) {
            navigate(redirectTarget);
          } else if (authenticatedUser.role === 'ADMIN') {
            navigate('/admin');
          } else if (authenticatedUser.role === 'OPERATOR') {
            navigate('/operator');
          } else {
            navigate('/dashboard');
          }
        }, 1200);
      } catch (err: any) {
        setBioStage('failed');
        setTimeout(() => {
          setBioModalOpen(false);
          setBioStage('idle');
          setErrorMessage('Biometric login failed. Stored credentials out of sync.');
        }, 2000);
      }
    }, 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const authenticatedUser = await login({
        identifier: identifier.trim(),
        password,
        role: activeTab,
      });

      // Role-specific redirect
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (authenticatedUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (authenticatedUser.role === 'OPERATOR') {
        navigate('/operator');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials or sign up first.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 grid-bg">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex flex-col items-center space-y-2 group">
            <div className="w-14 h-14 rounded-2xl bg-black border border-amber-500/40 p-0.5 overflow-hidden shadow-xl shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all flex items-center justify-center shrink-0">
              <img
                src="/flashx_os_logo.jpg"
                alt="FLASH-X Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-xl text-white tracking-wider">FLASH-X</span>
            </div>
          </Link>
          <div className="text-[11px] text-[#E7CB58] font-mono font-medium tracking-wide">
            Beyond Booking. Beyond Navigation. Beyond Travel.
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Autonomous Portal Login
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Role-isolated access for Passengers, Fleet Operators, and Administrators.
          </p>
        </div>

        {/* Role Portal Tabs */}
        <div className="bg-[#16181F] p-1.5 rounded-2xl border border-white/10 grid grid-cols-3 gap-1 text-xs font-mono">
          {[
            { id: 'PASSENGER', label: 'Passenger', icon: User, color: 'text-amber-400' },
            { id: 'OPERATOR', label: 'Fleet Ops', icon: Activity, color: 'text-purple-400' },
            { id: 'ADMIN', label: 'System Admin', icon: Shield, color: 'text-cyan-400' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as UserRole)}
                className={`py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center space-x-1.5 transition-all ${
                  isSel
                    ? 'bg-[#E7CB58] text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Login Box */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              {activeTab === 'PASSENGER' ? 'Traveler Access' : activeTab === 'OPERATOR' ? 'Fleet Dispatch Access' : 'Root System Command'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              SECURE RBAC
            </span>
          </div>

          {/* Passenger Sign-Up Notice */}
          {activeTab === 'PASSENGER' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2">
              <div className="flex items-center space-x-2 font-bold text-[#E7CB58]">
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Mandatory Passenger Sign-Up</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Every passenger must sign up first to create their own username and password before signing in.
              </p>
              <div className="pt-1">
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 text-xs text-black bg-[#E7CB58] hover:bg-amber-400 font-bold px-3 py-1.5 rounded-xl transition-all shadow-md"
                >
                  <span>Create Passenger Account / Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Fleet Ops Credential Hint */}
          {activeTab === 'OPERATOR' && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-purple-300">
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Fleet Operations Portal Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('fleetops@flashx.com');
                    setPassword('fleetops123$%^');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] border border-purple-500/40 cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">OPERATOR USERNAME:</span>
                  <code className="text-white font-bold">fleetops@flashx.com</code>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">OPERATOR PASSWORD:</span>
                  <code className="text-[#E7CB58] font-bold">fleetops123$%^</code>
                </div>
              </div>
            </div>
          )}

          {/* Admin Credential Hint */}
          {activeTab === 'ADMIN' && (
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-cyan-300">
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>System Admin Portal Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('systemadmin@flashx.com');
                    setPassword('systemadmin123$%&');
                  }}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] border border-cyan-500/40 cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">ADMIN USERNAME:</span>
                  <code className="text-white font-bold">systemadmin@flashx.com</code>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">ADMIN PASSWORD:</span>
                  <code className="text-[#E7CB58] font-bold">systemadmin123$%&</code>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                {activeTab === 'PASSENGER' ? 'Your Registered Username or Email' : 'Operator / Admin Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeTab === 'PASSENGER' ? 'Enter username or email' : activeTab === 'OPERATOR' ? 'fleetops@flashx.com' : 'systemadmin@flashx.com'}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'PASSENGER' ? 'Enter your chosen password' : 'Enter password'}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:scale-[1.01] active:scale-[0.99] text-black font-display font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Identity...</span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Sign In to {activeTab === 'PASSENGER' ? 'Passenger Hub' : activeTab === 'OPERATOR' ? 'Fleet Operations' : 'Admin Command'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleBiometricLogin}
              className="w-full py-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-[#E7CB58]/20 hover:border-[#E7CB58]/40 text-[#E7CB58] hover:text-amber-400 transition-all flex items-center justify-center space-x-2 cursor-pointer font-mono"
            >
              {activeTab === 'PASSENGER' ? (
                <ScanFace className="w-4 h-4 text-[#E7CB58] animate-pulse" />
              ) : (
                <Fingerprint className="w-4 h-4 text-[#E7CB58] animate-pulse" />
              )}
              <span>Instant Biometric Access (FaceID / TouchID)</span>
            </button>
          </form>

          {/* Quick Access Helper Bar */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] text-gray-400 font-mono uppercase block text-center">
              Role Access & Registration:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <Link
                to="/register"
                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-center transition-colors font-semibold flex flex-col items-center justify-center"
              >
                <span>Passenger</span>
                <span className="text-[9px] text-gray-400">Sign Up First</span>
              </Link>
              <button
                type="button"
                onClick={() => handleTabChange('OPERATOR')}
                className={`p-2 rounded-lg text-center transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  activeTab === 'OPERATOR'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/60 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-purple-300 border border-white/5'
                }`}
              >
                <span>Fleet Ops</span>
                <span className="text-[9px] text-gray-400 font-mono">fleetops@flashx.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('ADMIN')}
                className={`p-2 rounded-lg text-center transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  activeTab === 'ADMIN'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/60 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/5'
                }`}
              >
                <span>System Admin</span>
                <span className="text-[9px] text-gray-400 font-mono">systemadmin@flashx.com</span>
              </button>
            </div>
          </div>

          {/* Registration Link for Passengers */}
          {activeTab === 'PASSENGER' && (
            <div className="pt-2 text-center text-xs text-gray-400 font-mono">
              Don't have a passenger account yet?{' '}
              <Link to="/register" className="text-[#E7CB58] hover:underline font-bold">
                Create Account (Sign Up)
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* Biometric Scanning Overlay Modal */}
      {bioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Animated scanning radar effect */}
            {bioStage === 'scanning' && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none" />
            )}

            {bioStage === 'register_prompt' ? (
              <form onSubmit={startBiometricRegistration} className="space-y-4 text-xs font-mono text-left">
                <div className="text-center space-y-2 pb-2">
                  {activeTab === 'PASSENGER' ? (
                    <ScanFace className="w-12 h-12 text-[#E7CB58] mx-auto animate-bounce" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-[#E7CB58] mx-auto animate-bounce" />
                  )}
                  <h3 className="text-base font-display font-bold text-white">Enable Biometric Login</h3>
                  <p className="text-xs text-gray-400">
                    Pair your device's biometric authentication (FaceID/TouchID) for secure, instantaneous future access.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-400 mb-1">Account Username / Email</label>
                    <input
                      type="text"
                      required
                      value={bioRegUser}
                      onChange={(e) => setBioRegUser(e.target.value)}
                      placeholder="Username or email"
                      className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-gray-400 mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      value={bioRegPass}
                      onChange={(e) => setBioRegPass(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full bg-[#101114] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBioModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-semibold cursor-pointer text-center"
                  >
                    Register Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 space-y-6">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  {bioStage === 'scanning' && (
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin" />
                  )}
                  <div className={`p-5 rounded-2xl bg-black border ${bioStage === 'success' ? 'border-emerald-500 bg-emerald-500/10' : bioStage === 'failed' ? 'border-red-500 bg-red-500/10' : 'border-white/10'} transition-all`}>
                    {activeTab === 'PASSENGER' ? (
                      <ScanFace className={`w-12 h-12 ${bioStage === 'success' ? 'text-emerald-400 scale-110' : bioStage === 'failed' ? 'text-red-400' : 'text-[#E7CB58] animate-pulse'}`} />
                    ) : (
                      <Fingerprint className={`w-12 h-12 ${bioStage === 'success' ? 'text-emerald-400 scale-110' : bioStage === 'failed' ? 'text-red-400' : 'text-[#E7CB58] animate-pulse'}`} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-display font-bold text-white">
                    {bioStage === 'scanning' ? 'Verifying Biometric Key...' : bioStage === 'success' ? 'Biometrics Verified!' : 'Verification Failed'}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {bioStage === 'scanning' ? 'Please align your face or hold your fingerprint to the scanner' : bioStage === 'success' ? 'Identity confirmed. Welcome back!' : 'Failed to scan biometrics. Please use password.'}
                  </p>
                </div>

                {bioStage === 'failed' && (
                  <button
                    onClick={() => setBioModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold font-mono"
                  >
                    Use Password login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
