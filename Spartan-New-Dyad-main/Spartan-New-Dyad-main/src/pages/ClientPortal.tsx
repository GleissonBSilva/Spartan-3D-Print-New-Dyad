"use client";

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSaaSData } from '@/context/SaaSDataContext';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti } from '@/lib/confetti';
import { toast } from 'sonner';

import { Calculadora3D } from '@/components/client/Calculadora3D';
import { EstoqueFilamentos } from '@/components/client/EstoqueFilamentos';
import { ParqueImpressoras } from '@/components/client/ParqueImpressoras';
import { ProjetosManager } from '@/components/client/ProjetosManager';
import { SpartanAiAssistant } from '@/components/client/SpartanAiAssistant';
import { ClientInvoicesList } from '@/components/client/ClientInvoicesList';
import { ClientPlansPricing } from '@/components/client/ClientPlansPricing';
import { ClientSettingsForm } from '@/components/client/ClientSettingsForm';
import { ClientPixModal } from '@/components/client/ClientPixModal';
import { ClientUpgradeModal } from '@/components/client/ClientUpgradeModal';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Cpu, Calculator, FolderKanban, Bot } from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, updateUserProfile } = useAuth();
  const { currentPlan, plans, filamentos, impressoras, projetos, changeClientPlan, invoices } = useSaaSData();

  const [pixModal, setPixModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);

  const handleUpgrade = (planId: string) => {
    changeClientPlan(planId);
    setUpgradeModal(false);
    triggerConfetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
    toast.success('Parabéns! Seu plano Spartan 3D foi atualizado.');
  };

  const isCalculadora = currentPath === '/cliente/calculadora';
  const isEstoque = currentPath === '/cliente/estoque';
  const isImpressoras = currentPath === '/cliente/impressoras';
  const isProjetos = currentPath === '/cliente/projetos';
  const isAiCopilot = currentPath === '/cliente/ia-copilot';
  const isPlanos = currentPath === '/cliente/planos';
  const isFaturas = currentPath === '/cliente/faturas';
  const isConfig = currentPath === '/cliente/configuracoes';
  const isOverview = !isCalculadora && !isEstoque && !isImpressoras && !isProjetos && !isAiCopilot && !isPlanos && !isFaturas && !isConfig;

  return (
    <DashboardLayout
      title={
        isCalculadora
          ? 'Calculadora de Impressão 3D'
          : isEstoque
          ? 'Estoque de Filamentos & Resinas'
          : isImpressoras
          ? 'Parque de Impressoras 3D'
          : isProjetos
          ? 'Projetos & Orçamentos Salvos'
          : isAiCopilot
          ? 'Spartan AI — Copilot & Diagnóstico 3D'
          : isPlanos
          ? 'Planos & Capacidade da Farm'
          : isFaturas
          ? 'Minhas Faturas & Assinatura'
          : isConfig
          ? 'Configurações da Farm'
          : `Painel do Maker: ${user?.name || 'Spartan 3D'}`
      }
      subtitle={`Estúdio: ${user?.companyName || 'Spartan Print Lab'} • Plano: ${currentPlan.name}`}
      badgeText={currentPlan.badge || 'MAKER ATIVO'}
    >
      {isOverview && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Impressoras Ativas</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">
                {impressoras.filter(i => i.status === 'imprimindo').length} / {impressoras.length}
              </p>
              <span className="text-[11px] text-emerald-400">Em produção contínua</span>
            </Card>

            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Carretéis no Estoque</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{filamentos.length} carretéis</p>
              <span className="text-[11px] text-slate-400">
                Total de {(filamentos.reduce((acc, f) => acc + f.pesoRestanteG, 0) / 1000).toFixed(1)}kg de material
              </span>
            </Card>

            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Projetos & Orçamentos</span>
                <FolderKanban className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{projetos.length} peças</p>
              <span className="text-[11px] text-emerald-400">Histórico salvo</span>
            </Card>

            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Spartan AI Maker</span>
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">Ativa</p>
              <span className="text-[11px] text-indigo-300">Diagnóstico de falhas FDM/SLA</span>
            </Card>
          </div>

          <Calculadora3D />
          <EstoqueFilamentos />
          <ParqueImpressoras />
          <ProjetosManager />
        </div>
      )}

      {isCalculadora && <Calculadora3D />}
      {isEstoque && <EstoqueFilamentos />}
      {isImpressoras && <ParqueImpressoras />}
      {isProjetos && <ProjetosManager />}
      {isAiCopilot && <SpartanAiAssistant />}

      {isPlanos && (
        <ClientPlansPricing
          plans={plans}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
        />
      )}

      {isFaturas && (
        <ClientInvoicesList
          invoices={invoices}
          currentPlan={currentPlan}
          onOpenPixModal={() => setPixModal(true)}
        />
      )}

      {isConfig && (
        <ClientSettingsForm
          user={user}
          onUpdateUserProfile={updateUserProfile}
        />
      )}

      <ClientPixModal
        isOpen={pixModal}
        onClose={() => setPixModal(false)}
      />

      <ClientUpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        plans={plans}
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
      />
    </DashboardLayout>
  );
};

export default ClientPortal;