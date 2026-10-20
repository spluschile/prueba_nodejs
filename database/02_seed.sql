-- 02_seed.sql
-- Datos iniciales de prueba para validar lecturas en la nube

USE [CloudTestDb];
GO

IF NOT EXISTS (SELECT 1 FROM DeploymentTests)
BEGIN
    INSERT INTO DeploymentTests (Title, Environment, Status, ResponseTimeMs, DbVersion, Notes, TestedBy)
    VALUES 
    ('Prueba Inicial de Conectividad TDS', 'Localhost', 'SUCCESS', 14, 'Microsoft SQL Server 2019 Dev', 'Conexión TCP puerto 1433 exitosa.', 'Antigravity QA'),
    ('Simulación Despliegue Azure Web App', 'Azure App Service', 'SUCCESS', 45, 'Azure SQL Database v12.0', 'Conexión SSL con TrustServerCertificate=false validada.', 'DevOps Lead'),
    ('Prueba de Carga Contenedor Docker', 'Local Docker', 'SUCCESS', 22, 'MSSQL 2022 Linux Container', 'Despliegue multi-contenedor con docker-compose exitoso.', 'Docker Agent'),
    ('Validación de Latencia en la Nube', 'AWS RDS', 'WARNING', 128, 'SQL Server Standard Edition', 'Latencia ligeramente elevada por distancia inter-región.', 'Cloud Engineer');

    INSERT INTO SystemLogs (EventType, Message, Details)
    VALUES
    ('INITIAL_SEED', 'Datos base de prueba insertados satisfactoriamente', 'Semilla ejecutada con 4 registros de prueba'),
    ('HEARTBEAT', 'Servicio SQL Server activo y escuchando conexiones', 'Instancia SQL Server lista para pruebas de nube');

    PRINT 'Semillas insertadas correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla DeploymentTests ya contiene registros.';
END
GO
