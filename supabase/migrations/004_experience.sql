-- ============================================================
-- Migration 004: Modulo Experiencia (Entidades + Experience Items)
-- ============================================================
-- Objetivo: Tablas de entidades aliadas y atributos de experiencia
-- Dependencias: 002_admin_profiles.sql (FK created_by, updated_by en entities)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: entities
-- Sustituye a src/data/entities.ts
-- logo_url almacena ruta relativa: entities/{id}/{filename}
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entities (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    full_name     TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    icon_name     TEXT        NOT NULL DEFAULT 'Building2',
    logo_url      TEXT,                    -- Ruta relativa: entities/{id}/{filename}
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    updated_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_entities_active_order;
CREATE INDEX idx_entities_active_order ON entities(active, order_index);

-- ------------------------------------------------------------------
-- Seed: entities
-- ------------------------------------------------------------------
INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'APRASEF',
       'Asociacion de Productores Agropecuarios Semillas del Futuro',
       'Proyectos y suministros agropecuarios para el fortalecimiento de la asociacion y sus productores.',
       'Users', 0
WHERE NOT EXISTS (SELECT 1 FROM entities LIMIT 1);

INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'Universidad Francisco de Paula Santander Ocana',
       'Universidad Francisco de Paula Santander Ocana',
       'Soluciones agropecuarias y acompanamiento tecnico para proyectos institucionales de la UFPSO.',
       'GraduationCap', 1
WHERE (SELECT COUNT(*) FROM entities) = 1;

INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'Alcaldia Municipal de Hacari',
       'Alcaldia Municipal de Hacari',
       'Suministros e insumos para proyectos de desarrollo rural en el municipio de Hacari.',
       'Landmark', 2
WHERE (SELECT COUNT(*) FROM entities) = 2;

INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'Asociacion de Municipios del Catatumbo',
       'Asociacion de Municipios del Catatumbo',
       'Proyectos conjuntos de desarrollo agropecuario para la region del Catatumbo.',
       'Building', 3
WHERE (SELECT COUNT(*) FROM entities) = 3;

INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'Alianza Fiduciaria S.A.',
       'Alianza Fiduciaria S.A.',
       'Suministros institucionales para el sector agropecuario.',
       'ScrollText', 4
WHERE (SELECT COUNT(*) FROM entities) = 4;

INSERT INTO entities (name, full_name, description, icon_name, order_index)
SELECT 'Camara de Comercio de Ocana',
       'Camara de Comercio de Ocana',
       'Acompanamiento y soluciones para el sector agropecuario regional.',
       'Building2', 5
WHERE (SELECT COUNT(*) FROM entities) = 5;

-- ------------------------------------------------------------------
-- Tabla: experience_items
-- Atributos de experiencia: "Experiencia en proyectos agropecuarios"
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experience_items (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    text          TEXT        NOT NULL,
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Seed: experience_items
-- ------------------------------------------------------------------
INSERT INTO experience_items (text, order_index)
SELECT 'Experiencia en proyectos agropecuarios', 0
WHERE NOT EXISTS (SELECT 1 FROM experience_items LIMIT 1);

INSERT INTO experience_items (text, order_index)
SELECT 'Acompanamiento tecnico especializado', 1
WHERE (SELECT COUNT(*) FROM experience_items) = 1;

INSERT INTO experience_items (text, order_index)
SELECT 'Soluciones integrales para el campo', 2
WHERE (SELECT COUNT(*) FROM experience_items) = 2;

INSERT INTO experience_items (text, order_index)
SELECT 'Cumplimiento y responsabilidad', 3
WHERE (SELECT COUNT(*) FROM experience_items) = 3;

INSERT INTO experience_items (text, order_index)
SELECT 'Innovacion y tecnologia aplicada al agro', 4
WHERE (SELECT COUNT(*) FROM experience_items) = 4;

INSERT INTO experience_items (text, order_index)
SELECT 'Compromiso con las comunidades rurales', 5
WHERE (SELECT COUNT(*) FROM experience_items) = 5;
