import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

export async function getDeployments(req: Request, res: Response): Promise<void> {
  try {
    const connection = await getPool();
    const result = await connection.request().query(`
      SELECT 
        Id, Title, Environment, Status, ResponseTimeMs, DbVersion, Notes, TestedBy, CreatedAt
      FROM DeploymentTests
      ORDER BY CreatedAt DESC;
    `);

    res.json({
      success: true,
      data: result.recordset,
      total: result.recordset.length,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar pruebas de despliegue en SQL Server',
      message: err.message,
    });
  }
}

export async function createDeployment(req: Request, res: Response): Promise<void> {
  const { title, environment, status, responseTimeMs, notes, testedBy } = req.body;

  if (!title || !environment) {
    res.status(400).json({
      success: false,
      error: 'Campos requeridos faltantes: title y environment son obligatorios.',
    });
    return;
  }

  try {
    const connection = await getPool();
    
    // Obtener versión activa de SQL Server para registrarla
    let dbVersion = 'SQL Server';
    try {
      const vResult = await connection.request().query<{ Version: string }>('SELECT @@VERSION AS Version');
      dbVersion = vResult.recordset[0]?.Version?.split('\n')[0] || 'SQL Server';
    } catch {
      // ignore
    }

    const insertRequest = connection.request();
    insertRequest.input('title', sql.NVarChar(150), title);
    insertRequest.input('environment', sql.NVarChar(50), environment);
    insertRequest.input('status', sql.NVarChar(30), status || 'SUCCESS');
    insertRequest.input('responseTimeMs', sql.Int, parseInt(responseTimeMs || '10', 10));
    insertRequest.input('dbVersion', sql.NVarChar(250), dbVersion);
    insertRequest.input('notes', sql.NVarChar(500), notes || null);
    insertRequest.input('testedBy', sql.NVarChar(100), testedBy || 'Cloud Tester');

    const result = await insertRequest.query(`
      INSERT INTO DeploymentTests (Title, Environment, Status, ResponseTimeMs, DbVersion, Notes, TestedBy)
      OUTPUT INSERTED.*
      VALUES (@title, @environment, @status, @responseTimeMs, @dbVersion, @notes, @testedBy);
    `);

    // Registrar en SystemLogs
    try {
      const logReq = connection.request();
      logReq.input('event', sql.NVarChar(50), 'TEST_CREATED');
      logReq.input('msg', sql.NVarChar(sql.MAX), `Nueva prueba registrada: [${environment}] ${title}`);
      logReq.input('details', sql.NVarChar(sql.MAX), JSON.stringify({ status, responseTimeMs }));
      await logReq.query('INSERT INTO SystemLogs (EventType, Message, Details) VALUES (@event, @msg, @details)');
    } catch {
      // Ignorar error de log secundario
    }

    res.status(201).json({
      success: true,
      message: 'Prueba de despliegue registrada con éxito en SQL Server',
      data: result.recordset[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al insertar prueba en SQL Server',
      message: err.message,
    });
  }
}

export async function deleteDeployment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const connection = await getPool();
    const deleteRequest = connection.request();
    deleteRequest.input('id', sql.Int, parseInt(id, 10));
    const result = await deleteRequest.query('DELETE FROM DeploymentTests WHERE Id = @id;');

    res.json({
      success: true,
      message: `Registro ${id} eliminado correctamente`,
      rowsAffected: result.rowsAffected[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar registro en SQL Server',
      message: err.message,
    });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const connection = await getPool();
    const result = await connection.request().query(`
      SELECT 
        COUNT(*) AS TotalTests,
        SUM(CASE WHEN Status = 'SUCCESS' THEN 1 ELSE 0 END) AS SuccessCount,
        SUM(CASE WHEN Status = 'FAILED' THEN 1 ELSE 0 END) AS FailedCount,
        SUM(CASE WHEN Status = 'WARNING' THEN 1 ELSE 0 END) AS WarningCount,
        AVG(ResponseTimeMs) AS AvgLatencyMs
      FROM DeploymentTests;

      SELECT Environment, COUNT(*) AS Count
      FROM DeploymentTests
      GROUP BY Environment;
    `);

    const recordsets = result.recordsets as unknown as any[][];
    const summary = recordsets[0]?.[0] || {
      TotalTests: 0,
      SuccessCount: 0,
      FailedCount: 0,
      WarningCount: 0,
      AvgLatencyMs: 0,
    };

    const byEnvironment = recordsets[1] || [];

    res.json({
      success: true,
      summary,
      byEnvironment,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: err.message,
    });
  }
}

export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const connection = await getPool();
    const result = await connection.request().query(`
      SELECT TOP 20 Id, EventType, Message, Details, CreatedAt
      FROM SystemLogs
      ORDER BY CreatedAt DESC;
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar logs',
      message: err.message,
    });
  }
}
