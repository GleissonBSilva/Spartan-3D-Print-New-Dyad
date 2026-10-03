"use client";

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminClientsTable } from '@/components/admin/AdminClientsTable';
import { AdminBillingTable } from '@/components/admin/AdminBillingTable';
import { AdminPlansManager } from '@/components/admin/AdminPlansManager';
import { AdminAiCopilot } from '@/components/admin/AdminAiCopilot';
import { AdminWebhooksMonitor } from '@/components/admin/AdminWebhooksMonitor';
import { NewClientModal } from '@/components/admin/NewClientModal';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [newClientModal, setNewClientModal] = useState(false);

  const isClientsView = currentPath === '/admin/clientes';
  const isBillingView = currentPath === '/admin/cobranca';
  const isPlansView = currentPath === '/admin/planos';
  const isAiCopilotView = currentPath === '/admin/ia-copilot';
  const isWebhooksView = currentPath === '/admin/webhooks';
  const isOverview = !isClientsView && !isBillingView && !isPlansView && !isAiCopilotView && !isWebhooksView;

  return (
    <DashboardLayout
      title={
        isClientsView
          ? 'Gestão de Clientes & Assinantes'
          : isBillingView
          ? 'Faturamento & Cobrança Pix / Cartão'
          : isPlansView
          ? 'Planos, Precificação & Monetização'
          : isAiCopilotView
          ? 'Copilot IA de Crescimento & Retenção'
          : isWebhooksView
          ? 'Logs em Tempo Real & Webhooks'
          : 'Painel Executivo do Administrador'
      }
      subtitle={
        isClientsView
          ? 'Visualize, altere planos e gerencie o ciclo de vida dos assinantes'
          : isBillingView
          ? 'Histórico de faturas, conciliação Pix instantânea e recuperação automática'
          : isPlansView
          ? 'Configure limites de usuários, créditos de inteligência artificial e preços'
          : isAiCopilotView
          ? 'Motor preditivo de churn e geração de oportunidades de faturamento'
          : isWebhooksView
          ? 'Monitoramento de eventos da API, integrações de pagamento e telemetria'
          : 'Controle de Receita Recorrente (MRR), Churn e Automação de Faturamento'
      }
      badgeText="ADMIN MASTER"
    >
      {isOverview && (
        <div className="space-y-6">
          <AdminOverview />
          <AdminClientsTable onOpenNewClientModal={() => setNewClientModal(true)} />
          <AdminBillingTable showCreateButton={false} />
        </div>
      )}

      {isClientsView && <AdminClientsTable onOpenNewClientModal={() => setNewClientModal(true)} />}
      {isBillingView && <AdminBillingTable showCreateButton={true} />}
      {isPlansView && <AdminPlansManager />}
      {isAiCopilotView && <AdminAiCopilot />}
      {isWebhooksView && <AdminWebhooksMonitor />}

      <NewClientModal
        isOpen={newClientModal}
        onClose={() => setNewClientModal(false)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;