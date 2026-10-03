"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const AdminAiCopilot: React.FC = () => {
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleRecalculate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      toast.success('Estratégia algorítmica de expansão de MRR recalculada!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Análise Preditiva de Churn</h3>
              <p className="text-xs text-slate-400">Identificação em tempo real de clientes com risco de cancelamento</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Lucas Nogueira (Nogueira Multimarcas)</p>
                <p className="text-[11px] text-rose-400">Risco Alto • Fatura vencida há 4 dias</p>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Campanha de recuperação por WhatsApp enviada com sucesso!')}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-lg h-7 px-2.5"
              >
                Disparar Oferta IA
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Felipe Santana (Santana Digital)</p>
                <p className="text-[11px] text-amber-400">Teste expira em 48h • Alto uso de IA (94%)</p>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Oferta de conversão de teste enviada!')}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded-lg h-7 px-2.5"
              >
                Converter em Pro
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simulador de Expansão de MRR</h3>
              <p className="text-xs text-slate-400">Previsão algorítmica de expansão com novos recursos</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Upgrade de Planos Estimado:</span>
              <span className="text-emerald-400 font-bold">+R$ 8.900/mês</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Redução de Inadimplência:</span>
              <span className="text-indigo-400 font-bold">-62% de perdas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Previsão de ARR em 6 meses:</span>
              <span className="text-white font-black">R$ 2.450.000</span>
            </div>
          </div>

          <Button
            onClick={handleRecalculate}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-bold rounded-xl h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${aiGenerating ? 'animate-spin' : ''}`} />
            Recalcular Estratégia de Crescimento
          </Button>
        </Card>
      </div>
    </div>
  );
};