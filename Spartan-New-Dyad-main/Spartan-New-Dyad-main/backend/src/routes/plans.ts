import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getPlans, getPlanById, createPlan, updatePlan } from '../controllers/planController';

const router = Router();

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', authenticate, authorize('ADMIN'), createPlan);
router.put('/:id', authenticate, authorize('ADMIN'), updatePlan);

export default router;