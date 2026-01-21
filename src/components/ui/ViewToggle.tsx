import { useState, useEffect } from 'react';
import { Grid3X3, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  storageKey?: string;
  className?: string;
}

/**
 * ViewToggle Component
 * Allows switching between grid and list views with localStorage persistence
 */
export default function ViewToggle({
  view,
  onChange,
  storageKey,
  className = '',
}: ViewToggleProps) {
  // Persist preference in localStorage if storageKey is provided
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, view);
    }
  }, [view, storageKey]);

  return (
    <div className={`inline-flex items-center rounded-lg bg-muted p-1 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`
          p-2 rounded-md transition-all
          focus:outline-none focus:ring-2 focus:ring-primary/50
          ${view === 'grid' 
            ? 'bg-card text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
        aria-label="Vista en cuadrícula"
        aria-pressed={view === 'grid'}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`
          p-2 rounded-md transition-all
          focus:outline-none focus:ring-2 focus:ring-primary/50
          ${view === 'list' 
            ? 'bg-card text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
        aria-label="Vista en lista"
        aria-pressed={view === 'list'}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Hook to manage view mode with localStorage persistence
 */
export function useViewMode(storageKey: string, defaultView: ViewMode = 'list'): [ViewMode, (view: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'grid' || stored === 'list') {
        return stored;
      }
    }
    return defaultView;
  });

  const setViewWithStorage = (newView: ViewMode) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newView);
    }
  };

  return [view, setViewWithStorage];
}
