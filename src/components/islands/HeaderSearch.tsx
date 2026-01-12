import { useState, useRef, useEffect } from 'react';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/productos?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const handleToggle = () => {
    if (isOpen && searchTerm.trim()) {
      // If open and has text, submit
      window.location.href = `/productos?q=${encodeURIComponent(searchTerm.trim())}`;
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Expanded Search Input */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-out ${
          isOpen
            ? 'w-64 opacity-100 pointer-events-auto'
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
              className="w-full bg-card border border-border rounded-full pl-4 pr-10 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {/* Close button inside input */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar búsqueda"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Search Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`touch-target flex items-center justify-center transition-colors ${
          isOpen ? 'text-primary' : 'hover:text-primary'
        }`}
        aria-label={isOpen ? 'Buscar' : 'Abrir búsqueda'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}
