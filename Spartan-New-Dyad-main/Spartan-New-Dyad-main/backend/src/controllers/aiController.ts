import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const aiService = new AIService();

export const chat = async (req: any, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória',
      });
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { credits: true },
    });

    if (!user || user.credits < 100) {
      return res.status(400).json({
        success: false,
        message: 'Créditos de IA insuficientes',
      });
    }

    const result = await aiService.chat(req.userId, message, context);

    // Deduct credits (simplified: 100 credits per request)
    await prisma.user.update({
      where: { id: req.userId },
      data: { credits: { decrement: 100 } },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar chat',
    });
  }
};

export const diagnose = async (req: any, res: Response) => {
  try {
    const { issueDescription, imageUrl } = req.body;

    if (!issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'Descrição do problema é obrigatória',
      });
    }

    const result = await aiService.diagnosePrintIssue(issueDescription, imageUrl);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao diagnosticar problema',
    });
  }
};

export const optimize = async (req: any, res: Response) => {
  try {
    const parameters = req.body;

    const result = await aiService.optimizePrintParameters(parameters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao otimizar parâmetros',
    });
  }
};

export const getHistory = async (req: any, res: Response) => {
  try {
    const history = await aiService.getConversationHistory(req.userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar histórico',
    });
  }
};