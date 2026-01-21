import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus,
  Edit, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Grid3X3, 
  List,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
  Download,
  Power,
  Tag as TagIcon,
  Check,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  active: boolean;
  category?: { id: string; name: string };
  images?: { image_url: string; order: number }[];
  variants?: { id: string; size: string; stock: number }[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsListProps {
  initialProducts: Product[];
  categories: Category[];
}

type ViewMode = 'list' | 'grid';
type SortKey = 'name' | 'price' | 'stock' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function ProductsList({ initialProducts, categories }: ProductsListProps) {
  // State
  const [products, setProducts] = useState(initialProducts);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('products-view') as ViewMode) || 'list';
    }
    return 'list';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Save view preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('products-view', viewMode);
    }
  }, [viewMode]);

  // Helper functions
  const getTotalStock = (variants: Product['variants']) => {
    return variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  };

  const getFirstImage = (images: Product['images']) => {
    if (!images || images.length === 0) return '/placeholder.jpg';
    const sorted = [...images].sort((a, b) => a.order - b.order);
    return sorted[0]?.image_url || '/placeholder.jpg';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.category?.id === categoryFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((p) => p.active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((p) => !p.active);
    } else if (statusFilter === 'offer') {
      result = result.filter((p) => p.is_offer);
    } else if (statusFilter === 'low-stock') {
      result = result.filter((p) => getTotalStock(p.variants) < 10);
    }

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'stock':
            comparison = getTotalStock(a.variants) - getTotalStock(b.variants);
            break;
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, sortKey, sortDirection]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
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

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Delete handler
  const handleDelete = async (product: Product) => {
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deleteTarget.id);
          return newSet;
        });
        showToast('Producto eliminado', 'success');
      } else {
        showToast('Error al eliminar', 'error');
      }
    } catch (error) {
      showToast('Error al eliminar', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`¿Eliminar ${selectedIds.size} producto(s)?`)) return;
    
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await fetch('/api/admin/productos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      }
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      showToast(`${selectedIds.size} productos eliminados`, 'success');
    } catch (error) {
      showToast('Error al eliminar', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    const data = selected.length > 0 ? selected : filteredProducts;
    
    const headers = ['Nombre', 'Slug', 'Precio', 'Stock', 'Categoría', 'Estado'];
    const rows = data.map((p) => [
      p.name,
      p.slug,
      p.price.toString(),
      getTotalStock(p.variants).toString(),
      p.category?.name || '',
      p.active ? 'Activo' : 'Inactivo',
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exportado correctamente', 'success');
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${
          type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
        }
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

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setSortKey(null);
  };

  const hasActiveFilters = searchQuery || categoryFilter || statusFilter || sortKey;

  // Render sort icon
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {filteredProducts.length} de {products.length} productos
        </p>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex items-center rounded-lg bg-muted p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Vista en cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Vista en lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <a href="/admin/productos/nuevo" className="admin-btn-primary">
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-bar">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o slug..."
              className="admin-input pl-10 pr-10"
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

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select md:w-48"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select md:w-40"
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="offer">En oferta</option>
            <option value="low-stock">Stock bajo</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
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
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const totalStock = getTotalStock(product.variants);
            const isSelected = selectedIds.has(product.id);
            
            return (
              <div
                key={product.id}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  <img
                    src={getFirstImage(product.images)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(product.id)}
                      className="w-5 h-5 rounded border-input bg-background text-primary focus:ring-primary"
                    />
                  </div>
                  {product.is_offer && (
                    <span className="absolute top-2 right-2 badge badge-danger">Oferta</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mb-2">/{product.slug}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    {product.is_offer && product.offer_price ? (
                      <div>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="font-bold text-red-500 ml-2">
                          {formatPrice(product.offer_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold">{formatPrice(product.price)}</span>
                    )}
                    <span
                      className={`badge ${
                        totalStock === 0 ? 'badge-danger' : totalStock < 10 ? 'badge-warning' : 'badge-success'
                      }`}
                    >
                      {totalStock} uds
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${product.active ? 'badge-success' : 'badge-muted'}`}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                    {product.category && (
                      <span className="badge badge-muted text-xs">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <a
                    href={`/admin/productos/${product.id}`}
                    className="flex-1 admin-btn-secondary text-center text-sm py-2"
                  >
                    Editar
                  </a>
                  <a
                    href={`/productos/${product.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Ver en tienda"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products List View */}
      {viewMode === 'list' && (
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredProducts.length;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                    />
                  </th>
                  <th>Imagen</th>
                  <th
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nombre
                      <SortIcon columnKey="name" />
                    </div>
                  </th>
                  <th>Categoría</th>
                  <th
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Precio
                      <SortIcon columnKey="price" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Stock
                      <SortIcon columnKey="stock" />
                    </div>
                  </th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const totalStock = getTotalStock(product.variants);
                  const isSelected = selectedIds.has(product.id);
                  
                  return (
                    <tr
                      key={product.id}
                      className={`group ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                        />
                      </td>
                      <td>
                        <img
                          src={getFirstImage(product.images)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-muted ring-1 ring-border"
                        />
                      </td>
                      <td>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">/{product.slug}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-muted">
                          {product.category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="text-right">
                        {product.is_offer && product.offer_price ? (
                          <div>
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </p>
                            <p className="font-bold text-red-500">
                              {formatPrice(product.offer_price)}
                            </p>
                          </div>
                        ) : (
                          <p className="font-bold tabular-nums">{formatPrice(product.price)}</p>
                        )}
                      </td>
                      <td className="text-right">
                        <span
                          className={`badge ${
                            totalStock === 0
                              ? 'badge-danger'
                              : totalStock < 10
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {totalStock} uds
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`badge ${product.active ? 'badge-success' : 'badge-muted'}`}>
                            {product.active ? 'Activo' : 'Inactivo'}
                          </span>
                          {product.is_offer && (
                            <span className="badge badge-danger">Oferta</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`/admin/productos/${product.id}`}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </a>
                          <a
                            href={`/productos/${product.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Ver en tienda"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="admin-card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-heading text-foreground mb-2">
            {products.length === 0 ? 'No hay productos' : 'Sin resultados'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {products.length === 0
              ? 'Crea tu primer producto para empezar.'
              : 'No se encontraron productos con los filtros aplicados.'}
          </p>
          {products.length === 0 ? (
            <a href="/admin/productos/nuevo" className="admin-btn-primary inline-flex">
              <Plus className="w-5 h-5 mr-2" />
              Crear producto
            </a>
          ) : (
            <button onClick={clearFilters} className="text-primary hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">¿Eliminar producto?</h3>
                <p className="text-muted-foreground text-sm">
                  Vas a eliminar <strong className="text-foreground">{deleteTarget.name}</strong>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
