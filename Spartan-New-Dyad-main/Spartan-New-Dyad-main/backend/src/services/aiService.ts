import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  async chat(userId: string, message: string, context?: any) {
    try {
      const systemPrompt = `Você é o Spartan AI Assistant, um especialista em impressão 3D e fabricação digital. 
      Ajude usuários com:
      - Diagnóstico de problemas de impressão FDM/SLA
      - Otimização de parâmetros de impressão
      - Seleção de materiais e filamentos
      - Cálculos de custo e precificação
      - Dicas de manutenção de impressoras
      - Solução de problemas técnicos
      
      Responda em português de forma clara, técnica e prática.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context?.conversationHistory || []),
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const answer = completion.choices[0].message.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(tokensUsed);

      // Save conversation to database
      await prisma.aIConversation.create({
        data: {
          userId,
          question: message,
          answer,
          context: context || {},
          model: 'gpt-4',
          tokensUsed,
          cost,
        },
      });

      return { answer, tokensUsed, cost };
    } catch (error: any) {
      console.error('OpenAI error:', error);
      throw new Error('Erro ao processar requisição de IA');
    }
  }

  async diagnosePrintIssue(issueDescription: string, imageUrl?: string) {
    try {
      const systemPrompt = `Você é um especialista em diagnóstico de impressão 3D. 
      Analise os problemas descritos e forneça:
      1. Diagnóstico preciso do problema
      2. Causas prováveis
      3. Soluções específicas com parâmetros recomendados
      4. Prevenção futura
      
      Problemas comuns incluem: stringing, layer shifting, underextrusion, warping, elephant foot, etc.`;

      let content = issueDescription;
      if (imageUrl) {
        content += `\n\nImagem de referência: ${imageUrl}`;
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
        max_tokens: 800,
      });

      return {
        diagnosis: completion.choices[0].message.content,
        confidence: 0.85,
      };
    } catch (error: any) {
      console.error('Diagnosis error:', error);
      throw new Error('Erro ao diagnosticar problema de impressão');
    }
  }

  async optimizePrintParameters(model: {
    material: string;
    layerHeight: number;
    printSpeed: number;
    nozzleTemp: number;
    bedTemp: number;
  }) {
    try {
      const prompt = `Otimize os seguintes parâmetros de impressão 3D para ${model.material}:
      - Altura da camada: ${model.layerHeight}mm
      - Velocidade de impressão: ${model.printSpeed}mm/s
      - Temperatura do bico: ${model.nozzleTemp}°C
      - Temperatura da mesa: ${model.bedTemp}°C
      
      Forneça parâmetros otimizados com justificativa técnica.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Você é um especialista em otimização de impressão 3D.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      });

      return {
        recommendations: completion.choices[0].message.content,
        originalParameters: model,
      };
    } catch (error: any) {
      console.error('Optimization error:', error);
      throw new Error('Erro ao otimizar parâmetros');
    }
  }

  private calculateCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // Simplified calculation
    return (tokens / 1000) * 0.045;
  }

  async getConversationHistory(userId: string, limit: number = 10) {
    return prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}