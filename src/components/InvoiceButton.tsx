import { useState, useEffect } from 'react';
import RequestInvoiceModal from './RequestInvoiceModal';
import { FileText } from 'lucide-react';

interface InvoiceButtonProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
}

interface InvoiceInfo {
  id: string;
  invoice_number: string;
  pdf_url?: string;
}

export default function InvoiceButton({ orderId, orderNumber, orderStatus }: InvoiceButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if invoice already exists for this order
  useEffect(() => {
    const checkInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/check?orderId=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.invoice) {
            setInvoice(data.invoice);
          }
        }
      } catch (err) {
        console.error('Error checking invoice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (['paid', 'shipped', 'delivered'].includes(orderStatus)) {
      checkInvoice();
    } else {
      setIsLoading(false);
    }
  }, [orderId, orderStatus]);

  const handleSuccess = (invoiceNumber: string, invoiceUrl?: string) => {
    setInvoice({ 
      id: '', 
      invoice_number: invoiceNumber,
      pdf_url: invoiceUrl 
    });
  };

  // Don't show for pending or cancelled orders
  if (!['paid', 'shipped', 'delivered'].includes(orderStatus)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="glass border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-3 bg-muted rounded w-32 mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const showDownload = invoice?.pdf_url;

  return (
    <>
      <div className="glass border border-border rounded-2xl p-6">
        <h2 className="font-heading text-lg mb-4">Factura</h2>
        
        {showDownload ? (
          // Invoice exists AND has URL - show download option
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-500">Factura disponible</p>
                <p className="text-xs text-muted-foreground">Nº {invoice?.invoice_number}</p>
              </div>
            </div>
            
            <a
              href={invoice?.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-primary text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-primary/90 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Descargar Factura
            </a>
          </div>
        ) : (
          // No invoice OR invoice exists but download failed (zombie) - show request button
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {invoice 
                ? 'Hubo un error al generar la factura. Por favor, solicítala de nuevo para regenerarla.' 
                : 'Si necesitas una factura con tus datos fiscales, puedes solicitarla aquí.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-all"
            >
              <FileText className="w-5 h-5" />
              {invoice ? 'Regenerar Factura' : 'Solicitar Factura'}
            </button>
          </div>
        )}
      </div>

      <RequestInvoiceModal
        orderId={orderId}
        orderNumber={orderNumber}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
