import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, fail, json, preflight } from '../_shared/cors.ts';

Deno.serve(async request => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return fail('Method not allowed', 405);
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return fail('Authentication required', 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await anon.auth.getUser();
    if (authError || !auth.user) return fail('Invalid session', 401);
    const { data: profile, error: profileError } = await anon.from('spartan_profiles').select('company_id, role, ai_credits_remaining').eq('id', auth.user.id).single();
    if (profileError || !profile) return fail('Profile not found', 403);
    const body = await request.json();
    const question = String(body.question || '').trim();
    if (!question || question.length > 4000) return fail('Question must contain 1 to 4000 characters.');
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return fail('AI service is not configured. Add OPENAI_API_KEY to Supabase function secrets.', 503);
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: creditsRemaining, error: creditError } = await anon.rpc('spartan_consume_ai_credits', { p_amount: 1 });
    if (creditError) return fail('Insufficient AI credits.', 402);
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Você é um assistente técnico de impressão 3D. Dê orientações práticas e seguras, peça dados faltantes e nunca invente que leu arquivos ou telemetria. Sinalize quando parâmetros dependem do fabricante e do material.' },
          { role: 'user', content: question },
        ],
      }),
    });
    } catch (error) {
      await admin.rpc('spartan_refund_ai_credit', { p_user_id: auth.user.id });
      return fail(error, 502);
    }
    const result = await response.json();
    if (!response.ok) {
      await admin.rpc('spartan_refund_ai_credit', { p_user_id: auth.user.id });
      return fail(result.error?.message || 'AI provider request failed.', 502);
    }
    const answer = String(result.choices?.[0]?.message?.content || '').trim();
    await admin.from('spartan_ai_conversations').insert({ company_id: profile.company_id, user_id: auth.user.id, question, answer, model: result.model, tokens_used: result.usage?.total_tokens || 0 });
    return json({ answer, model: result.model, tokensUsed: result.usage?.total_tokens || 0, creditsRemaining });
  } catch (error) { return fail(error, 500); }
});
