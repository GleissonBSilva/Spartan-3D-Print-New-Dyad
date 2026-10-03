"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Send, CheckCircle, Clock, FileText, Plus, Printer, Play, Check } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { OrcamentoPdfModal } from './OrcamentoPdfModal';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ProjetoImpressao3D } from '@/types/saas';

export const ProjetosManager: React.FC = () => {
  const { projetos, updateProjetoStatus } = useSaaSData();
  const [filtro, setFiltro] = useState<'todos' | 'orcamento' | 'em_impressao' | 'concluido'>('todos');
  const [selectedProjetoPdf, setSelectedProjetoPdf] = useState<ProjetoImpressao3D | null>(null);

  const projetosFiltrados = projetos.filter(p => {
    if (filtro === 'todos') return true;
    return p.status === filtro;
  });

  const handleEnviarOrcamentoWhatsApp = (proj: ProjetoImpressao3D) => {
    const materialsDesc = proj.materials && proj.materials.length > 0
      ? proj.materials.map((m, i) => `  ${i + 1}. ${m.filamentType} ${m.color} (${m.weightGrams}g)`).join('\n')
      : `  • ${proj.filamentoUtilizado} (${proj.pesoEstimadoG}g)`;

    const texto = encodeURIComponent(
      `*Orçamento de Impressão 3D - Spartan 3D*\n\n` +
      `Olá ${proj.clienteNome}!\n` +
      `📦 *Peça:* ${proj.nomePeca}\n` +
      `⏱️ *Tempo de Impressão:* ${proj.tempoEstimadoHoras}h\n` +
      `⚖️ *Peso Total:* ${proj.pesoEstimadoG}g\n\n` +
      `🎨 *Cores/Materiais:*\n${materialsDesc}\n\n` +
      `💰 *Valor Final:* R$ ${proj.precoCobrado.toFixed(2)}\n\n` +
      `_Podemos iniciar a produção na nossa farm?_`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    toast.success(`Orçamento para ${proj.clienteNome} gerado com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Projetos & Orçamentos da Farm
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o ciclo de vida dos orçamentos, aprove para produção e envie propostas para clientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cliente/calculadora">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs">
              <Plus className="w-4 h-4 mr-1" /> Novo Orçamento / Peça
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['todos', 'orcamento', 'em_impressao', 'concluido'] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant="ghost"
            onClick={() => setFiltro(f)}
            className={`text-xs rounded-xl h-8 capitalize ${
              filtro === f ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'todos' ? 'Todos os Projetos' : f.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Peça / STL</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Materiais / Cores</th>
                <th className="py-3 px-4">Tempo</th>
                <th className="py-3 px-4">Custo Total</th>
                <th className="py-3 px-4">Preço Cobrado</th>
                <th className="py-3 px-4">Lucro Líquido</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {projetosFiltrados.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-white">{proj.nomePeca}</td>
                  <td className="py-3.5 px-4 text-slate-400">{proj.clienteNome}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {proj.materials && proj.materials.length > 0 ? (
                        proj.materials.map((m, idx) => (
                          <span
                            key={m.id || idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: m.colorHex || '#6366f1' }}
                            />
                            {m.filamentType} {m.weightGrams}g
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">{proj.filamentoUtilizado}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{proj.tempoEstimadoHoras}h</td>
                  <td className="py-3.5 px-4 text-rose-400 font-medium">R$ {proj.custoTotal.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-white font-bold">R$ {proj.precoCobrado.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">+ R$ {proj.lucroLiquido.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    {proj.status === 'concluido' && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <CheckCircle className="w-3 h-3" /> Concluído
                      </span>
                    )}
                    {proj.status === 'em_impressao' && (
                      <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <Clock className="w-3 h-3" /> Na Máquina
                      </span>
                    )}
                    {proj.status === 'orcamento' && (
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <FileText className="w-3 h-3" /> Orçamento
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {proj.status === 'orcamento' && (
                      <Button
                        size="sm"
                        onClick={() => updateProjetoStatus(proj.id, 'em_impressao')}
                        className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                        title="Aprovar e dar baixa automática de materiais no estoque"
                      >
                        <Play className="w-3 h-3 mr-1" /> Produzir
                      </Button>
                    )}
                    {proj.status === 'em_impressao' && (
                      <Button
                        size="sm"
                        onClick={() => updateProjetoStatus(proj.id, 'concluido')}
                        className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                      >
                        <Check className="w-3 h-3 mr-1" /> Finalizar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProjetoPdf(proj)}
                      className="h-7 px-2 text-xs bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                    >
                      <Printer className="w-3 h-3 mr-1" /> PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEnviarOrcamentoWhatsApp(proj)}
                      className="h-7 px-2 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
                    >
                      <Send className="w-3 h-3 mr-1" /> WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selectedProjetoPdf && (
        <OrcamentoPdfModal
          isOpen={Boolean(selectedProjetoPdf)}
          onClose={() => setSelectedProjetoPdf(null)}
          projeto={selectedProjetoPdf}
        />
      )}
    </div>
  );
};