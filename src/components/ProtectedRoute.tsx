import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Shield, ShieldAlert, ArrowRight, User, Activity, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101114] flex items-center justify-center text-white font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7CB58] border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-400">Verifying Cryptographic Role Authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login page with return target
  if (!user || !role) {
    const defaultTargetRole = allowedRoles?.includes('ADMIN')
      ? 'ADMIN'
      : allowedRoles?.includes('OPERATOR')
      ? 'OPERATOR'
      : 'PASSENGER';

    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&role=${defaultTargetRole}`} replace />;
  }

  // Logged in but role is not authorized for this route
  if (allowedRoles && !allowedRoles.includes(role)) {
    const isTargetAdmin = allowedRoles.includes('ADMIN');
    const isTargetOperator = allowedRoles.includes('OPERATOR');

    return (
      <div className="min-h-screen bg-[#101114] text-white flex items-center justify-center p-4 sm:p-6 grid-bg">
        <div className="max-w-md w-full bg-[#16181F] border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          
          <div className="flex items-center space-x-3 text-red-400 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block font-bold">
                HTTP 403 • ACCESS FORBIDDEN
              </span>
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                Role Privilege Boundary
              </h2>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Signed-in Identity:</span>
              <span className="text-white font-bold">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Role Tier:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                role === 'ADMIN' ? 'bg-cyan-500/20 text-cyan-300' : role === 'OPERATOR' ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Required Role:</span>
              <span className="text-red-400 font-bold">{allowedRoles.join(' or ')}</span>
            </div>
          </div>

          <div className="text-xs text-gray-300 font-mono leading-relaxed space-y-2">
            {role === 'PASSENGER' && isTargetAdmin && (
              <p>
                As a <strong>Passenger</strong>, your account is isolated to traveler bookings, ticket management, and safety features. Root System Administrator controls and financial ledgers are restricted to system administrators.
              </p>
            )}
            {role === 'PASSENGER' && isTargetOperator && (
              <p>
                As a <strong>Passenger</strong>, your account cannot access Fleet Operations or coach dispatch matrices. Fleet dispatching is reserved for authorized fleet personnel.
              </p>
            )}
            {role === 'OPERATOR' && isTargetAdmin && (
              <p>
                As a <strong>Fleet Operator</strong>, you have access to fleet scheduling and coach telemetry, but root administrative commands and system audit logs require Root System Admin privileges.
              </p>
            )}
          </div>

          {/* Action buttons based on perspective */}
          <div className="space-y-2 pt-2">
            {role === 'PASSENGER' && (
              <Link
                to="/dashboard"
                className="w-full py-3 rounded-xl bg-[#E7CB58] hover:bg-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <User className="w-4 h-4" />
                <span>Return to Passenger Hub</span>
              </Link>
            )}

            {role === 'OPERATOR' && (
              <Link
                to="/operator"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-600/20"
              >
                <Activity className="w-4 h-4" />
                <span>Return to Fleet Operations</span>
              </Link>
            )}

            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}&role=${isTargetAdmin ? 'ADMIN' : 'OPERATOR'}`}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-mono text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E7CB58]" />
              <span>Log in with {isTargetAdmin ? 'System Admin (systemadmin@flashx.com)' : 'Fleet Ops (fleetops@flashx.com)'}</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};
