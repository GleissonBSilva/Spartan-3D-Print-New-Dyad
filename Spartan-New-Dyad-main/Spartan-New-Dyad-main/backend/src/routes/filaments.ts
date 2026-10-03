import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getFilaments, 
  createFilament, 
  updateFilament,
  consumeFilament,
  deleteFilament 
} from '../controllers/filamentController';

const router = Router();

router.get('/', authenticate, getFilaments);
router.post('/', authenticate, createFilament);
router.put('/:id', authenticate, updateFilament);
router.patch('/:id/consume', authenticate, consumeFilament);
router.delete('/:id', authenticate, deleteFilament);

export default router;