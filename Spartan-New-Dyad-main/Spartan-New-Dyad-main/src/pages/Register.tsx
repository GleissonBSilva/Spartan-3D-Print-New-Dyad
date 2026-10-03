"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSaaSData } from '@/context/SaaSDataContext';
import { Zap, Check, ArrowRight, Building, Mail, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { triggerConfetti } from '@/lib/confetti';
import { toast } from 'sonner';

const Register: React.FC = () => {
  const { login } = useAuth();
  const { plans, addClient } = useSaaSData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    planId: 'plan_pro',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      addClient({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        planId: formData.planId,
      });

      triggerConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      login('client', formData.email);
      toast.success('Conta criada com sucesso! 14 dias de teste ativados.');
      navigate('/cliente');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 relative">
      <div className="w-full max-w-2xl space-y-6 z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">NexusScale</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Comece seu Teste de 14 Dias Grátis</h2>
          <p className="text-sm text-slate-400">
            Acesso total a todas as ferramentas de IA, recuperação de vendas e gestão sem cartão.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Escolha o Plano e Preencha os Dados</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Você pode alterar ou cancelar a qualquer momento diretamente pelo seu painel.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selecione seu plano inicial
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, planId: plan.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.planId === plan.id
                          ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-white">{plan.name}</span>
                        {plan.popular && (
                          <Badge className="bg-indigo-600 text-[9px] px-1 py-0 text-white">TOP</Badge>
                        )}
                      </div>
                      <p className="text-lg font-black text-indigo-400">
                        R$ {plan.priceMonthly}
                        <span className="text-[10px] text-slate-400 font-normal">/mês</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Nome Completo
                  </label>
                  <Input
                    required
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-950 border-slate-750 text-white rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    E-mail Corporativo
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="seuemail@empresa.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-950 border-slate-750 text-white rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Nome da Empresa
                  </label>
                  <Input
                    required
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-slate-950 border-slate-750 text-white rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    WhatsApp / Telefone
                  </label>
                  <Input
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-950 border-slate-750 text-white rounded-xl h-10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-indigo-600/30"
                >
                  {loading ? 'Configurando seu ambiente...' : 'Criar Minha Conta Grátis'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Não solicitamos cartão de crédito agora. Acesso instantâneo.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Já possui cadastro?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;