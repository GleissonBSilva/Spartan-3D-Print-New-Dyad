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
      toast.success('Status do cliente atualizado.');
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

  const payInvoice = (_invoiceId: string) => {
    toast.info('A confirmação de pagamento é processada pelo webhook do provedor.');
  };

  return { clients, invoices, addClient, updateClientStatus, createInvoice, openInvoiceCheckout, payInvoice };
}
