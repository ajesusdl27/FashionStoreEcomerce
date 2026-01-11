-- ============================================
-- FASHIONSTORE - POLÍTICAS DE SEGURIDAD (RLS)
-- Ejecutar DESPUÉS de 001_create_tables.sql
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORÍAS
-- ============================================
-- Lectura pública
CREATE POLICY "Categories: Public read" 
  ON categories FOR SELECT 
  USING (true);

-- Escritura solo admin (usuarios autenticados)
CREATE POLICY "Categories: Admin write" 
  ON categories FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- PRODUCTOS
-- ============================================
-- Lectura pública (solo productos activos)
CREATE POLICY "Products: Public read active" 
  ON products FOR SELECT 
  USING (active = true);

-- Admin puede ver y modificar todos
CREATE POLICY "Products: Admin full access" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- VARIANTES
-- ============================================
-- Lectura pública
CREATE POLICY "Variants: Public read" 
  ON product_variants FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Variants: Admin write" 
  ON product_variants FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- IMÁGENES
-- ============================================
-- Lectura pública
CREATE POLICY "Images: Public read" 
  ON product_images FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Images: Admin write" 
  ON product_images FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- PEDIDOS
-- ============================================
-- Inserción pública (guest checkout)
CREATE POLICY "Orders: Public insert" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Lectura solo admin
CREATE POLICY "Orders: Admin read" 
  ON orders FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Actualización solo admin
CREATE POLICY "Orders: Admin update" 
  ON orders FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- ============================================
-- ITEMS DE PEDIDO
-- ============================================
-- Inserción pública con pedido
CREATE POLICY "Order items: Public insert" 
  ON order_items FOR INSERT 
  WITH CHECK (true);

-- Lectura solo admin
CREATE POLICY "Order items: Admin read" 
  ON order_items FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- CONFIGURACIÓN
-- ============================================
-- Lectura pública
CREATE POLICY "Settings: Public read" 
  ON settings FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Settings: Admin write" 
  ON settings FOR ALL 
  USING (auth.role() = 'authenticated');
