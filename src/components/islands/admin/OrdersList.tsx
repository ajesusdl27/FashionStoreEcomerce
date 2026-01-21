import { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Eye,
  Truck,
  FileText,
  Mail,
  Check,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: number | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrdersListProps {
  initialOrders: Order[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  initialStatus: string;
}

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'return_completed';

const statusConfig: Record<OrderStatus, { 
  label: string; 
  bgClass: string; 
  textClass: string; 
  borderColor: string;
  tabColor: string;
}> = {
  pending: {
    label: 'Pendiente',
    bgClass: 'bg-yellow-500/20',
    textClass: 'text-yellow-500',
    borderColor: 'border-l-yellow-500',
    tabColor: 'bg-yellow-500',
  },
  paid: {
    label: 'Pagado',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-500',
    borderColor: 'border-l-green-500',
    tabColor: 'bg-green-500',
  },
  shipped: {
    label: 'Enviado',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-500',
    borderColor: 'border-l-blue-500',
    tabColor: 'bg-blue-500',
  },
  delivered: {
    label: 'Entregado',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-500',
    borderColor: 'border-l-emerald-500',
    tabColor: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelado',
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-500',
    borderColor: 'border-l-red-500',
    tabColor: 'bg-red-500',
  },
  return_requested: {
    label: 'Dev. Solicitada',
    bgClass: 'bg-orange-500/20',
    textClass: 'text-orange-500',
    borderColor: 'border-l-orange-500',
    tabColor: 'bg-orange-500',
  },
  return_completed: {
    label: 'Reembolsado',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-500',
    borderColor: 'border-l-purple-500',
    tabColor: 'bg-purple-500',
  },
};

const statusTabs = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'paid', label: 'Pagados' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default function OrdersList({ 
  initialOrders, 
  totalCount, 
  currentPage,
  pageSize,
  initialStatus,
}: OrdersListProps) {
  const [orders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper functions
  const formatOrderId = (orderNumber: number | null, id: string) => {
    if (orderNumber) {
      return `#${orderNumber.toString().padStart(5, '0')}`;
    }
    return `#${id.slice(0, 8).toUpperCase()}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if order is urgent (pending/paid for more than 2 days)
  const isOrderUrgent = (order: Order) => {
    if (!['pending', 'paid'].includes(order.status)) return false;
    const orderDate = new Date(order.created_at);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return orderDate < twoDaysAgo;
  };

  // Filter orders locally for search
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_email.toLowerCase().includes(query) ||
        formatOrderId(o.order_number, o.id).toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Navigate with filters
  const navigateWithFilters = (newStatus?: string, newPage?: number) => {
    const params = new URLSearchParams();
    const status = newStatus !== undefined ? newStatus : statusFilter;
    const page = newPage || 1;
    
    if (status) params.set('status', status);
    if (page > 1) params.set('page', page.toString());
    
    const query = params.toString();
    window.location.href = `/admin/pedidos${query ? `?${query}` : ''}`;
  };

  // Quick actions
  const handleMarkShipped = async (orderId: string) => {
    try {
      const response = await fetch('/api/admin/pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'shipped' }),
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Export selected orders
  const handleExport = () => {
    const selected = orders.filter((o) => selectedIds.has(o.id));
    const data = selected.length > 0 ? selected : filteredOrders;
    
    const headers = ['Pedido', 'Cliente', 'Email', 'Total', 'Estado', 'Fecha'];
    const rows = data.map((o) => [
      formatOrderId(o.order_number, o.id),
      o.customer_name,
      o.customer_email,
      o.total_amount.toString(),
      statusConfig[o.status as OrderStatus]?.label || o.status,
      formatDate(o.created_at),
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">{totalCount} pedidos en total</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          const config = tab.value ? statusConfig[tab.value as OrderStatus] : null;
          
          return (
            <button
              key={tab.value}
              onClick={() => navigateWithFilters(tab.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? config 
                    ? `${config.tabColor} text-white` 
                    : 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o número de pedido..."
              className="admin-input pl-10 pr-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="admin-input w-36"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="admin-input w-36"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-semibold">
                {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status as OrderStatus] || statusConfig.pending;
            const urgent = isOrderUrgent(order);
            const isSelected = selectedIds.has(order.id);
            
            return (
              <div
                key={order.id}
                className={`
                  bg-card hover:bg-muted/50 border rounded-lg p-4 transition-all border-l-4
                  ${status.borderColor}
                  ${isSelected ? 'ring-2 ring-primary/20' : 'border-border'}
                  ${urgent ? 'bg-amber-500/5' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(order.id)}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />

                  {/* Order ID */}
                  <div className="flex-shrink-0 w-24">
                    <div className="flex items-center gap-2">
                      {urgent && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pedido urgente" />
                      )}
                      <span className="font-mono text-sm text-muted-foreground">
                        {formatOrderId(order.order_number, order.id)}
                      </span>
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Customer */}
                    <div className="md:col-span-1">
                      <p className="font-semibold text-foreground truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.customer_email}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-foreground">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold ${status.bgClass} ${status.textClass}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleMarkShipped(order.id)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                        title="Marcar como enviado"
                      >
                        <Truck className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                    <a
                      href={`/admin/pedidos/${order.id}`}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No se encontraron pedidos</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWithFilters(undefined, currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => navigateWithFilters(undefined, pageNum)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => navigateWithFilters(undefined, currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
