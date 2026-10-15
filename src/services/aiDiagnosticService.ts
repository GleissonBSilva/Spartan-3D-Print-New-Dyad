/**
 * Spartan 3D — Motor Especialista de Diagnóstico Técnico & IA
 * Garante respostas aprofundadas, exatas e personalizadas para qualquer dúvida de manufatura aditiva 3D
 */

import { supabase } from '@/lib/supabase';

export interface AiDiagnosticResult {
  answer: string;
  model: string;
  source: 'supabase_edge' | 'spartan_expert_engine';
}

export class AiDiagnosticService {
  /**
   * Normaliza termos técnicos, gírias e erros comuns de digitação em impressão 3D
   */
  private static normalizeQuestion(raw: string): string {
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos para busca robusta
      .replace(/pteg/g, 'petg')
      .replace(/pétg/g, 'petg')
      .replace(/pla\+/g, 'pla plus')
      .replace(/abs\+/g, 'abs plus')
      .replace(/orcaslicer/g, 'orca')
      .replace(/bambu studio/g, 'bambu')
      .replace(/bambustudio/g, 'bambu')
      .replace(/cura slicer/g, 'cura')
      .replace(/prusaslicer/g, 'prusa')
      .replace(/z offset/g, 'z-offset')
      .replace(/hot end/g, 'hotend')
      .trim();
  }

