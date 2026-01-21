-- ============================================
-- MIGRACIÓN: Añadir campos de metadata a categorías
-- Fecha: 21 de Enero 2026
-- Descripción: Añade campos para mejorar la experiencia visual de categorías sin imágenes
-- ============================================

-- Añadir campos de metadata a categorías
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'tag',
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default';

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Comentarios para documentación
COMMENT ON COLUMN categories.featured IS 'Indica si la categoría debe destacarse en la página principal';
COMMENT ON COLUMN categories.display_order IS 'Orden de visualización (menor número = mayor prioridad)';
COMMENT ON COLUMN categories.description IS 'Descripción breve de la categoría para mostrar en tarjetas';
COMMENT ON COLUMN categories.icon_name IS 'Nombre del icono de Lucide React a usar (ej: shirt, footprints, watch)';
COMMENT ON COLUMN categories.color_theme IS 'Tema de color para gradientes (default, blue, green, purple, orange, red, pink)';

-- Actualizar categorías existentes con valores por defecto inteligentes
UPDATE categories 
SET 
  display_order = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 1
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 2
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 3
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 4
    ELSE 5
  END,
  icon_name = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'shirt'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'pants'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'footprints'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'watch'
    WHEN LOWER(name) LIKE '%mujer%' OR LOWER(name) LIKE '%woman%' THEN 'user'
    WHEN LOWER(name) LIKE '%hombre%' OR LOWER(name) LIKE '%man%' THEN 'user-check'
    WHEN LOWER(name) LIKE '%niño%' OR LOWER(name) LIKE '%kid%' OR LOWER(name) LIKE '%child%' THEN 'baby'
    ELSE 'tag'
  END,
  color_theme = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'blue'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'purple'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'orange'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'green'
    WHEN LOWER(name) LIKE '%mujer%' OR LOWER(name) LIKE '%woman%' THEN 'pink'
    WHEN LOWER(name) LIKE '%hombre%' OR LOWER(name) LIKE '%man%' THEN 'blue'
    WHEN LOWER(name) LIKE '%niño%' OR LOWER(name) LIKE '%kid%' OR LOWER(name) LIKE '%child%' THEN 'yellow'
    ELSE 'default'
  END,
  description = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'Encuentra tu estilo perfecto'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'Comodidad y estilo'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'Pisa con confianza'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'Completa tu look'
    ELSE 'Descubre nuestra colección'
  END
WHERE featured IS NULL OR display_order IS NULL OR icon_name IS NULL OR color_theme IS NULL;

-- Marcar las primeras 3 categorías como destacadas
UPDATE categories 
SET featured = TRUE 
WHERE id IN (
  SELECT id 
  FROM categories 
  ORDER BY display_order ASC, name ASC 
  LIMIT 3
);

-- Verificar los cambios
SELECT 
  name, 
  featured, 
  display_order, 
  icon_name, 
  color_theme, 
  description 
FROM categories 
ORDER BY display_order ASC, name ASC;