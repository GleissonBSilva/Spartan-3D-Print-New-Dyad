import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPrinters = async (req: any, res: Response) => {
  try {
    const printers = await prisma.printer.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: printers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar impressoras',
    });
  }
};

export const createPrinter = async (req: any, res: Response) => {
  try {
    const printerData = req.body;
    
    const printer = await prisma.printer.create({
      data: {
        ...printerData,
        userId: req.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Impressora adicionada com sucesso',
      data: printer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar impressora',
    });
  }
};

export const updatePrinter = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const printer = await prisma.printer.updateMany({
      where: { 
        id,
        userId: req.userId,
      },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Impressora atualizada com sucesso',
      data: printer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar impressora',
    });
  }
};

export const updatePrinterStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, meta } = req.body;

    const printer = await prisma.printer.updateMany({
      where: { 
        id,
        userId: req.userId,
      },
      data: { 
        status,
        meta,
        lastActivity: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Status da impressora atualizado',
      data: printer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar status',
    });
  }
};

export const deletePrinter = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.printer.deleteMany({
      where: { 
        id,
        userId: req.userId,
      },
    });

    res.json({
      success: true,
      message: 'Impressora removida com sucesso',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao remover impressora',
    });
  }
};