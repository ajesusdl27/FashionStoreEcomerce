import { type ReactNode, type ChangeEvent } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * FilterBar Container
 * Wraps filter components with consistent styling
 */
export default function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`
      bg-card border border-border rounded-xl p-4 mb-6
      flex flex-col md:flex-row gap-4
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Search Input for FilterBar
 */
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Buscar...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input w-full pl-10 pr-10"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Select Filter for FilterBar
 */
interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  label,
}: SelectFilterProps) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="sr-only">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-select w-full md:w-48"
        aria-label={label || placeholder}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Date Range Filter for FilterBar
 */
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className = '',
}: DateRangeFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="admin-input w-36"
        aria-label="Fecha desde"
      />
      <span className="text-muted-foreground">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="admin-input w-36"
        aria-label="Fecha hasta"
      />
    </div>
  );
}

/**
 * Clear Filters Button
 */
interface ClearFiltersProps {
  onClick: () => void;
  visible?: boolean;
  className?: string;
}

export function ClearFilters({ onClick, visible = true, className = '' }: ClearFiltersProps) {
  if (!visible) return null;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
        text-primary hover:text-primary/80 transition-colors
        ${className}
      `}
    >
      <X className="w-4 h-4" />
      Limpiar filtros
    </button>
  );
}

/**
 * Filter Group with label
 */
interface FilterGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ label, children, className = '' }: FilterGroupProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Status Tab Filters (for switching between status views)
 */
interface StatusTab {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

interface StatusTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StatusTabs({ tabs, activeTab, onChange, className = '' }: StatusTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const colorClass = tab.color || (isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80');
        
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive ? colorClass : 'bg-muted text-muted-foreground hover:bg-muted/80'}
            `}
            aria-pressed={isActive}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
