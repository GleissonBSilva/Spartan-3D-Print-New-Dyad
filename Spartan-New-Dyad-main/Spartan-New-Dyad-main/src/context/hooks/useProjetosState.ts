"use client";

import { useState, useEffect } from 'react';
import { ProjetoImpressao3D, ProjectMaterial, Plan, Impressora3D } from '@/types/saas';
import { INITIAL_PROJETOS } from '@/data/saasInitialData';
import { FeatureGatingService } from '@/services/featureGatingService';
import { toast } from 'sonner';

interface UseProjetosStateProps {
  currentPlan: Plan;
  impressoras: Impressora3D[];
  consumirMultiplosFilamentos: (materials: ProjectMaterial[]) => void;
  estornarMultiplosFilamentos: (materials: ProjectMaterial[]) => void;
  updateImpressoraStatus: (id: string, status: Impressora3D['status'], meta?: { projetoId?: string; projetoNome?: string }) => void;
}

export function useProjetosState({
  currentPlan,
  impressoras,
  consumirMultiplosFilamentos,
  estornarMultiplosFilamentos,
  updateImpressoraStatus,
}: UseProjetosStateProps) {
  const [projetos, setProjetos] = useState<ProjetoImpressao3D[]>(() => {
    const saved = localStorage.getItem('spartan_projetos_v2');
    return saved ? JSON.parse(saved) : INITIAL_PROJETOS;
  });

  useEffect(() => {
    localStorage.setItem('spartan_projetos_v2', JSON.stringify(projetos));
  }, [projetos]);

  const addProjeto = (
    proj: Omit<ProjetoImpressao3D, 'id' | 'dataCriacao' | 'estoqueBaixado'>
  ): boolean => {
    const gate = FeatureGatingService.canAddProject(projetos.length, currentPlan);
    if (!gate.allowed) {
      toast.error(gate.status.message || 'Limite de projetos atingido no seu plano.');
      return false;
    }

    if (gate.status.isNearLimit || gate.status.isCritical) {
      toast.warning(gate.status.message);
    }

    const entraEmProducao = proj.status === 'em_impressao' || proj.status === 'aprovado';
    const newId = `proj_${Date.now()}`;
    const newProj: ProjetoImpressao3D = {
      ...proj,
      id: newId,
      estoqueBaixado: entraEmProducao,
      dataCriacao: new Date().toISOString().split('T')[0],
    };

    setProjetos(prev => [newProj, ...prev]);

    if (entraEmProducao) {
      consumirMultiplosFilamentos(newProj.materials);
      if (newProj.impressoraId) {
        updateImpressoraStatus(newProj.impressoraId, 'imprimindo', {
          projetoId: newId,
          projetoNome: newProj.nomePeca,
        });
      }
      toast.success(`Projeto "${newProj.nomePeca}" iniciado na produção! Estoque baixado e impressora alocada.`);
    } else {
      toast.success(`Orçamento para "${newProj.nomePeca}" salvo! Estoque preservado.`);
    }

    return true;
  };

  const updateProjetoStatus = (id: string, newStatus: ProjetoImpressao3D['status']) => {
    setProjetos(prev =>
      prev.map(p => {
        if (p.id === id) {
          // 1. Transição para Produção (Baixa de Estoque + Ocupação da Impressora)
          if ((newStatus === 'em_impressao' || newStatus === 'aprovado') && !p.estoqueBaixado) {
            consumirMultiplosFilamentos(p.materials);
            if (p.impressoraId) {
              updateImpressoraStatus(p.impressoraId, 'imprimindo', {
                projetoId: p.id,
                projetoNome: p.nomePeca,
              });
            }
            toast.success(`Produção iniciada: Materiais de "${p.nomePeca}" baixados do estoque.`);
            return { ...p, status: newStatus, estoqueBaixado: true };
          }

          // 2. Conclusão da Produção (Libera impressora)
          if (newStatus === 'concluido') {
            if (p.impressoraId) {
              updateImpressoraStatus(p.impressoraId, 'disponivel');
            }
            toast.success(`Projeto "${p.nomePeca}" concluído com sucesso! Máquina liberada.`);
            return { ...p, status: newStatus };
          }

          // 3. Cancelamento com estorno
          if (newStatus === 'cancelado' && p.estoqueBaixado) {
            estornarMultiplosFilamentos(p.materials);
            if (p.impressoraId) {
              updateImpressoraStatus(p.impressoraId, 'disponivel');
            }
            toast.info(`Projeto cancelado: Filamentos estornados de volta ao estoque.`);
            return { ...p, status: newStatus, estoqueBaixado: false };
          }

          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  return {
    projetos,
    addProjeto,
    updateProjetoStatus,
  };
}