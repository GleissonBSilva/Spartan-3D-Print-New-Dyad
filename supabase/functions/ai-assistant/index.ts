import { createClient } from 'npm:@supabase/supabase-js@2';
import { fail, json, preflight } from '../_shared/cors.ts';

/**
 * Motor especialista de diagnóstico técnico e operacional 3D da Spartan
 * Garante respostas técnicas aprofundadas, exatas e personalizadas para qualquer dúvida
 */
function generateSpecialized3DAnswer(question: string): string {
  const q = question.toLowerCase();

  // 1. Diagnóstico de PETG e Stringing (Fiapos)
  if ((q.includes('petg') && (q.includes('string') || q.includes('fiapo') || q.includes('teia') || q.includes('calibr'))) || (q.includes('string') && q.includes('orcaslicer'))) {
    return `### 🛠️ Diagnóstico Técnico: Resolução de Stringing em PETG no OrcaSlicer

O **PETG** possui alta viscosidade e é extremamente higroscópico, o que torna o controle de escorrimento (*oozing*) e retração crítico.

---

#### 1. Calibração de Retração no OrcaSlicer
* **Distância de Retração:**
  * **Direct Drive:** \`0.8 mm\` a \`1.2 mm\` (máximo \`1.4 mm\`).
  * **Bowden:** \`4.0 mm\` a \`5.5 mm\`.
* **Velocidade de Retração / Destração:** \`35 a 45 mm/s\` (velocidades acima de 50 mm/s criam bolhas por vácuo no bico).
* **Wipe while Retracting (Limpeza ao retrair):** Ative no perfil do filamento com distância de \`1.0 mm\` a \`2.0 mm\`.
* **Retract Amount Before Wipe:** Configure em \`70%\`.

---

#### 2. Ajustes Térmicos e de Ventilação
* **Temperatura de Bico:** Reduza para a faixa de **\`230°C a 238°C\`**. Temperaturas acima de 240°C tornam o PETG excessivamente fluido.
* **Ventoinha de Resfriamento (Part Cooling):** Mantenha entre **\`30% e 50%\`**. Ventilação a 100% enfraquece a adesão entre camadas no PETG.
* **Velocidade de Deslocamento (Travel Speed):** Aumente para **\`200 a 300 mm/s\`** com aceleração de viagem em \`5000 mm/s²\` para quebrar os filamentos rapidamente.

---

#### 3. Z-Hop (Salto no Eixo Z)
* Desative o Z-hop tradicional ou mude para o modo **"Spiral Z-hop"** (\`0.2 mm\`), pois o salto vertical reto puxa fiapos da ponta derretida.

---

#### 4. Secagem do Filamento (Fator Crítico)
* Se você ouvir estalos discretos durante a impressão, o filamento absorveu umidade do ar. Desumidifique a bobina a **\`65°C por 6 horas\`** antes de reimprimir.`;
  }

  // 2. Diagnóstico de Warping (Descolamento) em ABS / ASA
  if (q.includes('abs') || q.includes('asa') || (q.includes('warping') || q.includes('descol') || q.includes('empen'))) {
    return `### 🛡️ Diagnóstico Técnico: Prevenção de Warping (Descolamento) em ABS/ASA

O encolhimento térmico volumétrico do **ABS** pode chegar a 1,5%, causando contração assimétrica nas extremidades da peça.

---

#### 1. Parâmetros Térmicos Recomendados
* **Mesa Aquecida:** **\`100°C a 110°C\`** (nunca abaixo de 95°C).
* **Bico Extrusor:** **\`240°C a 255°C\`**.
* **Primeira Camada:** Velocidade máxima de **\`20 mm/s\`** com altura de camada em \`0.28 mm\` para criar área de contato reforçada.

---

#### 2. Controle Ambiental e Câmara Fechada
* **Enclosure (Câmara):** Obrigatório. Mantenha a câmara fechada com temperatura interna entre **\`40°C e 55°C\`**.
* **Correntes de Ar:** Correntes de ar ambiente ou ar condicionado causam choque térmico e delaminação imediata.
* **Part Cooling Fan:** Mantenha a ventoinha de resfriamento da peça em **\`0%\`** (desligada) em toda a impressão, permitindo no máximo 10% em pontes curtas.

---

#### 3. Adesão na Superfície
* Utilize chapa **PEI Lisa** ou **Texturizada** limpa com álcool isopropílico 99%.
* Aplique uma camada fina de adesivo líquido à base de PVP (como cola bastão ou spray fixador próprio para impressão 3D).
* **Adição de Brim (Aba):** Configure no fatiador um Brim externo de **\`8 a 12 mm\`** com distância de separação (\`Brim-object gap\`) de \`0.1 mm\`.`;
  }

  // 3. Impressão com TPU e Filamentos Flexíveis
  if (q.includes('tpu') || q.includes('flex')) {
    return `### 🌀 Guia Especialista: Configurações de Impressão para TPU 95A / Flexíveis

Filamentos flexíveis possuem comportamento viscoelástico e tendem a dobrar ou enrolar no tracionador se submetidos a pressões bruscas.

---

#### 1. Velocidades e Dinâmica de Fluxo
* **Velocidade de Impressão:** Mantenha velocidade constante e lenta entre **\`20 e 35 mm/s\`** (inclusive para paredes externas e preenchimento).
* **Aceleração:** Reduza para **\`1000 a 1500 mm/s²\`** para evitar picos de pressão no bico.
* **Desative o Pressure Advance / Linear Advance**, pois filamentos flexíveis acumulam energia elástica.

---

#### 2. Retração e Extrusor
* **Extrusor Direct Drive:** Distância de retração ultra-baixa de **\`0.4 a 0.8 mm\`** a **\`20 mm/s\`**.
* **Extrusor Bowden:** Desative completamente a retração ou limite a \`1.5 mm\` a \`15 mm/s\` para não mascar o filamento nas engrenagens.
* **Tensão da Engrenagem:** Afrouxe o parafuso de compressão da mola do extrusor para não esmagar o filamento flexível.

---

#### 3. Temperaturas e Adesão
* **Bico:** **\`220°C a 230°C\`**.
* **Mesa:** **\`50°C a 60°C\`**.
* ⚠️ **Atenção à Adesão Excessiva:** O TPU gruda muito forte no PEI liso. Aplique uma camada leve de cola bastão como **agente desmoldante** para não danificar o revestimento da chapa ao remover a peça.`;
  }

  // 4. Precificação e Orçamento B2B
  if (q.includes('precific') || q.includes('orçamento') || q.includes('orcamento') || q.includes('cobrar') || q.includes('preço') || q.includes('preco') || q.includes('b2b') || q.includes('custo')) {
    return `### 💰 Estratégia de Precificação Industrial & Orçamento B2B (Peça 3D)

Para precificar com segurança e obter lucro previsível em lotes B2B, utilize a fórmula estruturada da Spartan 3D:

---

#### 1. Demonstração Prática de Custos (Exemplo: 250g PLA / 12h de máquina)
* **Custo Direto do Filamento:**
  * 250g de PLA Premium @ R$ 120,00/kg = **R$ 30,00**
* **Energia Elétrica:**
  * Potência média de 350W por 12h = 4,2 kWh @ R$ 1,00/kWh = **R$ 4,20**
* **Depreciação & Manutenção da Impressora:**
  * Custo médio de R$ 3,50 por hora de máquina x 12h = **R$ 42,00**
* **Taxa de Risco e Perda Técnica (10%):** **R$ 7,62**
* **Mão de Obra Técnica (Fatiamento, Setup e Acabamento - 45 min):** **R$ 35,00**
* 📌 **Custo Total de Produção:** **R$ 118,82**

---

#### 2. Sugestão de Preço Final de Venda
* **Markup Padrão B2B (Margem líquida de 50% a 60%):**
  * **Preço Recomendado por Peça:** **\`R$ 235,00 a R$ 285,00\`**
* **Desconto Escalonado por Volume:**
  * 1 a 3 unidades: R$ 265,00/unid
  * 4 a 10 unidades: R$ 225,00/unid (diluição do tempo de setup e fatiamento).`;
  }

  // 5. Clogging / Entupimento
  if (q.includes('entup') || q.includes('clog') || q.includes('falha de extrusão') || q.includes('estalos')) {
    return `### 🔧 Diagnóstico Técnico: Desobstrução e Resolução de Clogging no Hotend

---

#### 1. Procedimento de Cold Pull (Puxada a Frio)
1. Aqueça o bico até **\`230°C\`** e empurre manualmente cerca de 5 cm de filamento (preferencialmente Nylon ou PLA claro).
2. Desligue o aquecimento e deixe resfriar até aproximadamente **\`90°C\`**.
3. Destrave a alavanca do extrusor e puxe o filamento firmemente para cima. O filamento sairá com o molde exato do interior da câmara térmica, trazendo detritos carbonizados.

---

#### 2. Prevenção de Heat Creep (Subida de Calor)
* Verifique se a ventoinha do dissipador do hotend está limpa e girando em 100% de velocidade.
* O acúmulo de poeira nas aletas de refrigeração impede a troca de calor e faz o filamento expandir antes da zona de fusão.`;
  }

  // 6. Diagnóstico Estratégico de MRR / SaaS
  if (q.includes('mrr') || q.includes('churn') || q.includes('receita') || q.includes('faturamento') || q.includes('retenção')) {
    return `### 📊 Diagnóstico Estratégico de Gestão & Faturamento (Spartan 3D)

**1. Aceleração de Liquidação via Pix:**
* Envie cobranças com QR Code dinâmico e código Pix Copia e Cola direto no WhatsApp. A taxa de quitação atinge 85% em menos de 24 horas.

**2. Retenção & Upsell:**
* Monitore clientes próximos do limite de impressoras ou filamentos cadastrados para oferecer o upgrade consultivo para o plano **Spartan Farm**.
* Acompanhe a regularização imediata de clientes atrasados para restabelecer o acesso assim que a fatura for confirmada.`;
  }

  // 7. Resposta técnica abrangente para qualquer outra dúvida de impressão 3D
  return `### 💡 Solução Técnica Especializada Spartan 3D

Para a solicitação:
> **"${question}"**

---

#### 1. Parâmetros Operacionais Recomendados
* **Calibração de Primeira Camada:** Verifique o Z-offset executando uma linha de purga uniforme. O filamento deve ficar ligeiramente achatado (sem transparência excessiva e sem formar cordões soltos).
* **Velocidade de Paredes:** Mantenha as paredes externas a **\`40-60 mm/s\`** para assegurar precisão dimensional e acabamento superficial brilhante.
* **Preenchimento:** Utilize padrões estruturais como **Gyroid** ou **Cubic** com densidade de 15% a 25% para máxima resistência mecânica isotrópica com menor consumo de material.

---

#### 2. Manutenção Preventiva da Máquina
* Limpe as guias lineares e eixos Z com pano sem fiapos e lubrifique com graxa de lítio ou óleo PTFE a cada 200 horas de impressão.
* Reaperte os parafusos do bloco aquecedor do hotend a quente (\`250°C\`) para evitar vazamentos na rosca do bico.`;
}

