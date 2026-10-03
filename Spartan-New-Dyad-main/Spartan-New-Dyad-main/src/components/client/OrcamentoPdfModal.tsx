"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Printer, Send, CheckCircle2, Layers } from 'lucide-react';
import { ProjetoImpressao3D } from '@/types/saas';
import { toast } from 'sonner';

interface OrcamentoPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto: Partial<ProjetoImpressao3D>;
  companyName?: string;
}

export const OrcamentoPdfModal: React.FC<OrcamentoPdfModalProps> = ({
  isOpen,
  onClose,
  projeto,
  companyName = 'Spartan 3D Print Lab',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsapp = () => {
    const materialsDesc = projeto.materials && projeto.materials.length > 0
      ? projeto.materials.map((m, i) => `  ${i + 1}. ${m.filamentType} ${m.color} (${m.weightGrams}g)`).join('\n')
      : `  • ${projeto.filamentoUtilizado || 'PLA Premium'} (${projeto.pesoEstimadoG}g)`;

    const texto = encodeURIComponent(
      `*Proposta Comercial #${projeto.id || 'SP-01'} - ${companyName}*\n\n` +
      `👤 *Cliente:* ${projeto.clienteNome || 'Cliente'}\n` +
      `📦 *Peça / Projeto:* ${projeto.nomePeca}\n` +
      `⏱️ *Tempo de Produção:* ${projeto.tempoEstimadoHoras} horas\n` +
      `⚖️ *Peso Total:* ${projeto.pesoEstimadoG}g\n\n` +
      `🎨 *Materiais & Cores:*\n${materialsDesc}\n\n` +
      `💰 *Valor Total:* R$ ${(projeto.precoCobrado || 0).toFixed(2)}\n\n` +
      `✅ *Prazo de Produção:* 1 a 3 dias úteis\n` +
      `💳 *Pagamento via Pix instantâneo ou Cartão.*`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    toast.success('Proposta formal enviada para o WhatsApp!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-left my-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Visualização da Proposta Comercial</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white text-xs rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir / PDF
            </Button>
            <Button
              size="sm"
              onClick={handleSendWhatsapp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Enviar WhatsApp
            </Button>
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-2 text-sm">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Proposal Document */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200 print:bg-white print:text-black print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white print:text-black">{companyName}</h2>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  Manufatura Aditiva & Prototipagem de Precisão
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-mono font-bold text-indigo-400 print:text-indigo-700 block">
                ORÇAMENTO #{projeto.id || 'SP-2025-01'}
              </span>
              <span className="text-slate-400 print:text-gray-500">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block mb-1">
                Dados do Solicitante
              </span>
              <p className="font-bold text-white print:text-black">{projeto.clienteNome || 'Cliente'}</p>
              <p className="text-slate-400 print:text-gray-600">Peça: {projeto.nomePeca}</p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block mb-1">
                Validade & Produção
              </span>
              <p className="font-bold text-white print:text-black">7 dias úteis</p>
              <p className="text-slate-400 print:text-gray-600">Tempo de Máquina: {projeto.tempoEstimadoHoras}h</p>
            </div>
          </div>

          {/* Items & Materials Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 print:text-gray-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Configuração de Materiais & Cores Utilizadas ({projeto.materials?.length || 1} material):
            </span>

            <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold print:bg-gray-100 print:text-gray-700">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Tipo de Filamento</th>
                    <th className="py-2.5 px-4">Cor / Acabamento</th>
                    <th className="py-2.5 px-4 text-right">Peso Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-gray-200 print:text-gray-800">
                  {projeto.materials && projeto.materials.length > 0 ? (
                    projeto.materials.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td className="py-2 px-4 font-mono text-slate-400">#{idx + 1}</td>
                        <td className="py-2 px-4 font-bold text-white print:text-black">{m.filamentType}</td>
                        <td className="py-2 px-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: m.colorHex || '#6366f1' }}
                            />
                            {m.color}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right font-medium">{m.weightGrams}g</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2 px-4 font-mono text-slate-400">#1</td>
                      <td className="py-2 px-4 font-bold text-white print:text-black">PLA / PETG</td>
                      <td className="py-2 px-4">{projeto.filamentoUtilizado || 'Padrão'}</td>
                      <td className="py-2 px-4 text-right font-medium">{projeto.pesoEstimadoG}g</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total & Conditions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-800 print:border-gray-200">
            <div className="text-xs space-y-1 text-slate-400 print:text-gray-600 text-left">
              <div className="flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Garantia de Tolerância Dimensional e Resistência Mecânica
              </div>
              <p>Forma de Pagamento: 50% de entrada e 50% na entrega via Pix.</p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 print:text-gray-500 uppercase block">Total do Orçamento</span>
              <span className="text-2xl font-black text-white print:text-black">
                R$ {(projeto.precoCobrado || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};