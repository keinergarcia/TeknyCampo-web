-- ============================================================
-- Migration 003: Modulo Servicios
-- ============================================================
-- Objetivo: Tabla de servicios + seed data
-- Dependencias: 002_admin_profiles.sql (FK created_by, updated_by)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: services
-- Sustituye a src/data/services.ts
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    features      JSONB       NOT NULL DEFAULT '[]'::jsonb,
    icon_name     TEXT        NOT NULL DEFAULT 'Wheat',
    color_scheme  TEXT        NOT NULL DEFAULT 'amber',
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    updated_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Restricciones CHECK
-- ------------------------------------------------------------------
ALTER TABLE services DROP CONSTRAINT IF EXISTS ck_services_features_is_array;
ALTER TABLE services ADD CONSTRAINT ck_services_features_is_array
    CHECK (jsonb_typeof(features) = 'array');

ALTER TABLE services DROP CONSTRAINT IF EXISTS ck_services_color_scheme;
ALTER TABLE services ADD CONSTRAINT ck_services_color_scheme
    CHECK (color_scheme IN ('amber', 'green', 'orange', 'blue'));

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_services_active_order;
CREATE INDEX idx_services_active_order ON services(active, order_index);

-- ------------------------------------------------------------------
-- Seed data (solo si la tabla esta vacia)
-- ------------------------------------------------------------------
INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
SELECT 'Insumos Agropecuarios',
       'Ofrecemos una amplia gama de insumos de alta calidad para el sector agropecuario, incluyendo fertilizantes, semillas certificadas, productos veterinarios, nutricion animal y herramientas especializadas.',
       '["Fertilizantes orgánicos y químicos", "Semillas certificadas", "Productos veterinarios", "Nutrición animal", "Herramientas e implementos"]'::jsonb,
       'Wheat', 'amber', 0
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
SELECT 'Soluciones Agricolas',
       'Desarrollamos soluciones tecnologicas para la agricultura: sistemas de riego, manejo de cultivos, asistencia tecnica y fertilizacion para optimizar la productividad del campo.',
       '["Sistemas de riego", "Manejo de cultivos", "Asistencia técnica", "Fertilización y productividad"]'::jsonb,
       'Sprout', 'green', 1
WHERE (SELECT COUNT(*) FROM services) = 1;

INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
SELECT 'Soluciones Ganaderas',
       'Brindamos soluciones integrales para la ganaderia: alimentacion animal, manejo sanitario, suplementacion y mejoramiento productivo para maximizar la produccion.',
       '["Alimentación animal", "Manejo sanitario", "Suplementación", "Mejoramiento productivo"]'::jsonb,
       'Beef', 'orange', 2
WHERE (SELECT COUNT(*) FROM services) = 2;

INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
SELECT 'Capacitacion y Acompanamiento',
       'Formamos y acompanamos a agricultores y ganaderos con programas de formacion tecnica, fortalecimiento rural, asesoria agropecuaria y acompanamiento productivo.',
       '["Formación técnica", "Fortalecimiento rural a productores", "Asesoría agropecuaria", "Acompañamiento"]'::jsonb,
       'GraduationCap', 'blue', 3
WHERE (SELECT COUNT(*) FROM services) = 3;
