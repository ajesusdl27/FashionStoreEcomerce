-- ============================================
-- FASHIONSTORE - Añadir tipo de talla a categorías
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Añadir columna size_type a categories
ALTER TABLE categories 
ADD COLUMN size_type TEXT DEFAULT 'clothing' 
CHECK (size_type IN ('clothing', 'footwear', 'universal'));

-- Comentario para documentación
COMMENT ON COLUMN categories.size_type IS 'Tipo de talla: clothing (XXS-XXL), footwear (36-46), universal (Única)';

-- Actualizar categorías existentes según su nombre
-- (Ajusta estos UPDATEs según tus categorías reales)
UPDATE categories SET size_type = 'footwear' WHERE slug ILIKE '%zapatilla%' OR slug ILIKE '%zapato%' OR slug ILIKE '%bota%';
UPDATE categories SET size_type = 'universal' WHERE slug ILIKE '%accesorio%' OR slug ILIKE '%gorra%' OR slug ILIKE '%gafa%' OR slug ILIKE '%reloj%' OR slug ILIKE '%bolso%';
