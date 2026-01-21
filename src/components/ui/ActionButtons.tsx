import { type ReactNode, type MouseEvent, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  href?: string;
  external?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-primary-foreground
    hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]
    active:scale-[0.98]
  `,
  secondary: `
    bg-card text-foreground border border-input
    hover:bg-muted
  `,
  danger: `
    bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30
    hover:bg-red-500/30
  `,
  ghost: `
    text-muted-foreground
    hover:text-foreground hover:bg-muted
  `,
  outline: `
    bg-transparent text-foreground border border-border
    hover:bg-muted
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  icon: 'p-2.5',
};

/**
 * ActionButton Component
 * Flexible button component with variants, sizes, and loading states
 */
export default function ActionButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  href,
  external = false,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ActionButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const content = (
    <>
      {loading ? (
        <Loader2 className={`${size === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} animate-spin`} />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}

// Pre-built button variants for common use cases
export function PrimaryButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="secondary" {...props} />;
}

export function DangerButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="danger" {...props} />;
}

export function GhostButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="ghost" {...props} />;
}

export function IconButton(props: Omit<ActionButtonProps, 'size'>) {
  return <ActionButton size="icon" {...props} />;
}

/**
 * Button Group
 * Groups buttons together with consistent spacing
 */
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function ButtonGroup({ children, className = '', align = 'left' }: ButtonGroupProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex items-center gap-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}
