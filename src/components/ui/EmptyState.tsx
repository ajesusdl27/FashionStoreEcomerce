import { type ReactNode } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Search, 
  FileText, 
  Heart,
  AlertCircle,
  Inbox,
  Tag,
  Users,
  Mail,
  Settings,
  RotateCcw,
  Megaphone,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

type IconName = 
  | 'shopping-bag' 
  | 'package' 
  | 'search' 
  | 'file' 
  | 'heart' 
  | 'alert'
  | 'inbox'
  | 'tag'
  | 'users'
  | 'mail'
  | 'settings'
  | 'returns'
  | 'megaphone'
  | 'warning'
  | 'error'
  | 'refresh';

type EmptyStateVariant = 'default' | 'no-data' | 'no-results' | 'error';

interface EmptyStateProps {
  icon?: IconName | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: EmptyStateVariant;
}

const iconMap: Record<IconName, typeof ShoppingBag> = {
  'shopping-bag': ShoppingBag,
  'package': Package,
  'search': Search,
  'file': FileText,
  'heart': Heart,
  'alert': AlertCircle,
  'inbox': Inbox,
  'tag': Tag,
  'users': Users,
  'mail': Mail,
  'settings': Settings,
  'returns': RotateCcw,
  'megaphone': Megaphone,
  'warning': AlertTriangle,
  'error': XCircle,
  'refresh': RefreshCw,
};

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    iconWrapper: 'w-16 h-16',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    iconWrapper: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-20 h-20',
    iconWrapper: 'w-24 h-24',
    title: 'text-xl',
    description: 'text-base',
  },
};

const variantStyles = {
  default: {
    iconWrapper: 'bg-muted/50',
    iconColor: 'text-muted-foreground/50',
  },
  'no-data': {
    iconWrapper: 'bg-primary/10',
    iconColor: 'text-primary/50',
  },
  'no-results': {
    iconWrapper: 'bg-amber-500/10',
    iconColor: 'text-amber-500/50',
  },
  error: {
    iconWrapper: 'bg-red-500/10',
    iconColor: 'text-red-500/50',
  },
};

export default function EmptyState({ 
  icon = 'shopping-bag', 
  title, 
  description, 
  action,
  className = '',
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizes = sizeClasses[size];
  const styles = variantStyles[variant];
  
  // Get default icon based on variant if not specified
  const getDefaultIcon = () => {
    if (icon !== 'shopping-bag') return icon;
    switch (variant) {
      case 'no-results': return 'search';
      case 'error': return 'error';
      default: return icon;
    }
  };
  
  const finalIcon = getDefaultIcon();
  
  // Render icon - either from map or custom ReactNode
  const renderIcon = () => {
    if (typeof finalIcon === 'string' && finalIcon in iconMap) {
      const IconComponent = iconMap[finalIcon as IconName];
      return <IconComponent className={`${sizes.icon} ${styles.iconColor}`} strokeWidth={1.5} />;
    }
    return finalIcon;
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
      {/* Icon Container */}
      <div className={`${sizes.iconWrapper} rounded-full ${styles.iconWrapper} flex items-center justify-center mb-6`}>
        {renderIcon()}
      </div>
      
      {/* Title */}
      <h3 className={`font-heading ${sizes.title} text-foreground mb-2`}>
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className={`${sizes.description} text-muted-foreground max-w-sm mb-6`}>
          {description}
        </p>
      )}
      
      {/* Action */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}

// Pre-built empty state variants for common use cases
export function NoDataState({ 
  title = 'No hay datos',
  description = 'Aún no hay elementos para mostrar.',
  action,
  icon,
  size = 'md',
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={icon || 'inbox'}
      title={title}
      description={description}
      action={action}
      size={size}
      variant="no-data"
    />
  );
}

export function NoResultsState({
  title = 'Sin resultados',
  description = 'No se encontraron elementos con los filtros aplicados.',
  action,
  size = 'md',
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="search"
      title={title}
      description={description}
      action={action}
      size={size}
      variant="no-results"
    />
  );
}

export function ErrorState({
  title = 'Error al cargar',
  description = 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
  action,
  size = 'md',
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="error"
      title={title}
      description={description}
      action={action}
      size={size}
      variant="error"
    />
  );
}
