import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar .env desde backend/.env o desde la raíz
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config(); // fallback default

const portNumber = parseInt(process.env.DB_PORT || '1433', 10);

export const sqlConfig: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: isNaN(portNumber) ? 1433 : portNumber,
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'CloudTestDb',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    connectTimeout: 8000,
    requestTimeout: 15000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    console.log(`[SQL Server] Conectado exitosamente a: ${sqlConfig.server}:${sqlConfig.port}/${sqlConfig.database}`);
    return pool;
  } catch (err: any) {
    console.error('[SQL Server] Error de conexión:', err.message);
    throw err;
  }
}

export async function checkDbConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  serverVersion?: string;
  databaseName?: string;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const connection = await getPool();
    const result = await connection.request().query<{
      Version: string;
      DbName: string;
    }>('SELECT @@VERSION AS Version, DB_NAME() AS DbName;');

    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      latencyMs,
      serverVersion: result.recordset[0]?.Version?.split('\n')[0] || 'SQL Server',
      databaseName: result.recordset[0]?.DbName || sqlConfig.database,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

export async function initDbSchema(): Promise<void> {
  try {
    const connection = await getPool();
    const schemaSql = `
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeploymentTests')
      BEGIN
          CREATE TABLE DeploymentTests (
              Id INT IDENTITY(1,1) PRIMARY KEY,
              Title NVARCHAR(150) NOT NULL,
              Environment NVARCHAR(50) NOT NULL,
              Status NVARCHAR(30) NOT NULL,
              ResponseTimeMs INT NOT NULL DEFAULT 0,
              DbVersion NVARCHAR(250) NULL,
              Notes NVARCHAR(500) NULL,
              TestedBy NVARCHAR(100) NOT NULL DEFAULT 'Tester Cloud',
              CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
          );
      END;

      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemLogs')
      BEGIN
          CREATE TABLE SystemLogs (
              Id INT IDENTITY(1,1) PRIMARY KEY,
              EventType NVARCHAR(50) NOT NULL,
              Message NVARCHAR(MAX) NOT NULL,
              Details NVARCHAR(MAX) NULL,
              CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
          );
      END;
    `;
    await connection.request().batch(schemaSql);
    console.log('[SQL Server] Tablas verificadas e inicializadas correctamente.');
  } catch (err: any) {
    console.warn('[SQL Server] No se pudo inicializar esquema automático:', err.message);
  }
}

export { sql };
