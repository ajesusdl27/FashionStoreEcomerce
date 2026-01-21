import { type ReactNode, type MouseEvent } from 'react';
import { Edit, Copy, Trash2, Eye, ExternalLink, MoreHorizontal } from 'lucide-react';

type ActionVariant = 'default' | 'danger' | 'success' | 'warning';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  variant?: ActionVariant;
  disabled?: boolean;
  loading?: boolean;
  external?: boolean;
}

const variantStyles: Record<ActionVariant, string> = {
  default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  danger: 'text-red-500 hover:text-red-400 hover:bg-red-500/10',
  success: 'text-green-500 hover:text-green-400 hover:bg-green-500/10',
  warning: 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10',
};

/**
 * Individual Action Button
 */
export function ActionButton({
  icon,
  label,
  onClick,
  href,
  variant = 'default',
  disabled = false,
  loading = false,
  external = false,
}: ActionButtonProps) {
  const baseClasses = `
    p-2 rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-target
    ${variantStyles[variant]}
  `;

  const content = loading ? (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    icon
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        title={label}
        aria-label={label}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
      title={label}
      aria-label={label}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
}

/**
 * Quick Actions Container
 * Groups action buttons together with consistent spacing
 */
interface QuickActionsProps {
  children: ReactNode;
  className?: string;
  /** Show actions on hover only (desktop) */
  showOnHover?: boolean;
}

export default function QuickActions({ 
  children, 
  className = '',
  showOnHover = false,
}: QuickActionsProps) {
  return (
    <div 
      className={`
        flex items-center gap-1
        ${showOnHover ? 'sm:opacity-0 sm:group-hover:opacity-100 transition-opacity' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Pre-built action button variants for common use cases
export function EditAction({ href, onClick }: { href?: string; onClick?: () => void }) {
  return (
    <ActionButton 
      icon={<Edit className="w-4 h-4" />} 
      label="Editar" 
      href={href}
      onClick={onClick}
    />
  );
}

export function DuplicateAction({ onClick }: { onClick: () => void }) {
  return (
    <ActionButton 
      icon={<Copy className="w-4 h-4" />} 
      label="Duplicar" 
      onClick={onClick}
    />
  );
}

export function DeleteAction({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <ActionButton 
      icon={<Trash2 className="w-4 h-4" />} 
      label="Eliminar" 
      onClick={onClick}
      variant="danger"
      loading={loading}
    />
  );
}

export function ViewAction({ href, external }: { href: string; external?: boolean }) {
  return (
    <ActionButton 
      icon={external ? <ExternalLink className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
      label={external ? "Ver en tienda" : "Ver detalles"}
      href={href}
      external={external}
    />
  );
}

export function MoreAction({ onClick }: { onClick: () => void }) {
  return (
    <ActionButton 
      icon={<MoreHorizontal className="w-4 h-4" />} 
      label="Más acciones" 
      onClick={onClick}
    />
  );
}
