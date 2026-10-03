import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { chat, diagnose, optimize, getHistory } from '../controllers/aiController';

const router = Router();

router.post('/chat', authenticate, chat);
router.post('/diagnose', authenticate, diagnose);
router.post('/optimize', authenticate, optimize);
router.get('/history', authenticate, getHistory);

export default router;