  /**
   * Gera resposta técnica especializada diretamente baseada no assunto perguntado
   */
  public static getExpertAnswer(question: string): string {
    const q = this.normalizeQuestion(question);

    // 1. Misturar Filamentos: PLA com PETG / Suportes Multimateriais
    if (
      (q.includes('pla') && q.includes('petg')) ||
      (q.includes('mistur') && (q.includes('filamento') || q.includes('material') || q.includes('cor')))
    ) {
      return `### 🔬 Análise Técnica Especializada: Misturar Filamento PLA com PETG

A resposta direta é: **Depende da aplicação.** Eles **NÃO se fundem para criar peças sólidas**, mas são considerados o **"Santo Graal" para suportes destacáveis**.

---

#### 1. Para Peças Sólidas Estruturais (Mesma Peça): ❌ NÃO FUNCIONA
* **Incompatibilidade Química:** O PLA (*ácido polilático*) e o PETG (*polietileno tereftalato glicol*) possuem estruturas moleculares completamente distintas que **não criam adesão intermolecular**.
* Se você tentar imprimir camadas alternadas ou fundi-los na mesma peça, ela **delaminará e se partirá com o menor esforço manual**, pois a adesão entre as camadas de PLA e PETG é praticamente nula.
* **Diferença de Temperatura:** O PLA imprime entre \`195°C e 215°C\`, enquanto o PETG exige entre \`230°C e 245°C\`. Isso causa degradação térmica do PLA e subextrusão do PETG se tentados na mesma faixa.

---

#### 2. Para Interface de Suporte (Zero-Gap Support): ✅ É A MELHOR COMBINAÇÃO DO MERCADO!
* Como o PLA e o PETG não aderem entre si, essa é uma das técnicas mais avançadas da impressão 3D em impressoras com troca de filamento (*Bambu Lab AMS, ERCF, Prusa MMU, Dual Extruder*)!
* **Como configurar no OrcaSlicer / Bambu Studio:**
  1. No menu de **Suportes (Support)**, configure o corpo principal do suporte com o mesmo material da peça (para economizar trocas de carretel).
  2. Configure apenas a **"Camada de Interface do Suporte" (Support Interface)** com o outro material (exemplo: Peça em PETG com Interface em PLA, ou Peça em PLA com Interface em PETG).
  3. Ajuste a **Distância Z Superior (Top Z-Distance)** para **\`0.0 mm\` (Zero Gap)**.
* **Resultado:** A parte inferior suspensa da peça fica com acabamento de primeira camada perfeitamente lisa e o suporte se solta inteiro com a mão ou uma espátula, sem deixar nenhuma cicatriz na peça!

---

#### 3. Cuidados Críticos na Troca (Torre de Purga)
* Ao alternar entre PLA e PETG no mesmo bico:
  * Aumente o **Volume de Purga (Flushing Volume)** na troca para pelo menos **\`380 a 480 mm³\`**.
  * Se sobrar qualquer resíduo microscópico de PLA dentro do bico na hora de extrusar o PETG estrutural, a peça sofrerá fraqueza mecânica interna grave naquele ponto.`;
    }

    // 2. PETG e Stringing (Fiapos / Teias / Oozing)
    if (
      q.includes('petg') &&
      (q.includes('string') || q.includes('fiapo') || q.includes('teia') || q.includes('calibr') || q.includes('retra'))
    ) {
      return `### 🛠️ Diagnóstico Técnico: Resolução Definitiva de Stringing (Fiapos) em PETG

O **PETG** possui alta viscosidade e é extremamente higroscópico (*absorve umidade do ar rapidamente*), tornando o controle de retração e temperatura essencial.

---

#### 1. Calibração de Retração no OrcaSlicer / Cura / PrusaSlicer
* **Distância de Retração:**
  * **Direct Drive:** Ajuste entre **\`0.8 mm\` e \`1.2 mm\`** (máximo \`1.4 mm\`).
  * **Bowden:** Ajuste entre **\`4.0 mm\` e \`5.5 mm\`**.
* **Velocidade de Retração / Destração:** **\`35 a 45 mm/s\`** (velocidades acima de 50 mm/s criam cavitação e bolhas por vácuo no bico).
* **Wipe while Retracting (Limpeza ao retrair):** Ative no perfil do filamento com distância de **\`1.0 mm a 2.0 mm\`**.
* **Retract Amount Before Wipe:** Configure em **\`70%\`**.

---

#### 2. Ajustes Térmicos e de Ventilação
* **Temperatura de Bico:** Reduza para a faixa de **\`230°C a 238°C\`**. Temperaturas acima de 240°C aumentam drasticamente a fluidez do PETG, causando gotejamento involuntário (*oozing*).
* **Ventoinha de Resfriamento (Part Cooling):** Mantenha entre **\`30% e 50%\`**. Evite 100% de ventilação, pois resfriamento excessivo fragiliza a adesão entre camadas no PETG.
* **Velocidade de Deslocamento (Travel Speed):** Aumente para **\`200 a 300 mm/s\`** com aceleração de viagem em \`5000 mm/s²\` para quebrar os fios rapidamente.

---

#### 3. Z-Hop (Salto no Eixo Z)
* Desative o Z-hop vertical ou mude para o modo **"Spiral Z-hop"** (\`0.2 mm\`), pois o salto vertical reto puxa fiapos da ponta derretida.

---

#### 4. Secagem do Filamento (Fator Crítico)
* Se você ouvir estalos discretos durante a impressão, o filamento absorveu umidade. Desumidifique a bobina a **\`65°C por 6 horas\`** antes de reimprimir.`;
    }

    // 3. Warping / Descolamento de Mesa (ABS / ASA / Nylon / PLA)
    if (
      q.includes('warping') ||
      q.includes('descol') ||
      q.includes('empen') ||
      q.includes('abs') ||
      q.includes('asa')
    ) {
      return `### 🛡️ Diagnóstico Técnico: Prevenção de Warping e Descolamento da Mesa

O empenamento (*warping*) ocorre devido ao encolhimento térmico volumétrico do plástico durante o resfriamento assimétrico das camadas inferiores.

---

#### 1. Parâmetros Térmicos Recomendados
* **Mesa Aquecida:**
  * **ABS / ASA:** **\`100°C a 110°C\`** (nunca abaixo de 95°C).
  * **PETG:** **\`70°C a 80°C\`**.
  * **PLA:** **\`55°C a 65°C\`**.
* **Bico Extrusor:**
  * **ABS/ASA:** **\`240°C a 255°C\`**.
* **Primeira Camada:** Velocidade reduzida a **\`20 mm/s\`** com altura de camada em \`0.28 mm\` e largura de linha em \`0.50 mm\` (em bico 0.4) para aumentar a ancoragem.

---

#### 2. Controle Ambiental e Câmara Fechada
* **Enclosure (Câmara):** Obrigatório para ABS/ASA/Nylon. Mantenha a câmara fechada com temperatura interna estável entre **\`40°C e 55°C\`**.
* **Correntes de Ar:** Ar-condicionado ou correntes de vento no ambiente causam choque térmico imediato e delaminação das bordas.
* **Part Cooling Fan:** Mantenha a ventoinha da peça em **\`0%\` (desligada)** durante toda a impressão de ABS/ASA.

---

#### 3. Superfície e Adesão
* Utilize chapa **PEI Texturizada** ou **Lisa** limpa com água morna e sabão neutro, finalizando com álcool isopropílico 99%.
* Aplique spray fixador ou cola bastão própria para impressão 3D.
* **Brim (Aba):** Configure no fatiador um Brim externo de **\`8 a 12 mm\`** com \`Brim-object gap\` de \`0.1 mm\`.`;
    }

    // 4. Filamento TPU e Flexíveis
    if (q.includes('tpu') || q.includes('flex')) {
      return `### 🌀 Guia Especialista: Parâmetros de Impressão para TPU 95A / Filamentos Flexíveis

Filamentos flexíveis possuem comportamento viscoelástico: eles dobram e escapam das engrenagens do extrusor se submetidos a pressão brusca ou alta velocidade.

---

#### 1. Velocidades e Dinâmica de Fluxo
* **Velocidade de Impressão:** Mantenha constante e baixa, entre **\`20 e 35 mm/s\`** (inclusive para paredes externas e preenchimento).
* **Aceleração:** Reduza para **\`1000 a 1500 mm/s²\`** para evitar picos repentinos de pressão no bico.
* **Desative o Pressure Advance / Linear Advance**, pois filamentos elásticos acumulam energia mecânica interna.

---

#### 2. Configuração de Retração
* **Extrusor Direct Drive:** Distância ultra-baixa de **\`0.4 a 0.8 mm\`** com velocidade lenta de **\`20 mm/s\`**.
* **Extrusor Bowden:** Recomenda-se **desativar a retração** ou limitar a \`1.5 mm\` a \`15 mm/s\` para não mascar o filamento no tubo PTFE.
* **Tensão da Engrenagem:** Afrouxe o parafuso de compressão do tracionador para não esmagar o filamento flexível antes da entrada do hotend.

---

#### 3. Temperatura e Alerta de Remoção da Mesa
* **Bico:** **\`220°C a 230°C\`**.
* **Mesa:** **\`50°C a 60°C\`**.
* ⚠️ **ALERTA CRÍTICO DE ADESÃO:** O TPU adere com extrema força em chapas PEI lisas, correndo o risco de rasgar o revestimento da chapa na remoção. Aplique uma camada fina de **cola bastão como desmoldante** antes de imprimir.`;
    }

    // 5. Clogging / Entupimento de Bico / Subextrusão
    if (
      q.includes('entup') ||
      q.includes('clog') ||
      q.includes('subextrus') ||
      q.includes('estalo') ||
      q.includes('bico entupido')
    ) {
      return `### 🔧 Diagnóstico Técnico: Desobstrução de Bico e Prevenção de Heat Creep

---

#### 1. Procedimento Oficial de Cold Pull (Puxada a Frio)
1. Aqueça o bico até **\`235°C\`** e empurre manualmente cerca de 5 cm de filamento (*preferencialmente Nylon ou PLA claro*).
2. Desligue o aquecimento e deixe o hotend resfriar até aproximadamente **\`90°C\`** (*para PLA*) ou **\`130°C\`** (*para Nylon*).
3. Destrave a alavanca do extrusor e puxe o filamento firmemente e de forma contínua para cima.
4. O filamento sairá com o formato cônico perfeito do interior do bico, trazendo toda a carbonização e detritos que obstruíam a saída.

---

#### 2. Prevenção de Heat Creep (Subida Excessiva de Calor)
* Verifique se a ventoinha frontal do dissipador (*Hotend Cooling Fan*) está girando em 100% sem poeira acumulada.
* Se a troca de calor for ineficiente, o filamento amolece antes do bloco de aquecimento e incha na garganta térmica, travando a passagem.
* Se for usar filamentos com partículas abrasivas (*Madeira, Fibra de Carbono, Glow in the dark*), utilize **bico endurecido de no mínimo \`0.6 mm\`** para evitar entupimento imediato.`;
    }

    // 6. Adesão de Primeira Camada e Calibração de Z-Offset
    if (
      q.includes('adesao') ||
      q.includes('primeira camada') ||
      q.includes('z-offset') ||
      q.includes('nivelamento')
    ) {
      return `### 🎯 Diagnóstico Técnico: Adesão Perfeita de Primeira Camada e Z-Offset

---

#### 1. Ajuste Fino do Z-Offset
* Imprima um teste de camada única de 50x50 mm (\`Single Layer Square\`).
* **Linhas separadas com vãos visíveis:** O bico está muito alto. Abaixe o Z-offset em incrementos de **\`-0.02 mm\`**.
* **Superfície áspera com rebarbas transparentes:** O bico está muito baixo e esmagando o material. Suba o Z-offset em incrementos de **\`+0.02 mm\`**.
* **Linha uniforme com leve achatamento e sem relevo:** Altura ideal alcançada.

---

#### 2. Limpeza Profunda da Mesa
* A oleosidade natural das mãos é o fator número 1 de perda de aderência.
* Lave a chapa periodicamente com água morna e algumas gotas de detergente neutro.
* Seque com papel toalha e finalize borrifando **álcool isopropílico 99%** antes de iniciar o aquecimento.`;
    }

    // 7. Precificação e Custos 3D para Clientes e B2B
    if (
      q.includes('precific') ||
      q.includes('orcamento') ||
      q.includes('cobrar') ||
      q.includes('preco') ||
      q.includes('custo')
    ) {
      return `### 💰 Estratégia de Precificação Técnica & Custos da Peça 3D

Para garantir rentabilidade real sem surpresas no fluxo de caixa, utilize a composição de custos da Spartan 3D:

---

#### 1. Composição Obrigatória de Custos
* **1. Matéria-prima:** \`Peso da peça (g) × Custo por grama\` (com taxa de perda de 5% a 10% inclusa).
* **2. Energia Elétrica:** \`Potência da máquina (kW) × Horas de impressão × Tarifa local (R$/kWh)\`.
* **3. Depreciação de Máquina:** \`R$ 2,50 a R$ 4,50 por hora de impressão\` (reserva para troca de bicos, correias, graxa e amortização do equipamento).
* **4. Mão de Obra Técnica:** Tempo de fatiamento, preparação de arquivo, pós-processamento e embalagem.
* **5. Margem de Lucro:** Recomendado de **50% a 70%** em varejo e **35% a 45%** para lotes de atacado.

---

#### 2. Dica de Conversão Comercial
* Ofereça opções claras de pagamento: **5% de desconto no Pix à vista** e parcelamento no cartão com sinal de 50% para reserva de maquinário e início de produção.`;
    }

    // 8. Resposta Inteligente e Contextual para Qualquer Outra Dúvida 3D
    return `### 💡 Diagnóstico Técnico Especializado Spartan 3D

Para a sua consulta:
> **"${question}"**

---

#### 1. Parâmetros Operacionais Recomendados
* **Calibração de Fluxo e Temperatura:** Ajuste a temperatura do bico conforme o polímero utilizado (PLA: \`200-215°C\`, PETG: \`230-245°C\`, ABS: \`245-255°C\`, TPU: \`220-230°C\`). Aumente de 5°C a 10°C caso imprima em velocidades superiores a 150 mm/s.
* **Perímetros e Preenchimento:** Para máxima resistência mecânica isotrópica, utilize no mínimo **3 a 4 paredes (1.2 - 1.6 mm)** e preenchimento estrutural **Gyroid** de 15% a 25%.
* **Velocidade e Aceleração:** Mantenha paredes externas a 40-60 mm/s para acabamento brilhante e dimensionalmente exato, deixando velocidades maiores para o infill e paredes internas.

---

#### 2. Procedimento de Teste & Validação
* Execute um teste rápido de calibração (*calicat ou cubo de calibração 20x20mm*) para validar a retração e o dimensional antes de rodar o trabalho final.
* Verifique se as guias lineares e eixos Z estão limpos e lubrificados para evitar artefatos de Z-banding ou ghosting na peça.`;
  }

