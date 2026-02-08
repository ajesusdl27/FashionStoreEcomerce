-- Migration: Add low_stock_threshold setting
-- This setting controls the threshold for low stock alerts across the admin panel.
-- Default value: 5 units. The admin can change it from /admin/configuracion.

INSERT INTO public.settings (key, value, value_number, description, is_public)
VALUES (
  'low_stock_threshold',
  '5',
  5,
  'Umbral de stock bajo para alertas de inventario (número de unidades)',
  false
)
ON CONFLICT (key) DO NOTHING;
