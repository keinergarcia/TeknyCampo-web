-- ============================================================
-- Migration 006: Modulo Capacitaciones (NUEVO)
-- ============================================================
-- Objetivo: Tabla de capacitaciones. Modulo nuevo, no reemplaza
--           datos existentes. Sin seed data inicial.
-- Dependencias: 002_admin_profiles.sql (FK created_by, updated_by)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: trainings
-- image_url almacena ruta relativa: trainings/{id}/{filename}
-- brochure_url almacena ruta relativa: documents/trainings/{id}/{filename}
-- curriculum es JSONB: [{title, duration, topics[]}]
-- requirements es TEXT[]: array de requisitos
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    content         TEXT,                    -- Contenido extendido (HTML sanitizado)
    instructor      TEXT,
    modality        TEXT        NOT NULL DEFAULT 'presencial',
    duration        TEXT,                    -- "4 semanas", "40 horas"
    schedule        TEXT,                    -- "Sabados 8am-12pm"
    location        TEXT,                    -- "Ocana, Norte de Santander"
    start_date      DATE,
    end_date        DATE,
    price           NUMERIC(10,2),           -- NULL = gratuita
    max_participants INT,
    curriculum      JSONB,                   -- [{title, duration, topics[]}]
    requirements    TEXT[],                  -- Array de requisitos
    certificate     BOOLEAN     NOT NULL DEFAULT false,
    image_url       TEXT,                    -- Ruta relativa: trainings/{id}/{filename}
    brochure_url    TEXT,                    -- Ruta relativa: documents/trainings/{id}/{filename}
    featured        BOOLEAN     NOT NULL DEFAULT false,
    active          BOOLEAN     NOT NULL DEFAULT true,
    order_index     INT         NOT NULL DEFAULT 0,
    created_by      UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    updated_by      UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Restricciones CHECK
-- ------------------------------------------------------------------
ALTER TABLE trainings DROP CONSTRAINT IF EXISTS ck_trainings_modality;
ALTER TABLE trainings ADD CONSTRAINT ck_trainings_modality
    CHECK (modality IN ('presencial', 'virtual', 'hibrida'));

ALTER TABLE trainings DROP CONSTRAINT IF EXISTS ck_trainings_dates;
ALTER TABLE trainings ADD CONSTRAINT ck_trainings_dates
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_trainings_active_order;
CREATE INDEX idx_trainings_active_order ON trainings(active, order_index);