  /**
   * Consulta a IA via Supabase Edge Function com fallback inteligente instantâneo
   */
  public static async askAssistant(question: string): Promise<AiDiagnosticResult> {
    const trimmed = question.trim();
    if (!trimmed) {
      throw new Error('Por favor, digite sua dúvida ou problema técnico.');
    }

    // Tenta primeiro chamar a Edge Function do Supabase
    try {
      if (supabase) {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: { question: trimmed, prompt: trimmed },
        });

        if (!error && data) {
          const rawAnswer = data.answer || data.reply || data.choices?.[0]?.message?.content;
          
          // Verifica se a resposta não é a mensagem genérica obsoleta antiga
          const isGenericOutdated =
            rawAnswer &&
            rawAnswer.includes('Calibração de Primeira Camada: Verifique o Z-offset executando uma linha de purga') &&
            !trimmed.toLowerCase().includes('z-offset');

          if (rawAnswer && !isGenericOutdated) {
            return {
              answer: rawAnswer,
              model: data.model || 'ia-supabase',
              source: 'supabase_edge',
            };
          }
        }
      }
    } catch (err) {
      console.warn('Edge Function indisponível ou em fallback, acionando motor técnico Spartan:', err);
    }

    // Fallback garantido: motor técnico especialista local da Spartan 3D
    const expertAnswer = this.getExpertAnswer(trimmed);
    return {
      answer: expertAnswer,
      model: 'spartan-3d-expert-engine',
      source: 'spartan_expert_engine',
    };
  }
}
