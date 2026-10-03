import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  updateUserStatus,
  updateUserPlan,
  createUser 
} from '../controllers/userController';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateUserStatus);
router.patch('/:id/plan', authenticate, authorize('ADMIN'), updateUserPlan);

export default router;