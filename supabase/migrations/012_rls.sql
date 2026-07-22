-- ============================================================
-- Migration 012: RLS Policies + Rate Limit + Honeypot
-- ============================================================
-- Objetivo: Activar RLS en todas las tablas, crear politicas
--           restrictivas + proteccion contra spam
-- Dependencias: 002-009 (tablas existen), 010 (is_admin)
-- Idempotente: SI (DROP POLICY IF EXISTS, ALTER TABLE IF NOT EXISTS)
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- 1. Activar RLS en todas las tablas del schema public
-- ------------------------------------------------------------------
ALTER TABLE IF EXISTS services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS entities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS experience_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trainings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS benefits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hero_stats           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS about_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS why_choose_us        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_info         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_links         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_profiles       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. POLITICAS DE LECTURA PUBLICA (solo contenido visible)
-- ============================================================

-- Content tables: solo registros activos
DROP POLICY IF EXISTS public_read_services ON services;
CREATE POLICY public_read_services ON services
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_entities ON entities;
CREATE POLICY public_read_entities ON entities
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_experience_items ON experience_items;
CREATE POLICY public_read_experience_items ON experience_items
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_news ON news;
CREATE POLICY public_read_news ON news
    FOR SELECT USING (active = true AND published_at IS NOT NULL);

DROP POLICY IF EXISTS public_read_trainings ON trainings;
CREATE POLICY public_read_trainings ON trainings
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_jobs ON jobs;
CREATE POLICY public_read_jobs ON jobs
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_benefits ON benefits;
CREATE POLICY public_read_benefits ON benefits
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_hero_stats ON hero_stats;
CREATE POLICY public_read_hero_stats ON hero_stats
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_about_sections ON about_sections;
CREATE POLICY public_read_about_sections ON about_sections
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_why_choose_us ON why_choose_us;
CREATE POLICY public_read_why_choose_us ON why_choose_us
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_contact_info ON contact_info;
CREATE POLICY public_read_contact_info ON contact_info
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS public_read_social_links ON social_links;
CREATE POLICY public_read_social_links ON social_links
    FOR SELECT USING (active = true);

-- site_config: siempre visible (datos publicos)
DROP POLICY IF EXISTS public_read_site_config ON site_config;
CREATE POLICY public_read_site_config ON site_config
    FOR SELECT USING (true);

-- ============================================================
-- 3. POLITICAS DE ADMINISTRACION (INSERT, UPDATE, DELETE)
-- ============================================================

-- Generadas mediante macro mental para cada tabla de contenido:
--   admin_insert_{table}, admin_update_{table}, admin_delete_{table}
--   todas usan is_admin() como unico filtro

-- services ---
DROP POLICY IF EXISTS admin_insert_services ON services;
CREATE POLICY admin_insert_services ON services
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_services ON services;
CREATE POLICY admin_update_services ON services
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_services ON services;
CREATE POLICY admin_delete_services ON services
    FOR DELETE USING (is_admin());

-- entities ---
DROP POLICY IF EXISTS admin_insert_entities ON entities;
CREATE POLICY admin_insert_entities ON entities
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_entities ON entities;
CREATE POLICY admin_update_entities ON entities
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_entities ON entities;
CREATE POLICY admin_delete_entities ON entities
    FOR DELETE USING (is_admin());

-- experience_items ---
DROP POLICY IF EXISTS admin_insert_experience_items ON experience_items;
CREATE POLICY admin_insert_experience_items ON experience_items
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_experience_items ON experience_items;
CREATE POLICY admin_update_experience_items ON experience_items
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_experience_items ON experience_items;
CREATE POLICY admin_delete_experience_items ON experience_items
    FOR DELETE USING (is_admin());

-- news ---
DROP POLICY IF EXISTS admin_insert_news ON news;
CREATE POLICY admin_insert_news ON news
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_news ON news;
CREATE POLICY admin_update_news ON news
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_news ON news;
CREATE POLICY admin_delete_news ON news
    FOR DELETE USING (is_admin());

-- trainings ---
DROP POLICY IF EXISTS admin_insert_trainings ON trainings;
CREATE POLICY admin_insert_trainings ON trainings
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_trainings ON trainings;
CREATE POLICY admin_update_trainings ON trainings
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_trainings ON trainings;
CREATE POLICY admin_delete_trainings ON trainings
    FOR DELETE USING (is_admin());

