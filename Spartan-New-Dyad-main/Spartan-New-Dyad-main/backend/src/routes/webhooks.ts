import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Stripe webhook
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        // Handle successful payment
        console.log('Payment successful:', session);
        break;
      case 'invoice.paid':
        // Handle invoice payment
        console.log('Invoice paid:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        console.log('Subscription cancelled:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mercado Pago webhook
router.post('/mercadopago', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      // Handle Mercado Pago payment notification
      console.log('Mercado Pago payment notification:', paymentId);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Mercado Pago webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;