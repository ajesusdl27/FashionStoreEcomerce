import { Clock, AlertTriangle, CheckCircle, XCircle, Package, Truck } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface RecentReturn {
  id: string;
  status: string;
  refund_amount: number | null;
  created_at: string;
  order: {
    id: string;
    customer_name: string;
  } | null;
}

interface ReturnsWidgetProps {
  returns: RecentReturn[];
  pendingCount: number;
  totalRefunded: number;
  returnRate: number;
}

// ============================================
// HELPERS
// ============================================

const statusConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  requested: { label: 'Solicitada', class: 'badge-warning', icon: AlertTriangle },
  approved: { label: 'Aprobada', class: 'badge-info', icon: CheckCircle },
  shipped: { label: 'Enviada', class: 'badge-info', icon: Truck },
  received: { label: 'Recibida', class: 'badge-info', icon: Package },
  completed: { label: 'Completada', class: 'badge-success', icon: CheckCircle },
  rejected: { label: 'Rechazada', class: 'badge-danger', icon: XCircle },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `hace ${diffD}d`;
  if (diffH > 0) return `hace ${diffH}h`;
  return 'ahora';
}

// ============================================
// COMPONENT
// ============================================

/**
 * Returns overview widget for the admin dashboard.
 * Shows recent returns with status badges and quick stats.
 */
export default function ReturnsWidget({ returns, pendingCount, totalRefunded, returnRate }: ReturnsWidgetProps) {
  return (
    <div>
      {/* Compact stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Pendientes</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold text-red-500">{formatCurrency(totalRefunded)}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Reembolsado</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold text-foreground">{returnRate}%</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Tasa dev.</p>
        </div>
      </div>

      {/* Returns list */}
      {returns.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
          <p className="text-sm">No hay devoluciones recientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {returns.map((ret) => {
            const config = statusConfig[ret.status] ?? statusConfig.requested;
            return (
              <a
                key={ret.id}
                href={`/admin/devoluciones/${ret.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {ret.order?.customer_name || 'Cliente'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge text-[10px] ${config!.class}`}>{config!.label}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(ret.created_at)}
                    </span>
                  </div>
                </div>
                {ret.refund_amount && ret.refund_amount > 0 && (
                  <span className="text-sm font-medium text-red-400 ml-2">
                    -{formatCurrency(ret.refund_amount)}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
