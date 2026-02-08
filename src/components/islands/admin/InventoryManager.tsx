import { useState, useMemo, useCallback } from 'react';
import {
  Search, Package, AlertTriangle, XCircle, CheckCircle,
  ChevronLeft, ChevronRight, Edit2, Check, X, Loader2,
  ArrowUpDown, ArrowUp, ArrowDown, Plus, Minus, Save,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface ProductVariant {
  id: string;
  size: string;
  stock: number;
  product: {
    id: string;
    name: string;
    price: number;
    category: {
      id: string;
      name: string;
    } | null;
  };
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

interface InventoryManagerProps {
  initialVariants: ProductVariant[];
  categories: Category[];
  lowStockThreshold: number;
  metrics: {
    totalSkus: number;
    outOfStock: number;
    lowStock: number;
    inventoryValue: number;
  };
}

type StockFilter = 'all' | 'out-of-stock' | 'low-stock' | 'normal';
type SortField = 'name' | 'stock-asc' | 'stock-desc' | 'category';

// ============================================
// COMPONENT
// ============================================

export default function InventoryManager({
  initialVariants,
  categories,
  lowStockThreshold,
  metrics: _initialMetrics,
}: InventoryManagerProps) {
  // State
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'add' | 'set'>('add');
  const [bulkValue, setBulkValue] = useState<number>(0);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [savingVariant, setSavingVariant] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const ITEMS_PER_PAGE = 25;

  // ============================================
  // COMPUTED / FILTERED DATA
  // ============================================

  const filteredVariants = useMemo(() => {
    let result = [...variants];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.product.name.toLowerCase().includes(q) ||
        v.size.toLowerCase().includes(q) ||
        v.product.category?.name.toLowerCase().includes(q)
      );
    }

    // Stock status filter
    if (stockFilter === 'out-of-stock') {
      result = result.filter(v => v.stock === 0);
    } else if (stockFilter === 'low-stock') {
      result = result.filter(v => v.stock > 0 && v.stock <= lowStockThreshold);
    } else if (stockFilter === 'normal') {
      result = result.filter(v => v.stock > lowStockThreshold);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(v => v.product.category?.id === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'name':
          return a.product.name.localeCompare(b.product.name) || a.size.localeCompare(b.size);
        case 'stock-asc':
          return a.stock - b.stock || a.product.name.localeCompare(b.product.name);
        case 'stock-desc':
          return b.stock - a.stock || a.product.name.localeCompare(b.product.name);
        case 'category':
          return (a.product.category?.name || '').localeCompare(b.product.category?.name || '') || a.product.name.localeCompare(b.product.name);
        default:
          return 0;
      }
    });

    return result;
  }, [variants, searchQuery, stockFilter, categoryFilter, sortField, lowStockThreshold]);

  const totalPages = Math.ceil(filteredVariants.length / ITEMS_PER_PAGE);
  const paginatedVariants = filteredVariants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Live metrics based on current data
  const liveMetrics = useMemo(() => ({
    totalSkus: variants.length,
    outOfStock: variants.filter(v => v.stock === 0).length,
    lowStock: variants.filter(v => v.stock > 0 && v.stock <= lowStockThreshold).length,
    inventoryValue: variants.reduce((sum, v) => sum + (v.stock * v.product.price), 0),
  }), [variants, lowStockThreshold]);

  // ============================================
  // HELPERS
  // ============================================

  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) return { label: 'Sin stock', class: 'badge-danger', icon: XCircle };
    if (stock <= lowStockThreshold) return { label: 'Bajo', class: 'badge-warning', icon: AlertTriangle };
    return { label: 'OK', class: 'badge-success', icon: CheckCircle };
  }, [lowStockThreshold]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleInlineSave = async (variantId: string) => {
    setSavingVariant(variantId);
    try {
      const response = await fetch('/api/admin/productos/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, stock: editStock }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar');
      }

      setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, stock: editStock } : v
      ));
      setEditingVariant(null);
      showToast('Stock actualizado');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingVariant(null);
    }
  };

  const handleBulkSave = async () => {
    if (selectedVariants.size === 0) return;

    setIsBulkSaving(true);
    try {
      const updates = Array.from(selectedVariants).map(variantId => {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return null;
        
        let newStock: number;
        if (bulkAction === 'add') {
          newStock = Math.max(0, variant.stock + bulkValue);
        } else {
          newStock = Math.max(0, bulkValue);
        }
        
        return { variantId, stock: newStock };
      }).filter(Boolean) as { variantId: string; stock: number }[];

      const response = await fetch('/api/admin/productos/stock-bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Error en actualización masiva');
      }

      // Update local state
      setVariants(prev => prev.map(v => {
        const update = updates.find(u => u.variantId === v.id);
        if (update) return { ...v, stock: update.stock };
        return v;
      }));

      setSelectedVariants(new Set());
      setBulkValue(0);
      setIsBulkMode(false);
      showToast(data.message);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVariants.size === paginatedVariants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(paginatedVariants.map(v => v.id)));
    }
  };

  const toggleSelectVariant = (id: string) => {
    const next = new Set(selectedVariants);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedVariants(next);
  };

  // ============================================
  // RENDER
  // ============================================

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField === field) return <ArrowUp className="w-3 h-3" />;
    if (sortField === `${field}-desc`) return <ArrowDown className="w-3 h-3" />;
    return <ArrowUpDown className="w-3 h-3 opacity-50" />;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
          className={`admin-card text-left transition-all ${stockFilter === 'all' ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border'}`}
        >
          <p className="text-sm text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold text-foreground">{liveMetrics.totalSkus}</p>
          <p className="text-xs text-muted-foreground mt-1">variantes registradas</p>
        </button>

        <button
          onClick={() => { setStockFilter('out-of-stock'); setCurrentPage(1); }}
          className={`admin-card text-left transition-all ${stockFilter === 'out-of-stock' ? 'ring-2 ring-red-500' : 'hover:ring-1 hover:ring-border'}`}
        >
          <p className="text-sm text-muted-foreground">Sin Stock</p>
          <p className={`text-2xl font-bold ${liveMetrics.outOfStock > 0 ? 'text-red-500' : 'text-foreground'}`}>
            {liveMetrics.outOfStock}
          </p>
          <p className="text-xs text-muted-foreground mt-1">productos agotados</p>
        </button>

        <button
          onClick={() => { setStockFilter('low-stock'); setCurrentPage(1); }}
          className={`admin-card text-left transition-all ${stockFilter === 'low-stock' ? 'ring-2 ring-amber-500' : 'hover:ring-1 hover:ring-border'}`}
        >
          <p className="text-sm text-muted-foreground">Stock Bajo</p>
          <p className={`text-2xl font-bold ${liveMetrics.lowStock > 0 ? 'text-amber-500' : 'text-foreground'}`}>
            {liveMetrics.lowStock}
          </p>
          <p className="text-xs text-muted-foreground mt-1">&lt; {lowStockThreshold} unidades</p>
        </button>

        <button
          onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
          className="admin-card text-left hover:ring-1 hover:ring-border transition-all"
        >
          <p className="text-sm text-muted-foreground">Valor Inventario</p>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(liveMetrics.inventoryValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">precio × stock</p>
        </button>
      </div>

      {/* Alert Banners */}
      {liveMetrics.outOfStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>{liveMetrics.outOfStock} variante{liveMetrics.outOfStock !== 1 ? 's' : ''}</strong> sin stock.
            <button onClick={() => { setStockFilter('out-of-stock'); setCurrentPage(1); }} className="underline ml-1 hover:no-underline">
              Ver agotados
            </button>
          </p>
        </div>
      )}

      {liveMetrics.lowStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>{liveMetrics.lowStock} variante{liveMetrics.lowStock !== 1 ? 's' : ''}</strong> con stock bajo (&lt; {lowStockThreshold} uds).
            <button onClick={() => { setStockFilter('low-stock'); setCurrentPage(1); }} className="underline ml-1 hover:no-underline">
              Ver bajo stock
            </button>
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar producto, talla o categoría..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="stock-asc">Ordenar: Menos stock</option>
              <option value="stock-desc">Ordenar: Más stock</option>
              <option value="category">Ordenar: Categoría</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {stockFilter !== 'all' && (
              <button
                onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3" /> Limpiar filtro
              </button>
            )}
            <button
              onClick={() => { setIsBulkMode(!isBulkMode); setSelectedVariants(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                isBulkMode
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              {isBulkMode ? 'Cancelar edición masiva' : 'Edición masiva'}
            </button>
          </div>
        </div>

        {/* Bulk Mode Controls */}
        {isBulkMode && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedVariants.size} seleccionada{selectedVariants.size !== 1 ? 's' : ''}
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as 'add' | 'set')}
                  className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                >
                  <option value="add">Añadir stock</option>
                  <option value="set">Establecer stock en</option>
                </select>

                <div className="flex items-center gap-1">
                  {bulkAction === 'add' && (
                    <button
                      onClick={() => setBulkValue(v => v - 1)}
                      className="p-2 rounded-lg hover:bg-muted border border-border"
                      disabled={bulkValue <= -999}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    type="number"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(parseInt(e.target.value) || 0)}
                    min={bulkAction === 'set' ? 0 : -999}
                    max={9999}
                    className="w-20 px-3 py-2 text-center bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {bulkAction === 'add' && (
                    <button
                      onClick={() => setBulkValue(v => v + 1)}
                      className="p-2 rounded-lg hover:bg-muted border border-border"
                      disabled={bulkValue >= 9999}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm text-muted-foreground ml-1">uds</span>
                </div>
              </div>

              <button
                onClick={handleBulkSave}
                disabled={selectedVariants.size === 0 || isBulkSaving || (bulkAction === 'add' && bulkValue === 0)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isBulkSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Aplicar a {selectedVariants.size} variante{selectedVariants.size !== 1 ? 's' : ''}
              </button>
            </div>

            {selectedVariants.size > 0 && bulkValue !== 0 && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Vista previa:</strong>{' '}
                  {bulkAction === 'add'
                    ? `Se ${bulkValue > 0 ? 'añadirán' : 'restarán'} ${Math.abs(bulkValue)} unidades a cada variante seleccionada.`
                    : `Se establecerá el stock de cada variante seleccionada en ${bulkValue} unidades.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredVariants.length)} de {filteredVariants.length} variantes
          {filteredVariants.length !== variants.length && ` (filtrado de ${variants.length} total)`}
        </span>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {isBulkMode && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVariants.size === paginatedVariants.length && paginatedVariants.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button onClick={() => setSortField(sortField === 'name' ? 'name' : 'name')} className="flex items-center gap-1 hover:text-foreground">
                    Producto <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Talla</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button onClick={() => setSortField(sortField === 'category' ? 'category' : 'category')} className="flex items-center gap-1 hover:text-foreground">
                    Categoría <SortIcon field="category" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <button
                    onClick={() => setSortField(sortField === 'stock-asc' ? 'stock-desc' : 'stock-asc')}
                    className="flex items-center gap-1 hover:text-foreground mx-auto"
                  >
                    Stock
                    {sortField === 'stock-asc' ? <ArrowUp className="w-3 h-3" /> :
                     sortField === 'stock-desc' ? <ArrowDown className="w-3 h-3" /> :
                     <ArrowUpDown className="w-3 h-3 opacity-50" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan={isBulkMode ? 7 : 6} className="px-4 py-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No se encontraron variantes con los filtros actuales</p>
                    <button
                      onClick={() => { setSearchQuery(''); setStockFilter('all'); setCategoryFilter('all'); setCurrentPage(1); }}
                      className="text-primary hover:underline mt-2 text-sm"
                    >
                      Limpiar filtros
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedVariants.map((variant) => {
                  const status = getStockStatus(variant.stock);
                  const isEditing = editingVariant === variant.id;
                  const isSaving = savingVariant === variant.id;

                  return (
                    <tr
                      key={variant.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        variant.stock === 0 ? 'bg-red-500/5' :
                        variant.stock <= lowStockThreshold ? 'bg-amber-500/5' : ''
                      } ${selectedVariants.has(variant.id) ? 'bg-primary/5' : ''}`}
                    >
                      {isBulkMode && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedVariants.has(variant.id)}
                            onChange={() => toggleSelectVariant(variant.id)}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/productos/${variant.product.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {variant.product.name}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-muted text-xs font-medium">
                          {variant.size}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {variant.product.category?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={editStock}
                              onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlineSave(variant.id);
                                if (e.key === 'Escape') setEditingVariant(null);
                              }}
                              className="w-16 px-2 py-1 text-sm text-center bg-card border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                              autoFocus
                              disabled={isSaving}
                            />
                          </div>
                        ) : (
                          <span className={`font-mono font-medium ${
                            variant.stock === 0 ? 'text-red-500' :
                            variant.stock <= lowStockThreshold ? 'text-amber-500' :
                            'text-foreground'
                          }`}>
                            {variant.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <>
                                <button
                                  onClick={() => handleInlineSave(variant.id)}
                                  className="p-1 rounded hover:bg-green-500/20 text-green-500 transition-colors"
                                  title="Guardar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingVariant(null)}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingVariant(variant.id); setEditStock(variant.stock); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-60 hover:opacity-100"
                            title="Editar stock"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
