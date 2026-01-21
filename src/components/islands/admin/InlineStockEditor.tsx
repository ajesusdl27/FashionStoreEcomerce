import { useState } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

interface InlineStockEditorProps {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  currentStock: number;
  onUpdate?: (variantId: string, newStock: number) => void;
}

export default function InlineStockEditor({
  variantId,
  productId,
  productName,
  size,
  currentStock,
  onUpdate,
}: InlineStockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState(currentStock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (stock === currentStock) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/productos/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          productId,
          stock,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar stock');
      }

      onUpdate?.(variantId, stock);
      setIsEditing(false);
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 bg-green-500 text-white animate-fade-in';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Stock actualizado</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStock(currentStock);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
          onKeyDown={handleKeyDown}
          className="w-16 px-2 py-1 text-sm bg-card border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
          disabled={isLoading}
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <>
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-green-500/20 text-green-500 transition-colors"
              title="Guardar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`badge ${currentStock === 0 ? 'badge-danger' : currentStock < 5 ? 'badge-warning' : 'badge-success'}`}
      >
        {currentStock === 0 ? 'Sin stock' : `${currentStock} uds`}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-60 hover:opacity-100"
        title="Editar stock"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
