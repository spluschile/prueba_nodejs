import { Request, Response } from 'express';
import os from 'os';
import { checkDbConnection, sqlConfig } from '../config/db';

export async function getHealth(req: Request, res: Response): Promise<void> {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Cloud Deployment API',
    uptimeSeconds: Math.floor(uptimeSeconds),
    system: {
      platform: os.platform(),
      release: os.release(),
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

export async function getDbStatus(req: Request, res: Response): Promise<void> {
  const dbStatus = await checkDbConnection();

  res.json({
    ...dbStatus,
    config: {
      server: sqlConfig.server,
      port: sqlConfig.port,
      database: sqlConfig.database,
      user: sqlConfig.user,
      encrypt: sqlConfig.options?.encrypt,
      trustServerCertificate: sqlConfig.options?.trustServerCertificate,
    },
    checkedAt: new Date().toISOString(),
  });
}
