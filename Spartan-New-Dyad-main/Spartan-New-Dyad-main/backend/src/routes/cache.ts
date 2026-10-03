import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { cacheService } from '../services/cacheService';

const router = Router();

// Cache statistics endpoint
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await cacheService.getCacheStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar estatísticas de cache',
    });
  }
});

// Clear cache endpoint
router.post('/clear', authenticate, async (req, res) => {
  try {
    await cacheService.flushDb();
    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao limpar cache',
    });
  }
});

// Invalidate user cache
router.post('/invalidate/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    await cacheService.invalidateUserCache(userId);
    res.json({
      success: true,
      message: `Cache do usuário ${userId} invalidado`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao invalidar cache do usuário',
    });
  }
});

export default router;