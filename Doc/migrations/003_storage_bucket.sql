-- ============================================
-- FASHIONSTORE - STORAGE BUCKET
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- ============================================
-- POLÍTICAS DEL BUCKET
-- ============================================

-- Lectura pública de imágenes
CREATE POLICY "Product images: Public read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- Subida solo para usuarios autenticados (admin)
CREATE POLICY "Product images: Admin upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Actualización solo para admin
CREATE POLICY "Product images: Admin update" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Eliminación solo para admin
CREATE POLICY "Product images: Admin delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
