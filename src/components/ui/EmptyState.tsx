import { type ReactNode } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Search, 
  FileText, 
  Heart,
  AlertCircle
} from 'lucide-react';

type IconName = 'shopping-bag' | 'package' | 'search' | 'file' | 'heart' | 'alert';

interface EmptyStateProps {
  icon?: IconName | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<IconName, typeof ShoppingBag> = {
  'shopping-bag': ShoppingBag,
  'package': Package,
  'search': Search,
  'file': FileText,
  'heart': Heart,
  'alert': AlertCircle,
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

export default function EmptyState({ 
  icon = 'shopping-bag', 
  title, 
  description, 
  action,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizes = sizeClasses[size];
  
  // Render icon - either from map or custom ReactNode
  const renderIcon = () => {
    if (typeof icon === 'string' && icon in iconMap) {
      const IconComponent = iconMap[icon as IconName];
      return <IconComponent className={`${sizes.icon} text-muted-foreground/50`} strokeWidth={1.5} />;
    }
    return icon;
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
      {/* Icon Container */}
      <div className={`${sizes.iconWrapper} rounded-full bg-muted/50 flex items-center justify-center mb-6`}>
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
