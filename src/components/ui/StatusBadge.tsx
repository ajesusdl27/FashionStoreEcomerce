import { type ReactNode } from 'react';

type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'muted' 
  | 'primary';

type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  icon?: ReactNode;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  muted: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/20 text-primary border-primary/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

// Predefined status configurations for common use cases
export const STATUS_CONFIG = {
  // Orders
  pending: { variant: 'warning' as const, label: 'Pendiente' },
  paid: { variant: 'success' as const, label: 'Pagado' },
  shipped: { variant: 'info' as const, label: 'Enviado' },
  delivered: { variant: 'success' as const, label: 'Entregado' },
  cancelled: { variant: 'danger' as const, label: 'Cancelado' },
  return_requested: { variant: 'warning' as const, label: 'Dev. Solicitada' },
  return_approved: { variant: 'warning' as const, label: 'Dev. Aprobada' },
  return_shipped: { variant: 'info' as const, label: 'Dev. Enviada' },
  return_received: { variant: 'info' as const, label: 'Dev. Recibida' },
  return_completed: { variant: 'success' as const, label: 'Reembolsado' },
  partially_refunded: { variant: 'warning' as const, label: 'Reemb. Parcial' },
  
  // Coupons/Promotions
  active: { variant: 'success' as const, label: 'Activo' },
  inactive: { variant: 'muted' as const, label: 'Inactivo' },
  expired: { variant: 'danger' as const, label: 'Expirado' },
  scheduled: { variant: 'warning' as const, label: 'Programado' },
  depleted: { variant: 'danger' as const, label: 'Agotado' },
  
  // Returns
  requested: { variant: 'warning' as const, label: 'Pendiente' },
  approved: { variant: 'info' as const, label: 'Aprobada' },
  received: { variant: 'info' as const, label: 'En revisión' },
  completed: { variant: 'success' as const, label: 'Completada' },
  rejected: { variant: 'danger' as const, label: 'Rechazada' },
  
  // Stock
  in_stock: { variant: 'success' as const, label: 'En stock' },
  low_stock: { variant: 'warning' as const, label: 'Stock bajo' },
  out_of_stock: { variant: 'danger' as const, label: 'Sin stock' },
  
  // Newsletter
  draft: { variant: 'muted' as const, label: 'Borrador' },
  sending: { variant: 'info' as const, label: 'Enviando' },
  sent: { variant: 'success' as const, label: 'Enviado' },
  failed: { variant: 'danger' as const, label: 'Fallido' },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;

/**
 * StatusBadge Component
 * A flexible badge component for displaying statuses with consistent styling
 */
export default function StatusBadge({ 
  variant = 'muted',
  size = 'md',
  children,
  icon,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-semibold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'info' ? 'bg-blue-500' :
          'bg-current'
        } animate-pulse`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Helper function to render status from predefined config
 */
export function renderStatus(
  status: string, 
  options?: { size?: BadgeSize; pulse?: boolean }
) {
  const config = STATUS_CONFIG[status as StatusKey];
  if (!config) {
    return (
      <StatusBadge variant="muted" size={options?.size}>
        {status}
      </StatusBadge>
    );
  }
  
  return (
    <StatusBadge 
      variant={config.variant} 
      size={options?.size}
      pulse={options?.pulse}
    >
      {config.label}
    </StatusBadge>
  );
}
