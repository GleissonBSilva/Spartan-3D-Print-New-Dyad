"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Box } from 'lucide-react';
import { Impressora3D } from '@/types/saas';

interface PieceDetailsFormProps {
  nomePeca: string;
  setNomePeca: (val: string) => void;
  clienteNome: string;
  setClienteNome: (val: string) => void;
  selectedImpressoraId: string;
  setSelectedImpressoraId: (val: string) => void;
  tempoHoras: number;
  setTempoHoras: (val: number) => void;
  impressoras: Impressora3D[];
}

export const PieceDetailsForm: React.FC<PieceDetailsFormProps> = ({
  nomePeca,
  setNomePeca,
  clienteNome,
  setClienteNome,
  selectedImpressoraId,
  setSelectedImpressoraId,
  tempoHoras,
  setTempoHoras,
  impressoras,
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Box className="w-4 h-4 text-indigo-400" />
        <h3 className="font-bold text-white text-sm">Dados da Peça & Cliente</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Nome da Peça / Arquivo STL
          </label>
          <Input
            required
            value={nomePeca}
            onChange={e => setNomePeca(e.target.value)}
            placeholder="Ex: Luminária Voronoi 4 Cores"
            className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Cliente / Solicitante
          </label>
          <Input
            value={clienteNome}
            onChange={e => setClienteNome(e.target.value)}
            placeholder="Ex: Mariana Silva Arquitetura"
            className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Impressora Alocada na Farm
          </label>
          <select
            value={selectedImpressoraId}
            onChange={e => setSelectedImpressoraId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-750 text-white text-xs rounded-xl h-10 px-3 focus:outline-none focus:border-indigo-500"
          >
            {impressoras.map(i => (
              <option key={i.id} value={i.id}>
                {i.nome} ({i.potenciaWatts}W - {i.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Tempo Total Estimado de Fatiamento (Horas)
          </label>
          <Input
            type="number"
            step="0.1"
            min={0.1}
            value={tempoHoras}
            onChange={e => setTempoHoras(Number(e.target.value))}
            className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10 font-bold text-amber-400"
          />
        </div>
      </div>
    </Card>
  );
};