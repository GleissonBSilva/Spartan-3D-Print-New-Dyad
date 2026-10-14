import { useCallback, useEffect, useState } from 'react';
import { User, Invoice } from '@/types/saas';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { canAccessAdmin } from '@/lib/permissions';

export function useBillingState() {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const load = useCallback(async () => {
    if (!user || !supabase) { setClients([]); setInvoices([]); return; }
    if (canAccessAdmin(user)) {
      const [{ data: users, error: userError }, { data: invoiceRows, error: invoiceError }, { data: planRows, error: planError }] = await Promise.all([
        supabase.from('spartan_profiles').select('id, email, full_name, role, status, plan_id, company_id, company_name, created_at').eq('role', 'client'),
        supabase.from('spartan_invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('spartan_plans').select('id, price_monthly'),
      ]);
      if (userError) throw userError;
      if (invoiceError) throw invoiceError;
      if (planError) throw planError;
      const monthlyPrices = new Map((planRows || []).map((plan: any) => [plan.id, Number(plan.price_monthly)]));
      const mappedClients = (users || []).map((row: any) => ({
        id: row.id, email: row.email || '', name: row.full_name || 'Cliente', role: row.role,
        avatar: '', companyId: row.company_id, companyName: row.company_name, planId: row.plan_id, status: row.status, mrr: monthlyPrices.get(row.plan_id) || 0,
        joinedAt: row.created_at,
      })) as User[];
      setClients(mappedClients);
      const names = new Map(mappedClients.map(client => [client.id, client.name]));
      setInvoices((invoiceRows || []).map((row: any) => ({
        id: row.id, clientId: row.user_id, clientName: names.get(row.user_id) || 'Assinante', amount: Number(row.amount),
        status: row.status === 'paid' ? 'paid' : row.status === 'failed' ? 'failed' : 'pending',
        dueDate: row.due_date, paidAt: row.paid_at || undefined, method: row.method,
      })) as Invoice[]);
    } else {
      const { data, error } = await supabase.from('spartan_invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data || []).map((row: any) => ({
        id: row.id, clientId: row.user_id, clientName: user.name, amount: Number(row.amount),
        status: row.status === 'paid' ? 'paid' : row.status === 'failed' ? 'failed' : 'pending',
        dueDate: row.due_date, paidAt: row.paid_at || undefined, method: row.method,
      })) as Invoice[]);
      setClients([]);
    }
  }, [user]);

  useEffect(() => { void load().catch(error => toast.error(`Falha ao carregar faturamento: ${error.message}`)); }, [load]);

  const addClient = (data: Partial<User>) => {
    if (!supabase || !canAccessAdmin(user)) { toast.error('Apenas administradores podem convidar clientes.'); return; }
    void supabase.functions.invoke('invite-client', { body: { email: data.email, name: data.name, companyName: data.companyName, planId: data.planId } })
      .then(({ data: result, error }) => {
        if (error) throw error;
        toast.success(result?.message || 'Convite enviado por e-mail.');
        return load();
      }).catch(error => toast.error(`Não foi possível convidar o cliente: ${error.message}`));
  };

  const updateClientStatus = (id: string, status: User['status']) => {
    if (!supabase) return;
    void Promise.resolve(supabase.from('spartan_profiles').update({ status }).eq('id', id)).then(({ error }) => {
      if (error) throw error;
      setClients(prev => prev.map(client => client.id === id ? { ...client, status } : client));
      if (status === 'overdue') {
        toast.error('Status alterado para Atrasado. O acesso do cliente foi bloqueado imediatamente.');
      } else if (status === 'active') {
        toast.success('Status alterado para Ativo. O acesso do cliente foi liberado imediatamente.');
      } else if (status === 'canceled') {
        toast.info('Status alterado para Cancelado. O acesso do cliente foi suspenso.');
      } else {
        toast.success('Status do cliente atualizado com sucesso.');
      }
    }).catch(error => toast.error(`Falha ao atualizar cliente: ${error.message}`));
  };

  const createInvoice = (clientId: string, amount: number, method: Invoice['method'] = 'pix', planId?: string) => {
    if (!supabase) return;
    void supabase.functions.invoke('create-checkout', { body: { clientId, amount, method, planId } }).then(({ data, error }) => {
      if (error) throw error;
      if (data?.checkoutUrl) window.location.assign(data.checkoutUrl);
      toast.success('Cobrança criada pelo provedor de pagamento.');
      return load();
    }).catch(error => toast.error(`Não foi possível criar a cobrança: ${error.message}`));
  };

  const openInvoiceCheckout = (invoiceId: string) => {
    if (!supabase) return;
    void supabase.functions.invoke('create-checkout', { body: { invoiceId } }).then(({ data, error }) => {
      if (error) throw error;
      if (data?.checkoutUrl) window.location.assign(data.checkoutUrl);
      return load();
    }).catch(error => toast.error(`Não foi possível abrir o pagamento: ${error.message}`));
  };

  const payInvoice = (invoiceId: string) => {
    openInvoiceCheckout(invoiceId);
  };

  const confirmInvoicePayment = async (invoiceId: string) => {
    if (!supabase) return;
    try {
      const nowIso = new Date().toISOString();
      const { data: invoiceData, error: invoiceErr } = await supabase
        .from('spartan_invoices')
        .update({ status: 'paid', paid_at: nowIso })
        .eq('id', invoiceId)
        .select('*')
        .single();
      if (invoiceErr) throw invoiceErr;

      // Se a fatura é de um cliente em atraso, restaura o status para 'active'
      if (invoiceData?.user_id) {
        const { data: profile } = await supabase
          .from('spartan_profiles')
          .select('status')
          .eq('id', invoiceData.user_id)
          .single();
        if (profile?.status === 'overdue') {
          await supabase.from('spartan_profiles').update({ status: 'active' }).eq('id', invoiceData.user_id);
          setClients(prev => prev.map(c => c.id === invoiceData.user_id ? { ...c, status: 'active' } : c));
        }
      }

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paidAt: nowIso.slice(0, 10) } : inv));
      toast.success('Pagamento liquidado com sucesso! Acesso do cliente verificado.');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao confirmar pagamento da fatura.');
    }
  };

  const cancelInvoice = async (invoiceId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('spartan_invoices').update({ status: 'canceled' }).eq('id', invoiceId);
      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'failed' } : inv));
      toast.info('Fatura cancelada.');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao cancelar fatura.');
    }
  };

  const createDirectInvoice = async (params: { clientId: string; amount: number; dueDate?: string; planId?: string; method?: Invoice['method'] }) => {
    if (!supabase) return null;
    try {
      const targetClient = clients.find(c => c.id === params.clientId);
      const companyId = targetClient?.companyId || user?.companyId;
      const dueDate = params.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase.from('spartan_invoices').insert({
        company_id: companyId,
        user_id: params.clientId,
        amount: params.amount,
        method: params.method || 'pix',
        plan_id: params.planId || targetClient?.planId || 'plan_pro',
        currency: 'BRL',
        status: 'pending',
        due_date: dueDate,
        provider: 'pix_direto',
      }).select('*').single();
      if (error) throw error;
      toast.success('Cobrança Pix criada com sucesso!');
      await load();
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar cobrança.');
      return null;
    }
  };

  return {
    clients,
    invoices,
    addClient,
    updateClientStatus,
    createInvoice,
    createDirectInvoice,
    confirmInvoicePayment,
    cancelInvoice,
    openInvoiceCheckout,
    payInvoice,
    refreshBilling: load,
  };
}
