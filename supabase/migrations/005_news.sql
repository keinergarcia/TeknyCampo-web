-- ============================================================
-- Migration 005: Modulo Noticias
-- ============================================================
-- Objetivo: Tabla de noticias + seed data
-- Dependencias: 002_admin_profiles.sql (FK created_by, updated_by)
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: news
-- Sustituye a src/data/news.ts
-- image_url almacena ruta relativa: news/{id}/{filename}
-- slug se genera automaticamente en el frontend
-- published_at NULL = borrador
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT        NOT NULL,
    slug          TEXT        NOT NULL UNIQUE,
    excerpt       TEXT        NOT NULL,
    content       TEXT        NOT NULL,
    category      TEXT        NOT NULL,
    author        TEXT        NOT NULL,
    image_url     TEXT,                    -- Ruta relativa: news/{id}/{filename}
    featured      BOOLEAN     NOT NULL DEFAULT false,
    published_at  TIMESTAMPTZ,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    updated_by    UUID        REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Indices
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS idx_news_active_published;
CREATE INDEX idx_news_active_published ON news(active, published_at DESC)
    WHERE active = true AND published_at IS NOT NULL;

DROP INDEX IF EXISTS idx_news_created_at;
CREATE INDEX idx_news_created_at ON news(created_at DESC);

DROP INDEX IF EXISTS idx_news_slug;
CREATE INDEX idx_news_slug ON news(slug);

-- ------------------------------------------------------------------
-- Seed data (solo si la tabla esta vacia)
-- Las imagenes locales (SVGs) se migraran a Storage en un Sprint posterior
-- Por ahora image_url se deja como NULL
-- ------------------------------------------------------------------
INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Tekny Campo participa en proyectos de desarrollo rural en el Catatumbo',
    'tekny-campo-participa-en-proyectos-de-desarrollo-rural-en-el-catatumbo',
    'Nuestro equipo continua trabajando junto a asociaciones y entidades publicas en proyectos que fortalecen la productividad agricola de la region del Catatumbo.',
    'Tekny Campo Soluciones Agropecuarias ha venido desarrollando importantes proyectos de acompanamiento tecnico y suministro de insumos en la region del Catatumbo, trabajando de la mano con asociaciones de productores y entidades gubernamentales para fortalecer el desarrollo rural sostenible.',
    'Proyectos', 'Equipo Tekny Campo', true, '2026-06-15 00:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM news LIMIT 1);

INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Importancia de la capacitacion tecnica en el sector agropecuario',
    'importancia-de-la-capacitacion-tecnica-en-el-sector-agropecuario',
    'En Tekny Campo promovemos la formacion tecnica de productores rurales como herramienta clave para mejorar la productividad y sostenibilidad del campo.',
    'La capacitacion tecnica es fundamental para el desarrollo del sector agropecuario. En Tekny Campo ofrecemos programas de formacion y acompanamiento que permiten a los productores adquirir conocimientos actualizados sobre buenas practicas agricolas, manejo de cultivos y nutricion animal.',
    'Capacitacion', 'Comunicaciones Tekny', false, '2026-06-10 00:00:00+00'
WHERE (SELECT COUNT(*) FROM news) = 1;

INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Sistemas de riego eficiente para pequenos y medianos productores',
    'sistemas-de-riego-eficiente-para-pequenos-y-medianos-productores',
    'Conoce las soluciones de riego que ofrecemos para optimizar el uso del agua y mejorar los rendimientos en cultivos de la region.',
    'El acceso a sistemas de riego eficiente es clave para mejorar la productividad agricola. En Tekny Campo ofrecemos soluciones adaptadas a las necesidades de pequenos y medianos productores, contribuyendo al uso responsable del agua y al aumento de los rendimientos.',
    'Tecnologia', 'Equipo Tecnico Tekny', false, '2026-06-05 00:00:00+00'
WHERE (SELECT COUNT(*) FROM news) = 2;

INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Tekny Campo y su compromiso con el desarrollo rural en Ocana',
    'tekny-campo-y-su-compromiso-con-el-desarrollo-rural-en-ocana',
    'Desde Ocana, Norte de Santander, seguimos trabajando por el fortalecimiento del sector agropecuario regional.',
    'Con sede en Ocana, Norte de Santander, Tekny Campo reafirma su compromiso con el desarrollo del sector agropecuario regional, brindando soluciones integrales y acompanamiento tecnico a productores y comunidades rurales.',
    'Regional', 'Equipo Tekny Campo', false, '2026-06-01 00:00:00+00'
WHERE (SELECT COUNT(*) FROM news) = 3;

INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Alianza estrategica con asociaciones de productores del Catatumbo',
    'alianza-estrategica-con-asociaciones-de-productores-del-catatumbo',
    'Fortalecimiento de alianzas con asociaciones como APRASEF para impulsar el desarrollo agropecuario en la region.',
    'Tekny Campo ha establecido importantes alianzas con asociaciones de productores como APRASEF (Asociacion de Productores Agropecuarios Semillas del Futuro), contribuyendo al fortalecimiento tecnico y productivo de sus asociados mediante suministro de insumos y acompanamiento especializado.',
    'Alianzas', 'Direccion Comercial', false, '2026-05-28 00:00:00+00'
WHERE (SELECT COUNT(*) FROM news) = 4;

INSERT INTO news (title, slug, excerpt, content, category, author, featured, published_at)
SELECT
    'Beneficios de la nutricion animal en la produccion ganadera',
    'beneficios-de-la-nutricion-animal-en-la-produccion-ganadera',
    'Conoce las mejores practicas en alimentacion y suplementacion animal para mejorar la productividad de tu ganado.',
    'Una adecuada nutricion animal es esencial para garantizar la salud del ganado y la calidad de los productos derivados. En Tekny Campo ofrecemos soluciones en alimentacion, suplementacion y manejo sanitario para maximizar la produccion.',
    'Educacion', 'Equipo Tecnico', false, '2026-05-20 00:00:00+00'
WHERE (SELECT COUNT(*) FROM news) = 5;
