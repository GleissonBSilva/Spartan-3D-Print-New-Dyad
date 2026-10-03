"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Box, ImagePlus, X } from 'lucide-react';
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
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
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
  imageFile,
  setImageFile,
}) => {
  const [imagePreview, setImagePreview] = useState('');
  useEffect(() => {
    if (!imageFile) { setImagePreview(''); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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

      <div>
        <label htmlFor="project-image" className="text-xs font-semibold text-slate-300 block mb-1.5">Imagem de referência do produto</label>
        <input id="project-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={event => { const file = event.target.files?.[0]; if (file) setImageFile(file); event.target.value = ''; }} />
        {imagePreview ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
            <img src={imagePreview} alt="Prévia do produto" className="h-20 w-20 rounded-lg object-cover" />
            <span className="flex-1 truncate text-xs text-slate-300">{imageFile?.name}</span>
            <label htmlFor="project-image" className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-xs text-indigo-200 hover:bg-slate-800">Trocar imagem</label>
            <button type="button" aria-label="Remover imagem" onClick={() => setImageFile(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <label htmlFor="project-image" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300 hover:border-indigo-500 hover:text-white">
            <ImagePlus className="h-5 w-5 text-indigo-400" />
            <span>Adicionar foto ou render do produto <span className="block text-xs text-slate-500">JPG, PNG ou WebP · até 50 MB</span></span>
          </label>
        )}
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
