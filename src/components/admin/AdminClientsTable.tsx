"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, CheckCircle2, Clock, User, Lock, Unlock, Ban, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { User as SaaSUser } from '@/types/saas';

interface AdminClientsTableProps {
  onOpenNewClientModal: () => void;
}

export const AdminClientsTable: React.FC<AdminClientsTableProps> = ({ onOpenNewClientModal }) => {
  const { clients, updateClientStatus, deleteClient, createInvoice, plans } = useSaaSData();
  const [clientToDelete, setClientToDelete] = useState<SaaSUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      const ok = await deleteClient(clientToDelete.id);
      if (ok) {
        setClientToDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-white font-bold">Clientes & Assinantes</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Gerencie acessos, faturas, bloqueios e exclusão completa de cada assinante em tempo real
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onOpenNewClientModal}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                <tr>
                  <th className="py-3 px-4">Cliente / Empresa</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">MRR</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data de Início</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {client.avatar ? (
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{client.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {client.companyName ? `${client.companyName} • ${client.email}` : client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                        {client.planId === 'plan_enterprise'
                          ? 'Enterprise VIP'
                          : client.planId === 'plan_starter'
                          ? 'Starter Booster'
                          : 'Pro Scaler'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      R$ {client.mrr}/mês
                    </td>
                    <td className="py-3.5 px-4">
                      {client.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      )}
                      {client.status === 'trialing' && (() => {
                        const joinedMs = client.joinedAt ? new Date(client.joinedAt).getTime() : Date.now();
                        const elapsedDays = Math.floor((Date.now() - joinedMs) / (24 * 60 * 60 * 1000));
                        const remainingDays = Math.max(0, 14 - elapsedDays);
                        return (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                            <Clock className="w-3 h-3" /> Teste Grátis ({remainingDays}d restantes)
                          </span>
                        );
                      })()}
                      {client.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                          <Lock className="w-3 h-3 text-rose-400" /> Atrasado (Bloqueado)
                        </span>
                      )}
                      {client.status === 'canceled' && (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                          <Ban className="w-3 h-3" /> Cancelado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {client.joinedAt ? new Date(client.joinedAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => createInvoice(client.id, plans.find(plan => plan.id === client.planId)?.priceMonthly || 0, 'pix')}
                        className="h-7 px-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg"
                        title="Gerar cobrança Pix para o cliente"
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        Cobrar Pix
                      </Button>

                      {client.status === 'trialing' && (
                        <Button
                          size="sm"
                          onClick={() => updateClientStatus(client.id, 'active')}
                          className="h-7 px-2.5 text-[11px] bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg font-semibold transition-all"
                          title="Ativar assinatura definitiva após pagamento"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ativar Conta
                        </Button>
                      )}

                      {client.status === 'overdue' ? (
                        <Button
                          size="sm"
                          onClick={() => updateClientStatus(client.id, 'active')}
                          className="h-7 px-2.5 text-[11px] bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg font-semibold transition-all"
                          title="Liberar e ativar acesso do cliente imediatamente após pagamento"
                        >
                          <Unlock className="w-3 h-3 mr-1" />
                          Desbloquear (Ativar)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateClientStatus(client.id, 'overdue')}
                          className="h-7 px-2.5 text-[11px] bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg font-semibold transition-all"
                          title="Alterar para atrasado e bloquear o acesso imediato do cliente"
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Bloquear (Atrasado)
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => setClientToDelete(client)}
                        className="h-7 px-2.5 text-[11px] bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg font-semibold transition-all"
                        title="Excluir usuário e apagar todos os seus dados no Supabase"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão Total */}
      {clientToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={e => {
            if (e.target === e.currentTarget && !deleting) setClientToDelete(null);
          }}
        >
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Excluir Usuário Permanentemente?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Esta ação apagará 100% dos dados deste cliente no Supabase.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-300">
                <strong className="text-white">Cliente:</strong> {clientToDelete.name}
              </p>
              {clientToDelete.companyName && (
                <p className="text-slate-300">
                  <strong className="text-white">Estúdio / Farm:</strong> {clientToDelete.companyName}
                </p>
              )}
              <p className="text-slate-300">
                <strong className="text-white">E-mail:</strong> {clientToDelete.email}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
              <p>• Todos os projetos, filamentos, impressoras, faturas, chaves Pix e arquivos serão removidos.</p>
              <p className="text-emerald-400">
                • O e-mail <strong>{clientToDelete.email}</strong> ficará totalmente livre caso o cliente queira criar uma nova conta do zero no futuro.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setClientToDelete(null)}
                className="border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={() => void handleConfirmDelete()}
                className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Excluindo tudo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Sim, Excluir Tudo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};