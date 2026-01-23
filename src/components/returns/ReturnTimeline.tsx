import { Check, Clock, Package, Truck, RotateCcw, CreditCard, X } from 'lucide-react';

interface ReturnTimelineProps {
  status: string;
  createdAt: string;
  approvedAt?: string | null;
  shippedAt?: string | null;
  receivedAt?: string | null;
  completedAt?: string | null;
  rejectedAt?: string | null;
  trackingNumber?: string | null;
  refundAmount?: number | null;
  isCompact?: boolean;
}

type TimelineStep = {
  key: string;
  label: string;
  description: string;
  icon: typeof Clock;
  date?: string | null | undefined;
  isActive: boolean;
  isCompleted: boolean;
  isRejected?: boolean;
  color: string;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReturnTimeline({
  status,
  createdAt,
  approvedAt,
  shippedAt,
  receivedAt,
  completedAt,
  rejectedAt,
  trackingNumber,
  refundAmount,
  isCompact = false,
}: ReturnTimelineProps) {
  const isRejected = status === 'rejected';
  
  // Define all steps
  const steps: TimelineStep[] = [
    {
      key: 'requested',
      label: 'Solicitud Enviada',
      description: 'Tu solicitud de devolución ha sido recibida',
      icon: RotateCcw,
      date: createdAt,
      isActive: status === 'requested',
      isCompleted: ['approved', 'shipped', 'received', 'completed', 'rejected'].includes(status),
      color: 'amber',
    },
    {
      key: 'approved',
      label: 'Aprobada',
      description: isRejected ? 'Solicitud rechazada' : 'Tu devolución ha sido aprobada',
      icon: isRejected ? X : Check,
      date: isRejected ? rejectedAt : approvedAt,
      isActive: status === 'approved',
      isCompleted: ['shipped', 'received', 'completed'].includes(status),
      isRejected,
      color: isRejected ? 'red' : 'blue',
    },
    {
      key: 'shipped',
      label: 'Paquete Enviado',
      description: trackingNumber 
        ? `Enviado con seguimiento: ${trackingNumber}`
        : 'El cliente ha enviado el paquete',
      icon: Truck,
      date: shippedAt,
      isActive: status === 'shipped',
      isCompleted: ['received', 'completed'].includes(status),
      color: 'purple',
    },
    {
      key: 'received',
      label: 'Recibido en Almacén',
      description: 'Estamos revisando los artículos',
      icon: Package,
      date: receivedAt,
      isActive: status === 'received',
      isCompleted: status === 'completed',
      color: 'cyan',
    },
    {
      key: 'completed',
      label: 'Reembolso Completado',
      description: refundAmount 
        ? `Reembolso de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(refundAmount)}`
        : 'El reembolso ha sido procesado',
      icon: CreditCard,
      date: completedAt,
      isActive: status === 'completed',
      isCompleted: status === 'completed',
      color: 'emerald',
    },
  ];

  // Filter steps if rejected (only show until rejection)
  const visibleSteps = isRejected 
    ? steps.slice(0, 2) 
    : steps;

  const getColorClasses = (step: TimelineStep) => {
    const defaultColors = { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', bgLight: 'bg-amber-500/10' };
    
    if (step.isRejected) {
      return {
        bg: 'bg-red-500',
        text: 'text-red-500',
        border: 'border-red-500',
        bgLight: 'bg-red-500/10',
      };
    }
    
    const colorsMap: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
      amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', bgLight: 'bg-amber-500/10' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', bgLight: 'bg-blue-500/10' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', bgLight: 'bg-purple-500/10' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', bgLight: 'bg-cyan-500/10' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', bgLight: 'bg-emerald-500/10' },
    };
    
    return colorsMap[step.color] ?? defaultColors;
  };

  if (isCompact) {
    // Compact horizontal version
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {visibleSteps.map((step, index) => {
          const colors = getColorClasses(step);
          const Icon = step.icon;
          const isActiveOrCompleted = step.isActive || step.isCompleted;
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step indicator */}
              <div 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  isActiveOrCompleted 
                    ? `${colors.bgLight} ${colors.text}` 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{step.label}</span>
                {step.isCompleted && <Check className="w-3 h-3" />}
              </div>
              
              {/* Connector */}
              {index < visibleSteps.length - 1 && (
                <div 
                  className={`w-4 h-0.5 mx-0.5 ${
                    step.isCompleted ? colors.bg : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full vertical version
  return (
    <div className="relative">
      {visibleSteps.map((step, index) => {
        const colors = getColorClasses(step);
        const Icon = step.icon;
        const isActiveOrCompleted = step.isActive || step.isCompleted;
        const isLast = index === visibleSteps.length - 1;
        
        return (
          <div key={step.key} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div 
                className={`absolute left-4 top-8 w-0.5 h-[calc(100%-1rem)] ${
                  step.isCompleted ? colors.bg : 'bg-muted'
                }`}
              />
            )}
            
            {/* Icon */}
            <div 
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                isActiveOrCompleted 
                  ? `${colors.bg} text-white` 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className={`pb-6 ${isActiveOrCompleted ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${isActiveOrCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </h4>
                {step.isActive && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bgLight} ${colors.text}`}>
                    <Clock className="w-3 h-3" />
                    En curso
                  </span>
                )}
                {step.isCompleted && (
                  <Check className={`w-4 h-4 ${colors.text}`} />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step.description}
              </p>
              {step.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(step.date)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
