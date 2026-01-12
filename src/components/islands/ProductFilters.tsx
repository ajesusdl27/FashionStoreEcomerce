import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialOffers?: boolean;
  initialSort?: string;
}

export default function ProductFilters({
  categories,
  initialCategory = '',
  initialSearch = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  initialOffers = false,
  initialSort = 'created_at',
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  // Build URL preserving all current filters
  const buildURL = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    return url.toString();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildURL({ q: search || null });
  };

  const handleCategoryChange = (slug: string) => {
    window.location.href = buildURL({ categoria: slug || null });
  };

  const handleSortChange = (value: string) => {
    const url = new URL(window.location.href);
    
    if (value === 'price-asc') {
      url.searchParams.set('orden', 'price');
      url.searchParams.set('dir', 'asc');
    } else if (value === 'price-desc') {
      url.searchParams.set('orden', 'price');
      url.searchParams.delete('dir');
    } else if (value === 'name') {
      url.searchParams.set('orden', 'name');
      url.searchParams.set('dir', 'asc');
    } else {
      url.searchParams.delete('orden');
      url.searchParams.delete('dir');
    }
    
    window.location.href = url.toString();
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildURL({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const handleOffersToggle = () => {
    const currentOffers = new URL(window.location.href).searchParams.get('ofertas') === 'true';
    window.location.href = buildURL({ ofertas: currentOffers ? null : 'true' });
  };

  const clearFilters = () => {
    window.location.href = '/productos';
  };

  const hasActiveFilters = initialCategory || initialSearch || initialMinPrice || initialMaxPrice || initialOffers;

  // Inline all filter content to avoid re-mount issues
  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="search-input" className="block font-heading text-sm font-semibold uppercase tracking-wider mb-3">
          Buscar
        </label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            id="search-input"
            defaultValue={initialSearch}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors"
            aria-label="Buscar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-1.5">Pulsa Enter o el botón para buscar</p>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
          Categorías
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => handleCategoryChange('')}
              className={`block w-full text-left py-1.5 text-sm transition-colors ${
                !initialCategory ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`block w-full text-left py-1.5 text-sm transition-colors ${
                  initialCategory === cat.slug ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
          Rango de Precio
        </h3>
        <form onSubmit={handlePriceSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              defaultValue={initialMinPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min €"
              min="0"
              step="0.01"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              defaultValue={initialMaxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max €"
              min="0"
              step="0.01"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary text-background rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Aplicar precio
          </button>
        </form>
      </div>

      {/* Offers */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
          Ofertas
        </h3>
        <button
          type="button"
          onClick={handleOffersToggle}
          className={`flex items-center gap-2 py-1.5 text-sm transition-colors ${
            initialOffers ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className={initialOffers ? 'text-accent' : ''}>🔥</span>
          Solo ofertas
        </button>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">
          Ordenar por
        </h3>
        <select
          defaultValue={initialSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="created_at">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name">Nombre A-Z</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-2 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl">Filtros</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
