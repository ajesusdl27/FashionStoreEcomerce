import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Tag, Flame, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderNavigationProps {
  currentPath: string;
}

export default function HeaderNavigation({ currentPath }: HeaderNavigationProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');
        
        if (fetchError) {
          console.error('Error fetching categories:', fetchError);
          setError(fetchError.message);
          return;
        }
        
        if (data) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching categories:', err);
        setError('Error al cargar categorías');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const linkClasses = (path: string) => `
    text-sm font-medium transition-colors relative
    ${isActive(path) 
      ? 'text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' 
      : 'hover:text-primary'
    }
  `;

  return (
    <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
      {/* Home Link */}
      <a 
        href="/" 
        className={linkClasses('/')}
        aria-current={isActive('/') ? 'page' : undefined}
      >
        Inicio
      </a>

      {/* Products Link */}
      <a 
        href="/productos" 
        className={linkClasses('/productos')}
        aria-current={isActive('/productos') ? 'page' : undefined}
      >
        Productos
      </a>

      {/* Categories Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
            currentPath.startsWith('/categoria') ? 'text-primary' : 'hover:text-primary'
          }`}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          Categorías
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-3 w-56 glass border border-border rounded-lg shadow-xl py-2 z-[45] animate-in fade-in slide-in-from-top-2 duration-200">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Cargando categorías...
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <a
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    currentPath === `/categoria/${category.slug}`
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setIsDropdownOpen(false)}
                  aria-current={currentPath === `/categoria/${category.slug}` ? 'page' : undefined}
                >
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {category.name}
                </a>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No hay categorías disponibles
              </div>
            )}
            
            {/* View All Link */}
            <div className="border-t border-border mt-2 pt-2">
              <a
                href="/productos"
                className="flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-muted transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Ver todos los productos
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Offers Link - Highlighted */}
      <a 
        href="/productos?ofertas=true" 
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
          currentPath.includes('ofertas=true') 
            ? 'text-accent' 
            : 'text-accent hover:text-accent/80'
        }`}
        aria-current={currentPath.includes('ofertas=true') ? 'page' : undefined}
      >
        <Flame className="w-4 h-4" />
        Ofertas
      </a>
    </nav>
  );
}
