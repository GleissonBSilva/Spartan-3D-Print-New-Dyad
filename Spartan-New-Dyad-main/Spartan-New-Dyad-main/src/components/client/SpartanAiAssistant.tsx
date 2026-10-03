"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Wrench, Thermometer, Layers, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';

export const SpartanAiAssistant: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [categoria, setCategoria] = useState<'falha' | 'material' | 'orcamento'>('falha');
  const [resposta, setResposta] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const sugestoes = [
    { cat: 'falha', text: 'Minha peça em PETG está apresentando stringing (fiapos) excessivo. Como calibrar no OrcaSlicer?' },
    { cat: 'falha', text: 'Peça descolando da mesa (Warping) em ABS. Qual temperatura de mesa e fechamento usar?' },
    { cat: 'material', text: 'Quais as melhores configurações de retração e velocidade para imprimir TPU 95A?' },
    { cat: 'orcamento', text: 'Como precificar uma peça de 250g em PLA que demora 12h de máquina para uma empresa B2B?' },
  ];

  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pergunta.trim()) return;

    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      if (pergunta.toLowerCase().includes('stringing') || pergunta.toLowerCase().includes('fiapo')) {
        setResposta(
          `🔧 Diagnóstico Spartan AI — Redução de Stringing em PETG:\n\n` +
          `1. **Temperatura de Bico:** Reduza em 5°C a 10°C (PETG costuma fluir bem entre 230°C e 235°C).\n` +
          `2. **Distância de Retração:** Ajuste para 0.8mm a 1.2mm (Direct Drive) ou 4.0mm a 6.0mm (Bowden).\n` +
          `3. **Velocidade de Retração:** Suba para 45mm/s a 50mm/s.\n` +
          `4. **Wiping & Coasting:** Ative "Wipe while retracting" (0.4mm) no fatiador.\n` +
          `5. **Secagem do Filamento:** O PETG é altamente higroscópico. Seque o carretel a 65°C por 6 horas antes de imprimir.`
        );
      } else if (pergunta.toLowerCase().includes('warping') || pergunta.toLowerCase().includes('descolando')) {
        setResposta(
          `🛡️ Diagnóstico Spartan AI — Prevenção de Warping em ABS:\n\n` +
          `1. **Gabinete Fechado:** O ABS contrai com correntes de ar. Mantenha a câmara aquecida (mínimo 45°C - 55°C).\n` +
          `2. **Temperatura da Mesa:** Mantenha entre 100°C e 110°C constantes.\n` +
          `3. **Adesão de Primeira Camada:** Use spray de fixação extra forte (Karisma/3D Fila) ou pasta de PEI texturizado limpo com álcool isopropílico.\n` +
          `4. **Brim / Aba:** Adicione uma borda (Brim) de 8mm a 10mm ao redor da peça no fatiador.\n` +
          `5. **Ventoinha de Resfriamento:** Desligue ou mantenha no máximo em 10%-20%.`
        );
      } else {
        setResposta(
          `💡 Recomendação Técnica Spartan 3D:\n\n` +
          `Para a solicitação: "${pergunta}"\n\n` +
          `• **Orientação de Impressão:** Posicione o modelo no plano com maior área de contato para reduzir o volume de suportes necessários.\n` +
          `• **Densidade de Infill:** 15% a 20% com padrão Gyroid oferece a melhor relação peso/resistência mecânica.\n` +
          `• **Custo Sugerido:** Inclua margem de risco de 10% de falha e taxa de kWh local.\n` +
          `• **Pós-processamento:** Remova suportes manualmente e aplique cura UV (em caso de resina) por 5 minutos.`
        );
      }
      toast.success('Diagnóstico gerado com sucesso pela Spartan AI!');
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-white font-bold">
                  Spartan 3D Copilot & Diagnóstico de Falhas
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Inteligência Artificial especializada em parâmetros de fatiamento, bicos, resinas e resolução de problemas
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
              IA CALIBRADA
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">Dúvidas Frequentes da Farm:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sugestoes.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPergunta(sug.text);
                  }}
                  className="text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-xs text-slate-300 transition-all hover:bg-slate-900"
                >
                  {sug.text}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleEnviar} className="space-y-3 pt-2">
            <Input
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              placeholder="Digite seu problema (ex: entupimento de bico 0.4 com filamento madeira)..."
              className="bg-slate-950 border-slate-750 text-white rounded-xl h-11 text-xs"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={carregando || !pergunta.trim()}
                className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl h-10 px-5"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {carregando ? 'Consultando Parâmetros...' : 'Pedir Diagnóstico IA'}
              </Button>
            </div>
          </form>

          {resposta && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Resposta da IA Spartan:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(resposta);
                    toast.success('Solução copiada!');
                  }}
                  className="h-7 text-xs text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
                </Button>
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {resposta}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card lateral de Guia Rápido */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-400" />
          Temperaturas Médias Recomendadas
        </h3>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">PLA Standard / Silk</span>
              <span className="text-[11px] text-slate-400">Bico: 200°C - 215°C</span>
            </div>
            <span className="text-emerald-400 font-semibold">Mesa: 55°C - 60°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">PETG</span>
              <span className="text-[11px] text-slate-400">Bico: 230°C - 245°C</span>
            </div>
            <span className="text-cyan-400 font-semibold">Mesa: 70°C - 80°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">ABS / ASA</span>
              <span className="text-[11px] text-slate-400">Bico: 240°C - 260°C</span>
            </div>
            <span className="text-amber-400 font-semibold">Mesa: 95°C - 110°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">TPU Flexível</span>
              <span className="text-[11px] text-slate-400">Bico: 215°C - 230°C</span>
            </div>
            <span className="text-indigo-400 font-semibold">Mesa: 45°C - 50°C</span>
          </div>
        </div>
      </Card>
    </div>
  );
};