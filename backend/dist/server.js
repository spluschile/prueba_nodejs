"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./routes/api"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Permitir solicitudes desde frontend web, Tauri y herramientas de prueba
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Logger de solicitudes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});
// Rutas API
app.use('/api', api_1.default);
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Servir frontend compilado si existe (Modo Fullstack para Cloud)
const possiblePublicPaths = [
    path_1.default.join(__dirname, 'public'),
    path_1.default.join(__dirname, '../public'),
    path_1.default.join(__dirname, '../../frontend/dist'),
];
let publicPath = null;
for (const p of possiblePublicPaths) {
    if (fs_1.default.existsSync(p) && fs_1.default.existsSync(path_1.default.join(p, 'index.html'))) {
        publicPath = p;
        break;
    }
}
if (publicPath) {
    console.log(`[Frontend] Sirviendo interfaz web estática desde: ${publicPath}`);
    app.use(express_1.default.static(publicPath));
    // Fallback para SPA en cualquier ruta no /api
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
else {
    // Ruta raíz con información del servicio si no hay frontend compilado
    app.get('/', (req, res) => {
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
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Ruta no encontrada',
            requestedPath: req.originalUrl,
        });
    });
}
// Manejador global de errores
app.use((err, req, res, next) => {
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
        await (0, db_1.initDbSchema)();
    }
    catch (err) {
        console.warn('Nota: SQL Server aún no disponible o esperando credenciales:', err.message);
    }
});
