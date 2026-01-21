import { type ReactNode } from 'react';
import { X, Trash2, Download, Tag, Power, CheckSquare } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: ReactNode;
  className?: string;
}

interface BulkActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Individual Bulk Action Button
 */
export function BulkActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
  loading = false,
}: BulkActionButtonProps) {
  const variantStyles = variant === 'danger' 
    ? 'text-red-400 hover:bg-red-500/20 border-red-500/30' 
    : 'text-foreground hover:bg-muted border-border';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
        rounded-lg border transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles}
      `}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Bulk Actions Bar
 * Appears when items are selected, showing count and available actions
 */
export default function BulkActions({
  selectedCount,
  onClearSelection,
  children,
  className = '',
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div 
      className={`
        flex items-center justify-between gap-4 p-4 mb-4
        bg-primary/5 border border-primary/20 rounded-xl
        animate-in slide-in-from-top duration-200
        ${className}
      `}
    >
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-primary">
          <CheckSquare className="w-5 h-5" />
          <span className="font-semibold">
            {selectedCount} {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          aria-label="Limpiar selección"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

// Pre-built bulk action buttons for common use cases
export function BulkDeleteAction({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <BulkActionButton
      icon={<Trash2 className="w-4 h-4" />}
      label="Eliminar"
      onClick={onClick}
      variant="danger"
      loading={loading}
    />
  );
}

export function BulkExportAction({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <BulkActionButton
      icon={<Download className="w-4 h-4" />}
      label="Exportar"
      onClick={onClick}
      loading={loading}
    />
  );
}

export function BulkCategoryAction({ onClick }: { onClick: () => void }) {
  return (
    <BulkActionButton
      icon={<Tag className="w-4 h-4" />}
      label="Cambiar categoría"
      onClick={onClick}
    />
  );
}

export function BulkToggleAction({ onClick, label = "Activar/Desactivar" }: { onClick: () => void; label?: string }) {
  return (
    <BulkActionButton
      icon={<Power className="w-4 h-4" />}
      label={label}
      onClick={onClick}
    />
  );
}
