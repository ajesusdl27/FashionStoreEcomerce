import { Check, Circle, Clock, Package, Truck, Home, RotateCcw, Ban } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  date?: string;
  description?: string;
}

interface OrderTimelineProps {
  currentStatus: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  className?: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Standard order flow statuses
const statusOrder = ['pending', 'paid', 'shipped', 'delivered'];
const returnStatuses = ['return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed'];

const statusConfig: Record<string, { icon: typeof Check; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Pendiente', color: 'text-yellow-500' },
  paid: { icon: Check, label: 'Pagado', color: 'text-emerald-500' },
  shipped: { icon: Truck, label: 'Enviado', color: 'text-blue-500' },
  delivered: { icon: Home, label: 'Entregado', color: 'text-primary' },
  cancelled: { icon: Ban, label: 'Cancelado', color: 'text-red-500' },
  return_requested: { icon: RotateCcw, label: 'Devolución Solicitada', color: 'text-amber-500' },
  return_approved: { icon: Check, label: 'Devolución Aprobada', color: 'text-amber-500' },
  return_shipped: { icon: Package, label: 'Devolución Enviada', color: 'text-blue-500' },
  return_received: { icon: Check, label: 'Devolución Recibida', color: 'text-blue-500' },
  return_completed: { icon: Check, label: 'Reembolsado', color: 'text-emerald-500' },
  partially_refunded: { icon: Check, label: 'Reembolso Parcial', color: 'text-amber-500' },
};

export default function OrderTimeline({
  currentStatus,
  createdAt,
  paidAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
  className = '',
}: OrderTimelineProps) {
  // Determine which timeline to show
  const isCancelled = currentStatus === 'cancelled';
  const isReturn = returnStatuses.includes(currentStatus) || currentStatus === 'partially_refunded';
  
  // Build timeline steps based on order flow
  const getSteps = (): TimelineStep[] => {
    if (isCancelled) {
      return [
        { status: 'pending', label: 'Pedido Creado', date: createdAt },
        { status: 'cancelled', label: 'Cancelado', date: cancelledAt },
      ];
    }

    const steps: TimelineStep[] = [
      { status: 'pending', label: 'Pedido Creado', date: createdAt },
      { status: 'paid', label: 'Pago Confirmado', date: paidAt },
      { status: 'shipped', label: 'Enviado', date: shippedAt },
      { status: 'delivered', label: 'Entregado', date: deliveredAt },
    ];

    // Add return steps if applicable
    if (isReturn) {
      steps.push({
        status: currentStatus,
        label: statusConfig[currentStatus]?.label || currentStatus,
        date: undefined, // Could add return dates if available
      });
    }

    return steps;
  };

  const steps = getSteps();
  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className={`relative ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[step.status] || statusConfig.pending;
        const IconComponent = config.icon;
        
        return (
          <div key={step.status} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              {/* Dot/Icon */}
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? `${config.color} border-current bg-current/10` 
                    : 'border-border bg-muted text-muted-foreground'
                  }
                  ${isCurrent ? 'ring-4 ring-current/20' : ''}
                `}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-0.5 h-12 my-1 transition-colors
                    ${index < currentIndex ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {isCurrent && !isCancelled && currentStatus !== 'delivered' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
              </div>
              {step.date && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDate(step.date)}
                </p>
              )}
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
