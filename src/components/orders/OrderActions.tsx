import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  customerEmail: string;
}

export default function OrderActions({ orderId, orderStatus, customerEmail }: OrderActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc('cancel_order', {
        p_order_id: orderId
      });

      if (rpcError) {
        throw rpcError;
      }

      // Reload page to reflect new status
      window.location.reload();
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Error al cancelar el pedido.');
      setIsCancelling(false);
    }
  };

  const canCancel = orderStatus === 'paid';
  const canRequestReturn = orderStatus === 'delivered';

  if (!canCancel && !canRequestReturn) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Cancel Order Button */}
      {canCancel && (
        <button
          onClick={handleCancelOrder}
          disabled={isCancelling}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cancelando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar Pedido
            </>
          )}
        </button>
      )}

      {/* Request Return Button */}
      {canRequestReturn && (
        <button
          onClick={() => setShowReturnModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg font-medium transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Solicitar Devolución
        </button>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReturnModal(false)}
          />
          
          {/* Modal - uses card semantic colors */}
          <div className="relative bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Solicitar Devolución</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Pedido #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="space-y-5">
              {/* Shipping Instructions */}
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Instrucciones de Envío
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Debes enviar los artículos en su embalaje original a:
                </p>
                <p className="text-foreground font-medium mt-2 bg-muted p-3 rounded-lg text-sm">
                  Calle de la Moda 123, Polígono Industrial, Madrid
                </p>
              </div>

              {/* Email Confirmation */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Confirmación por Email
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300/80 text-sm">
                  Hemos enviado un correo con la etiqueta de devolución a <span className="font-medium">{customerEmail}</span>.
                </p>
              </div>

              {/* Financial Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Información sobre el Reembolso
                </h3>
                <p className="text-amber-700 dark:text-amber-300/80 text-sm">
                  Una vez recibido y validado el paquete, el reembolso se procesará en tu método de pago original en un plazo de <span className="font-semibold">5 a 7 días hábiles</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