-- jobs ---
DROP POLICY IF EXISTS admin_insert_jobs ON jobs;
CREATE POLICY admin_insert_jobs ON jobs
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_jobs ON jobs;
CREATE POLICY admin_update_jobs ON jobs
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_jobs ON jobs;
CREATE POLICY admin_delete_jobs ON jobs
    FOR DELETE USING (is_admin());

-- benefits ---
DROP POLICY IF EXISTS admin_insert_benefits ON benefits;
CREATE POLICY admin_insert_benefits ON benefits
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_benefits ON benefits;
CREATE POLICY admin_update_benefits ON benefits
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_benefits ON benefits;
CREATE POLICY admin_delete_benefits ON benefits
    FOR DELETE USING (is_admin());

-- hero_stats ---
DROP POLICY IF EXISTS admin_insert_hero_stats ON hero_stats;
CREATE POLICY admin_insert_hero_stats ON hero_stats
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_hero_stats ON hero_stats;
CREATE POLICY admin_update_hero_stats ON hero_stats
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_hero_stats ON hero_stats;
CREATE POLICY admin_delete_hero_stats ON hero_stats
    FOR DELETE USING (is_admin());

-- about_sections ---
DROP POLICY IF EXISTS admin_insert_about_sections ON about_sections;
CREATE POLICY admin_insert_about_sections ON about_sections
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_about_sections ON about_sections;
CREATE POLICY admin_update_about_sections ON about_sections
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_about_sections ON about_sections;
CREATE POLICY admin_delete_about_sections ON about_sections
    FOR DELETE USING (is_admin());

-- why_choose_us ---
DROP POLICY IF EXISTS admin_insert_why_choose_us ON why_choose_us;
CREATE POLICY admin_insert_why_choose_us ON why_choose_us
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_why_choose_us ON why_choose_us;
CREATE POLICY admin_update_why_choose_us ON why_choose_us
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_why_choose_us ON why_choose_us;
CREATE POLICY admin_delete_why_choose_us ON why_choose_us
    FOR DELETE USING (is_admin());

-- contact_info ---
DROP POLICY IF EXISTS admin_insert_contact_info ON contact_info;
CREATE POLICY admin_insert_contact_info ON contact_info
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_contact_info ON contact_info;
CREATE POLICY admin_update_contact_info ON contact_info
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_contact_info ON contact_info;
CREATE POLICY admin_delete_contact_info ON contact_info
    FOR DELETE USING (is_admin());

-- social_links ---
DROP POLICY IF EXISTS admin_insert_social_links ON social_links;
CREATE POLICY admin_insert_social_links ON social_links
    FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_update_social_links ON social_links;
CREATE POLICY admin_update_social_links ON social_links
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS admin_delete_social_links ON social_links;
CREATE POLICY admin_delete_social_links ON social_links
    FOR DELETE USING (is_admin());

-- site_config ---
DROP POLICY IF EXISTS admin_update_site_config ON site_config;
CREATE POLICY admin_update_site_config ON site_config
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 4. POLITICAS PARA contact_messages Y job_applications
--    (SELECT solo admin, INSERT publico con restricciones)
-- ============================================================

-- contact_messages ---
DROP POLICY IF EXISTS admin_select_contact_messages ON contact_messages;
CREATE POLICY admin_select_contact_messages ON contact_messages
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS public_insert_contact_messages ON contact_messages;
CREATE POLICY public_insert_contact_messages ON contact_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS admin_update_contact_messages ON contact_messages;
CREATE POLICY admin_update_contact_messages ON contact_messages
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS admin_delete_contact_messages ON contact_messages;
CREATE POLICY admin_delete_contact_messages ON contact_messages
    FOR DELETE USING (is_admin());

-- job_applications ---
DROP POLICY IF EXISTS admin_select_job_applications ON job_applications;
CREATE POLICY admin_select_job_applications ON job_applications
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS public_insert_job_applications ON job_applications;
CREATE POLICY public_insert_job_applications ON job_applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS admin_update_job_applications ON job_applications;
CREATE POLICY admin_update_job_applications ON job_applications
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS admin_delete_job_applications ON job_applications;
CREATE POLICY admin_delete_job_applications ON job_applications
    FOR DELETE USING (is_admin());

-- ============================================================
-- 5. POLITICAS PARA admin_profiles (solo administradores)
-- ============================================================

DROP POLICY IF EXISTS admin_select_admin_profiles ON admin_profiles;
CREATE POLICY admin_select_admin_profiles ON admin_profiles
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS admin_insert_admin_profiles ON admin_profiles;
CREATE POLICY admin_insert_admin_profiles ON admin_profiles
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS admin_update_admin_profiles ON admin_profiles;
CREATE POLICY admin_update_admin_profiles ON admin_profiles
    FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS admin_delete_admin_profiles ON admin_profiles;
