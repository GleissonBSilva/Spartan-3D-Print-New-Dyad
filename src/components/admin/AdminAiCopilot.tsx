import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Sparkles } from 'lucide-react';
import { requireSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const AdminAiCopilot: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await requireSupabase().functions.invoke('ai-assistant', { body: { question: `Atue como analista da plataforma Spartan 3D. Baseie a resposta apenas nos dados fornecidos e deixe claras as incertezas. ${question.trim()}` } });
      if (error) throw error;
      setAnswer(data.answer);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível consultar a IA.');
    } finally { setBusy(false); }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
      <CardHeader><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-600/20 p-3 text-indigo-300"><Bot /></div><div><CardTitle className="text-white">Copiloto administrativo</CardTitle><CardDescription>Consulta o modelo configurado no Supabase. Dados de receita e clientes só são incluídos quando você os informa.</CardDescription></div></div></CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="admin-ai-question" className="text-sm text-slate-300">Pergunta</label>
          <Textarea id="admin-ai-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={4000} placeholder="Ex.: sugira como reduzir o atraso nas faturas pendentes…" className="min-h-28 bg-slate-950 border-slate-700" />
          <Button type="submit" disabled={busy || !question.trim()}><Sparkles className="mr-2 h-4 w-4" />{busy ? 'Consultando…' : 'Gerar análise'}</Button>
        </form>
        {answer && <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><h3 className="mb-2 text-sm font-semibold text-indigo-300">Resposta</h3><pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-200">{answer}</pre></div>}
      </CardContent>
    </Card>
  );
};
