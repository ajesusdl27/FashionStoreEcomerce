import { Package, RefreshCw, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

interface TrustBadge {
  icon: typeof Package;
  title: string;
  description?: string;
}

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showDescriptions?: boolean;
  className?: string;
  freeShippingThreshold?: number;
  returnDays?: number;
}

export default function TrustBadges({ 
  variant = 'horizontal',
  showDescriptions = true,
  className = '',
  freeShippingThreshold = 50,
  returnDays = 30,
}: TrustBadgesProps) {
  const badges: TrustBadge[] = [
    {
      icon: Package,
      title: `Envío gratis +${freeShippingThreshold}€`,
      description: 'En España peninsular e islas',
    },
    {
      icon: RefreshCw,
      title: `${returnDays} días devolución`,
      description: 'Devoluciones sin complicaciones',
    },
    {
      icon: ShieldCheck,
      title: 'Pago 100% seguro',
      description: 'Encriptación SSL',
    },
    {
      icon: CreditCard,
      title: 'Múltiples métodos',
      description: 'Visa, Mastercard, PayPal',
    },
  ];

  // Compact variant - single line icons
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-xs text-muted-foreground ${className}`}>
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div key={index} className="flex items-center gap-1.5">
              <IconComponent className="w-4 h-4 text-primary" />
              <span>{badge.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical variant - stacked list
  if (variant === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{badge.title}</p>
                {showDescriptions && badge.description && (
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant - grid layout (default)
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <div 
            key={index} 
            className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{badge.title}</p>
            {showDescriptions && badge.description && (
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
