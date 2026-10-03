"use client";

import { useState, useEffect } from 'react';
import { FilamentoEstoque, ProjectMaterial, Plan } from '@/types/saas';
import { INITIAL_FILAMENTOS } from '@/data/saasInitialData';
import { FeatureGatingService } from '@/services/featureGatingService';
import { toast } from 'sonner';

export function useFilamentosState(currentPlan: Plan) {
  const [filamentos, setFilamentos] = useState<FilamentoEstoque[]>(() => {
    const saved = localStorage.getItem('spartan_filamentos_v2');
    return saved ? JSON.parse(saved) : INITIAL_FILAMENTOS;
  });

  useEffect(() => {
    localStorage.setItem('spartan_filamentos_v2', JSON.stringify(filamentos));
  }, [filamentos]);

  const addFilamento = (fil: Omit<FilamentoEstoque, 'id'>): boolean => {
    const gate = FeatureGatingService.canAddFilament(filamentos.length, currentPlan);
    if (!gate.allowed) {
      toast.error(gate.status.message || 'Limite de carretéis atingido.');
      return false;
    }

    if (gate.status.isNearLimit || gate.status.isCritical) {
      toast.warning(gate.status.message);
    }

    const newFil: FilamentoEstoque = {
      ...fil,
      id: `fil_${Date.now()}`,
    };
    setFilamentos(prev => [newFil, ...prev]);
    toast.success(`Carretel ${newFil.tipo} (${newFil.cor}) adicionado ao estoque!`);
    return true;
  };

  const consumirFilamento = (filamentoId: string, gramas: number) => {
    setFilamentos(prev =>
      prev.map(f => {
        if (f.id === filamentoId) {
          const novoPeso = Math.max(0, f.pesoRestanteG - gramas);
          if (novoPeso <= 150) {
            toast.warning(`Atenção: Carretel ${f.tipo} (${f.cor}) com menos de 150g restantes!`);
          }
          return { ...f, pesoRestanteG: novoPeso };
        }
        return f;
      })
    );
  };

  const consumirMultiplosFilamentos = (materials: ProjectMaterial[]) => {
    if (!materials || materials.length === 0) return;
    setFilamentos(prev => {
      let updated = [...prev];
      materials.forEach(mat => {
        if (mat.materialId) {
          updated = updated.map(f => {
            if (f.id === mat.materialId) {
              const novoPeso = Math.max(0, f.pesoRestanteG - (mat.weightGrams || 0));
              if (novoPeso <= 150) {
                toast.warning(`Estoque baixo: ${f.tipo} (${f.cor}) tem apenas ${novoPeso}g restantes.`);
              }
              return { ...f, pesoRestanteG: novoPeso };
            }
            return f;
          });
        }
      });
      return updated;
    });
  };

  const estornarMultiplosFilamentos = (materials: ProjectMaterial[]) => {
    if (!materials || materials.length === 0) return;
    setFilamentos(prev => {
      let updated = [...prev];
      materials.forEach(mat => {
        if (mat.materialId) {
          updated = updated.map(f => {
            if (f.id === mat.materialId) {
              const novoPeso = Math.min(f.pesoTotalG, f.pesoRestanteG + (mat.weightGrams || 0));
              return { ...f, pesoRestanteG: novoPeso };
            }
            return f;
          });
        }
      });
      return updated;
    });
    toast.info('Materiais estornados de volta ao estoque com sucesso.');
  };

  return {
    filamentos,
    addFilamento,
    consumirFilamento,
    consumirMultiplosFilamentos,
    estornarMultiplosFilamentos,
  };
}