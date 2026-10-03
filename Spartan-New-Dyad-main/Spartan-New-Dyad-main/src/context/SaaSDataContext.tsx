"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Plan, Invoice, FilamentoEstoque, Impressora3D, ProjetoImpressao3D, ProjectMaterial, User, SaaSMetrics } from '@/types/saas';
import { INITIAL_PLANS, buildInitialMetrics } from '@/data/saasInitialData';
import { useFilamentosState } from './hooks/useFilamentosState';
import { useImpressorasState } from './hooks/useImpressorasState';
import { useProjetosState } from './hooks/useProjetosState';
import { useBillingState } from './hooks/useBillingState';
import { toast } from 'sonner';

export { INITIAL_PLANS };

export interface SaaSDataContextType {
  plans: Plan[];
  clients: User[];
  invoices: Invoice[];
  filamentos: FilamentoEstoque[];
  impressoras: Impressora3D[];
  projetos: ProjetoImpressao3D[];
  currentPlan: Plan;
  metrics: SaaSMetrics;
  clientCredits: number;
  consumeCredits: (amount: number) => boolean;
  addFilamento: (fil: Omit<FilamentoEstoque, 'id'>) => boolean;
  consumirFilamento: (filamentoId: string, gramas: number) => void;
  consumirMultiplosFilamentos: (materials: ProjectMaterial[]) => void;
  estornarMultiplosFilamentos: (materials: ProjectMaterial[]) => void;
  addImpressora: (imp: Omit<Impressora3D, 'id'>) => boolean;
  updateImpressoraStatus: (id: string, status: Impressora3D['status'], meta?: { projetoId?: string; projetoNome?: string }) => void;
  addProjeto: (proj: Omit<ProjetoImpressao3D, 'id' | 'dataCriacao' | 'estoqueBaixado'>) => boolean;
  updateProjetoStatus: (id: string, newStatus: ProjetoImpressao3D['status']) => void;
  changeClientPlan: (planId: string) => void;
  addClient: (client: Partial<User>) => void;
  updateClientStatus: (id: string, status: User['status']) => void;
  createInvoice: (clientId: string, amount: number, method?: Invoice['method']) => void;
  payInvoice: (invoiceId: string) => void;
}

const SaaSDataContext = createContext<SaaSDataContextType | undefined>(undefined);

export const SaaSDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [activePlanId, setActivePlanId] = useState<string>('plan_pro');
  const [clientCredits, setClientCredits] = useState<number>(25000);

  const currentPlan = useMemo(
    () => plans.find(p => p.id === activePlanId) || plans[1],
    [plans, activePlanId]
  );

  // 1. Filamentos & Estoque
  const {
    filamentos,
    addFilamento,
    consumirFilamento,
    consumirMultiplosFilamentos,
    estornarMultiplosFilamentos,
  } = useFilamentosState(currentPlan);

  // 2. Parque de Impressoras
  const {
    impressoras,
    addImpressora,
    updateImpressoraStatus,
  } = useImpressorasState(currentPlan);

  // 3. Projetos & Orçamentos (interligado com estoque e impressoras)
  const {
    projetos,
    addProjeto,
    updateProjetoStatus,
  } = useProjetosState({
    currentPlan,
    impressoras,
    consumirMultiplosFilamentos,
    estornarMultiplosFilamentos,
    updateImpressoraStatus,
  });

  // 4. Clientes & Faturamento
  const {
    clients,
    invoices,
    addClient,
    updateClientStatus,
    createInvoice,
    payInvoice,
  } = useBillingState();

  const metrics = useMemo(() => {
    const totalMrr = clients.reduce((acc, c) => (c.status === 'active' ? acc + c.mrr : acc), 0) + 124500;
    return buildInitialMetrics(totalMrr, clients.length);
  }, [clients]);

  const consumeCredits = (amount: number): boolean => {
    if (clientCredits < amount) {
      toast.error('Créditos de IA insuficientes! Faça um upgrade de plano.');
      return false;
    }
    setClientCredits(prev => prev - amount);
    return true;
  };

  const changeClientPlan = (planId: string) => {
    setActivePlanId(planId);
    toast.success(`Plano Spartan atualizado para ${plans.find(p => p.id === planId)?.name}!`);
  };

  return (
    <SaaSDataContext.Provider
      value={{
        plans,
        clients,
        invoices,
        filamentos,
        impressoras,
        projetos,
        currentPlan,
        metrics,
        clientCredits,
        consumeCredits,
        addFilamento,
        consumirFilamento,
        consumirMultiplosFilamentos,
        estornarMultiplosFilamentos,
        addImpressora,
        updateImpressoraStatus,
        addProjeto,
        updateProjetoStatus,
        changeClientPlan,
        addClient,
        updateClientStatus,
        createInvoice,
        payInvoice,
      }}
    >
      {children}
    </SaaSDataContext.Provider>
  );
};

export const useSaaSData = () => {
  const context = useContext(SaaSDataContext);
  if (!context) {
    throw new Error('useSaaSData must be used within a SaaSDataProvider');
  }
  return context;
};