"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('ceo@saasmaster.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Auto-detect role based on email or default to admin
      if (email.includes('cliente') || email.includes('agencia')) {
        login('client', email);
        toast.success('Login como Cliente realizado com sucesso!');
        navigate('/cliente');
      } else {
        login('admin', email);
        toast.success('Login como Administrador Master realizado!');
        navigate('/admin');
      }
    }, 600);
  };

  const handleQuickLogin = (role: 'admin' | 'client') => {
    login(role);
    toast.success(`Acesso rápido como ${role === 'admin' ? 'Administrador' : 'Cliente'} liberado!`);
    navigate(role === 'admin' ? '/admin' : '/cliente');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">NexusScale</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-200">Acesse sua Central de Crescimento</h2>
          <p className="text-xs text-slate-400">
            Gerencie sua receita recorrente, clientes e automações de IA.
          </p>
        </div>

        {/* Card */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-white font-bold">Entrar na Plataforma</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Digite suas credenciais corporativas para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  E-mail Corporativo
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seuemail@empresa.com"
                  className="bg-slate-950/80 border-slate-750 text-white rounded-xl text-sm focus:border-indigo-500 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Link de recuperação enviado para o e-mail!')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-slate-950/80 border-slate-750 text-white rounded-xl text-sm focus:border-indigo-500 h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-10 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm mt-2"
              >
                {loading ? 'Validando acesso...' : 'Entrar no Sistema'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Demo Access Badges */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Demonstração Instantânea (1 Clique)
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  variant="outline"
                  className="bg-slate-950 border-slate-750 hover:bg-slate-800 text-white text-xs h-12 flex flex-col items-center justify-center rounded-xl p-1"
                >
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Painel Admin
                  </span>
                  <span className="text-[9px] text-slate-400">MRR, Clientes & Faturas</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleQuickLogin('client')}
                  variant="outline"
                  className="bg-slate-950 border-slate-750 hover:bg-slate-800 text-white text-xs h-12 flex flex-col items-center justify-center rounded-xl p-1"
                >
                  <span className="flex items-center gap-1 font-semibold text-cyan-400">
                    <UserIcon className="w-3.5 h-3.5" />
                    Painel Cliente
                  </span>
                  <span className="text-[9px] text-slate-400">Assinatura & IA Tools</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-400">
            Ainda não tem uma conta?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Criar conta e testar 14 dias grátis
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Criptografia 256-bit
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" /> 99.99% Uptime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;