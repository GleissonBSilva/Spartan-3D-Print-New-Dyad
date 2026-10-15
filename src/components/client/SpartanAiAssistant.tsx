"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Thermometer, Copy, Check, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const SpartanAiAssistant: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState<string | null>(null);
  const [modeloUsado, setModeloUsado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const sugestoes = [
    { cat: 'falha', text: 'Minha peça em PETG está apresentando stringing (fiapos) excessivo. Como calibrar no OrcaSlicer?' },
    { cat: 'falha', text: 'Peça descolando da mesa (Warping) em ABS. Qual temperatura de mesa e fechamento usar?' },
    { cat: 'material', text: 'Quais as melhores configurações de retração e velocidade para imprimir TPU 95A?' },
    { cat: 'orcamento', text: 'Como precificar uma peça de 250g em PLA que demora 12h de máquina para uma empresa B2B?' },
  ];

  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pergunta.trim()) return;
    
    setCarregando(true);
    try {
      if (!supabase) {
        throw new Error("Supabase não inicializado.");
      }

      // Chamada direta à Edge Function 'ai-assistant' suportando question e prompt
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { question: pergunta.trim(), prompt: pergunta.trim() }
      });

      if (error) {
        throw new Error(error.message || "Erro ao comunicar com a Edge Function.");
      }

      const botReply = data?.answer || data?.reply || data?.choices?.[0]?.message?.content || "Sem resposta gerada.";
      setResposta(botReply);
      setModeloUsado(data?.model || null);
      toast.success('Diagnóstico gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Falha ao consultar o assistente.');
    } finally { 
      setCarregando(false); 
    }
  };

  const handleCopy = () => {
    if (!resposta) return;
    navigator.clipboard.writeText(resposta);
    setCopiado(true);
    toast.success('Solução copiada para a área de transferência!');
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleLimpar = () => {
    setResposta(null);
    setModeloUsado(null);
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
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
              IA via Supabase
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">Dúvidas Frequentes da Farm:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sugestoes.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPergunta(sug.text)}
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

          {carregando && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Consultando base de conhecimento técnico e gerando diagnóstico 3D...</span>
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-3 bg-slate-850 rounded w-3/4"></div>
                <div className="h-3 bg-slate-850 rounded w-full"></div>
                <div className="h-3 bg-slate-850 rounded w-5/6"></div>
              </div>
            </div>
          )}

          {resposta && !carregando && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Resposta da IA Spartan:
                  </span>
                  {modeloUsado && (
                    <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10 py-0 px-2 h-5">
                      {modeloUsado}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg px-2"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLimpar}
                    className="h-7 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg px-2"
                    title="Limpar resposta"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Renderização rica em Markdown com suporte customizado a cabeçalhos, listas, blocos de código e tabelas */}
              <div className="text-xs text-slate-200 font-sans leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => <h1 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-800" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-sm font-bold text-white mt-2.5 mb-1" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-xs font-semibold text-amber-300 mt-2 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-2 leading-relaxed text-slate-200 text-xs" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1 text-xs text-slate-200" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1 text-xs text-slate-200" {...props} />,
                    li: ({ ...props }) => <li className="text-xs text-slate-200" {...props} />,
                    strong: ({ ...props }) => <strong className="font-semibold text-white" {...props} />,
                    blockquote: ({ ...props }) => <blockquote className="border-l-2 border-amber-500/80 pl-2.5 italic text-slate-300 my-2 text-xs" {...props} />,
                    code: ({ children, ...props }) => {
                      const isInline = !String(children).includes('\n');
                      return isInline ? (
                        <code className="rounded bg-slate-900 border border-slate-800 px-1 py-0.5 font-mono text-[11px] text-amber-300 font-semibold" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-2.5 my-2 border border-slate-800 font-mono text-[11px] text-slate-200">
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                    img: ({ ...props }) => (
                      <img 
                        {...props} 
                        className="rounded-lg max-h-64 object-cover my-3 border border-slate-700 shadow-md" 
                        alt={props.alt || 'Imagem de diagnóstico 3D'} 
                      />
                    ),
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
                        <table className="min-w-full divide-y divide-slate-700 text-xs" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th className="px-3 py-2 bg-slate-900 text-left font-semibold text-slate-300 border-b border-slate-800" {...props} />
                    ),
                    td: ({ ...props }) => (
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300" {...props} />
                    )
                  }}
                >
                  {resposta}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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