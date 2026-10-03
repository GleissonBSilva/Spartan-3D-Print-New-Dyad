"use client";

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Zap,
  TrendingUp,
  Settings,
  LogOut,
  Sparkles,
  Calculator,
  Layers,
  Cpu,
  FolderKanban,
  Bot,
  Menu,
  X,
  Box,
  Bell,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import { registerPushDevice } from '@/services/notificationService';
import { canAccessAdmin } from '@/lib/permissions';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badgeText?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeText,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasAdminAccess = canAccessAdmin(user);
  const isAdmin = location.pathname.startsWith('/admin');

  const adminNavItems: Array<{ label: string; href: string; icon: LucideIcon; badge?: string; highlight?: boolean }> = [
    { label: 'Visão Geral (MRR SaaS)', href: '/admin', icon: LayoutDashboard },
    { label: 'Makers & Assinantes', href: '/admin/clientes', icon: Users },
    { label: 'Faturamento & Pix', href: '/admin/cobranca', icon: CreditCard },
    { label: 'Planos Spartan 3D', href: '/admin/planos', icon: TrendingUp },
    { label: 'Copilot Administrativo', href: '/admin/ia-copilot', icon: Bot },
    { label: 'Webhooks', href: '/admin/webhooks', icon: Bell },
  ];

  const clientNavItems: Array<{ label: string; href: string; icon: LucideIcon; badge?: string; highlight?: boolean }> = [
    { label: 'Meu Painel 3D', href: '/cliente', icon: LayoutDashboard },
    { label: 'Calculadora de Custos', href: '/cliente/calculadora', icon: Calculator, badge: 'CALC' },
    { label: 'Estoque de Filamentos', href: '/cliente/estoque', icon: Layers },
    { label: 'Parque de Impressoras', href: '/cliente/impressoras', icon: Cpu },
    { label: 'Projetos & Orçamentos', href: '/cliente/projetos', icon: FolderKanban },
    { label: 'Spartan AI (Diagnóstico)', href: '/cliente/ia-copilot', icon: Bot, badge: 'IA' },
    { label: 'Upgrade de Plano', href: '/cliente/planos', icon: Zap, highlight: true },
    { label: 'Minhas Faturas', href: '/cliente/faturas', icon: CreditCard },
    { label: 'Configurações da Farm', href: '/cliente/configuracoes', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.info('Sessão encerrada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.');
    }
  };

  const handleEnableNotifications = async () => {
    if (!user) return;
    try { await registerPushDevice(user); toast.success('Notificações ativadas neste dispositivo.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível ativar notificações.'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Mobile Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Box className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight">SPARTAN 3D PRINT</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEnableNotifications}
          aria-label="Ativar notificações push"
          className="mr-1 h-10 gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 text-indigo-100 hover:bg-indigo-500/25 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <span className="text-xs font-semibold">Avisos</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block">SPARTAN 3D</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  {isAdmin ? 'Administração da plataforma' : 'Gestão de impressão 3D'}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile snippet */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-750 flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={`Foto ou logo de ${user.name || user.companyName || 'sua conta'}`} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50" />
            ) : (
              <div aria-hidden="true" className="w-10 h-10 rounded-full border-2 border-indigo-500/50 bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-100">
                {(user?.name || user?.companyName || 'M').trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Maker'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.companyName || 'EstÃºdio 3D'}</p>
              {user && <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-indigo-300">{[user.role === 'client' ? 'Cliente' : user.role, ...(user.platformRoles || []), user.planId === 'plan_enterprise' ? 'SPARTAN BUSINESS' : ''].filter(Boolean).join(' · ')}</p>}
            </div>
          </div>

          {hasAdminAccess && <Link to={isAdmin ? '/cliente' : '/admin'} onClick={() => setSidebarOpen(false)} className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20"><ArrowLeftRight className="h-3.5 w-3.5" />{isAdmin ? 'Abrir Minha Farm' : 'Abrir Admin / Dev'}</Link>}

          {/* Navigation Links */}
          <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isAdmin ? 'Painel Administrativo' : 'Módulos de Impressão 3D'}
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : item.highlight
                      ? 'bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer of sidebar */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
            <span className="text-[10px] text-slate-400">v3.2 Spartan</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto pb-24 lg:pb-16">
          {/* Header */}
          <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h1>
                {badgeText && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                    {badgeText}
                  </Badge>
                )}
              </div>
              {subtitle && <p className="text-xs md:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={handleEnableNotifications} aria-label="Ativar notificações push" className="h-10 border-indigo-400/40 bg-indigo-500/15 px-4 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/25 hover:text-white"><Bell className="mr-2 h-4 w-4" />Ativar avisos</Button>
          </header>

          {/* Children View */}
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
