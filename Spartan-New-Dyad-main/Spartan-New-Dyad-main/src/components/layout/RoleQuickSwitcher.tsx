"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Globe, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RoleQuickSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside aria-label="Modo de Demonstração e Navegação Rápida" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 max-w-[95vw] overflow-x-auto text-xs">
      <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700 font-semibold text-indigo-400">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        <span className="hidden sm:inline">Modo Demo:</span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          switchRole('admin');
          navigate('/admin');
        }}
        className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all ${
          location.pathname.startsWith('/admin')
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
        Admin (Fundador)
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          switchRole('client');
          navigate('/cliente');
        }}
        className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all ${
          location.pathname.startsWith('/cliente')
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <UserIcon className="w-3.5 h-3.5 mr-1 text-cyan-400" />
        Portal do Cliente
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate('/')}
        className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all ${
          location.pathname === '/'
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Globe className="w-3.5 h-3.5 mr-1 text-purple-400" />
        Landing Page
      </Button>

      {!user ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/login')}
          className="h-7 px-2.5 rounded-full text-xs bg-slate-800 border-slate-600 hover:bg-slate-700 text-white"
        >
          <LogIn className="w-3.5 h-3.5 mr-1" />
          Login
        </Button>
      ) : (
        <span className="text-[10px] text-slate-400 pl-1 hidden md:inline">
          Logado como: <strong className="text-slate-200">{user.name.split(' ')[0]}</strong> ({user.role})
        </span>
      )}
    </aside>
  );
};