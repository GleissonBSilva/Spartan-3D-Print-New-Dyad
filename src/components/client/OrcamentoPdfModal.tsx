"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Printer, Send, CheckCircle2, Layers, Clock, Scale, UserRound, Mail, Phone, CalendarDays } from 'lucide-react';
import { ProjetoImpressao3D } from '@/types/saas';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface OrcamentoPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto: Partial<ProjetoImpressao3D>;
}

const money = (value?: number) => `R$ ${(value || 0).toFixed(2)}`;

export const OrcamentoPdfModal: React.FC<OrcamentoPdfModalProps> = ({ isOpen, onClose, projeto }) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const companyName = user?.companyName || 'Minha empresa de impressão 3D';
  const reference = projeto.id?.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase() || 'NOVO';
  const createdDate = projeto.dataCriacao ? new Date(projeto.dataCriacao) : new Date();
  const quoteDate = createdDate.toLocaleDateString('pt-BR');
  const materials = projeto.materials || [];
  const companyPhone = user?.companyPhone?.trim();
  const phoneDigits = companyPhone?.replace(/\D/g, '');
  const productName = projeto.nomePeca || 'Peça impressa em 3D';

  const handlePrint = () => window.print();

  const handleSendWhatsapp = () => {
    const materialsDesc = materials.length
      ? materials.map((material, index) => `${index + 1}. ${material.filamentType} ${material.color} — ${material.weightGrams} g`).join('\n')
      : `${projeto.filamentoUtilizado || 'Material a confirmar'} — ${projeto.pesoEstimadoG || '—'} g`;
    const contact = [companyPhone && `WhatsApp: ${companyPhone}`, user?.email && `E-mail: ${user.email}`].filter(Boolean).join('\n');
    const text = encodeURIComponent(
      `PROPOSTA COMERCIAL #${reference} — ${companyName}\n\n` +
      `Cliente: ${projeto.clienteNome || 'Cliente'}\n` +
      `Produto: ${productName}\n` +
      `Peso estimado: ${projeto.pesoEstimadoG ?? '—'} g\n` +
      `Tempo estimado de impressão: ${projeto.tempoEstimadoHoras ?? '—'} h\n` +
      `Impressora: ${projeto.impressoraNome || 'A definir'}\n\n` +
      `Materiais e cores:\n${materialsDesc}\n\n` +
      `Valor da proposta: ${money(projeto.precoCobrado)}\n` +
      `Validade: 7 dias\n\n` +
      `${contact ? `Contato da empresa:\n${contact}\n\n` : ''}` +
      `Data: ${quoteDate}`
    );
    window.open(`https://wa.me/${phoneDigits || ''}?text=${text}`, '_blank', 'noopener,noreferrer');
    toast.success('Proposta preparada para compartilhar pelo WhatsApp.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-4 sm:p-8 space-y-5 shadow-2xl text-left my-4 sm:my-8">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-4 print:hidden">
          <span className="text-sm font-bold text-white">Visualização da proposta comercial</span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} variant="outline" className="bg-slate-800 border-slate-700 text-white text-xs rounded-xl"><Printer className="w-3.5 h-3.5 mr-1" />Imprimir / PDF</Button>
            <Button size="sm" onClick={handleSendWhatsapp} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold"><Send className="w-3.5 h-3.5 mr-1" />Enviar WhatsApp</Button>
            <button onClick={onClose} aria-label="Fechar proposta" className="text-slate-400 hover:text-white ml-1 text-sm">✕</button>
          </div>
        </div>

        <article className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5 text-slate-200 print:bg-white print:text-black print:border-none print:p-0">
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-slate-800 pb-5 print:border-gray-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white overflow-hidden shrink-0 print:border print:border-gray-200">
                {user?.avatar ? <img src={user.avatar} alt={`Logo de ${companyName}`} className="w-full h-full object-cover" /> : <Box className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-white print:text-black break-words">{companyName}</h2>
                <p className="text-xs text-slate-400 print:text-gray-600">Impressão 3D e manufatura aditiva</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 print:text-gray-700">
                  {user?.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{user.email}</span>}
                  {companyPhone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{companyPhone}</span>}
                </div>
              </div>
            </div>
            <div className="sm:text-right text-xs shrink-0">
              <span className="font-mono font-bold text-indigo-400 print:text-indigo-700 block">ORÇAMENTO #SP-{reference}</span>
              <span className="text-slate-400 print:text-gray-500 inline-flex items-center gap-1 sm:justify-end mt-1"><CalendarDays className="h-3 w-3" />{quoteDate}</span>
            </div>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] uppercase font-bold tracking-wide text-slate-400 print:text-gray-500 block mb-2">Solicitante</span>
              <p className="font-bold text-white print:text-black inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-indigo-400 print:text-indigo-700" />{projeto.clienteNome || 'Cliente'}</p>
            </div>
            <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] uppercase font-bold tracking-wide text-slate-400 print:text-gray-500 block mb-2">Produto / projeto</span>
              <p className="font-bold text-white print:text-black">{productName}</p>
              {projeto.observacoes && <p className="text-xs text-slate-400 print:text-gray-600 mt-1 whitespace-pre-wrap">{projeto.observacoes}</p>}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 print:text-gray-800 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-400 print:text-indigo-700" />Materiais e acabamento ({materials.length || 1})</h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold print:bg-gray-100 print:text-gray-700">
                  <tr><th className="py-2.5 px-3 sm:px-4">#</th><th className="py-2.5 px-3 sm:px-4">Material</th><th className="py-2.5 px-3 sm:px-4">Cor / acabamento</th><th className="py-2.5 px-3 sm:px-4 text-right">Peso</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-gray-200 print:text-gray-800">
                  {materials.length ? materials.map((material, index) => (
                    <tr key={material.id || index}>
                      <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3 sm:px-4 font-bold text-white print:text-black">{material.filamentType}</td>
                      <td className="py-2.5 px-3 sm:px-4"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: material.colorHex || '#6366f1' }} />{material.color}</span></td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-medium">{material.weightGrams} g</td>
                    </tr>
                  )) : (
                    <tr><td className="py-2.5 px-3 sm:px-4">1</td><td className="py-2.5 px-3 sm:px-4 font-bold text-white print:text-black">{projeto.filamentoUtilizado || 'Material a definir'}</td><td className="py-2.5 px-3 sm:px-4">Conforme combinado</td><td className="py-2.5 px-3 sm:px-4 text-right">{projeto.pesoEstimadoG ?? '—'} g</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-4 print:border-gray-300">
            <div className="rounded-xl bg-slate-900/70 p-3 print:bg-gray-50"><span className="text-[11px] text-slate-400 print:text-gray-500 flex items-center gap-1"><Scale className="h-3 w-3" />Peso total estimado</span><strong className="mt-1 block text-sm text-white print:text-black">{projeto.pesoEstimadoG ?? '—'} g</strong></div>
            <div className="rounded-xl bg-slate-900/70 p-3 print:bg-gray-50"><span className="text-[11px] text-slate-400 print:text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />Tempo de impressão</span><strong className="mt-1 block text-sm text-white print:text-black">{projeto.tempoEstimadoHoras ?? '—'} h</strong></div>
            <div className="rounded-xl bg-slate-900/70 p-3 print:bg-gray-50 col-span-2 sm:col-span-1"><span className="text-[11px] text-slate-400 print:text-gray-500">Impressora</span><strong className="mt-1 block text-sm text-white print:text-black">{projeto.impressoraNome || 'A definir'}</strong></div>
          </section>

          <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-slate-800 pt-4 print:border-gray-300">
            <div className="text-xs space-y-1.5 text-slate-400 print:text-gray-600">
              <p className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Proposta válida por 7 dias úteis.</p>
              <p>Prazo e condições de pagamento devem ser confirmados com a empresa.</p>
              {(user?.email || companyPhone) && <p className="pt-1 text-slate-300 print:text-gray-700">Contato: {[companyPhone, user?.email].filter(Boolean).join(' · ')}</p>}
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-400 print:text-gray-500 uppercase block">Total da proposta</span>
              <span className="text-2xl font-black text-white print:text-black">{money(projeto.precoCobrado)}</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};
