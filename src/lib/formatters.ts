/**
 * Utilidades de formateo para el dashboard
 * @module formatters
 */

/**
 * Formatea un número como precio en euros
 * @param price - Cantidad a formatear
 * @returns Precio formateado (ej: "1.234,56 €")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

/**
 * Formatea una fecha en español
 * @param date - Fecha en formato ISO string
 * @param options - Opciones de formateo (opcional)
 * @returns Fecha formateada (ej: "14 ene, 10:30")
 */
export const formatDate = (
  date: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(date).toLocaleDateString('es-ES', options || {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea un número de pedido
 * @param orderNumber - Número secuencial del pedido
 * @returns ID formateado con padding (ej: "#A000123")
 */
export const formatOrderId = (orderNumber: number): string => {
  return `#A${String(orderNumber).padStart(6, '0')}`;
};

/**
 * Formatea números grandes con sufijos (K, M)
 * @param num - Número a formatear
 * @returns Número abreviado (ej: 1500 → "1.5K", 2000000 → "2M")
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Formatea un porcentaje con signo
 * @param value - Valor del porcentaje
 * @returns Porcentaje formateado (ej: "+12.5%", "-5.3%")
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
