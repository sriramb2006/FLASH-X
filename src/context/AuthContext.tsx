import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../shared/types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionToken: string;
  role: UserRole | null;
  switchRole: (role: UserRole) => Promise<void>;
  login: (credentials: { identifier?: string; username?: string; email?: string; password?: string; role?: string } | string, role?: string) => Promise<User>;
  register: (data: { name: string; username?: string; email: string; mobile: string; password?: string }) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flashx_token'));
  const [sessionToken] = useState<string>(() => {
    let st = sessionStorage.getItem('flashx_session_token');
    if (!st) {
      st = `st-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('flashx_session_token', st);
    }
    return st;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe(token);
        if (res.user) {
          setUser(res.user);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('flashx_token');
        }
      } catch (e) {
        console.warn('Failed loading current user session:', e);
        setUser(null);
        setToken(null);
        localStorage.removeItem('flashx_token');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      if (targetRole === 'OPERATOR') {
        const res = await api.login({ identifier: 'fleetops@flashx.com', password: 'fleetops123$%^', role: 'OPERATOR' });
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('flashx_token', res.token);
      } else if (targetRole === 'ADMIN') {
        const res = await api.login({ identifier: 'systemadmin@flashx.com', password: 'systemadmin123$%&', role: 'ADMIN' });
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('flashx_token', res.token);
      } else {
        // If switching to passenger without an active passenger account, user is directed to sign in or register
        logout();
      }
    } catch (e) {
      console.error('Role switch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { identifier?: string; username?: string; email?: string; password?: string; role?: string } | string, role?: string): Promise<User> => {
    const res = await api.login(credentials, role);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('flashx_token', res.token);
    return res.user;
  };

  const register = async (data: { name: string; username?: string; email: string; mobile: string; password?: string }): Promise<User> => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('flashx_token', res.token);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('flashx_token');
  };

  const updateUser = async (updated: User) => {
    const res = await api.updateProfile(updated);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionToken,
        role: user?.role || null,
        switchRole,
        login,
        register,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
