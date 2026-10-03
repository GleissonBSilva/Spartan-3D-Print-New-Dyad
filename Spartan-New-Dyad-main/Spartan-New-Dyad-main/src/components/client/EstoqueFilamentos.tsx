"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, AlertTriangle, Layers, Droplet } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { FilamentoEstoque } from '@/types/saas';

export const EstoqueFilamentos: React.FC = () => {
  const { filamentos, addFilamento } = useSaaSData();
  const [showAddForm, setShowAddForm] = useState(false);

  const [novoTipo, setNovoTipo] = useState<FilamentoEstoque['tipo']>('PLA');
  const [novaCor, setNovaCor] = useState('');
  const [novaMarca, setNovaMarca] = useState('');
  const [novoPreco, setNovoPreco] = useState(95);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCor || !novaMarca) return;

    addFilamento({
      tipo: novoTipo,
      cor: novaCor,
      corHex: '#3b82f6',
      marca: novaMarca,
      pesoTotalG: 1000,
      pesoRestanteG: 1000,
      precoKg: novoPreco,
    });

    setNovaCor('');
    setNovaMarca('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Estoque de Filamentos & Resinas
          </h2>
          <p className="text-xs text-slate-400">
            Controle de peso restante em gramas, cores e custos por carretel
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showAddForm ? 'Fechar Cadastro' : 'Novo Carretel'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Tipo de Material</label>
              <select
                value={novoTipo}
                onChange={e => setNovoTipo(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-750 text-white text-xs rounded-xl h-10 px-3"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU (Flexível)</option>
                <option value="ASA">ASA (Outdoor)</option>
                <option value="RESINA">Resina UV SLA</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Cor / Acabamento</label>
              <Input
                required
                placeholder="Ex: Branco Pérola Silk"
                value={novaCor}
                onChange={e => setNovaCor(e.target.value)}
                className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Marca / Fabricante</label>
              <Input
                required
                placeholder="Ex: Voolt3D / 3D Fila / Elegoo"
                value={novaMarca}
                onChange={e => setNovaMarca(e.target.value)}
                className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Preço Pago (R$/kg)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  required
                  value={novoPreco}
                  onChange={e => setNovoPreco(Number(e.target.value))}
                  className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl">
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Grid de Carretéis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filamentos.map(fil => {
          const porcentagem = Math.round((fil.pesoRestanteG / fil.pesoTotalG) * 100);
          const isBaixo = fil.pesoRestanteG <= 200;

          return (
            <Card
              key={fil.id}
              className={`bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden ${
                isBaixo ? 'border-amber-500/50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: fil.corHex }}
                  />
                  <div>
                    <span className="font-bold text-white text-sm block">{fil.tipo}</span>
                    <span className="text-[11px] text-slate-400">{fil.cor}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                  {fil.marca}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Restante:</span>
                  <span className={`font-bold ${isBaixo ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {fil.pesoRestanteG}g ({porcentagem}%)
                  </span>
                </div>
                <Progress
                  value={porcentagem}
                  className={`h-2 bg-slate-950 ${isBaixo ? '[&>div]:bg-amber-500' : '[&>div]:bg-indigo-500'}`}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>R$ {fil.precoKg.toFixed(2)}/kg</span>
                <span>R$ {(fil.precoKg / 1000).toFixed(3)}/g</span>
              </div>

              {isBaixo && (
                <div className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Fim de carretel próximo!
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};