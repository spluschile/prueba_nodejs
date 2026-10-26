"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployments = getDeployments;
exports.createDeployment = createDeployment;
exports.deleteDeployment = deleteDeployment;
exports.getStats = getStats;
exports.getLogs = getLogs;
const db_1 = require("../config/db");
async function getDeployments(req, res) {
    try {
        const connection = await (0, db_1.getPool)();
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error al consultar pruebas de despliegue en SQL Server',
            message: err.message,
        });
    }
}
async function createDeployment(req, res) {
    const { title, environment, status, responseTimeMs, notes, testedBy } = req.body;
    if (!title || !environment) {
        res.status(400).json({
            success: false,
            error: 'Campos requeridos faltantes: title y environment son obligatorios.',
        });
        return;
    }
    try {
        const connection = await (0, db_1.getPool)();
        // Obtener versión activa de SQL Server para registrarla
        let dbVersion = 'SQL Server';
        try {
            const vResult = await connection.request().query('SELECT @@VERSION AS Version');
            dbVersion = vResult.recordset[0]?.Version?.split('\n')[0] || 'SQL Server';
        }
        catch {
            // ignore
        }
        const insertRequest = connection.request();
        insertRequest.input('title', db_1.sql.NVarChar(150), title);
        insertRequest.input('environment', db_1.sql.NVarChar(50), environment);
        insertRequest.input('status', db_1.sql.NVarChar(30), status || 'SUCCESS');
        insertRequest.input('responseTimeMs', db_1.sql.Int, parseInt(responseTimeMs || '10', 10));
        insertRequest.input('dbVersion', db_1.sql.NVarChar(250), dbVersion);
        insertRequest.input('notes', db_1.sql.NVarChar(500), notes || null);
        insertRequest.input('testedBy', db_1.sql.NVarChar(100), testedBy || 'Cloud Tester');
        const result = await insertRequest.query(`
      INSERT INTO DeploymentTests (Title, Environment, Status, ResponseTimeMs, DbVersion, Notes, TestedBy)
      OUTPUT INSERTED.*
      VALUES (@title, @environment, @status, @responseTimeMs, @dbVersion, @notes, @testedBy);
    `);
        // Registrar en SystemLogs
        try {
            const logReq = connection.request();
            logReq.input('event', db_1.sql.NVarChar(50), 'TEST_CREATED');
            logReq.input('msg', db_1.sql.NVarChar(db_1.sql.MAX), `Nueva prueba registrada: [${environment}] ${title}`);
            logReq.input('details', db_1.sql.NVarChar(db_1.sql.MAX), JSON.stringify({ status, responseTimeMs }));
            await logReq.query('INSERT INTO SystemLogs (EventType, Message, Details) VALUES (@event, @msg, @details)');
        }
        catch {
            // Ignorar error de log secundario
        }
        res.status(201).json({
            success: true,
            message: 'Prueba de despliegue registrada con éxito en SQL Server',
            data: result.recordset[0],
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error al insertar prueba en SQL Server',
            message: err.message,
        });
    }
}
async function deleteDeployment(req, res) {
    const { id } = req.params;
    try {
        const connection = await (0, db_1.getPool)();
        const deleteRequest = connection.request();
        deleteRequest.input('id', db_1.sql.Int, parseInt(id, 10));
        const result = await deleteRequest.query('DELETE FROM DeploymentTests WHERE Id = @id;');
        res.json({
            success: true,
            message: `Registro ${id} eliminado correctamente`,
            rowsAffected: result.rowsAffected[0],
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error al eliminar registro en SQL Server',
            message: err.message,
        });
    }
}
async function getStats(req, res) {
    try {
        const connection = await (0, db_1.getPool)();
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
        const recordsets = result.recordsets;
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas',
            message: err.message,
        });
    }
}
async function getLogs(req, res) {
    try {
        const connection = await (0, db_1.getPool)();
        const result = await connection.request().query(`
      SELECT TOP 20 Id, EventType, Message, Details, CreatedAt
      FROM SystemLogs
      ORDER BY CreatedAt DESC;
    `);
        res.json({
            success: true,
            data: result.recordset,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error al consultar logs',
            message: err.message,
        });
    }
}
