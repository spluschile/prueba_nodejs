import { Router } from 'express';
import { getHealth, getDbStatus } from '../controllers/healthController';
import {
  getDeployments,
  createDeployment,
  deleteDeployment,
  getStats,
  getLogs,
} from '../controllers/deploymentController';

const router = Router();

// Health & Diagnósticos
router.get('/health', getHealth);
router.get('/db/status', getDbStatus);

// Pruebas de Despliegue CRUD
router.get('/deployments', getDeployments);
router.post('/deployments', createDeployment);
router.delete('/deployments/:id', deleteDeployment);
router.get('/deployments/stats', getStats);
router.get('/logs', getLogs);

export default router;
