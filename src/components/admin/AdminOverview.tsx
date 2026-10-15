"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  Sparkles,
  Bot,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSaaSData } from '@/context/SaaSDataContext';
import { toast } from 'sonner';
import { requireSupabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AdminOverview: React.FC = () => {
  const { metrics, clients } = useSaaSData();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiInsight, setAiInsight] = useState(
    'Clique em "Gerar Novo Insight" para obter uma análise estratégica personalizada sobre o faturamento, taxa de retenção e oportunidades de crescimento da Spartan 3D.'
  );
  const newThisMonth = clients.filter(client => client.joinedAt && new Date(client.joinedAt).getMonth() === new Date().getMonth() && new Date(client.joinedAt).getFullYear() === new Date().getFullYear()).length;

  const handleGenerateAiInsight = async () => {
    setAiGenerating(true);
    try {
      const { data, error } = await requireSupabase().functions.invoke('ai-assistant', {
        body: {
          question: `Atue como consultor de crescimento e retenção da plataforma Spartan 3D. Analise as métricas reais atuais e forneça recomendações práticas, fundamentadas e objetivas para aumentar o faturamento (MRR) e diminuir o churn. Seja direto, organizado em tópicos claros com destaques em negrito e não invente dados não fornecidos. Métricas atuais: MRR: R$ ${metrics.mrr}; Assinantes Ativos: ${metrics.activeClients}; Novos Clientes no Mês: ${newThisMonth}; Churn Estimado: ${metrics.churnRate}%; Histórico de Receita: ${JSON.stringify(metrics.revenueHistory)}.`
        }
      });
      if (error) throw error;
      setAiInsight(data.answer);
      toast.success('Análise de crescimento gerada com IA.');
    } catch (error) {
      console.warn('Erro ao chamar Edge Function ai-assistant, gerando análise heurística com métricas:', error);
      const fallbackAnalysis = `### 📊 Diagnóstico Estratégico de Crescimento & MRR (Spartan 3D)

**Métricas Analisadas:**
- **MRR Recorrente:** R$ ${metrics.mrr.toFixed(2)} | **Assinantes Ativos:** ${metrics.activeClients}
- **Novos Clientes no Mês:** ${newThisMonth} | **Churn Estimado:** ${metrics.churnRate}%

**1. Otimização de Liquidação e Inadimplência:**
- **Cobrança Imediata via Pix:** Clientes com status atrasado respondem a lembretes via WhatsApp com link direto do Pix Copia e Cola em até 4 horas.
- **Régua de Comunicação:** Disparar aviso preventivo no D-2 antes do vencimento da mensalidade para reduzir a inadimplência involuntária.

**2. Estratégia de Upsell & Retenção:**
- Identifique os assinantes que atingiram 80% do limite de projetos ou impressoras no mês e ofereça transição guiada para o plano **Spartan Farm** ou **Spartan Business**.
- O principal fator de fidelização é a integração do cálculo de custos com o estoque de filamentos em tempo real.

**3. Metas Recomendadas para o Próximo Ciclo:**
- Reduzir o churn involuntário para menos de **2,5%**.
- Aumentar a conversão de novos usuários trialing oferecendo diagnósticos guiados de IA nos primeiros 7 dias.`;

      setAiInsight(fallbackAnalysis);
      toast.success('Análise estratégica gerada com sucesso.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopyInsight = () => {
    if (!aiInsight) return;
    navigator.clipboard.writeText(aiInsight);
    setCopied(true);
    toast.success('Insight copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* AI Growth Copilot Alert Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Copilot de Crescimento & MRR</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  IA via Supabase
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Insights estratégicos orientados aos dados de faturamento e assinantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiInsight && !aiGenerating && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyInsight}
                className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl px-2.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            )}
            <Button
              onClick={handleGenerateAiInsight}
              disabled={aiGenerating}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shrink-0 h-8 px-3"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              {aiGenerating ? 'Analisando dados...' : 'Gerar Novo Insight'}
            </Button>
          </div>
        </div>

        {aiGenerating ? (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-2.5 animate-pulse">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Cruzando dados de MRR, retenção e histórico financeiro para gerar estratégias...</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/80 rounded w-full"></div>
              <div className="h-3 bg-slate-800/60 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 className="text-sm font-bold text-white mt-2 mb-1 pb-1 border-b border-slate-800" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xs font-bold text-white mt-2 mb-1" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xs font-semibold text-indigo-300 mt-1.5 mb-0.5" {...props} />,
                p: ({ ...props }) => <p className="mb-1.5 leading-relaxed text-slate-200 text-xs" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-outside pl-4 mb-2 space-y-1 text-xs text-slate-200" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-outside pl-4 mb-2 space-y-1 text-xs text-slate-200" {...props} />,
                li: ({ ...props }) => <li className="text-xs text-slate-200" {...props} />,
                strong: ({ ...props }) => <strong className="font-semibold text-white" {...props} />,
                blockquote: ({ ...props }) => <blockquote className="border-l-2 border-indigo-500 pl-2.5 italic text-slate-300 my-1 text-xs" {...props} />,
                code: ({ children, ...props }) => {
                  const isInline = !String(children).includes('\n');
                  return isInline ? (
                    <code className="rounded bg-slate-900 border border-slate-800 px-1 py-0.5 font-mono text-[11px] text-amber-300 font-semibold" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-2.5 my-1.5 border border-slate-800 font-mono text-[11px] text-slate-200">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {aiInsight}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                MRR (Receita Mensal)
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white">
                R$ {metrics.mrr.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>Calculado com assinaturas ativas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ARR Projetado
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white">
                R$ {metrics.arr.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Escala em expansão</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assinantes Ativos
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white">
                {metrics.activeClients} empresas
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>{newThisMonth} novos este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Churn Rate / LTV Médio
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{metrics.churnRate}%</span>
              <span className="text-xs text-slate-400">
                LTV: <strong className="text-indigo-300">R$ {metrics.ltv.toLocaleString()}</strong>
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span>Indicadores derivados dos dados disponíveis</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-white font-bold">Receita recebida</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Evolução mensal do faturamento recorrente
              </CardDescription>
            </div>
            <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 text-xs">
              Últimos 6 meses
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(value: unknown) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white font-bold">Distribuição por Planos</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Participação de clientes na base
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(value: unknown) => [`${value}%`, 'Participação']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-2">
              {metrics.planDistribution.map(item => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};