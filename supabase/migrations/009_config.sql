-- ============================================================
-- Migration 009: Modulo Configuracion General
-- ============================================================
-- Objetivo: Tablas de configuracion del sitio
-- Dependencias: Ninguna
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: hero_stats
-- Sustituye datos hardcodeados en Hero.tsx
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hero_stats (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    value         TEXT        NOT NULL,
    label         TEXT        NOT NULL,
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO hero_stats (value, label, order_index)
SELECT '10+', 'Anos de experiencia', 0
WHERE NOT EXISTS (SELECT 1 FROM hero_stats LIMIT 1);

INSERT INTO hero_stats (value, label, order_index)
SELECT '200+', 'Proyectos ejecutados', 1
WHERE (SELECT COUNT(*) FROM hero_stats) = 1;

INSERT INTO hero_stats (value, label, order_index)
SELECT '100+', 'Clientes satisfechos', 2
WHERE (SELECT COUNT(*) FROM hero_stats) = 2;

-- ------------------------------------------------------------------
-- Tabla: about_sections
-- Sustituye contenido de About.tsx
-- section_key debe ser uno de: historia, mision, vision, objetivos, valores
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS about_sections (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key   TEXT        NOT NULL UNIQUE,
    title         TEXT        NOT NULL,
    content       TEXT        NOT NULL,
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE about_sections DROP CONSTRAINT IF EXISTS ck_about_sections_section_key;
ALTER TABLE about_sections ADD CONSTRAINT ck_about_sections_section_key
    CHECK (section_key IN ('historia', 'mision', 'vision', 'objetivos', 'valores'));

INSERT INTO about_sections (section_key, title, content, order_index)
SELECT 'historia', 'Historia',
       E'Tekny Campo Soluciones Agropecuarias nacio con el proposito de apoyar el desarrollo del sector agropecuario colombiano mediante soluciones innovadoras y acompanamiento tecnico especializado.\n\nDesde sus inicios, la empresa ha trabajado junto a productores, asociaciones, entidades publicas y organizaciones rurales, ofreciendo insumos, capacitacion y asesoria para mejorar la productividad y sostenibilidad del campo.\n\nA lo largo de su trayectoria, Tekny Campo ha participado en proyectos agropecuarios que han contribuido al fortalecimiento de comunidades rurales y al crecimiento del sector agricola y ganadero en la region.',
       0
WHERE NOT EXISTS (SELECT 1 FROM about_sections LIMIT 1);

INSERT INTO about_sections (section_key, title, content, order_index)
SELECT 'mision', 'Mision',
       'Somos una empresa comprometida con el desarrollo del sector agropecuario, dedicada a brindar soluciones tecnologicas, suministro de insumos, capacitacion y acompanamiento tecnico, orientados a mejorar la productividad, sostenibilidad y competitividad del campo colombiano, promoviendo el crecimiento integral de productores y comunidades rurales.',
       1
WHERE (SELECT COUNT(*) FROM about_sections) = 1;

INSERT INTO about_sections (section_key, title, content, order_index)
SELECT 'vision', 'Vision',
       'Ser una empresa lider y reconocida en el sector agropecuario colombiano por brindar soluciones innovadoras, sostenibles y de alta calidad, contribuyendo al desarrollo productivo del campo, al fortalecimiento de las comunidades rurales y a la transformacion tecnologica del sector agropecuario.',
       2
WHERE (SELECT COUNT(*) FROM about_sections) = 2;

INSERT INTO about_sections (section_key, title, content, order_index)
SELECT 'objetivos', 'Objetivo General',
       'Impulsar el desarrollo sostenible y productivo del sector agropecuario colombiano mediante soluciones integrales, asistencia tecnica, capacitacion y suministro de insumos de alta calidad.',
       3
WHERE (SELECT COUNT(*) FROM about_sections) = 3;

INSERT INTO about_sections (section_key, title, content, order_index)
SELECT 'valores', 'Valores Corporativos',
       E'Compromiso: Dedicacion total con el campo colombiano.\nResponsabilidad: Cumplimiento y seriedad en cada proyecto.\nInnovacion: Busqueda constante de nuevas soluciones.\nCalidad: Excelencia en productos y servicios.\nServicio al cliente: Atencion personalizada y cercana.\nAmor por el campo: Pasion por el desarrollo rural.',
       4
WHERE (SELECT COUNT(*) FROM about_sections) = 4;

-- ------------------------------------------------------------------
-- Tabla: why_choose_us
-- Sustituye datos de About.tsx (seccion "Por que elegirnos")
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS why_choose_us (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    icon_name     TEXT        NOT NULL DEFAULT 'Award',
    title         TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    order_index   INT         NOT NULL DEFAULT 0,
    active        BOOLEAN     NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO why_choose_us (icon_name, title, description, order_index)
SELECT 'Award', 'Experiencia Comprobada', 'Proyectos ejecutados con exito', 0
WHERE NOT EXISTS (SELECT 1 FROM why_choose_us LIMIT 1);

INSERT INTO why_choose_us (icon_name, title, description, order_index)
SELECT 'Users', 'Acompanamiento Tecnico', 'Asesoria especializada permanente', 1
WHERE (SELECT COUNT(*) FROM why_choose_us) = 1;

INSERT INTO why_choose_us (icon_name, title, description, order_index)
SELECT 'TrendingUp', 'Soluciones Integrales', 'Todo para tu produccion', 2
WHERE (SELECT COUNT(*) FROM why_choose_us) = 2;

INSERT INTO why_choose_us (icon_name, title, description, order_index)
SELECT 'Heart', 'Compromiso Rural', 'Pasion por el campo colombiano', 3
WHERE (SELECT COUNT(*) FROM why_choose_us) = 3;

-- ------------------------------------------------------------------
-- Tabla: social_links
-- Sustituye datos hardcodeados en Contact.tsx y Footer.tsx
-- Los valores iniciales son placeholder (#) hasta que el admin configure las URLs
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_links (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    platform      TEXT        NOT NULL UNIQUE,
    url           TEXT        NOT NULL DEFAULT '#',
    active        BOOLEAN     NOT NULL DEFAULT true,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE social_links DROP CONSTRAINT IF EXISTS ck_social_links_platform;
ALTER TABLE social_links ADD CONSTRAINT ck_social_links_platform
    CHECK (platform IN ('facebook', 'instagram', 'linkedin'));

INSERT INTO social_links (platform, url, active)
SELECT 'facebook', '#', false
WHERE NOT EXISTS (SELECT 1 FROM social_links LIMIT 1);

INSERT INTO social_links (platform, url, active)
SELECT 'instagram', '#', false
WHERE (SELECT COUNT(*) FROM social_links) = 1;

INSERT INTO social_links (platform, url, active)
SELECT 'linkedin', '#', false
WHERE (SELECT COUNT(*) FROM social_links) = 2;

-- ------------------------------------------------------------------
-- Tabla: site_config (Singleton)
-- Una unica fila con configuracion global del sitio
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_config (
    id              INT         PRIMARY KEY DEFAULT 1,
    site_name       TEXT        NOT NULL DEFAULT 'Tekny Campo',
    tagline         TEXT        NOT NULL DEFAULT 'Tecnologia al servicio del campo',
    description     TEXT,
    canonical_url   TEXT,
    email           TEXT        NOT NULL DEFAULT 'Teknycampos@gmail.com',
    phone           TEXT        NOT NULL DEFAULT '311 549 9784',
    address         TEXT        NOT NULL DEFAULT 'Ocana, Norte de Santander, Colombia',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
