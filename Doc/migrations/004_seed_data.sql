-- ============================================
-- FASHIONSTORE - DATOS DE PRUEBA (SEED)
-- Ejecutar DESPUÉS de todas las migraciones
-- ============================================

-- ============================================
-- CATEGORÍAS
-- ============================================
INSERT INTO categories (name, slug) VALUES
  ('Zapatillas', 'zapatillas'),
  ('Camisetas', 'camisetas'),
  ('Pantalones', 'pantalones'),
  ('Sudaderas', 'sudaderas'),
  ('Accesorios', 'accesorios');

-- ============================================
-- PRODUCTOS
-- ============================================

-- Zapatillas
INSERT INTO products (name, slug, description, price, offer_price, category_id, is_offer) VALUES
  (
    'Nike Air Max 270',
    'nike-air-max-270',
    'Las icónicas Air Max 270 combinan estilo urbano con la máxima comodidad. Unidad Air visible en el talón para una amortiguación excepcional durante todo el día.',
    159.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'zapatillas'),
    false
  ),
  (
    'Adidas Ultraboost 23',
    'adidas-ultraboost-23',
    'Experimenta la energía del Boost. Diseñadas para corredores que buscan rendimiento superior y comodidad sin límites en cada zancada.',
    189.99,
    149.99,
    (SELECT id FROM categories WHERE slug = 'zapatillas'),
    true
  ),
  (
    'New Balance 550',
    'new-balance-550',
    'El clásico retro de los 80 vuelve con fuerza. Silueta basketball vintage perfecta para el streetwear contemporáneo.',
    129.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'zapatillas'),
    false
  );

-- Camisetas
INSERT INTO products (name, slug, description, price, offer_price, category_id, is_offer) VALUES
  (
    'Nike Dri-FIT Essential',
    'nike-dri-fit-essential',
    'Camiseta técnica con tecnología Dri-FIT que evacua el sudor para mantenerte seco y cómodo durante tus entrenamientos más intensos.',
    34.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'camisetas'),
    false
  ),
  (
    'Adidas Trefoil Classic',
    'adidas-trefoil-classic',
    'El logo Trefoil nunca pasa de moda. Camiseta de algodón premium con corte regular y estilo atemporal.',
    29.99,
    24.99,
    (SELECT id FROM categories WHERE slug = 'camisetas'),
    true
  ),
  (
    'Under Armour Tech 2.0',
    'under-armour-tech-2',
    'Material ultraligero y transpirable que seca rápidamente. Perfecta para entrenamientos de alta intensidad.',
    39.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'camisetas'),
    false
  );

-- Pantalones
INSERT INTO products (name, slug, description, price, offer_price, category_id, is_offer) VALUES
  (
    'Nike Tech Fleece Jogger',
    'nike-tech-fleece-jogger',
    'El revolucionario Tech Fleece ofrece calidez sin peso. Diseño moderno con bolsillos seguros y ajuste ceñido.',
    109.99,
    89.99,
    (SELECT id FROM categories WHERE slug = 'pantalones'),
    true
  ),
  (
    'Adidas Tiro 23',
    'adidas-tiro-23',
    'Los pantalones de entrenamiento preferidos por profesionales. Tejido AEROREADY y corte slim para máximo rendimiento.',
    54.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'pantalones'),
    false
  );

-- Sudaderas
INSERT INTO products (name, slug, description, price, offer_price, category_id, is_offer) VALUES
  (
    'Nike Club Fleece Hoodie',
    'nike-club-fleece-hoodie',
    'Comodidad clásica de Nike. Forro polar cepillado suave, capucha ajustable y bolsillo canguro. Un básico imprescindible.',
    69.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'sudaderas'),
    false
  ),
  (
    'The North Face Drew Peak',
    'north-face-drew-peak',
    'Sudadera con capucha icónica con el emblemático logo Half Dome. Algodón orgánico y construcción duradera.',
    89.99,
    69.99,
    (SELECT id FROM categories WHERE slug = 'sudaderas'),
    true
  ),
  (
    'Champion Reverse Weave',
    'champion-reverse-weave',
    'El tejido Reverse Weave original que minimiza el encogimiento. Calidad heritage desde 1919.',
    79.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'sudaderas'),
    false
  );

-- Accesorios
INSERT INTO products (name, slug, description, price, offer_price, category_id, is_offer) VALUES
  (
    'Nike Heritage Backpack',
    'nike-heritage-backpack',
    'Mochila versátil con compartimento principal espacioso y bolsillo frontal. Perfecta para el día a día.',
    44.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'accesorios'),
    false
  ),
  (
    'Adidas Classic Cap',
    'adidas-classic-cap',
    'Gorra de béisbol clásica con logo bordado. Cierre ajustable para un ajuste personalizado.',
    24.99,
    19.99,
    (SELECT id FROM categories WHERE slug = 'accesorios'),
    true
  );

-- ============================================
-- VARIANTES (Stock por Talla)
-- ============================================

-- Nike Air Max 270
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('38', 5), ('39', 8), ('40', 12), ('41', 10), 
  ('42', 15), ('43', 8), ('44', 6), ('45', 3)
) AS s(size, stock)
WHERE p.slug = 'nike-air-max-270';

-- Adidas Ultraboost 23
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('38', 3), ('39', 5), ('40', 8), ('41', 10), 
  ('42', 12), ('43', 7), ('44', 4), ('45', 2)
) AS s(size, stock)
WHERE p.slug = 'adidas-ultraboost-23';

-- New Balance 550
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('38', 6), ('39', 10), ('40', 15), ('41', 12), 
  ('42', 18), ('43', 10), ('44', 5), ('45', 0)
) AS s(size, stock)
WHERE p.slug = 'new-balance-550';

-- Camisetas (tallas texto)
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('XS', 5), ('S', 12), ('M', 20), ('L', 18), ('XL', 10), ('XXL', 5)
) AS s(size, stock)
WHERE p.slug IN ('nike-dri-fit-essential', 'adidas-trefoil-classic', 'under-armour-tech-2');

-- Pantalones
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('XS', 4), ('S', 10), ('M', 15), ('L', 12), ('XL', 8), ('XXL', 3)
) AS s(size, stock)
WHERE p.slug IN ('nike-tech-fleece-jogger', 'adidas-tiro-23');

-- Sudaderas
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, s.size, s.stock
FROM products p
CROSS JOIN (VALUES 
  ('XS', 3), ('S', 8), ('M', 12), ('L', 15), ('XL', 10), ('XXL', 4)
) AS s(size, stock)
WHERE p.slug IN ('nike-club-fleece-hoodie', 'north-face-drew-peak', 'champion-reverse-weave');

-- Accesorios (talla única)
INSERT INTO product_variants (product_id, size, stock) 
SELECT p.id, 'Única', 25
FROM products p
WHERE p.slug IN ('nike-heritage-backpack', 'adidas-classic-cap');

-- ============================================
-- IMÁGENES PLACEHOLDER
-- (URLs de ejemplo - reemplazar con URLs reales del storage)
-- ============================================
INSERT INTO product_images (product_id, image_url, "order")
SELECT p.id, 
  'https://placehold.co/600x600/1a365d/ffffff?text=' || REPLACE(p.name, ' ', '+'),
  0
FROM products p;
