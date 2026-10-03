"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Edit } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { toast } from 'sonner';

export const AdminPlansManager: React.FC = () => {
  const { plans } = useSaaSData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <Card key={plan.id} className="bg-slate-900 border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
            </div>
            {plan.badge && (
              <Badge className="bg-indigo-600 text-white text-[10px]">{plan.badge}</Badge>
            )}
          </div>

          <div className="pt-2">
            <span className="text-3xl font-black text-white">R$ {plan.priceMonthly}</span>
            <span className="text-xs text-slate-400">/mês</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Limite de Usuários:</span>
              <span className="font-semibold text-white">{plan.maxUsers} assentos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Créditos de IA:</span>
              <span className="font-semibold text-indigo-400">{plan.creditsAI.toLocaleString()}/mês</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            {plan.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => toast.success(`Configurações do plano ${plan.name} salvas!`)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl"
          >
            <Edit className="w-3.5 h-3.5 mr-1" /> Editar Limites & Preço
          </Button>
        </Card>
      ))}
    </div>
  );
};