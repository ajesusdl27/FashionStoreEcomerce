import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: {
    name: string;
    images?: { image_url: string }[];
  };
  variant?: {
    size: string;
  };
}

interface OrderActionsProps {
  orderId: string;
  orderNumber?: number;
  orderStatus: string;
  customerEmail: string;
  deliveredAt?: string;
  orderItems: OrderItem[];
}

const RETURN_REASONS = [
  { value: 'size_mismatch', label: 'Talla incorrecta' },
  { value: 'defective', label: 'Producto defectuoso' },
  { value: 'not_as_described', label: 'No coincide con la descripción' },
  { value: 'changed_mind', label: 'Cambio de opinión' },
  { value: 'arrived_late', label: 'Llegó tarde' },
  { value: 'other', label: 'Otro motivo' },
];

export default function OrderActions({ 
  orderId,
  orderNumber,
  orderStatus, 
  customerEmail, 
  deliveredAt,
  orderItems 
}: OrderActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReturn, setExistingReturn] = useState<any>(null);
  
  // Return form state
  const [selectedItems, setSelectedItems] = useState<{[key: string]: {
    selected: boolean;
    quantity: number;
    reason: string;
    reason_details: string;
  }}>({});
  const [customerNotes, setCustomerNotes] = useState('');

  // Initialize selected items
  useEffect(() => {
    if (orderItems) {
      const initial: any = {};
      orderItems.forEach(item => {
        initial[item.id] = {
          selected: false,
          quantity: 1,
          reason: 'size_mismatch',
          reason_details: '',
        };
      });
      setSelectedItems(initial);
    }
  }, [orderItems]);

  // Check for existing return
  useEffect(() => {
    const checkExistingReturn = async () => {
      const { data } = await supabase
        .from('returns')
        .select('id, status')
        .eq('order_id', orderId)
        .not('status', 'in', '(rejected,completed)')
        .maybeSingle();
      
      if (data) {
        setExistingReturn(data);
      }
    };
    
    if (orderStatus === 'delivered') {
      checkExistingReturn();
    }
  }, [orderId, orderStatus]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: cancelReason || 'Cancelación solicitada por el cliente'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cancelar el pedido');
      }

      setSuccess(result.message);
      setShowCancelModal(false);
      
      // Reload page after brief delay to show success
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Error al cancelar el pedido.');
      setIsCancelling(false);
    }
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], selected }
    }));
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, data]) => data.selected)
      .map(([itemId, data]) => {
        const orderItem = orderItems.find(i => i.id === itemId);
        return {
          order_item_id: itemId,
          product_variant_id: orderItem?.variant_id,
          quantity: data.quantity,
          reason: data.reason,
          reason_details: data.reason_details,
        };
      });

    if (itemsToReturn.length === 0) {
      setError('Selecciona al menos un artículo para devolver');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          items: itemsToReturn,
          customer_notes: customerNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la solicitud');
      }

      setSuccess('¡Solicitud de devolución enviada correctamente!');
      setExistingReturn({ id: result.return_id, status: 'requested' });
      // Close modal after brief delay to show success
      setTimeout(() => {
        setShowReturnModal(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReturnWindowValid = () => {
    if (!deliveredAt) return true; // If no delivery date, allow
    const delivered = new Date(deliveredAt);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 30;
  };

  const canCancel = orderStatus === 'paid';
  const canRequestReturn = orderStatus === 'delivered' && !existingReturn && isReturnWindowValid();

  if (!canCancel && !canRequestReturn && !existingReturn) {
    return null;
  }

  const getReturnStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      requested: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Pendiente' },
      approved: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Aprobada' },
      shipped: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Enviada' },
      received: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', label: 'En revisión' },
      completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completada' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rechazada' },
    };
    return badges[status] || badges.requested;
  };

  return (
    <div className="glass border border-border rounded-2xl p-6">
      <h2 className="font-heading text-lg mb-4">Gestión del Pedido</h2>
      
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && !showReturnModal && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-primary font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Existing Return Status with Shipping Instructions */}
        {existingReturn && (
          <div className={`${getReturnStatusBadge(existingReturn.status).bg} border border-current/20 rounded-xl overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${getReturnStatusBadge(existingReturn.status).text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <div>
                  <p className={`font-medium ${getReturnStatusBadge(existingReturn.status).text}`}>
                    Devolución {getReturnStatusBadge(existingReturn.status).label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {existingReturn.status === 'requested' 
                      ? 'Esperando aprobación del administrador'
                      : existingReturn.status === 'approved'
                      ? 'Envía el paquete a la dirección indicada'
                      : 'Tu solicitud está en proceso'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Shipping Instructions (show when approved or requested) */}
            {(existingReturn.status === 'approved' || existingReturn.status === 'requested') && (
              <div className="bg-muted/30 border-t border-current/10 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección de envío</p>
                    <p className="text-sm text-foreground font-medium">
                      FashionStore Devoluciones<br />
                      Calle de la Moda 123<br />
                      28001 Madrid, España
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-muted-foreground">
                    Incluye el número de pedido en el paquete. El reembolso se procesará en 5-7 días hábiles tras recibir el artículo.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancel Order Button */}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isCancelling}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar Pedido
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

        {/* Return Window Expired */}
        {orderStatus === 'delivered' && !isReturnWindowValid() && !existingReturn && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              El plazo de 30 días para devoluciones ha expirado
            </p>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !success && setShowReturnModal(false)}
            />
            
            <div className="relative bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Success Overlay */}
              {success && (
                <div className="absolute inset-0 z-20 bg-card/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">¡Solicitud Enviada!</h3>
                  <p className="text-muted-foreground text-center">Tu devolución ha sido registrada correctamente.</p>
                </div>
              )}

              <button
                onClick={() => setShowReturnModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">Solicitar Devolución</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        Pedido {orderNumber ? `#A${String(orderNumber).padStart(6, '0')}` : `#${orderId.slice(0, 8).toUpperCase()}`}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        Selecciona los artículos a devolver
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitReturn} className="p-6 space-y-6">
                {/* Items Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Artículos del pedido</h3>
                  
                  {orderItems.map(item => (
                    <div 
                      key={item.id}
                      className={`border rounded-xl p-4 transition-all ${
                        selectedItems[item.id]?.selected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems[item.id]?.selected || false}
                          onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        
                        <div className="flex-1">
                          <div className="flex gap-3">
                            {item.product?.images?.[0]?.image_url && (
                              <img 
                                src={item.product.images[0].image_url} 
                                alt={item.product?.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{item.product?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Talla: {item.variant?.size} · Cantidad: {item.quantity}
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {(item.price_at_purchase * item.quantity).toFixed(2)} €
                              </p>
                            </div>
                          </div>
                          
                          {selectedItems[item.id]?.selected && (
                            <div className="mt-4 space-y-3 pl-0">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Cantidad a devolver
                                  </label>
                                  <select
                                    value={selectedItems[item.id]?.quantity || 1}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary relative z-10"
                                  >
                                    {Array.from({ length: item.quantity }, (_, i) => i + 1).map(n => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Motivo
                                  </label>
                                  <select
                                    value={selectedItems[item.id]?.reason || 'size_mismatch'}
                                    onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary relative z-10"
                                  >
                                    {RETURN_REASONS.map(r => (
                                      <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              {(selectedItems[item.id]?.reason === 'defective' || 
                                selectedItems[item.id]?.reason === 'other') && (
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Describe el problema
                                  </label>
                                  <textarea
                                    value={selectedItems[item.id]?.reason_details || ''}
                                    onChange={(e) => handleItemChange(item.id, 'reason_details', e.target.value)}
                                    placeholder="Describe el defecto o problema..."
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground min-h-[80px]"
                                    required={selectedItems[item.id]?.reason === 'defective'}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="¿Hay algo más que debamos saber?"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground min-h-[80px]"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="flex-1 px-4 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !isCancelling && setShowCancelModal(false)}
            />
            
            <div className="relative bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Cancelar Pedido</h2>
                    <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>💰 Reembolso automático:</strong> Se te devolverá el importe completo a tu método de pago original en 5-10 días hábiles.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Motivo de cancelación (opcional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cuéntanos por qué cancelas el pedido..."
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground min-h-[80px] resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                      'Confirmar Cancelación'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
