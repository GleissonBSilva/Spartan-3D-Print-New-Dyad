"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';
import { toast } from 'sonner';

export const AdminWebhooksMonitor: React.FC = () => {
  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: 'wh_912',
      event: 'payment_intent.succeeded',
      status: '200 OK',
      time: 'Há 2 minutos',
      payload: '{"amount": 49700, "customer": "usr_client_1", "status": "paid"}',
    },
    {
      id: 'wh_911',
      event: 'subscription.created',
      status: '200 OK',
      time: 'Há 18 minutos',
      payload: '{"plan": "plan_pro", "customer": "c2", "mrr": 497}',
    },
    {
      id: 'wh_910',
      event: 'invoice.payment_action_required',
      status: '200 OK',
      time: 'Há 45 minutos',
      payload: '{"invoice_id": "INV-9023", "pix_qrcode_generated": true}',
    },
  ]);

  const handleSimulateWebhook = () => {
    const newLog = {
      id: `wh_${Math.floor(1000 + Math.random() * 9000)}`,
      event: 'charge.captured.pix_instant',
      status: '200 OK',
      time: 'Agora mesmo',
      payload: `{"pix_e2e": "E2E${Date.now()}", "settlement": "instant", "amount": 497}`,
    };
    setWebhookLogs(prev => [newLog, ...prev]);
    toast.success('Webhook simulado recebido e processado com sucesso!');
  };

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base text-white font-bold">Monitor de Webhooks em Tempo Real</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Eventos recebidos dos gateways de pagamento e telemetria da API
          </CardDescription>
        </div>
        <Button
          onClick={handleSimulateWebhook}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl"
        >
          <Radio className="w-3.5 h-3.5 mr-1 text-emerald-400 animate-pulse" />
          Simular Webhook Pix
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-800 font-mono text-xs">
          {webhookLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-slate-800/30 space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {log.status}
                  </span>
                  <span className="text-white font-bold">{log.event}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{log.time}</span>
              </div>
              <pre className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto mt-2">
                {log.payload}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};