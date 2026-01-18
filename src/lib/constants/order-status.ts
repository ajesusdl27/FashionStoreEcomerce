/**
 * Order Status Constants and Configuration
 * Unified source of truth for order states across admin and customer views
 */

// ============================================
// ORDER STATUS VALUES
// ============================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

// ============================================
// STATUS DISPLAY CONFIGURATION
// ============================================

export interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pendiente',
    bgClass: 'bg-yellow-500/20',
    textClass: 'text-yellow-400',
    borderColor: 'border-l-yellow-500',
  },
  paid: {
    label: 'Pagado',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
    borderColor: 'border-l-green-500',
  },
  shipped: {
    label: 'Enviado',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
    borderColor: 'border-l-blue-500',
  },
  delivered: {
    label: 'Entregado',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
    borderColor: 'border-l-green-500',
  },
  cancelled: {
    label: 'Cancelado',
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-400',
    borderColor: 'border-l-red-500',
  },
};

// ============================================
// STATUS FILTER OPTIONS (for dropdowns)
// ============================================

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: ORDER_STATUS.PENDING, label: ORDER_STATUS_CONFIG.pending.label },
  { value: ORDER_STATUS.PAID, label: ORDER_STATUS_CONFIG.paid.label },
  { value: ORDER_STATUS.SHIPPED, label: ORDER_STATUS_CONFIG.shipped.label },
  { value: ORDER_STATUS.DELIVERED, label: ORDER_STATUS_CONFIG.delivered.label },
  { value: ORDER_STATUS.CANCELLED, label: ORDER_STATUS_CONFIG.cancelled.label },
];

// ============================================
// VALID STATE TRANSITIONS
// ============================================

/**
 * Defines which status transitions are allowed
 * Key: current status
 * Value: array of statuses that can be transitioned to
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  paid: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  shipped: [ORDER_STATUS.DELIVERED],
  delivered: [], // Final state - no transitions allowed
  cancelled: [], // Final state - no transitions allowed
};

/**
 * Check if a status transition is valid
 */
export const isValidTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  const allowed = VALID_TRANSITIONS[from];
  return allowed.includes(to);
};

/**
 * Get human-readable error message for invalid transition
 */
export const getTransitionErrorMessage = (from: OrderStatus, to: OrderStatus): string => {
  const fromLabel = ORDER_STATUS_CONFIG[from]?.label || from;
  
  if (from === to) {
    return `El pedido ya está en estado "${fromLabel}"`;
  }
  
  if (VALID_TRANSITIONS[from].length === 0) {
    return `No se puede cambiar el estado de un pedido "${fromLabel}"`;
  }
  
  const allowedLabels = VALID_TRANSITIONS[from]
    .map(s => ORDER_STATUS_CONFIG[s]?.label || s)
    .join('" o "');
  
  return `Desde "${fromLabel}" solo puedes cambiar a "${allowedLabels}"`;
};

// ============================================
// RETURN STATUS CONFIGURATION
// ============================================

export const RETURN_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  SHIPPED: 'shipped',
  RECEIVED: 'received',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export type ReturnStatus = typeof RETURN_STATUS[keyof typeof RETURN_STATUS];

export interface ReturnStatusConfig {
  bg: string;
  text: string;
  label: string;
}

export const RETURN_STATUS_CONFIG: Record<ReturnStatus, ReturnStatusConfig> = {
  requested: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Pendiente' },
  approved: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Aprobada' },
  shipped: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Enviada' },
  received: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', label: 'En revisión' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completada' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rechazada' },
};
