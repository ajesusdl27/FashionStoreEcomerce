import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string | number;
  label: string | number;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, className = '', placeholder = 'Seleccionar...' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
      >
        <span className={!selectedOption ? 'text-muted-foreground' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                  ${option.value === value 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {option.label}
                {option.value === value && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
