    -- ============================================
    -- FASHIONSTORE - STORAGE BUCKET FOR DOCUMENTS
    -- Migración 025: Crear bucket 'documents'
    -- ============================================

    -- Crear bucket para documentos (facturas, pdfs)
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('documents', 'documents', true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- POLÍTICAS DEL BUCKET
    -- ============================================

    -- Lectura pública (para descargar facturas)
    CREATE POLICY "Documents: Public read" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'documents');

    -- Subida para usuarios autenticados (para generar sus facturas)
    -- Nota: En producción idealmente solo el Service Role subiría esto,
    -- pero dado que la llamada API actúa como el usuario, permitimos auth.
    CREATE POLICY "Documents: Authenticated upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

    -- Actualización solo para admin
    CREATE POLICY "Documents: Admin update" 
    ON storage.objects FOR UPDATE 
    USING (
        bucket_id = 'documents' 
        AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

    -- Eliminación solo para admin
    CREATE POLICY "Documents: Admin delete" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'documents' 
        AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );
