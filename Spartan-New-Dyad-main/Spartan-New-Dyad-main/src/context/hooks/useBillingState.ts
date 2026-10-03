"use client";

import { useState } from 'react';
import { User, Invoice } from '@/types/saas';
import { INITIAL_CLIENTS, INITIAL_INVOICES } from '@/data/saasInitialData';
import { toast } from 'sonner';

export function useBillingState() {
  const [clients, setClients] = useState<User[]>(INITIAL_CLIENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  const addClient = (newClientData: Partial<User>) => {
    const newClient: User = {
      id: `c_${Date.now()}`,
      name: newClientData.name || 'Maker 3D',
      email: newClientData.email || 'maker@spartan3d.com',
      companyName: newClientData.companyName || 'Impressão 3D Studio',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      planId: newClientData.planId || 'plan_pro',
      mrr: newClientData.planId === 'plan_enterprise' ? 299 : newClientData.planId === 'plan_starter' ? 49 : 129,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [newClient, ...prev]);
    toast.success(`Cliente ${newClient.name} cadastrado na plataforma Spartan!`);
  };

  const updateClientStatus = (id: string, status: User['status']) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
    toast.success('Status do assinante atualizado.');
  };

  const createInvoice = (clientId: string, amount: number, method: Invoice['method'] = 'pix') => {
    const client = clients.find(c => c.id === clientId);
    const newInvoice: Invoice = {
      id: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId,
      clientName: client?.name || 'Cliente Spartan',
      amount,
      status: 'pending',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      method,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    toast.success(`Fatura Pix de R$ ${amount} gerada com sucesso!`);
  };

  const payInvoice = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paidAt: new Date().toISOString().split('T')[0] }
          : inv
      )
    );
    toast.success(`Fatura #${invoiceId} liquidada com sucesso!`);
  };

  return {
    clients,
    invoices,
    addClient,
    updateClientStatus,
    createInvoice,
    payInvoice,
  };
}