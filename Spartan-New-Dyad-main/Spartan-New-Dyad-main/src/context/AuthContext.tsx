"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/saas';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const DEFAULT_ADMIN: User = {
  id: 'usr_admin_1',
  name: 'Gleison (Fundador)',
  email: 'ceo@saasmaster.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  companyName: 'Nexus Growth Inc.',
  status: 'active',
  mrr: 124500,
  joinedAt: '2024-01-10',
};

const DEFAULT_CLIENT: User = {
  id: 'usr_client_1',
  name: 'Carlos Mendes',
  email: 'carlos@agenciamkt.com.br',
  role: 'client',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  companyName: 'Mendes Growth Digital',
  planId: 'plan_pro',
  status: 'active',
  mrr: 497,
  joinedAt: '2024-03-01',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('saas_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('saas_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('saas_current_user');
    }
  }, [user]);

  const login = (role: UserRole, email?: string) => {
    if (role === 'admin') {
      setUser({ ...DEFAULT_ADMIN, email: email || DEFAULT_ADMIN.email });
    } else {
      setUser({ ...DEFAULT_CLIENT, email: email || DEFAULT_CLIENT.email });
    }
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_CLIENT);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};