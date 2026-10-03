import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getPrinters, 
  createPrinter, 
  updatePrinter, 
  updatePrinterStatus,
  deletePrinter 
} from '../controllers/printerController';

const router = Router();

router.get('/', authenticate, getPrinters);
router.post('/', authenticate, createPrinter);
router.put('/:id', authenticate, updatePrinter);
router.patch('/:id/status', authenticate, updatePrinterStatus);
router.delete('/:id', authenticate, deletePrinter);

export default router;