-- ============================================================
-- Migration 011: Triggers de actualizacion automatica y auditoria
-- ============================================================
-- Objetivo: Crear funciones trigger y aplicarlas a todas las
--           tablas que lo requieran
-- Dependencias: 002-009 (todas las tablas existen)
-- Idempotente: SI (CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS)
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Funcion trigger: trigger_set_updated_at
-- Actualiza updated_at automaticamente en cada UPDATE
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------
-- Funcion trigger: trigger_set_created_by
-- Asigna auth.uid() como created_by en INSERT (solo si es admin)
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------
-- Funcion trigger: trigger_set_updated_by
-- Asigna auth.uid() como updated_by en UPDATE (solo si es admin)
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------
-- Aplicacion de triggers por tabla
-- Tablas con updated_at + created_by + updated_by:
--   services, entities, news, trainings, jobs
-- Tablas con updated_at unicamente:
--   experience_items, benefits, job_applications, contact_info,
--   contact_messages, about_sections, social_links, site_config,
--   hero_stats, why_choose_us
-- ------------------------------------------------------------------

-- services ---
DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
DROP TRIGGER IF EXISTS trg_services_created_by ON services;
CREATE TRIGGER trg_services_created_by
    BEFORE INSERT ON services FOR EACH ROW
    EXECUTE FUNCTION trigger_set_created_by();
DROP TRIGGER IF EXISTS trg_services_updated_by ON services;
CREATE TRIGGER trg_services_updated_by
    BEFORE UPDATE ON services FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_by();

-- entities ---
DROP TRIGGER IF EXISTS trg_entities_updated_at ON entities;
CREATE TRIGGER trg_entities_updated_at
    BEFORE UPDATE ON entities FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
DROP TRIGGER IF EXISTS trg_entities_created_by ON entities;
CREATE TRIGGER trg_entities_created_by
    BEFORE INSERT ON entities FOR EACH ROW
    EXECUTE FUNCTION trigger_set_created_by();
DROP TRIGGER IF EXISTS trg_entities_updated_by ON entities;
CREATE TRIGGER trg_entities_updated_by
    BEFORE UPDATE ON entities FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_by();

-- news ---
DROP TRIGGER IF EXISTS trg_news_updated_at ON news;
CREATE TRIGGER trg_news_updated_at
    BEFORE UPDATE ON news FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
DROP TRIGGER IF EXISTS trg_news_created_by ON news;
CREATE TRIGGER trg_news_created_by
    BEFORE INSERT ON news FOR EACH ROW
    EXECUTE FUNCTION trigger_set_created_by();
DROP TRIGGER IF EXISTS trg_news_updated_by ON news;
CREATE TRIGGER trg_news_updated_by
    BEFORE UPDATE ON news FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_by();

-- trainings ---
DROP TRIGGER IF EXISTS trg_trainings_updated_at ON trainings;
CREATE TRIGGER trg_trainings_updated_at
    BEFORE UPDATE ON trainings FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
DROP TRIGGER IF EXISTS trg_trainings_created_by ON trainings;
CREATE TRIGGER trg_trainings_created_by
    BEFORE INSERT ON trainings FOR EACH ROW
    EXECUTE FUNCTION trigger_set_created_by();
DROP TRIGGER IF EXISTS trg_trainings_updated_by ON trainings;
CREATE TRIGGER trg_trainings_updated_by
    BEFORE UPDATE ON trainings FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_by();

-- jobs ---
DROP TRIGGER IF EXISTS trg_jobs_updated_at ON jobs;
CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
DROP TRIGGER IF EXISTS trg_jobs_created_by ON jobs;
CREATE TRIGGER trg_jobs_created_by
    BEFORE INSERT ON jobs FOR EACH ROW
    EXECUTE FUNCTION trigger_set_created_by();
DROP TRIGGER IF EXISTS trg_jobs_updated_by ON jobs;
CREATE TRIGGER trg_jobs_updated_by
    BEFORE UPDATE ON jobs FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_by();

-- experience_items ---
DROP TRIGGER IF EXISTS trg_experience_items_updated_at ON experience_items;
CREATE TRIGGER trg_experience_items_updated_at
    BEFORE UPDATE ON experience_items FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- benefits ---
DROP TRIGGER IF EXISTS trg_benefits_updated_at ON benefits;
CREATE TRIGGER trg_benefits_updated_at
    BEFORE UPDATE ON benefits FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- job_applications ---
DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON job_applications;
CREATE TRIGGER trg_job_applications_updated_at
    BEFORE UPDATE ON job_applications FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- contact_info ---
DROP TRIGGER IF EXISTS trg_contact_info_updated_at ON contact_info;
CREATE TRIGGER trg_contact_info_updated_at
    BEFORE UPDATE ON contact_info FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- contact_messages ---
DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- about_sections ---
DROP TRIGGER IF EXISTS trg_about_sections_updated_at ON about_sections;
CREATE TRIGGER trg_about_sections_updated_at
    BEFORE UPDATE ON about_sections FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- social_links ---
DROP TRIGGER IF EXISTS trg_social_links_updated_at ON social_links;
CREATE TRIGGER trg_social_links_updated_at
    BEFORE UPDATE ON social_links FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- site_config ---
DROP TRIGGER IF EXISTS trg_site_config_updated_at ON site_config;
CREATE TRIGGER trg_site_config_updated_at
    BEFORE UPDATE ON site_config FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- hero_stats ---
DROP TRIGGER IF EXISTS trg_hero_stats_updated_at ON hero_stats;
CREATE TRIGGER trg_hero_stats_updated_at
    BEFORE UPDATE ON hero_stats FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- why_choose_us ---
DROP TRIGGER IF EXISTS trg_why_choose_us_updated_at ON why_choose_us;
CREATE TRIGGER trg_why_choose_us_updated_at
    BEFORE UPDATE ON why_choose_us FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
