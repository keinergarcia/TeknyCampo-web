-- ============================================================
-- Migration 010: Funciones de base de datos
-- ============================================================
-- Objetivo: Funcion compuesta get_homepage_data() para reducir
--           N+1 queries a 1 sola llamada
-- Dependencias: 002_admin_profiles.sql (is_admin, usado implicitamente),
--               003-009 (todas las tablas existen)
-- Idempotente: SI (CREATE OR REPLACE FUNCTION)
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Funcion: get_homepage_data()
-- Devuelve todo el contenido necesario para la homepage en una
-- sola respuesta JSON. PostgreSQL ejecuta las subconsultas como
-- seq scans con filtros optimizados por los indices en active.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_homepage_data()
RETURNS JSON
LANGUAGE sql STABLE
AS $$
    SELECT json_build_object(
        'services',      (SELECT json_agg(s ORDER BY s.order_index) FROM services s WHERE s.active),
        'entities',      (SELECT json_agg(e ORDER BY e.order_index) FROM entities e WHERE e.active),
        'experience',    (SELECT json_agg(ei ORDER BY ei.order_index) FROM experience_items ei WHERE ei.active),
        'news',          (SELECT json_agg(sub) FROM (SELECT * FROM news n WHERE n.active AND n.published_at IS NOT NULL ORDER BY n.published_at DESC LIMIT 3) sub),
        'hero_stats',    (SELECT json_agg(h ORDER BY h.order_index) FROM hero_stats h WHERE h.active),
        'about_sections',(SELECT json_agg(a ORDER BY a.order_index) FROM about_sections a WHERE a.active),
        'why_choose_us', (SELECT json_agg(w ORDER BY w.order_index) FROM why_choose_us w WHERE w.active),
        'contact_info',  (SELECT json_agg(c ORDER BY c.order_index) FROM contact_info c WHERE c.active),
        'social_links',  (SELECT json_agg(sl) FROM social_links sl WHERE sl.active)
    );
$$;
