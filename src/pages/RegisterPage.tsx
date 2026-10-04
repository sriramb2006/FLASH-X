import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await register({
        name,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
      });

      // Redirect to passenger hub
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
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
            Create Passenger Account
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Register your travel identity for intercity bookings, tickets, and safety alerts.
          </p>
        </div>

        {/* Register Box */}
        <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              New Passenger Registration
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              PASSENGER TIER
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sriram Bommannan"
                className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Choose Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sriram"
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98401 23456"
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your secure password"
                className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E7CB58]/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E7CB58] via-amber-400 to-[#E7CB58] hover:scale-[1.01] active:scale-[0.99] text-black font-display font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Creating Passenger Identity...</span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Register & Access Passenger Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-400 font-mono border-t border-white/10">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E7CB58] hover:underline font-bold">
              Sign In to FLASH-X
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
