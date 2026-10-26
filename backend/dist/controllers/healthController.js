"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
exports.getDbStatus = getDbStatus;
const os_1 = __importDefault(require("os"));
const db_1 = require("../config/db");
async function getHealth(req, res) {
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Cloud Deployment API',
        uptimeSeconds: Math.floor(uptimeSeconds),
        system: {
            platform: os_1.default.platform(),
            release: os_1.default.release(),
            nodeVersion: process.version,
            memoryRssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
            environment: process.env.NODE_ENV || 'development',
        },
        cloud: {
            isDocker: Boolean(process.env.DOCKER_CONTAINER || process.env.IS_DOCKER),
            isAzure: Boolean(process.env.WEBSITE_SITE_NAME),
            isAws: Boolean(process.env.AWS_EXECUTION_ENV),
            isRender: Boolean(process.env.RENDER),
            isRailway: Boolean(process.env.RAILWAY_ENVIRONMENT),
        },
    });
}
async function getDbStatus(req, res) {
    const dbStatus = await (0, db_1.checkDbConnection)();
    res.json({
        ...dbStatus,
        config: {
            server: db_1.sqlConfig.server,
            port: db_1.sqlConfig.port,
            database: db_1.sqlConfig.database,
            user: db_1.sqlConfig.user,
            encrypt: db_1.sqlConfig.options?.encrypt,
            trustServerCertificate: db_1.sqlConfig.options?.trustServerCertificate,
        },
        checkedAt: new Date().toISOString(),
    });
}
