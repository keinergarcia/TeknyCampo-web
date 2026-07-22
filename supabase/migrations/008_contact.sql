-- ============================================================
-- Migration 008: Modulo Contacto
-- ============================================================
-- Objetivo: Tablas de informacion de contacto y mensajes
-- Dependencias: Ninguna (tablas autonomas)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- NOTA: La tabla existente 'contactos' NO se modifica.
--       'contact_messages' es la nueva tabla que la reemplazara.
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: contact_info
-- Sustituye a src/data/contact.ts
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_info (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    label         TEXT        NOT NULL,
    value         TEXT        NOT NULL,
    detail        TEXT,
    icon_name     TEXT        NOT NULL DEFAULT 'Phone',
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Seed: contact_info (4 items)
-- ------------------------------------------------------------------
INSERT INTO contact_info (label, value, detail, icon_name, order_index)
SELECT 'Telefono', '311 549 9784', 'Lunes a Viernes, 8am - 6pm', 'Phone', 0
WHERE NOT EXISTS (SELECT 1 FROM contact_info LIMIT 1);

INSERT INTO contact_info (label, value, detail, icon_name, order_index)
SELECT 'Correo electronico', 'Teknycampos@gmail.com', 'Respondemos en 24 horas', 'Mail', 1
WHERE (SELECT COUNT(*) FROM contact_info) = 1;

INSERT INTO contact_info (label, value, detail, icon_name, order_index)
SELECT 'Ubicacion', 'Ocana, Norte de Santander', 'Colombia', 'MapPin', 2
WHERE (SELECT COUNT(*) FROM contact_info) = 2;

INSERT INTO contact_info (label, value, detail, icon_name, order_index)
SELECT 'Horario de atencion', 'Lunes - Viernes', '8:00 AM - 6:00 PM', 'Clock', 3
WHERE (SELECT COUNT(*) FROM contact_info) = 3;

-- ------------------------------------------------------------------
-- Tabla: contact_messages
-- Reemplazara a la tabla existente 'contactos'
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    asunto        TEXT        NOT NULL,
    mensaje       TEXT        NOT NULL,
    read          BOOLEAN     NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_contact_messages_created_at;
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

DROP INDEX IF EXISTS idx_contact_messages_read;
CREATE INDEX idx_contact_messages_read ON contact_messages(read);
