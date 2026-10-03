import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar planos',
    });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar plano',
    });
  }
};

export const createPlan = async (req: any, res: Response) => {
  try {
    const planData = req.body;
    
    const plan = await prisma.plan.create({
      data: planData,
    });

    res.status(201).json({
      success: true,
      message: 'Plano criado com sucesso',
      data: plan,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar plano',
    });
  }
};

export const updatePlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: plan,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar plano',
    });
  }
};