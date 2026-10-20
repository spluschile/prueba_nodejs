import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { initDbSchema } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Permitir solicitudes desde frontend web, Tauri y herramientas de prueba
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Logger de solicitudes
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas API
app.use('/api', apiRoutes);

import path from 'path';
import fs from 'fs';

// Servir frontend compilado si existe (Modo Fullstack para Cloud)
const possiblePublicPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../public'),
  path.join(__dirname, '../../frontend/dist'),
];

let publicPath: string | null = null;
for (const p of possiblePublicPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    publicPath = p;
    break;
  }
}

if (publicPath) {
  console.log(`[Frontend] Sirviendo interfaz web estática desde: ${publicPath}`);
  app.use(express.static(publicPath));
  
  // Fallback para SPA en cualquier ruta no /api
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicPath!, 'index.html'));
  });
} else {
  // Ruta raíz con información del servicio si no hay frontend compilado
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Cloud Deployment SQL Server Test API',
      version: '1.0.0',
      documentation: '/api/health',
      endpoints: [
        'GET  /api/health',
        'GET  /api/db/status',
        'GET  /api/deployments',
        'POST /api/deployments',
        'DELETE /api/deployments/:id',
        'GET  /api/deployments/stats',
        'GET  /api/logs',
      ],
    });
  });

  // Manejador 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada',
      requestedPath: req.originalUrl,
    });
  });
}

// Manejador global de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error no controlado]', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Iniciar servidor
app.listen(port, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📋 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Intento de conexión inicial y chequeo de esquema en background
  try {
    await initDbSchema();
  } catch (err: any) {
    console.warn('Nota: SQL Server aún no disponible o esperando credenciales:', err.message);
  }
});
