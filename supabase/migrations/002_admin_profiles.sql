-- ============================================================
-- Migration 002: Administradores y control de acceso
-- ============================================================
-- Objetivo: Tabla de perfiles admin + funcion is_admin()
-- Dependencias: 001_extensions.sql
-- Idempotente: SI (CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION)
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Tabla: admin_profiles
-- Relacion 1:1 con auth.users de Supabase Auth
-- ON DELETE CASCADE: si se elimina el usuario auth, se elimina su perfil
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Funcion: is_admin()
-- Verifica si el usuario autenticado pertenece a admin_profiles
-- SECURITY DEFINER: se ejecuta con permisos del creador (postgres)
--   para poder leer admin_profiles incluso con RLS activa
-- STABLE: permite optimizacion en planes de ejecucion
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    );
$$;

-- Nota: Las politicas RLS se implementaran en Sprint 3 (Seguridad).
-- La funcion is_admin() se crea ahora para que este disponible
-- cuando se activen las politicas.
