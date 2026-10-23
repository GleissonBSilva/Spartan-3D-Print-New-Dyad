"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Copy,
  Check,
  Send,
  Search,
  Settings2,
  RefreshCw,
  X,
  CreditCard,
  Ban,
  TrendingUp,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Invoice, User } from '@/types/saas';
import {
  PixConfig,
  getSavedPixConfig,
  savePixConfig,
  syncPixConfigFromSupabase,
  generatePixPayload,
  getPixQrCodeUrl,
} from '@/services/pixService';

export const AdminFinancialArea: React.FC = () => {
  const { user } = useAuth();
  const {
    invoices,
    clients,
    plans,
    createDirectInvoice,
    confirmInvoicePayment,
    cancelInvoice,
    refreshBilling,
  } = useSaaSData();

  // Configuração Pix isolada por user.id e sincronizada na nuvem (Supabase)
  const [pixConfig, setPixConfig] = useState<PixConfig>(() => getSavedPixConfig(user?.id));
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PixConfig>(() => getSavedPixConfig(user?.id));
  const [savingConfig, setSavingConfig] = useState(false);

  React.useEffect(() => {
    if (!user?.id) return;
    const local = getSavedPixConfig(user.id);
    if (local.chave) {
      setPixConfig(local);
      setEditingConfig(local);
    }

    void syncPixConfigFromSupabase(user.id).then(cloudConfig => {
      if (cloudConfig && cloudConfig.chave) {
        setPixConfig(cloudConfig);
        setEditingConfig(cloudConfig);
      }
    });

    const handleUpdate = () => {
      const updated = getSavedPixConfig(user.id);
      setPixConfig(updated);
      setEditingConfig(updated);
    };

    window.addEventListener('spartan_pix_config_updated', handleUpdate);
    return () => window.removeEventListener('spartan_pix_config_updated', handleUpdate);
  }, [user?.id]);

  // Modal Nova Cobrança Pix
  const [showNewChargeModal, setShowNewChargeModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeDueDate, setChargeDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [chargeDescription, setChargeDescription] = useState('Mensalidade Assinatura Spartan 3D');
  const [creatingCharge, setCreatingCharge] = useState(false);

  // Modal Visualização Pix (QR Code / Copia e Cola)
  const [activePixModal, setActivePixModal] = useState<{
    invoice: Invoice;
    pixPayload: string;
    client?: User;
  } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Filtros e busca
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Cálculos de KPIs Financeiros
  const kpis = useMemo(() => {
    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const overdueClients = clients.filter(c => c.status === 'overdue');
    const totalOverdueMRR = overdueClients.reduce((sum, c) => sum + (c.mrr || 0), 0);

    const pixInvoices = invoices.filter(inv => inv.method === 'pix');
    const pixPaid = pixInvoices.filter(inv => inv.status === 'paid').length;
    const pixConversion = pixInvoices.length > 0 ? Math.round((pixPaid / pixInvoices.length) * 100) : 100;

    return {
      totalPaid,
      totalPending,
      pendingCount: pendingInvoices.length,
      overdueClientsCount: overdueClients.length,
      totalOverdueMRR,
      pixConversion,
      totalInvoicesCount: invoices.length,
    };
  }, [invoices, clients]);

  // Lista de faturas filtrada
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchSearch =
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBilling();
      toast.success('Dados financeiros e faturas atualizados.');
    } catch (error) {
      toast.error('Falha ao atualizar dados financeiros.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setPixConfig(editingConfig);
    setShowConfigModal(false);
    try {
      await savePixConfig(editingConfig, user?.id);
      toast.success('Configuração da Chave Pix salva na nuvem com sucesso!');
    } catch {
      toast.error('Não foi possível salvar na nuvem, mas o valor foi mantido no navegador.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleOpenNewCharge = (preselectClientId?: string) => {
    const targetId = preselectClientId || clients[0]?.id || '';
    setSelectedClientId(targetId);
    const client = clients.find(c => c.id === targetId);
    const plan = plans.find(p => p.id === client?.planId);
    setChargeAmount(plan ? String(plan.priceMonthly) : '150');
    setChargeDescription(plan ? `Assinatura Spartan 3D - Plano ${plan.name}` : 'Mensalidade Assinatura Spartan 3D');
    setShowNewChargeModal(true);
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    const plan = plans.find(p => p.id === client?.planId);
    if (plan) {
      setChargeAmount(String(plan.priceMonthly));
      setChargeDescription(`Assinatura Spartan 3D - Plano ${plan.name}`);
    }
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(chargeAmount);
    if (!selectedClientId) {
      toast.error('Selecione um cliente.');
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    setCreatingCharge(true);
    try {
      const targetClient = clients.find(c => c.id === selectedClientId);
      const created = await createDirectInvoice({
        clientId: selectedClientId,
        amount: amountNum,
        dueDate: chargeDueDate,
        planId: targetClient?.planId,
        method: 'pix',
      });

      if (created) {
        setShowNewChargeModal(false);
        // Gera o payload Pix para abrir na hora o modal de cobrança
        const invoiceObj: Invoice = {
          id: String(created.id),
          clientId: selectedClientId,
          clientName: targetClient?.name || 'Cliente',
          amount: amountNum,
          status: 'pending',
          dueDate: chargeDueDate,
          method: 'pix',
        };

        const payload = generatePixPayload({
          chave: pixConfig.chave,
          nomeTitular: pixConfig.nomeTitular,
          cidade: pixConfig.cidade,
          valor: amountNum,
          txId: String(created.id).replace(/-/g, '').slice(0, 20),
          descricao: chargeDescription,
        });

        setActivePixModal({
          invoice: invoiceObj,
          pixPayload: payload,
          client: targetClient,
        });
      }
    } finally {
      setCreatingCharge(false);
    }
  };

  const handleViewPix = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    const payload = generatePixPayload({
      chave: pixConfig.chave,
      nomeTitular: pixConfig.nomeTitular,
      cidade: pixConfig.cidade,
      valor: inv.amount,
      txId: inv.id.replace(/-/g, '').slice(0, 20),
      descricao: `Fatura ${inv.id.slice(0, 8)}`,
    });

    setActivePixModal({
      invoice: inv,
      pixPayload: payload,
      client,
    });
  };

  const handleCopyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    toast.success('Código Pix Copia e Cola copiado!');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleShareWhatsApp = (inv: Invoice, payload: string, clientName?: string) => {
    const text = encodeURIComponent(
      `Olá ${clientName || 'Assinante'},\n\nSegue o código Pix para pagamento da sua fatura na *Spartan 3D Print*:\n\n*Valor:* R$ ${inv.amount.toFixed(
        2
      )}\n*Vencimento:* ${inv.dueDate}\n*Código:* ${inv.id}\n\n*Pix Copia e Cola:*\n\`\`\`${payload}\`\`\`\n\nApós o pagamento, o acesso é liberado instantaneamente pelo sistema. Obrigado!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    toast.success('Cobrança preparada para compartilhamento no WhatsApp.');
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    await confirmInvoicePayment(invoiceId);
    if (activePixModal && activePixModal.invoice.id === invoiceId) {
      setActivePixModal(prev => (prev ? { ...prev, invoice: { ...prev.invoice, status: 'paid' } } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações Globais */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Gestão Financeira & Pix
          </h2>
          <p className="text-xs text-slate-400">
            Controle de liquidações, geração de cobranças Pix e conciliação em tempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingConfig(pixConfig);
              setShowConfigModal(true);
            }}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs"
          >
            <Settings2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Configurar Chave Pix
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenNewCharge()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Cobrança Pix
          </Button>
        </div>
      </div>

      {/* Cards de KPIs Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Liquidado (Pago)
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              R$ {kpis.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Receita confirmada e baixada na plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Faturas Pendentes
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              R$ {kpis.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-amber-400 font-medium">
              {kpis.pendingCount} cobrança(s) aguardando Pix
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Inadimplência Atual
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              R$ {kpis.totalOverdueMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-rose-400 font-medium">
              {kpis.overdueClientsCount} cliente(s) com acesso bloqueado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chave Pix da Farm
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-white truncate font-mono">
              {pixConfig.chave}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 truncate">
              {pixConfig.nomeTitular} • {pixConfig.cidade}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Faturas & Conciliação */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-slate-800/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                Faturas & Cobranças Pix
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Histórico completo com QR Code, compartilhamento no WhatsApp e baixa manual
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'pending' ? 'bg-amber-600/80 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pendentes ({invoices.filter(i => i.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'paid' ? 'bg-emerald-600/80 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pagas ({invoices.filter(i => i.status === 'paid').length})
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome do cliente ou código da fatura..."
              className="bg-slate-950 border-slate-800 text-white pl-9 rounded-xl text-xs h-10 placeholder:text-slate-500"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Assinante / Empresa</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Nenhuma fatura encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const client = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">
                          {inv.id.slice(0, 10)}…
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-white font-bold text-xs">{inv.clientName}</p>
                          <p className="text-[11px] text-slate-400">{client?.companyName || client?.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {inv.method === 'pix' ? <QrCode className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {inv.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                        <td className="py-3.5 px-4">
                          {inv.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Liquidada ({inv.paidAt || 'OK'})
                            </span>
                          ) : inv.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px] bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                              <Ban className="w-3 h-3" /> Cancelada / Falhou
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Aguardando Pix
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Ver QR Code Pix */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewPix(inv)}
                            className="h-7 px-2.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg font-medium"
                            title="Visualizar QR Code Pix e Copia e Cola"
                          >
                            <QrCode className="w-3 h-3 mr-1" />
                            Ver Pix
                          </Button>

                          {/* Se pendente, ação de baixa manual */}
                          {inv.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayment(inv.id)}
                                className="h-7 px-2.5 text-[11px] bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg font-semibold transition-all"
                                title="Confirmar recebimento manual e liquidar fatura"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Dar Baixa
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelInvoice(inv.id)}
                                className="h-7 px-2 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                                title="Cancelar fatura"
                              >
                                <Ban className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Configurar Chave Pix */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <h3>Configuração da Chave Pix</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tipo de Chave Pix
                </label>
                <select
                  value={editingConfig.tipoChave}
                  onChange={e =>
                    setEditingConfig(prev => ({
                      ...prev,
                      tipoChave: e.target.value as PixConfig['tipoChave'],
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Chave Pix Receptora
                </label>
                <Input
                  required
                  value={editingConfig.chave}
                  onChange={e => setEditingConfig(prev => ({ ...prev, chave: e.target.value }))}
                  placeholder="Ex: financeiro@spartan3d.com.br ou CNPJ"
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Nome do Titular / Beneficiário
                </label>
                <Input
                  required
                  maxLength={25}
                  value={editingConfig.nomeTitular}
                  onChange={e => setEditingConfig(prev => ({ ...prev, nomeTitular: e.target.value }))}
                  placeholder="SPARTAN 3D PRINT"
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Cidade do Titular (Padrão Bacen)
                </label>
                <Input
                  required
                  maxLength={15}
                  value={editingConfig.cidade}
                  onChange={e => setEditingConfig(prev => ({ ...prev, cidade: e.target.value }))}
                  placeholder="SAO PAULO"
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfigModal(false)}
                  className="border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingConfig}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  {savingConfig ? 'Salvando na Nuvem...' : 'Salvar Chave Pix'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Cobrança Pix */}
      {showNewChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3>Gerar Nova Cobrança Pix</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChargeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Cliente / Assinante
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Valor da Cobrança (R$)
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                  placeholder="Ex: 150.00"
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Data de Vencimento
                </label>
                <Input
                  required
                  type="date"
                  value={chargeDueDate}
                  onChange={e => setChargeDueDate(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Descrição da Cobrança
                </label>
                <Input
                  required
                  maxLength={40}
                  value={chargeDescription}
                  onChange={e => setChargeDescription(e.target.value)}
                  placeholder="Mensalidade Assinatura Spartan 3D"
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewChargeModal(false)}
                  className="border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creatingCharge}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  <QrCode className="w-3.5 h-3.5 mr-1.5" />
                  {creatingCharge ? 'Gerando Pix...' : 'Gerar Cobrança Pix'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualização Pix (QR Code + Copia e Cola) */}
      {activePixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cobrança Pix Instantânea</h3>
                  <p className="text-[11px] text-slate-400">Fatura: {activePixModal.invoice.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePixModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Informações da Cobrança */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Assinante:</span>
                <span className="font-bold text-white">{activePixModal.invoice.clientName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Valor:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  R$ {activePixModal.invoice.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
              <img
                src={getPixQrCodeUrl(activePixModal.pixPayload, 220)}
                alt="QR Code Pix"
                className="w-48 h-48 object-contain"
              />
              <span className="text-[11px] font-bold text-slate-800 mt-2">
                Escaneie com o app de qualquer banco
              </span>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={activePixModal.pixPayload}
                  className="bg-slate-950 border-slate-700 text-white font-mono text-[10px] h-9 rounded-xl truncate"
                />
                <Button
                  size="sm"
                  onClick={() => handleCopyPayload(activePixModal.pixPayload)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3 rounded-xl shrink-0"
                >
                  {copiedPayload ? (
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1" />
                  )}
                  {copiedPayload ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Ações: WhatsApp e Baixa */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Button
                size="sm"
                onClick={() =>
                  handleShareWhatsApp(
                    activePixModal.invoice,
                    activePixModal.pixPayload,
                    activePixModal.invoice.clientName
                  )
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-9 text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Enviar Cobrança no WhatsApp do Cliente
              </Button>

              {activePixModal.invoice.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConfirmPayment(activePixModal.invoice.id)}
                  className="w-full border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl h-9 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Confirmar Recebimento / Dar Baixa Agora
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
