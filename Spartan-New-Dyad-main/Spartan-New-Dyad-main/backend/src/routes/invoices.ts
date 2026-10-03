import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getInvoices, createInvoice, payInvoice, createPixPayment } from '../controllers/invoiceController';

const router = Router();

router.get('/', authenticate, getInvoices);
router.post('/', authenticate, createInvoice);
router.post('/pix', authenticate, createPixPayment);
router.patch('/:id/pay', authenticate, payInvoice);

export default router;