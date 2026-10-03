import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getProjects, 
  createProject, 
  getProjectById, 
  updateProject, 
  deleteProject,
  updateProjectStatus 
} from '../controllers/projectController';

const router = Router();

router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.get('/:id', authenticate, getProjectById);
router.put('/:id', authenticate, updateProject);
router.patch('/:id/status', authenticate, updateProjectStatus);
router.delete('/:id', authenticate, deleteProject);

export default router;