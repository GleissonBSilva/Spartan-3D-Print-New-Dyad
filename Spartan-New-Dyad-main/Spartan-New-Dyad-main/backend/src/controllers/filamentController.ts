import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFilaments = async (req: any, res: Response) => {
  try {
    const filaments = await prisma.filamento.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: filaments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar filamentos',
    });
  }
};

export const createFilament = async (req: any, res: Response) => {
  try {
    const filamentData = req.body;
    
    const filament = await prisma.filamento.create({
      data: {
        ...filamentData,
        userId: req.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Filamento adicionado com sucesso',
      data: filament,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar filamento',
    });
  }
};

export const updateFilament = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const filament = await prisma.filamento.updateMany({
      where: { 
        id,
        userId: req.userId,
      },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Filamento atualizado com sucesso',
      data: filament,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar filamento',
    });
  }
};

export const consumeFilament = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { gramas } = req.body;

    const filament = await prisma.filamento.findFirst({
      where: { id, userId: req.userId },
    });

    if (!filament) {
      return res.status(404).json({
        success: false,
        message: 'Filamento não encontrado',
      });
    }

    const novoPesoRestante = Math.max(0, filament.pesoRestanteG - gramas);

    await prisma.filamento.updateMany({
      where: { id },
      data: { pesoRestanteG: novoPesoRestante },
    });

    res.json({
      success: true,
      message: 'Filamento consumido com sucesso',
      data: { pesoRestanteG: novoPesoRestante },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao consumir filamento',
    });
  }
};

export const deleteFilament = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.filamento.deleteMany({
      where: { 
        id,
        userId: req.userId,
      },
    });

    res.json({
      success: true,
      message: 'Filamento removido com sucesso',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao remover filamento',
    });
  }
};