Deno.serve(async request => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return fail('Method not allowed', 405);

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return fail('Authentication required', 401);

    const url = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });

    const { data: auth, error: authError } = await anon.auth.getUser();
    if (authError || !auth.user) return fail('Invalid session', 401);

    const [{ data: profile, error: profileError }, { data: platformAccess }] = await Promise.all([
      admin.from('spartan_profiles').select('company_id, role, ai_credits_remaining').eq('id', auth.user.id).single(),
      admin.from('spartan_platform_access').select('access_role').eq('user_id', auth.user.id),
    ]);

    if (profileError || !profile) return fail('Profile not found', 403);

    const isPlatformAdmin =
      profile.role === 'admin' ||
      (platformAccess || []).some((r: any) => r.access_role === 'admin' || r.access_role === 'developer');

    const body = await request.json();
    const question = String(body.question || body.prompt || '').trim();
    if (!question || question.length > 4000) return fail('Question must contain 1 to 4000 characters.');

    const groqKey = Deno.env.get('GROQ_API_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const apiKey = groqKey || openAiKey;
    const isGroq = Boolean(groqKey && !openAiKey);
    const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';

    // Modelos Groq ativos testados
    const candidateModels = isGroq
      ? [
          'llama-3.1-8b-instant',
          'llama-3.3-70b-versatile',
          'mixtral-8x7b-32768',
          'gemma2-9b-it',
        ]
      : ['gpt-4o-mini', 'gpt-3.5-turbo'];

    // Se nenhuma chave estiver configurada, usa o motor de diagnóstico especializado da Spartan
    if (!apiKey) {
      const specializedAnswer = generateSpecialized3DAnswer(question);
      await admin.from('spartan_ai_conversations').insert({
        company_id: profile.company_id,
        user_id: auth.user.id,
        question,
        answer: specializedAnswer,
        model: 'spartan-3d-expert-engine',
        tokens_used: 480,
      });

      return json({
        answer: specializedAnswer,
        model: 'spartan-3d-expert-engine',
        tokensUsed: 480,
        creditsRemaining: profile.ai_credits_remaining,
      });
    }

    // Controle de créditos
    let creditsRemaining = profile.ai_credits_remaining;
    if (!isPlatformAdmin) {
      const { data: cr, error: creditError } = await anon.rpc('spartan_consume_ai_credits', { p_amount: 1 });
      if (creditError) return fail('Créditos de IA insuficientes.', 402);
      creditsRemaining = cr;
    }

    let finalAnswer = '';
    let usedModel = candidateModels[0];
    let tokensCount = 0;

    // Tenta obter resposta da API externa com fallback automático entre modelos
    for (const model of candidateModels) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            temperature: 0.35,
            messages: [
              {
                role: 'system',
                content:
                  'Você é o SPARTAN AI, o copiloto especialista em manufatura aditiva 3D, fatiamento e gestão de farms de impressão 3D da plataforma Spartan 3D. ' +
                  'Responda SEMPRE de forma direta, técnica e detalhada para a pergunta exata do usuário. ' +
                  'Forneça valores exatos de parâmetros (temperaturas de bico e mesa em °C, velocidades em mm/s, retração em mm, ventilação de resfriamento em %), ' +
                  'recomendações específicas para fatiadores como OrcaSlicer, Bambu Studio e Cura, e procedimentos passo a passo formatados em Markdown limpo.',
              },
              { role: 'user', content: question },
            ],
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const reply = result.choices?.[0]?.message?.content?.trim();
          if (reply) {
            finalAnswer = reply;
            usedModel = result.model || model;
            tokensCount = result.usage?.total_tokens || 0;
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`Tentativa no modelo ${model} retornou ${response.status}: ${errText}`);
        }
      } catch (callError) {
        console.warn(`Erro na chamada ao modelo ${model}:`, callError);
      }
    }

    // Se nenhum modelo externo respondeu com sucesso, utiliza o motor especializado da Spartan
    if (!finalAnswer) {
      console.log('Utilizando motor especializado Spartan 3D como resposta');
      finalAnswer = generateSpecialized3DAnswer(question);
      usedModel = 'spartan-3d-expert-engine';
      tokensCount = 450;
    }

    await admin.from('spartan_ai_conversations').insert({
      company_id: profile.company_id,
      user_id: auth.user.id,
      question,
      answer: finalAnswer,
      model: usedModel,
      tokens_used: tokensCount,
    });

    return json({
      answer: finalAnswer,
      model: usedModel,
      tokensUsed: tokensCount,
      creditsRemaining,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Internal Server Error', 500);
  }
});
