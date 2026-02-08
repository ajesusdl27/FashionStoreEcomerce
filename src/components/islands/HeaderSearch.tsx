import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatters';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  offer_price: number | null;
  images: { image_url: string }[] | null;
}

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Live search with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchTerm.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, offer_price, images:product_images(image_url)')
          .eq('active', true)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5);

        if (!error && data) {
          setResults(data as SearchResult[]);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      setShowDropdown(false);
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = `/productos?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const handleToggle = async () => {
    if (isOpen && searchTerm.trim()) {
      // If open and has text, submit
      setIsSearching(true);
      setShowDropdown(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = `/productos?q=${encodeURIComponent(searchTerm.trim())}`;
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setIsSearching(false);
    setShowDropdown(false);
    setResults([]);
  };

  const handleResultClick = (slug: string) => {
    setShowDropdown(false);
    window.location.href = `/productos/${slug}`;
  };

  return (
    <div className="relative flex items-center">
      {/* Expanded Search Input with loading state */}
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex flex-col transition-all duration-300 ease-out ${
          isOpen
            ? 'w-64 sm:w-80 opacity-100 pointer-events-auto'
            : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-card border border-border rounded-full pl-4 pr-10 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSearching}
              aria-label="Campo de búsqueda"
            />
            {/* Loading or Close button inside input */}
            {isSearching ? (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Results Dropdown */}
        {showDropdown && searchTerm.trim().length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((product) => {
                  const imageUrl = product.images?.[0]?.image_url || '/placeholder.jpg';
                  const price = product.offer_price || product.price;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                    >
                      {/* Product Image */}
                      <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-primary font-medium">{formatPrice(price)}</p>
                      </div>
                    </button>
                  );
                })}
                
                {/* View All Results */}
                <button
                  onClick={handleSubmit}
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors border-t border-border mt-1"
                >
                  Ver todos los resultados →
                </button>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron productos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Toggle Button - 44x44px touch target */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
          isOpen ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-muted'
        }`}
        aria-label={isOpen && searchTerm.trim() ? 'Buscar' : isOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
        aria-expanded={isOpen}
        disabled={isSearching}
      >
        {isSearching ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
