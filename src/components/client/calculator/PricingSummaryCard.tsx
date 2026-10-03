"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Layers, Zap, Save, CheckCircle2 } from 'lucide-react';
import { PricingCalculationResult } from '@/services/pricingService';

interface PricingSummaryCardProps {
  nomePeca: string;
  calculationResult: PricingCalculationResult;
  taxaFalhaPorcento: number;
  onSalvarOrcamento: () => void;
  onAprovarProducao: () => void;
  saving?: boolean;
  recalculating?: boolean;
  copying?: boolean;
}

export const PricingSummaryCard: React.FC<PricingSummaryCardProps> = ({
  nomePeca,
  calculationResult,
  taxaFalhaPorcento,
  onSalvarOrcamento,
  onAprovarProducao,
  saving = false,
  recalculating = false,
  copying = false,
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <DollarSign className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="font-bold text-white text-sm">Resumo Financeiro Consolidado</h3>
          <p className="text-[10px] text-slate-400">{nomePeca}</p>
        </div>
      </div>

      {/* Detalhamento Item a Item */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Materiais ({calculationResult.totalWeightGrams}g + {taxaFalhaPorcento}% falha):
          </span>
          <span className="font-bold text-white">
            R$ {calculationResult.materialsWithFailureCost.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Energia ({calculationResult.kwhTotal} kWh):
          </span>
          <span className="font-bold text-white">
            R$ {calculationResult.energyCost.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Depreciação Máquina & Bico:</span>
          <span className="font-bold text-white">
            R$ {calculationResult.depreciationCost.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Mão de Obra / Pós-processamento:</span>
          <span className="font-bold text-white">
            R$ {calculationResult.laborCost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total e Preço */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Custo Total de Fabricação:</span>
          <span className="font-bold text-rose-400 text-sm">
            R$ {calculationResult.totalProductionCost.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Lucro Líquido Estimado:</span>
          <span className="font-bold text-emerald-400 text-sm">
            + R$ {calculationResult.estimatedProfit.toFixed(2)}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
          <span className="text-xs font-bold text-white uppercase">Preço Final:</span>
          <span className="text-2xl font-black text-indigo-400">
            R$ {calculationResult.suggestedPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botões de Ação com Fluxo do Estoque */}
      <div className="space-y-2 pt-2">
        <Button
          disabled={saving}
          onClick={onSalvarOrcamento}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl h-10"
        >
          <Save className="w-3.5 h-3.5 mr-1 text-amber-400" />
          {recalculating ? 'Atualizar valores do projeto' : copying ? 'Salvar novo orçamento' : 'Salvar como Orçamento (Sem Baixar Estoque)'}
        </Button>

        {!recalculating && !copying && <Button
          disabled={saving}
          onClick={onAprovarProducao}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl h-10 shadow-lg shadow-emerald-600/25"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-white" />
          Aprovar & Iniciar Produção (Baixar Estoque)
        </Button>}
      </div>
    </Card>
  );
};
