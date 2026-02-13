import { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
  Plus,
  Loader2,
  Receipt,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  order_number: number | null;
  customer_name: string | null;
  customer_nif: string;
  customer_fiscal_name: string;
  customer_fiscal_address: string;
  total: number;
  issued_at: string;
  pdf_url: string | null;
}

interface TicketOrder {
  id: string;
  order_number: number | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface InvoicesListProps {
  initialInvoices: Invoice[];
  totalCount: number;
  initialTicketOrders: TicketOrder[];
  ticketTotalCount: number;
  activeTab: string;
  currentPage: number;
  pageSize: number;
  initialSearch: string;
  initialFrom: string;
  initialTo: string;
}

interface OrderResult {
  id: string;
  order_number: number | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatOrderId = (orderNumber: number | null, id?: string) => {
  if (orderNumber && orderNumber > 0) {
    return `#A${orderNumber.toString().padStart(6, '0')}`;
  }
  return id ? `#${id.slice(0, 8).toUpperCase()}` : '-';
};

const statusLabels: Record<string, string> = {
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  paid: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-l-green-500' },
  shipped: { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-l-blue-500' },
  delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-l-emerald-500' },
};

export default function InvoicesList({
  initialInvoices,
  totalCount,
  initialTicketOrders,
  ticketTotalCount,
  activeTab,
  currentPage,
  pageSize,
  initialSearch,
  initialFrom,
  initialTo,
}: InvoicesListProps) {
  const [invoices] = useState(initialInvoices);
  const [ticketOrders] = useState(initialTicketOrders);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);

  // PDF preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResults, setOrderResults] = useState<OrderResult[]>([]);
  const [searchingOrders, setSearchingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);
  const [fiscalForm, setFiscalForm] = useState({ nif: '', name: '', address: '' });
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [modalError, setModalError] = useState('');

  const isTicketsTab = activeTab === 'tickets';
  const currentCount = isTicketsTab ? ticketTotalCount : totalCount;
  const totalPages = Math.ceil(currentCount / pageSize);

  // Local search filter for quick filtering
  const filteredInvoices = useMemo(() => {
    if (!searchQuery || searchQuery === initialSearch) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.customer_fiscal_name.toLowerCase().includes(q) ||
        inv.customer_nif.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery, initialSearch]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery || searchQuery === initialSearch) return ticketOrders;
    const q = searchQuery.toLowerCase();
    return ticketOrders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        formatOrderId(o.order_number, o.id).toLowerCase().includes(q)
    );
  }, [ticketOrders, searchQuery, initialSearch]);

  // Navigate with server-side filters
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (activeTab !== 'facturas') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const query = params.toString();
    window.location.href = `/admin/facturas${query ? `?${query}` : ''}`;
  };

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams();
    if (activeTab !== 'facturas') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    if (page > 1) params.set('page', page.toString());
    const query = params.toString();
    window.location.href = `/admin/facturas${query ? `?${query}` : ''}`;
  };

  const switchTab = (tab: string) => {
    const params = new URLSearchParams();
    if (tab !== 'facturas') params.set('tab', tab);
    const query = params.toString();
    window.location.href = `/admin/facturas${query ? `?${query}` : ''}`;
  };

  // Download invoice PDF
  const handleDownload = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    }
  };

  // Regenerate invoice PDF
  const handleRegenerate = async (invoice: Invoice) => {
    setRegeneratingId(invoice.id);
    try {
      const response = await fetch('/api/admin/facturas/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Error al regenerar factura');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      window.location.reload();
    } catch {
      alert('Error de conexion al regenerar factura');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Download ticket PDF (on-demand generation)
  const handleDownloadTicket = async (order: TicketOrder) => {
    setDownloadingTicketId(order.id);
    try {
      const response = await fetch(
        `/api/admin/facturas?action=download-ticket&orderId=${encodeURIComponent(order.id)}`
      );

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Error al generar ticket');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const orderId = formatOrderId(order.order_number, order.id).replace('#', '');
      a.download = `ticket-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error de conexion al generar ticket');
    } finally {
      setDownloadingTicketId(null);
    }
  };

  // Preview invoice PDF inline
  const handlePreviewInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      setPreviewTitle(invoice.invoice_number);
      setPreviewUrl(invoice.pdf_url);
    }
  };

  // Preview ticket PDF inline (fetch on-demand)
  const handlePreviewTicket = async (order: TicketOrder) => {
    setLoadingPreviewId(order.id);
    try {
      const response = await fetch(
        `/api/admin/facturas?action=download-ticket&orderId=${encodeURIComponent(order.id)}`
      );

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Error al generar ticket');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const orderId = formatOrderId(order.order_number, order.id).replace('#', '');
      setPreviewTitle(`Ticket ${orderId}`);
      setPreviewUrl(url);
    } catch {
      alert('Error de conexion al generar ticket');
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewTitle('');
  };

  // Modal: search orders
  const handleSearchOrders = async () => {
    if (!orderSearch.trim()) return;
    setSearchingOrders(true);
    setModalError('');
    try {
      const response = await fetch(
        `/api/admin/facturas?action=search-orders&q=${encodeURIComponent(orderSearch.trim())}`
      );
      const data = await response.json();
      if (data.error) {
        setModalError(data.error);
      } else {
        setOrderResults(data.orders || []);
        if ((data.orders || []).length === 0) {
          setModalError('No se encontraron pedidos elegibles sin factura');
        }
      }
    } catch {
      setModalError('Error de conexion');
    } finally {
      setSearchingOrders(false);
    }
  };

  const handleSelectOrder = (order: OrderResult) => {
    setSelectedOrder(order);
    setFiscalForm({ nif: '', name: '', address: '' });
    setModalError('');
    setModalStep(2);
  };

  const handleCreateInvoice = async () => {
    if (!selectedOrder) return;
    if (!fiscalForm.nif.trim() || !fiscalForm.name.trim() || !fiscalForm.address.trim()) {
      setModalError('Todos los campos fiscales son obligatorios');
      return;
    }

    setCreatingInvoice(true);
    setModalError('');
    try {
      const response = await fetch('/api/admin/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          customerNif: fiscalForm.nif.trim(),
          customerFiscalName: fiscalForm.name.trim(),
          customerFiscalAddress: fiscalForm.address.trim(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setModalError(err.error || 'Error al crear factura');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const invoiceNumber = response.headers.get('X-Invoice-Number') || 'factura';
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setShowModal(false);
      window.location.reload();
    } catch {
      setModalError('Error de conexion');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalStep(1);
    setOrderSearch('');
    setOrderResults([]);
    setSelectedOrder(null);
    setFiscalForm({ nif: '', name: '', address: '' });
    setModalError('');
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (activeTab !== 'facturas') params.set('tab', activeTab);
    const query = params.toString();
    window.location.href = `/admin/facturas${query ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {currentCount} {isTicketsTab ? 'tickets' : 'facturas'} en total
        </p>
        {!isTicketsTab && (
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generar Factura
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => switchTab('facturas')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${!isTicketsTab
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }
          `}
        >
          <FileText className="w-4 h-4" />
          Facturas
        </button>
        <button
          onClick={() => switchTab('tickets')}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${isTicketsTab
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }
          `}
        >
          <Receipt className="w-4 h-4" />
          Tickets
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                isTicketsTab
                  ? 'Buscar por numero de pedido, nombre o email...'
                  : 'Buscar por numero de factura, NIF o nombre fiscal...'
              }
              className="admin-input pl-10 pr-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="admin-input w-36"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="admin-input w-36"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Content: Invoices or Tickets */}
      <div className="space-y-2">
        {isTicketsTab ? (
          // === TICKETS LIST ===
          filteredTickets.length > 0 ? (
            filteredTickets.map((order) => {
              const defaultColors = { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-l-green-500' };
              const colors = statusColors[order.status] ?? defaultColors;
              const isDownloading = downloadingTicketId === order.id;

              return (
                <div
                  key={order.id}
                  className={`
                    bg-card hover:bg-muted/50 border rounded-lg p-4 transition-all border-l-4
                    ${colors.border} border-border
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-28">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {formatOrderId(order.order_number, order.id)}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Customer */}
                      <div className="md:col-span-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.customer_email}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="font-bold tabular-nums text-foreground">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </div>

                      {/* Status */}
                      <div className="flex justify-end">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${colors.bg} ${colors.text}`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePreviewTicket(order)}
                        disabled={loadingPreviewId === order.id}
                        className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                        title="Ver ticket PDF"
                      >
                        {loadingPreviewId === order.id ? (
                          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 text-purple-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadTicket(order)}
                        disabled={isDownloading}
                        className="p-2 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-50"
                        title="Descargar ticket PDF"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                      <a
                        href={`/admin/pedidos/${order.id}`}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Ver pedido"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No se encontraron tickets</p>
              {(searchQuery || dateFrom || dateTo) && (
                <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          )
        ) : (
          // === INVOICES LIST ===
          filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const hasPdf = !!invoice.pdf_url;
              const isRegenerating = regeneratingId === invoice.id;

              return (
                <div
                  key={invoice.id}
                  className={`
                    bg-card hover:bg-muted/50 border rounded-lg p-4 transition-all border-l-4
                    ${hasPdf ? 'border-l-green-500' : 'border-l-amber-500'}
                    border-border
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Invoice Number */}
                    <div className="flex-shrink-0 w-36">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {invoice.invoice_number}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Order + Customer */}
                      <div className="md:col-span-1">
                        <a
                          href={`/admin/pedidos/${invoice.order_id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Pedido {formatOrderId(invoice.order_number, invoice.order_id)}
                        </a>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {invoice.customer_name || '-'}
                        </p>
                      </div>

                      {/* Fiscal Info */}
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {invoice.customer_fiscal_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{invoice.customer_nif}</p>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="font-bold tabular-nums text-foreground">
                          {formatPrice(invoice.total)}
                        </p>
                      </div>

                      {/* Date + PDF Status */}
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(invoice.issued_at)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                            hasPdf
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-amber-500/20 text-amber-500'
                          }`}
                        >
                          {hasPdf ? 'PDF' : 'Sin PDF'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {hasPdf && (
                        <button
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                          title="Ver factura PDF"
                        >
                          <Eye className="w-4 h-4 text-purple-500" />
                        </button>
                      )}
                      {hasPdf && (
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRegenerate(invoice)}
                        disabled={isRegenerating}
                        className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                        title="Regenerar PDF"
                      >
                        {isRegenerating ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                      <a
                        href={`/admin/pedidos/${invoice.order_id}`}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Ver pedido"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No se encontraron facturas</p>
              {(searchQuery || dateFrom || dateTo) && (
                <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Pagina {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

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
                    onClick={() => navigateToPage(pageNum)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${
                        currentPage === pageNum
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
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Generar Factura */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {modalStep === 1 ? 'Buscar Pedido' : 'Datos Fiscales'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              {modalStep === 1 && (
                <>
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchOrders()}
                        placeholder="Numero de pedido o nombre..."
                        className="admin-input pl-9 w-full"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSearchOrders}
                      disabled={searchingOrders || !orderSearch.trim()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {searchingOrders ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Buscar'
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Solo muestra pedidos pagados/enviados/entregados sin factura existente
                  </p>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orderResults.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm font-semibold">
                              {formatOrderId(order.order_number, order.id)}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {order.customer_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm">{formatPrice(order.total_amount)}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {statusLabels[order.status] || order.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.customer_email} · {formatDate(order.created_at)}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {modalStep === 2 && selectedOrder && (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-semibold">
                          {formatOrderId(selectedOrder.order_number, selectedOrder.id)}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {selectedOrder.customer_name}
                        </span>
                      </div>
                      <span className="font-bold">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setModalStep(1);
                        setModalError('');
                      }}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Cambiar pedido
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        NIF / CIF
                      </label>
                      <input
                        type="text"
                        value={fiscalForm.nif}
                        onChange={(e) => setFiscalForm((f) => ({ ...f, nif: e.target.value }))}
                        placeholder="B12345678"
                        className="admin-input w-full"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Nombre / Razon Social
                      </label>
                      <input
                        type="text"
                        value={fiscalForm.name}
                        onChange={(e) => setFiscalForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Empresa S.L."
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Direccion Fiscal
                      </label>
                      <input
                        type="text"
                        value={fiscalForm.address}
                        onChange={(e) => setFiscalForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="Calle Ejemplo 123, 28001 Madrid"
                        className="admin-input w-full"
                      />
                    </div>

                    <button
                      onClick={handleCreateInvoice}
                      disabled={creatingInvoice}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {creatingInvoice ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generar Factura
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {modalError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {modalError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: PDF Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closePreview}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {previewTitle}
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                download={`${previewTitle}.pdf`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar
              </a>
              <button
                onClick={closePreview}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* PDF iframe */}
          <div className="relative z-10 flex-1 p-4">
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-lg bg-white"
              title={previewTitle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
