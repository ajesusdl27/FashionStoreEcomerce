-- ============================================
-- FASHIONSTORE - ROLLBACK MIGRACIÓN 026
-- Revertir Sistema de Numeración Secuencial
-- ============================================
-- 
-- ⚠️  ATENCIÓN: USAR SOLO EN CASO DE EMERGENCIA
-- 
-- Este script revierte todos los cambios de la migración 026
-- y devuelve el sistema al uso de UUID como identificador único
--
-- IMPACTO:
-- - Se eliminará la columna order_number
-- - Se perderá el historial de números secuenciales
-- - El sistema volverá a usar UUID slice (#12345678)
--
-- ANTES DE EJECUTAR:
-- 1. Hacer backup completo de la base de datos
-- 2. Verificar que el código ha sido revertido (git revert)
-- 3. Confirmar con el equipo que es necesario el rollback
-- 4. Notificar a usuarios de posible inconsistencia temporal
--
-- TIEMPO ESTIMADO: 2-5 minutos
-- ============================================

BEGIN;

RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════';
RAISE NOTICE '        INICIANDO ROLLBACK DE MIGRACIÓN 026           ';
RAISE NOTICE '═══════════════════════════════════════════════════════';
RAISE NOTICE '';

-- ============================================
-- PASO 1: Registrar estado actual
-- ============================================
DO $$
DECLARE
  total_orders INT;
  max_number INT;
BEGIN
  SELECT COUNT(*) INTO total_orders FROM orders;
  SELECT MAX(order_number) INTO max_number FROM orders WHERE order_number IS NOT NULL;
  
  RAISE NOTICE 'Estado antes del rollback:';
  RAISE NOTICE '  - Total de pedidos: %', total_orders;
  RAISE NOTICE '  - Máximo order_number: %', COALESCE(max_number, 0);
  RAISE NOTICE '';
END $$;

-- ============================================
-- PASO 2: Eliminar constraint de unicidad
-- ============================================
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_order_number_unique;

RAISE NOTICE 'Paso 1/5: Constraint de unicidad eliminado';

-- ============================================
-- PASO 3: Hacer columna nullable (opcional)
-- ============================================
-- Esto permite eliminar la columna sin problemas
-- aunque no es estrictamente necesario
ALTER TABLE orders 
ALTER COLUMN order_number DROP NOT NULL;

RAISE NOTICE 'Paso 2/5: Columna order_number configurada como nullable';

-- ============================================
-- PASO 4: Eliminar índice
-- ============================================
DROP INDEX IF EXISTS idx_orders_order_number;

RAISE NOTICE 'Paso 3/5: Índice idx_orders_order_number eliminado';

-- ============================================
-- PASO 5: Eliminar columna
-- ============================================
-- Esto también elimina automáticamente la secuencia asociada
ALTER TABLE orders 
DROP COLUMN IF EXISTS order_number;

RAISE NOTICE 'Paso 4/5: Columna order_number eliminada';

-- ============================================
-- PASO 6: Verificar que la secuencia se eliminó
-- ============================================
-- La secuencia orders_order_number_seq debe eliminarse automáticamente
-- pero verificamos por seguridad
DO $$
DECLARE
  seq_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_sequences 
    WHERE schemaname = 'public' 
    AND sequencename = 'orders_order_number_seq'
  ) INTO seq_exists;
  
  IF seq_exists THEN
    EXECUTE 'DROP SEQUENCE IF EXISTS orders_order_number_seq';
    RAISE NOTICE 'Paso 5/5: Secuencia eliminada manualmente';
  ELSE
    RAISE NOTICE 'Paso 5/5: Secuencia eliminada automáticamente';
  END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN POST-ROLLBACK
-- ============================================
DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
  constraint_exists BOOLEAN;
  sequence_exists BOOLEAN;
BEGIN
  -- Verificar que la columna no existe
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'order_number'
  ) INTO column_exists;
  
  -- Verificar que el índice no existe
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'orders' 
    AND indexname = 'idx_orders_order_number'
  ) INTO index_exists;
  
  -- Verificar que el constraint no existe
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'orders' 
    AND constraint_name = 'orders_order_number_unique'
  ) INTO constraint_exists;
  
  -- Verificar que la secuencia no existe
  SELECT EXISTS (
    SELECT 1 
    FROM pg_sequences 
    WHERE schemaname = 'public' 
    AND sequencename = 'orders_order_number_seq'
  ) INTO sequence_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '         VERIFICACIÓN DE ROLLBACK                     ';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Columna order_number existe:      % (debe ser false)', column_exists;
  RAISE NOTICE 'Índice existe:                    % (debe ser false)', index_exists;
  RAISE NOTICE 'Constraint existe:                % (debe ser false)', constraint_exists;
  RAISE NOTICE 'Secuencia existe:                 % (debe ser false)', sequence_exists;
  RAISE NOTICE '';
  
  IF NOT column_exists AND NOT index_exists AND NOT constraint_exists AND NOT sequence_exists THEN
    RAISE NOTICE '✅ ROLLBACK COMPLETADO EXITOSAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema ha vuelto al estado anterior a la migración 026';
    RAISE NOTICE 'Los pedidos usarán UUID como identificador visible';
  ELSE
    RAISE WARNING '⚠️  ATENCIÓN: Algunos elementos no se eliminaron correctamente';
    RAISE WARNING 'Verificar manualmente y eliminar elementos restantes';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- ============================================
-- QUERY DE MUESTRA
-- ============================================
-- Mostrar que los pedidos siguen existiendo con sus UUIDs
DO $$
DECLARE
  sample_row RECORD;
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM orders;
  
  RAISE NOTICE 'Estado de la tabla orders después del rollback:';
  RAISE NOTICE 'Total de pedidos: %', total_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Muestra de pedidos (últimos 5):';
  RAISE NOTICE '';
  
  FOR sample_row IN 
    SELECT 
      substring(id::text, 1, 8) as short_id,
      customer_email,
      total_amount,
      status,
      created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    RAISE NOTICE 'UUID: #% | Cliente: % | Total: % | Estado: % | Fecha: %',
      UPPER(sample_row.short_id),
      sample_row.customer_email,
      sample_row.total_amount,
      sample_row.status,
      sample_row.created_at;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ============================================
-- FIN DE ROLLBACK
-- ============================================
-- 
-- ACCIONES POST-ROLLBACK:
-- 1. Verificar que el código en git ha sido revertido
-- 2. Desplegar versión anterior del código
-- 3. Probar flujo de checkout completo
-- 4. Verificar emails y facturas (deben usar UUID slice)
-- 5. Monitorizar logs de aplicación
-- 6. Comunicar a usuarios que el sistema ha sido restaurado
--
-- DOCUMENTACIÓN:
-- - Registrar incidente y razón del rollback
-- - Actualizar plan de migración con lecciones aprendidas
-- - Si se planea reintentar, revisar y ajustar el plan
-- ============================================
