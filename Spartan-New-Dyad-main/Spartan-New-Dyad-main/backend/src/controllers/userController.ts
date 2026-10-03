import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar usuários',
    });
  }
};

export const getUserById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        plan: true,
        projects: {
          take: 10,
          orderBy: { dataCriacao: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar usuário',
    });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
    const { password, ...safeUpdateData } = updateData;

    const user = await prisma.user.update({
      where: { id },
      data: safeUpdateData,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        status: true,
        credits: true,
        planId: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar usuário',
    });
  }
};

export const updateUserStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    res.json({
      success: true,
      message: 'Status do usuário atualizado',
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar status',
    });
  }
};

export const updateUserPlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { planId },
      include: { plan: true },
    });

    res.json({
      success: true,
      message: 'Plano do usuário atualizado',
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar plano',
    });
  }
};

export const createUser = async (req: any, res: Response) => {
  try {
    const userData = req.body;
    
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        status: true,
        credits: true,
        planId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar usuário',
    });
  }
};