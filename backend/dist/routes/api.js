"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const deploymentController_1 = require("../controllers/deploymentController");
const router = (0, express_1.Router)();
// Health & Diagnósticos
router.get('/health', healthController_1.getHealth);
router.get('/db/status', healthController_1.getDbStatus);
// Pruebas de Despliegue CRUD
router.get('/deployments', deploymentController_1.getDeployments);
router.post('/deployments', deploymentController_1.createDeployment);
router.delete('/deployments/:id', deploymentController_1.deleteDeployment);
router.get('/deployments/stats', deploymentController_1.getStats);
router.get('/logs', deploymentController_1.getLogs);
exports.default = router;
