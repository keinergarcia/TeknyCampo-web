-- ============================================================
-- Migration 013: Storage Policies (images + documents)
-- ============================================================
-- Objetivo: Proteger buckets de Storage con RLS
-- Dependencias: Buckets images + documents existentes
-- Idempotente: SI
-- Elimina datos existentes: NO
-- ============================================================

-- ------------------------------------------------------------------
-- Nota: RLS en storage.objects ya esta activo por defecto en Supabase.
-- No se ejecuta ALTER TABLE porque requiere ownership del schema storage.
-- ------------------------------------------------------------------
-- Eliminar politicas por defecto creadas automaticamente
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "Give users access to own folder 1l4qnj" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1x7f6i" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- ============================================================
-- BUCKET images (publico: lectura publica, escritura admin)
-- ============================================================

DROP POLICY IF EXISTS public_read_images ON storage.objects;
CREATE POLICY public_read_images ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');

DROP POLICY IF EXISTS admin_insert_images ON storage.objects;
CREATE POLICY admin_insert_images ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'images' AND is_admin());

DROP POLICY IF EXISTS admin_update_images ON storage.objects;
CREATE POLICY admin_update_images ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'images' AND is_admin())
    WITH CHECK (bucket_id = 'images' AND is_admin());

DROP POLICY IF EXISTS admin_delete_images ON storage.objects;
CREATE POLICY admin_delete_images ON storage.objects
    FOR DELETE
    USING (bucket_id = 'images' AND is_admin());

-- ============================================================
-- BUCKET documents (privado: solo admin)
-- ============================================================

DROP POLICY IF EXISTS admin_select_documents ON storage.objects;
CREATE POLICY admin_select_documents ON storage.objects
    FOR SELECT
    USING (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS admin_insert_documents ON storage.objects;
CREATE POLICY admin_insert_documents ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS admin_update_documents ON storage.objects;
CREATE POLICY admin_update_documents ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'documents' AND is_admin())
    WITH CHECK (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS admin_delete_documents ON storage.objects;
CREATE POLICY admin_delete_documents ON storage.objects
    FOR DELETE
    USING (bucket_id = 'documents' AND is_admin());
