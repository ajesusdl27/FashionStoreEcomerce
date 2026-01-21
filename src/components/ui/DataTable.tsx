import { 
  useState, 
  useCallback, 
  type ReactNode, 
  type ChangeEvent 
} from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  
  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (ids: Set<string>) => void;
  
  // Sorting
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  
  // Pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  
  // Loading & Empty states
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  
  // Styling
  className?: string;
  compact?: boolean;
  
  // Row click handler
  onRowClick?: (row: T) => void;
}

/**
 * DataTable Component
 * Reusable table with sorting, selection, and pagination
 */
export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  selectable = false,
  selectedIds = new Set(),
  onSelect,
  sortKey,
  sortDirection,
  onSort,
  page = 1,
  pageSize = 20,
  totalCount,
  onPageChange,
  loading = false,
  emptyMessage = 'No hay datos',
  emptyIcon,
  className = '',
  compact = false,
  onRowClick,
}: DataTableProps<T>) {
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;
  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(String(row[keyField])));
  const someSelected = data.some((row) => selectedIds.has(String(row[keyField])));

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onSelect) return;
    
    if (e.target.checked) {
      const newIds = new Set(selectedIds);
      data.forEach((row) => newIds.add(String(row[keyField])));
      onSelect(newIds);
    } else {
      const newIds = new Set(selectedIds);
      data.forEach((row) => newIds.delete(String(row[keyField])));
      onSelect(newIds);
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onSelect) return;
    
    const newIds = new Set(selectedIds);
    if (newIds.has(rowId)) {
      newIds.delete(rowId);
    } else {
      newIds.add(rowId);
    }
    onSelect(newIds);
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    let newDirection: SortDirection;
    if (sortKey !== key) {
      newDirection = 'asc';
    } else if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortDirection === 'desc') {
      newDirection = null;
    } else {
      newDirection = 'asc';
    }
    
    onSort(key, newDirection);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-primary" />;
    }
    return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
  };

  return (
    <div className={className}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {selectable && (
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                    aria-label="Seleccionar todos"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    ${col.headerClassName || ''}
                    ${col.sortable && onSort ? 'cursor-pointer select-none' : ''}
                  `}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {col.sortable && onSort && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {selectable && (
                    <td>
                      <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    {emptyIcon && (
                      <div className="mb-3 opacity-50">{emptyIcon}</div>
                    )}
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, index) => {
                const rowId = String(row[keyField]);
                const isSelected = selectedIds.has(rowId);
                
                return (
                  <tr
                    key={rowId}
                    className={`
                      group
                      ${isSelected ? 'bg-primary/5' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                          aria-label={`Seleccionar fila ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ''}>
                        {col.render 
                          ? col.render(row, index) 
                          : row[col.key] as ReactNode
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount !== undefined && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} de {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${page === pageNum 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage table state (selection, sorting, pagination)
 */
export function useTableState<T>(initialPageSize = 20) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  const handleSort = useCallback((key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1); // Reset to first page on sort
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    sortKey,
    sortDirection,
    handleSort,
    page,
    setPage,
    pageSize,
    clearSelection,
    resetPagination,
  };
}
