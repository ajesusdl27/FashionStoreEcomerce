import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = `/productos?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const handleToggle = async () => {
    if (isOpen && searchTerm.trim()) {
      // If open and has text, submit
      setIsSearching(true);
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
  };

  return (
    <div className="relative flex items-center">
      {/* Expanded Search Input with loading state */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-out ${
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
