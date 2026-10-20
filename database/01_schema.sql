-- 01_schema.sql
-- Creación de tablas para pruebas de despliegue en la nube con SQL Server

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeploymentTests')
BEGIN
    CREATE TABLE DeploymentTests (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(150) NOT NULL,
        Environment NVARCHAR(50) NOT NULL, -- 'Azure App Service', 'AWS RDS', 'Render', 'Local Docker', 'Localhost'
        Status NVARCHAR(30) NOT NULL,       -- 'SUCCESS', 'FAILED', 'WARNING'
        ResponseTimeMs INT NOT NULL DEFAULT 0,
        DbVersion NVARCHAR(250) NULL,
        Notes NVARCHAR(500) NULL,
        TestedBy NVARCHAR(100) NOT NULL DEFAULT 'Tester Cloud',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_DeploymentTests_CreatedAt ON DeploymentTests(CreatedAt DESC);
    CREATE INDEX IX_DeploymentTests_Environment ON DeploymentTests(Environment);
    PRINT 'Tabla DeploymentTests creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'Tabla DeploymentTests ya existe.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemLogs')
BEGIN
    CREATE TABLE SystemLogs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EventType NVARCHAR(50) NOT NULL,    -- 'CONNECTION_TEST', 'DEPLOY_CHECK', 'SCHEMA_MIGRATION'
        Message NVARCHAR(MAX) NOT NULL,
        Details NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_SystemLogs_CreatedAt ON SystemLogs(CreatedAt DESC);
    PRINT 'Tabla SystemLogs creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'Tabla SystemLogs ya existe.';
END
GO
