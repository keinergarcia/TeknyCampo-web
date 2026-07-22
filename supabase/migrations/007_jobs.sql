-- ============================================================
-- Migration 007: Modulo Trabaja con Nosotros
-- ============================================================
-- Objetivo: Tablas de vacantes, beneficios y postulaciones
-- Dependencias: 002_admin_profiles.sql (FK created_by, updated_by en jobs)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- NOTA: La tabla existente 'postulaciones' NO se modificada.
--       'job_applications' es la nueva tabla que la reemplazara.
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: jobs (Vacantes)
-- Sustituye datos hardcodeados en WorkWithUs.tsx y WorkWithUsPage.tsx
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT        NOT NULL,
    type          TEXT        NOT NULL,         -- "Tiempo completo", "Medio tiempo"
    location      TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    active        BOOLEAN     NOT NULL DEFAULT true,
    order_index   INT         NOT NULL DEFAULT 0,
    created_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    updated_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP INDEX IF EXISTS idx_jobs_active_order;
CREATE INDEX idx_jobs_active_order ON jobs(active, order_index);

-- ------------------------------------------------------------------
-- Seed: jobs (4 vacantes iniciales)
-- ------------------------------------------------------------------
INSERT INTO jobs (title, type, location, description, order_index)
SELECT 'Ingeniero Agronomo', 'Tiempo completo', 'Ocana',
       'Responsable de asesorar tecnicamente a productores en la seleccion de insumos y servicios agropecuarios.',
       0
WHERE NOT EXISTS (SELECT 1 FROM jobs LIMIT 1);

INSERT INTO jobs (title, type, location, description, order_index)
SELECT 'Asesor Tecnico Comercial', 'Tiempo completo', 'Norte de Santander',
       'Brinda asesoria tecnica y comercial a clientes del sector agropecuario en la region.',
       1
WHERE (SELECT COUNT(*) FROM jobs) = 1;

INSERT INTO jobs (title, type, location, description, order_index)
SELECT 'Especialista en Nutricion Animal', 'Tiempo completo', 'Ocana',
       'Desarrolla programas de alimentacion y suplementacion para diferentes especies productivas.',
       2
WHERE (SELECT COUNT(*) FROM jobs) = 2;

INSERT INTO jobs (title, type, location, description, order_index)
SELECT 'Tecnico de Campo', 'Tiempo completo', 'Catatumbo',
       'Realiza visitas tecnicas a fincas para brindar acompanamiento y soporte en campo.',
       3
WHERE (SELECT COUNT(*) FROM jobs) = 3;

-- ------------------------------------------------------------------
-- Tabla: benefits (Beneficios de trabajar en Tekny Campo)
-- Sustituye datos hardcodeados en WorkWithUsPage.tsx
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS benefits (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    icon_name     TEXT        NOT NULL DEFAULT 'Users',
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Seed: benefits (4 beneficios iniciales)
-- ------------------------------------------------------------------
INSERT INTO benefits (title, description, icon_name, order_index)
SELECT 'Ambiente colaborativo', 'Trabaja en un equipo multidisciplinario apasionado por el agro.', 'Users', 0
WHERE NOT EXISTS (SELECT 1 FROM benefits LIMIT 1);

INSERT INTO benefits (title, description, icon_name, order_index)
SELECT 'Desarrollo profesional', 'Acceso a capacitaciones y certificaciones especializadas.', 'Award', 1
WHERE (SELECT COUNT(*) FROM benefits) = 1;

INSERT INTO benefits (title, description, icon_name, order_index)
SELECT 'Crecimiento', 'Oportunidades de crecimiento interno basadas en meritos.', 'TrendingUp', 2
WHERE (SELECT COUNT(*) FROM benefits) = 2;

INSERT INTO benefits (title, description, icon_name, order_index)
SELECT 'Bienestar', 'Programas de bienestar integral y balance vida-trabajo.', 'Heart', 3
WHERE (SELECT COUNT(*) FROM benefits) = 3;

-- ------------------------------------------------------------------
-- Tabla: job_applications (Postulaciones)
-- Reemplazara a la tabla existente 'postulaciones'
-- cv_url almacena ruta relativa: documents/applications/{id}/{filename}
-- job_id es FK opcional para mantener historial aunque se elimine la vacante
-- cargo almacena texto libre para preservar el valor original
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    telefono      TEXT        NOT NULL,
    cargo         TEXT        NOT NULL,           -- Texto libre (preserva valor original)
    job_id        UUID        REFERENCES jobs(id) ON DELETE SET NULL,
    mensaje       TEXT,
    cv_url        TEXT,                           -- Ruta relativa: documents/applications/{id}/{filename}
    status        TEXT        NOT NULL DEFAULT 'pendiente',
    notes         TEXT,                           -- Notas internas del admin
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Restricciones CHECK
-- ------------------------------------------------------------------
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS ck_job_applications_status;
ALTER TABLE job_applications ADD CONSTRAINT ck_job_applications_status
    CHECK (status IN ('pendiente', 'revisado', 'contactado', 'rechazado', 'contratado'));

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_job_applications_created_at;
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);

DROP INDEX IF EXISTS idx_job_applications_status;
CREATE INDEX idx_job_applications_status ON job_applications(status);
