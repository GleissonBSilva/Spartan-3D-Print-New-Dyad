"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck } from 'lucide-react';
import { Plan } from '@/types/saas';

interface ClientOverviewCardsProps {
  currentPlan: Plan;
  clientCredits: number;
  onOpenUpgradeModal: () => void;
}

export const ClientOverviewCards: React.FC<ClientOverviewCardsProps> = ({
  currentPlan,
  clientCredits,
  onOpenUpgradeModal,
}) => {
  const maxCredits = currentPlan.creditsAI;
  const usedCreditsPercentage = Math.min(
    100,
    Math.round(((maxCredits - clientCredits) / maxCredits) * 100)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase">Créditos de IA Mensais</span>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
              {clientCredits.toLocaleString()} restantes
            </Badge>
          </div>
          <div>
            <Progress value={100 - usedCreditsPercentage} className="h-2.5 bg-slate-800" />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{currentPlan.creditsAI.toLocaleString()} contratados</span>
            <button
              onClick={onOpenUpgradeModal}
              className="text-indigo-400 hover:underline font-semibold"
            >
              + Recarregar / Upgrade
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block">Seu Plano Ativo</span>
            <p className="text-xl font-bold text-white mt-1">{currentPlan.name}</p>
            <p className="text-xs text-indigo-400 font-medium">R$ {currentPlan.priceMonthly}/mês • Renovação automática</p>
          </div>
          <Button
            size="sm"
            onClick={onOpenUpgradeModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Mudar Plano
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block">Gerente de Sucesso</span>
            <p className="text-base font-bold text-white mt-1">Gleison (Head de CS)</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Online no WhatsApp VIP
            </p>
          </div>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs rounded-xl">
              Chamar VIP
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};