CREATE POLICY admin_delete_admin_profiles ON admin_profiles
    FOR DELETE USING (is_admin());

-- ============================================================
-- 6. COLUMNAS PARA PROTECCION CONTRA SPAM
-- ============================================================

-- Honeypot: campo oculto que los bots rellenan automaticamente
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS honeypot TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS honeypot TEXT;

-- Rate limit config en site_config (modificable via admin)
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS rate_limit_contact_seconds INT NOT NULL DEFAULT 60;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS rate_limit_application_seconds INT NOT NULL DEFAULT 60;

-- ============================================================
-- 7. TRIGGER FUNCTIONS: HONEYPOT + RATE LIMIT
-- ============================================================

-- Funcion para contact_messages
CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    limit_secs INT;
BEGIN
    -- Honeypot: si el campo oculto tiene valor, es un bot
    IF NEW.honeypot IS NOT NULL AND NEW.honeypot != '' THEN
        RAISE EXCEPTION 'honeypot_triggered'
        USING DETAIL = 'Solicitud rechazada por proteccion anti-spam.';
    END IF;
    NEW.honeypot = NULL;

    -- Rate limit por email
    SELECT rate_limit_contact_seconds INTO limit_secs
    FROM site_config WHERE id = 1;

    IF EXISTS (
        SELECT 1 FROM contact_messages
        WHERE email = NEW.email
        AND created_at > now() - (limit_secs * interval '1 second')
    ) THEN
        RAISE EXCEPTION 'rate_limit_exceeded'
        USING DETAIL = format('Demasiados envios. Espere %s segundos.', limit_secs);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcion para job_applications
CREATE OR REPLACE FUNCTION check_application_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    limit_secs INT;
BEGIN
    -- Honeypot
    IF NEW.honeypot IS NOT NULL AND NEW.honeypot != '' THEN
        RAISE EXCEPTION 'honeypot_triggered'
        USING DETAIL = 'Solicitud rechazada por proteccion anti-spam.';
    END IF;
    NEW.honeypot = NULL;

    -- Rate limit por email
    SELECT rate_limit_application_seconds INTO limit_secs
    FROM site_config WHERE id = 1;

    IF EXISTS (
        SELECT 1 FROM job_applications
        WHERE email = NEW.email
        AND created_at > now() - (limit_secs * interval '1 second')
    ) THEN
        RAISE EXCEPTION 'rate_limit_exceeded'
        USING DETAIL = format('Demasiados envios. Espere %s segundos.', limit_secs);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. ATTACH TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_contact_messages_rate_limit ON contact_messages;
CREATE TRIGGER trg_contact_messages_rate_limit
    BEFORE INSERT ON contact_messages FOR EACH ROW
    EXECUTE FUNCTION check_contact_rate_limit();

DROP TRIGGER IF EXISTS trg_job_applications_rate_limit ON job_applications;
CREATE TRIGGER trg_job_applications_rate_limit
    BEFORE INSERT ON job_applications FOR EACH ROW
    EXECUTE FUNCTION check_application_rate_limit();

-- ============================================================
-- 9. CHECK CONSTRAINTS ADICIONALES
-- ============================================================

-- Proteccion basica en campos de entrada publica
ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS ck_contact_messages_email_format;
ALTER TABLE contact_messages ADD CONSTRAINT ck_contact_messages_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS ck_contact_messages_mensaje_length;
ALTER TABLE contact_messages ADD CONSTRAINT ck_contact_messages_mensaje_length
    CHECK (char_length(mensaje) <= 5000);

ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS ck_contact_messages_nombre_length;
ALTER TABLE contact_messages ADD CONSTRAINT ck_contact_messages_nombre_length
    CHECK (char_length(nombre) <= 200);

ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS ck_job_applications_email_format;
ALTER TABLE job_applications ADD CONSTRAINT ck_job_applications_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS ck_job_applications_mensaje_length;
ALTER TABLE job_applications ADD CONSTRAINT ck_job_applications_mensaje_length
    CHECK (mensaje IS NULL OR char_length(mensaje) <= 5000);

ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS ck_job_applications_nombre_length;
ALTER TABLE job_applications ADD CONSTRAINT ck_job_applications_nombre_length
    CHECK (char_length(nombre) <= 200);
