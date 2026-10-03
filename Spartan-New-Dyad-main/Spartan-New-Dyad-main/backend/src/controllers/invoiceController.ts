import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const getInvoices = async (req: any, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      include: {
        plan: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar faturas',
    });
  }
};

export const createInvoice = async (req: any, res: Response) => {
  try {
    const { amount, method, planId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { plan: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Create Stripe payment intent if using Stripe
    let paymentIntent;
    if (method === 'STRIPE') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'brl',
        metadata: {
          userId: req.userId,
          planId: planId || user.planId,
        },
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.userId,
        planId: planId || user.planId,
        amount,
        currency: 'BRL',
        method,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        stripeInvoiceId: paymentIntent?.id,
      },
      include: {
        plan: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Fatura criada com sucesso',
      data: {
        ...invoice,
        clientSecret: paymentIntent?.client_secret,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar fatura',
    });
  }
};

export const payInvoice = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        userId: req.userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Fatura não encontrada',
      });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Fatura já está paga',
      });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Update user plan if applicable
    if (invoice.planId) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { planId: invoice.planId },
      });
    }

    res.json({
      success: true,
      message: 'Fatura paga com sucesso',
      data: updatedInvoice,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao pagar fatura',
    });
  }
};

export const createPixPayment = async (req: any, res: Response) => {
  try {
    const { amount, planId } = req.body;

    // In a real implementation, you would integrate with Mercado Pago or another Pix provider
    // For now, we'll create a mock Pix payment
    
    const invoice = await prisma.invoice.create({
      data: {
        userId: req.userId,
        planId,
        amount,
        currency: 'BRL',
        method: 'PIX',
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        status: 'PENDING',
      },
      include: {
        plan: true,
      },
    });

    // Mock Pix QR code (in production, generate real QR code)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${invoice.id}520400005303986540${amount.toFixed(2)}5802BR5925Spartan 3D Print6009Sao Paulo62070503***6304`;

    res.status(201).json({
      success: true,
      message: 'Pagamento Pix criado',
      data: {
        invoice,
        pixCode,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`, // Placeholder
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar pagamento Pix',
    });
  }
};