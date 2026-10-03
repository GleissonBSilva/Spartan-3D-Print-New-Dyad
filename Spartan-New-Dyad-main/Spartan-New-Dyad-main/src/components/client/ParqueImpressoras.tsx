"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu, Plus, CheckCircle2, PlayCircle, Wrench, PowerOff } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { Impressora3D } from '@/types/saas';

export const ParqueImpressoras: React.FC = () => {
  const { impressoras, addImpressora, updateImpressoraStatus } = useSaaSData();
  const [showAddModal, setShowAddModal] = useState(false);

  const [nome, setNome] = useState('');
  const [modelo, setModelo] = useState('');
  const [potencia, setPotencia] = useState(350);
  const [bico, setBico] = useState(0.4);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    addImpressora({
      nome,
      modelo: modelo || 'Custom 3D Printer',
      tipo: 'FDM',
      status: 'disponivel',
      potenciaWatts: potencia,
      bicoMm: bico,
      horasUso: 0,
    });

    setNome('');
    setModelo('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Parque de Impressoras 3D (Print Farm)
          </h2>
          <p className="text-xs text-slate-400">
            Monitoramento de status, horas de trabalho e manutenções preventivas
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs"
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Máquina
        </Button>
      </div>

      {showAddModal && (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Apelido da Máquina</label>
              <Input
                required
                placeholder="Ex: Bambu P1S #02"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Modelo / Fabricante</label>
              <Input
                placeholder="Ex: Creality K1 / Ender 3"
                value={modelo}
                onChange={e => setModelo(e.target.value)}
                className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Potência Nominal (Watts)</label>
              <Input
                type="number"
                value={potencia}
                onChange={e => setPotencia(Number(e.target.value))}
                className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Diâmetro Bico (mm)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={bico}
                  onChange={e => setBico(Number(e.target.value))}
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

      {/* Lista de Máquinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impressoras.map(imp => (
          <Card key={imp.id} className="bg-slate-900 border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-base">{imp.nome}</h3>
                <p className="text-xs text-slate-400">{imp.modelo} • Bico {imp.bicoMm}mm • {imp.potenciaWatts}W</p>
              </div>

              <Badge
                className={`text-[10px] font-bold ${
                  imp.status === 'imprimindo'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 animate-pulse'
                    : imp.status === 'disponivel'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {imp.status.toUpperCase()}
              </Badge>
            </div>

            {imp.status === 'imprimindo' && (
              <div className="p-3.5 bg-slate-950 rounded-xl space-y-2 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate">{imp.projetoAtual}</span>
                  <span className="font-bold text-indigo-400">{imp.progressoPercentual}%</span>
                </div>
                <Progress value={imp.progressoPercentual || 0} className="h-2 bg-slate-900" />
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Horas de Extrusão: <strong className="text-white">{imp.horasUso}h</strong></span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateImpressoraStatus(imp.id, imp.status === 'imprimindo' ? 'disponivel' : 'imprimindo')}
                  className="h-7 text-[11px] bg-slate-800 text-slate-300 hover:text-white"
                >
                  {imp.status === 'imprimindo' ? 'Pausar/Finalizar' : 'Iniciar Impressão'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateImpressoraStatus(imp.id, 'manutencao')}
                  className="h-7 text-[11px] text-slate-400 hover:text-amber-300"
                >
                  <Wrench className="w-3 h-3 mr-1" /> Manutenção
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};