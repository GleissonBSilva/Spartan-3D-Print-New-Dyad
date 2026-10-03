import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        materials: true,
        printer: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar projetos',
    });
  }
};

export const createProject = async (req: any, res: Response) => {
  try {
    const projectData = req.body;
    
    const project = await prisma.project.create({
      data: {
        ...projectData,
        userId: req.userId,
        materials: {
          create: projectData.materials || [],
        },
      },
      include: {
        materials: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar projeto',
    });
  }
};

export const getProjectById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: req.userId,
      },
      include: {
        materials: true,
        printer: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar projeto',
    });
  }
};

export const updateProject = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await prisma.project.updateMany({
      where: { 
        id,
        userId: req.userId,
      },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar projeto',
    });
  }
};

export const deleteProject = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.deleteMany({
      where: { 
        id,
        userId: req.userId,
      },
    });

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao deletar projeto',
    });
  }
};

export const updateProjectStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await prisma.project.updateMany({
      where: { 
        id,
        userId: req.userId,
      },
      data: { 
        status,
        ...(status === 'CONCLUIDO' && { dataConclusao: new Date() }),
      },
    });

    res.json({
      success: true,
      message: 'Status do projeto atualizado',
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar status',
    });
  }
};