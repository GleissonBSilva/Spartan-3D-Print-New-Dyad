"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, QrCode, CircleAlert } from 'lucide-react';
import { Invoice, Plan } from '@/types/saas';

interface ClientInvoicesListProps {
  invoices: Invoice[];
  currentPlan: Plan;
  onOpenPixModal: (invoiceId: string) => void;
}

export const ClientInvoicesList: React.FC<ClientInvoicesListProps> = ({
  invoices,
  currentPlan,
  onOpenPixModal,
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base text-white font-bold">Minhas Faturas Recentes</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Visualize comprovantes, boletos e faça pagamentos via Pix
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Fatura</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Você ainda não tem faturas.</td></tr>}
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{inv.id}</td>
                  <td className="py-3.5 px-4 text-white">Assinatura Spartan 3D {currentPlan.name}</td>
                  <td className="py-3.5 px-4 font-bold text-white">R$ {inv.amount},00</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                  <td className="py-3.5 px-4">
                    {inv.status === 'paid' ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3 h-3" /> Liquidada
                      </span>
                    ) : inv.status === 'failed' ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]"><CircleAlert className="w-3 h-3" /> Falhou</span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                        <QrCode className="w-3 h-3" /> Aguardando Pix
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status === 'pending' ? (
                      <Button
                        size="sm"
                        onClick={() => onOpenPixModal(inv.id)}
                        aria-label={`Abrir pagamento da fatura ${inv.id}`}
                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                      >
                        {inv.method === 'credit_card' ? 'Pagar com cartão' : 'Continuar pagamento'}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">Comprovante no provedor</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
