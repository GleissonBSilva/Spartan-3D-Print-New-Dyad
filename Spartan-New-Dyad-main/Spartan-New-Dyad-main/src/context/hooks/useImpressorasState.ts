"use client";

import { useState, useEffect } from 'react';
import { Impressora3D, Plan } from '@/types/saas';
import { INITIAL_IMPRESSORAS } from '@/data/saasInitialData';
import { FeatureGatingService } from '@/services/featureGatingService';
import { toast } from 'sonner';

export function useImpressorasState(currentPlan: Plan) {
  const [impressoras, setImpressoras] = useState<Impressora3D[]>(() => {
    const saved = localStorage.getItem('spartan_impressoras_v2');
    return saved ? JSON.parse(saved) : INITIAL_IMPRESSORAS;
  });

  useEffect(() => {
    localStorage.setItem('spartan_impressoras_v2', JSON.stringify(impressoras));
  }, [impressoras]);

  const addImpressora = (imp: Omit<Impressora3D, 'id'>): boolean => {
    const gate = FeatureGatingService.canAddPrinter(impressoras.length, currentPlan);
    if (!gate.allowed) {
      toast.error(gate.status.message || 'Limite de impressoras atingido.');
      return false;
    }

    if (gate.status.isNearLimit || gate.status.isCritical) {
      toast.warning(gate.status.message);
    }

    const newImp: Impressora3D = {
      ...imp,
      id: `imp_${Date.now()}`,
    };
    setImpressoras(prev => [newImp, ...prev]);
    toast.success(`Impressora ${newImp.nome} cadastrada na farm!`);
    return true;
  };

  const updateImpressoraStatus = (
    id: string,
    status: Impressora3D['status'],
    meta?: { projetoId?: string; projetoNome?: string }
  ) => {
    setImpressoras(prev =>
      prev.map(i => {
        if (i.id === id) {
          if (status === 'imprimindo' && meta?.projetoNome) {
            return {
              ...i,
              status,
              projetoAtualId: meta.projetoId,
              projetoAtual: meta.projetoNome,
              progressoPercentual: 10,
            };
          }
          if (status === 'disponivel') {
            return {
              ...i,
              status,
              projetoAtualId: undefined,
              projetoAtual: undefined,
              progressoPercentual: 0,
            };
          }
          return { ...i, status };
        }
        return i;
      })
    );
  };

  return {
    impressoras,
    addImpressora,
    updateImpressoraStatus,
  };
}