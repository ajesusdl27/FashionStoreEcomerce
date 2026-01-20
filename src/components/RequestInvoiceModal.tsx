import { useState } from 'react';
import { X } from 'lucide-react';

interface RequestInvoiceModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceNumber: string, invoiceUrl?: string) => void;
}

export default function RequestInvoiceModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess
}: RequestInvoiceModalProps) {
  const [formData, setFormData] = useState({
    customerNif: '',
    customerFiscalName: '',
    customerFiscalAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/invoices/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          ...formData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al generar la factura');
      }

      // Descargar el PDF
      const invoiceNumber = response.headers.get('X-Invoice-Number') || 'fs-xxxx';
      const invoiceUrl = response.headers.get('X-Invoice-Url') || undefined;
      
      // Descargar PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      onSuccess(invoiceNumber, invoiceUrl);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Solicitar Factura
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Pedido #{orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              NIF / CIF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerNif}
              onChange={(e) => setFormData({ ...formData, customerNif: e.target.value.toUpperCase() })}
              placeholder="12345678A o B12345678"
              required
              pattern="^[A-Z0-9]{8,9}$"
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre / Razón Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerFiscalName}
              onChange={(e) => setFormData({ ...formData, customerFiscalName: e.target.value })}
              placeholder="Nombre completo o empresa"
              required
              minLength={2}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Dirección Fiscal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.customerFiscalAddress}
              onChange={(e) => setFormData({ ...formData, customerFiscalAddress: e.target.value })}
              placeholder="Calle, número, código postal, ciudad, provincia"
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-lime-500 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-lime-400 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </>
              ) : (
                'Generar Factura'
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="px-5 pb-5">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Nota:</strong> La factura se generará y descargará automáticamente. 
              Los datos fiscales introducidos quedarán asociados a este pedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
