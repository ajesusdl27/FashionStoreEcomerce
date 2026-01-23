/**
 * ReturnsMetricsDashboard - Dashboard de métricas de devoluciones para admin
 * 
 * Muestra estadísticas clave del sistema de devoluciones:
 * - Total de devoluciones por estado
 * - Tasa de devolución
 * - Tiempo promedio de resolución
 * - Reembolsos procesados
 * - Motivos más comunes
 */

import { 
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Banknote,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Inbox,
  BarChart3
} from 'lucide-react';

interface ReturnMetrics {
  totalReturns: number;
  byStatus: {
    requested: number;
    approved: number;
    shipped: number;
    received: number;
    completed: number;
    rejected: number;
  };
  totalRefunded: number;
  avgResolutionDays: number;
  returnRate: number;
  topReasons: { reason: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  pendingActions: number;
}

interface Props {
  metrics?: ReturnMetrics;
  loading?: boolean;
  error?: string;
}

const defaultMetrics: ReturnMetrics = {
  totalReturns: 0,
  byStatus: {
    requested: 0,
    approved: 0,
    shipped: 0,
    received: 0,
    completed: 0,
    rejected: 0,
  },
  totalRefunded: 0,
  avgResolutionDays: 0,
  returnRate: 0,
  topReasons: [],
  monthlyTrend: [],
  pendingActions: 0,
};

export default function ReturnsMetricsDashboard({ 
  metrics = defaultMetrics, 
  loading = false, 
  error 
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error al cargar métricas</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Devoluciones',
      value: metrics.totalReturns.toString(),
      icon: RefreshCw,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Reembolsado',
      value: formatCurrency(metrics.totalRefunded),
      icon: Banknote,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Tiempo Resolución',
      value: `${metrics.avgResolutionDays.toFixed(1)} días`,
      icon: Clock,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Tasa Devolución',
      value: formatPercent(metrics.returnRate),
      icon: metrics.returnRate > 5 ? TrendingUp : TrendingDown,
      color: metrics.returnRate > 5 ? 'bg-red-500' : 'bg-green-500',
      bgLight: metrics.returnRate > 5 ? 'bg-red-50' : 'bg-green-50',
      textColor: metrics.returnRate > 5 ? 'text-red-600' : 'text-green-600',
    },
  ];

  const statusCards = [
    { status: 'requested', label: 'Solicitadas', icon: Inbox, color: 'text-amber-500', bg: 'bg-amber-100' },
    { status: 'approved', label: 'Aprobadas', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    { status: 'shipped', label: 'Enviadas', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-100' },
    { status: 'received', label: 'Recibidas', icon: Inbox, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    { status: 'completed', label: 'Completadas', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { status: 'rejected', label: 'Rechazadas', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Alertas de acciones pendientes */}
      {metrics.pendingActions > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-amber-800">
              {metrics.pendingActions} devolución(es) requieren atención
            </span>
            <a 
              href="/admin/devoluciones?status=requested" 
              className="ml-auto text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Ver pendientes →
            </a>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border border-gray-200 ${card.bgLight} p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`mt-2 text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`rounded-lg ${card.color} p-2`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desglose por estado */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BarChart3 className="h-5 w-5" />
          Devoluciones por Estado
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statusCards.map((item) => {
            const count = metrics.byStatus[item.status];
            const percentage = metrics.totalReturns > 0 
              ? (count / metrics.totalReturns) * 100 
              : 0;
            
            return (
              <div
                key={item.status}
                className={`rounded-lg ${item.bg} p-4 text-center transition-transform hover:scale-105`}
              >
                <item.icon className={`mx-auto h-6 w-6 ${item.color}`} />
                <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid de motivos y tendencia */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Motivos más comunes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Motivos más Comunes
          </h3>
          {metrics.topReasons.length > 0 ? (
            <div className="space-y-3">
              {metrics.topReasons.map((item, index) => {
                const maxCount = Math.max(...metrics.topReasons.map(r => r.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.reason}</span>
                      <span className="text-gray-500">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay datos suficientes</p>
          )}
        </div>

        {/* Tendencia mensual */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Tendencia Mensual
          </h3>
          {metrics.monthlyTrend.length > 0 ? (
            <div className="flex h-40 items-end justify-between gap-2">
              {metrics.monthlyTrend.map((item, index) => {
                const maxCount = Math.max(...metrics.monthlyTrend.map(t => t.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">{item.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay datos suficientes</p>
          )}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">📊 Resumen</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-medium">En proceso:</span>{' '}
            {metrics.byStatus.requested + metrics.byStatus.approved + metrics.byStatus.shipped + metrics.byStatus.received} devoluciones
          </div>
          <div>
            <span className="font-medium">Completadas este mes:</span>{' '}
            {metrics.monthlyTrend.length > 0 ? metrics.monthlyTrend[metrics.monthlyTrend.length - 1]?.count ?? 0 : 0}
          </div>
          <div>
            <span className="font-medium">Ratio aprobación:</span>{' '}
            {metrics.totalReturns > 0 
              ? formatPercent(((metrics.byStatus.completed + metrics.byStatus.approved + metrics.byStatus.shipped + metrics.byStatus.received) / metrics.totalReturns) * 100)
              : '0%'
            }
          </div>
          <div>
            <span className="font-medium">Ratio rechazo:</span>{' '}
            {metrics.totalReturns > 0 
              ? formatPercent((metrics.byStatus.rejected / metrics.totalReturns) * 100)
              : '0%'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
