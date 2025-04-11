-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'taxonomy_db')
BEGIN
    CREATE DATABASE taxonomy_db;
END
GO

USE taxonomy_db;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'node_manager', 'node_lead', 'user')),
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- Create Taxonomies table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Taxonomies' and xtype='U')
BEGIN
    CREATE TABLE Taxonomies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        parentId INT,
        level INT NOT NULL DEFAULT 0,
        path NVARCHAR(MAX) NOT NULL DEFAULT '',
        [order] INT NOT NULL DEFAULT 0,
        isActive BIT NOT NULL DEFAULT 1,
        createdBy INT NOT NULL,
        updatedBy INT,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (parentId) REFERENCES Taxonomies(id),
        FOREIGN KEY (createdBy) REFERENCES Users(id),
        FOREIGN KEY (updatedBy) REFERENCES Users(id)
    );
END
GO

-- Create initial admin user if not exists
-- Password: admin123 (hashed with bcrypt)
IF NOT EXISTS (SELECT * FROM Users WHERE username = 'admin')
BEGIN
    INSERT INTO Users (username, password, email, role)
    VALUES (
        'admin',
        '$2a$10$6KvSPVpHvMVP5VQkS.8Xz.F9J8M6vhXfI9cGdD9hkB8jY9akB.v6e',
        'admin@example.com',
        'admin'
    );
END
GO

-- Create indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Taxonomies_ParentId' AND object_id = OBJECT_ID('Taxonomies'))
BEGIN
    CREATE INDEX IX_Taxonomies_ParentId ON Taxonomies(parentId);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Taxonomies_Path' AND object_id = OBJECT_ID('Taxonomies'))
BEGIN
    CREATE INDEX IX_Taxonomies_Path ON Taxonomies(path);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Taxonomies_Level' AND object_id = OBJECT_ID('Taxonomies'))
BEGIN
    CREATE INDEX IX_Taxonomies_Level ON Taxonomies(level);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE INDEX IX_Users_Username ON Users(username);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE INDEX IX_Users_Email ON Users(email);
END
GO

-- Create stored procedures
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'GetTaxonomyHierarchy')
    DROP PROCEDURE GetTaxonomyHierarchy
GO

CREATE PROCEDURE GetTaxonomyHierarchy
    @rootId INT = NULL
AS
BEGIN
    WITH TaxonomyCTE AS (
        -- Base case: root nodes or specific node
        SELECT 
            id,
            name,
            description,
            parentId,
            level,
            path,
            [order],
            isActive,
            createdBy,
            updatedBy,
            createdAt,
            updatedAt,
            CAST(RIGHT('000000000' + CAST([order] AS VARCHAR(10)), 10) AS VARCHAR(MAX)) AS SortPath
        FROM Taxonomies
        WHERE (@rootId IS NULL AND parentId IS NULL) OR (@rootId IS NOT NULL AND id = @rootId)

        UNION ALL

        -- Recursive case: child nodes
        SELECT 
            t.id,
            t.name,
            t.description,
            t.parentId,
            t.level,
            t.path,
            t.[order],
            t.isActive,
            t.createdBy,
            t.updatedBy,
            t.createdAt,
            t.updatedAt,
            CAST(cte.SortPath + '/' + RIGHT('000000000' + CAST(t.[order] AS VARCHAR(10)), 10) AS VARCHAR(MAX))
        FROM Taxonomies t
        INNER JOIN TaxonomyCTE cte ON t.parentId = cte.id
    )
    SELECT 
        id,
        name,
        description,
        parentId,
        level,
        path,
        [order],
        isActive,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt
    FROM TaxonomyCTE
    ORDER BY SortPath;
END
GO

-- Create triggers
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Taxonomies_UpdatePath')
    DROP TRIGGER TR_Taxonomies_UpdatePath
GO

CREATE TRIGGER TR_Taxonomies_UpdatePath
ON Taxonomies
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Update path and level for inserted/updated nodes
    WITH PathCTE AS (
        SELECT 
            t.id,
            t.parentId,
            CAST(t.id AS NVARCHAR(MAX)) AS path,
            0 AS level
        FROM Taxonomies t
        WHERE t.parentId IS NULL

        UNION ALL

        SELECT 
            t.id,
            t.parentId,
            CAST(p.path + '/' + CAST(t.id AS NVARCHAR(36)) AS NVARCHAR(MAX)),
            p.level + 1
        FROM Taxonomies t
        INNER JOIN PathCTE p ON t.parentId = p.id
    )
    UPDATE t
    SET 
        path = p.path,
        level = p.level,
        updatedAt = GETDATE()
    FROM Taxonomies t
    INNER JOIN PathCTE p ON t.id = p.id
    WHERE t.id IN (SELECT id FROM inserted);
END
GO
