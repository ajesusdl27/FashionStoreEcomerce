/**
 * Utilidades para formateo y parseo de números de pedido
 * Formato estándar: #A000001 (6 dígitos con padding)
 */

/**
 * Formatea un número secuencial de pedido en el formato estándar #A000001
 * @param orderNumber El número entero de la secuencia (ej. 1, 50, 999)
 * @returns Formato #A000001 o #PENDIENTE si es inválido
 * @example
 * formatOrderId(1) // "#A000001"
 * formatOrderId(999) // "#A000999"
 * formatOrderId(null) // "#PENDIENTE"
 */
export const formatOrderId = (orderNumber: number | null | undefined): string => {
  // Validación estricta
  if (orderNumber == null || orderNumber <= 0 || !Number.isInteger(orderNumber)) {
    console.warn('Invalid order number:', orderNumber);
    return "#PENDIENTE";
  }
  
  // Verificar límite de display (6 dígitos máximo)
  if (orderNumber > 999999) {
    console.error(`Order number ${orderNumber} exceeds max display limit (999999)`);
    throw new Error('Order number exceeds display limit');
  }
  
  // Formatear con padding de 6 dígitos
  const paddedNumber = orderNumber.toString().padStart(6, "0");
  return `#A${paddedNumber}`;
};

/**
 * Parsea un ID formateado de vuelta a número (útil para búsquedas)
 * @param input Formato: "#A000001", "A5", "5", etc.
 * @returns Número entero o null si es inválido
 * @example
 * parseOrderId("#A000001") // 1
 * parseOrderId("A5") // 5
 * parseOrderId("invalid") // null
 */
export const parseOrderId = (input: string): number | null => {
  if (!input || typeof input !== 'string') return null;
  
  // Eliminar todo excepto números
  const clean = input.replace(/[^0-9]/g, "");
  if (!clean) return null;
  
  const num = parseInt(clean, 10);
  
  // Validar rango
  return (num > 0 && num <= 999999) ? num : null;
};

/**
 * Verifica si un string tiene formato de order ID
 * @param input String a verificar
 * @returns true si parece un order ID (#A000001, A5, etc.)
 * @example
 * isOrderIdFormat("#A000001") // true
 * isOrderIdFormat("A5") // true
 * isOrderIdFormat("email@test.com") // false
 */
export const isOrderIdFormat = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  return /^#?A?\d{1,6}$/i.test(input.trim());
};

/**
 * Formatea número de factura basado en order_number
 * @param orderNumber Número secuencial del pedido
 * @returns Formato FV-A000001
 * @example
 * formatInvoiceNumber(1) // "FV-A000001"
 * formatInvoiceNumber(999) // "FV-A000999"
 */
export const formatInvoiceNumber = (orderNumber: number): string => {
  const formattedId = formatOrderId(orderNumber);
  // Remover el # y mantener A000001
  return `FV-${formattedId.substring(1)}`;
};

/**
 * Obtiene el ID de display para un pedido (con compatibilidad para pedidos antiguos)
 * Si el pedido tiene order_number, usa el formato nuevo (#A000001)
 * Si no, usa el UUID slice como fallback (#12345678)
 * @param order Objeto con order_number opcional e id obligatorio
 * @returns ID formateado para mostrar
 * @example
 * getDisplayOrderId({ order_number: 1, id: "uuid..." }) // "#A000001"
 * getDisplayOrderId({ order_number: null, id: "12345678-..." }) // "#12345678"
 */
export const getDisplayOrderId = (order: { order_number?: number | null; id: string }): string => {
  if (order.order_number != null && order.order_number > 0) {
    return formatOrderId(order.order_number);
  }
  // Fallback para pedidos antiguos sin order_number
  return `#${order.id.slice(0, 8).toUpperCase()}`;
};
