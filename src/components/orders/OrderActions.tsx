import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  customerEmail: _customerEmail, 
  deliveredAt,
  orderItems 
}: OrderActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReturn, setExistingReturn] = useState<any>(null);
  const [isLoadingReturn, setIsLoadingReturn] = useState(true); // NEW: Track loading state
  
  // State for shipping the return
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isMarkingShipped, setIsMarkingShipped] = useState(false);
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  
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
      
      try {
        // Use API endpoint instead of direct Supabase query (client has no auth session)
        const response = await fetch(`/api/returns/get-by-order?order_id=${orderId}`);
        const result = await response.json();
        
        if (response.ok && result.return) {
          setExistingReturn(result.return);
        } else if (result.error) {
          console.error('Error fetching return:', result.error);
        }
      } catch (err) {
        console.error('❌ Error checking return:', err);
      } finally {
        setIsLoadingReturn(false);
      }
    };
    
    // Check for returns when delivered OR when order has a return status
    const qualifies = orderStatus === 'delivered' || orderStatus?.startsWith?.('return_');
    
    if (qualifies) {
      checkExistingReturn();
    } else {
      setIsLoadingReturn(false); // Not checking, so stop loading
    }
  }, [orderId, orderStatus]);

  // Handle marking return as shipped
  const handleMarkReturnShipped = async () => {
    if (!existingReturn?.id) return;
    
    setIsMarkingShipped(true);
    setError(null);
    
    try {
      const response = await fetch('/api/returns/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_id: existingReturn.id,
          tracking_number: trackingNumber || null,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al marcar como enviada');
      }
      
      setSuccess('¡Devolución marcada como enviada! Te notificaremos cuando la recibamos.');
      setExistingReturn({ ...existingReturn, status: 'shipped' });
      setShowTrackingInput(false);
      setTrackingNumber('');
    } catch (err: any) {
      console.error('Error marking return as shipped:', err);
      setError(err.message || 'Error al marcar la devolución como enviada');
    } finally {
      setIsMarkingShipped(false);
    }
  };

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

      window.location.reload();
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Error al cancelar el pedido.');
      setIsCancelling(false);
    }
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const existing = prev[itemId];
      return {
        ...prev,
        [itemId]: { 
          selected, 
          quantity: existing?.quantity ?? 1, 
          reason: existing?.reason ?? 'size_mismatch', 
          reason_details: existing?.reason_details ?? '' 
        }
      };
    });
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setSelectedItems(prev => {
      const existing = prev[itemId];
      return {
        ...prev,
        [itemId]: { 
          selected: existing?.selected ?? false, 
          quantity: existing?.quantity ?? 1, 
          reason: existing?.reason ?? 'size_mismatch', 
          reason_details: existing?.reason_details ?? '',
          [field]: value 
        }
      };
    });
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
    const deliveryDate = new Date(deliveredAt);
    const today = new Date();
    const daysSinceDelivery = Math.floor((today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 30;
  };

  const handleMarkShipped = async (returnId: string, tracking?: string) => {
    setError(null);
    setSuccess(null);
    setIsMarkingShipped(true);

    try {
      const response = await fetch(`/api/returns/${returnId}/mark-shipped`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: tracking }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al marcar como enviado');
      }

      setSuccess('✅ Devolución marcada como enviada');
      setExistingReturn({ ...existingReturn, status: 'shipped' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMarkingShipped(false);
    }
  };

  const canCancel = orderStatus === 'paid';
  const canRequestReturn = orderStatus === 'delivered' && !existingReturn && isReturnWindowValid();
  const hasExistingReturn = !!existingReturn;

  // Wait for return check to complete before deciding to hide component
  if (isLoadingReturn) {
    return <div className="glass border border-border rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>;
  }

  const willRender = canCancel || canRequestReturn || hasExistingReturn;

  if (!willRender) {
    return null;
  }

  const getReturnStatusBadge = (status: string) => {
    const defaultBadge = { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Desconocido' };
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      requested: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Pendiente' },
      approved: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Aprobada' },
      shipped: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Enviada' },
      received: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', label: 'En revisión' },
      completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completada' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rechazada' },
    };
    return badges[status] ?? defaultBadge;
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
            
            {/* Mark as Shipped Button - Only show when approved */}
            {(() => {
              const shouldShowButton = existingReturn.status === 'approved';
              console.log('🔘 Button visibility check:', {
                returnStatus: existingReturn.status,
                shouldShowButton,
                existingReturn
              });
              return shouldShowButton;
            })() && (
              <div className="bg-muted/30 border-t border-current/10 p-4 space-y-3">
                {!showTrackingInput ? (
                  <button
                    onClick={() => setShowTrackingInput(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    He enviado mi paquete
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Número de seguimiento (opcional)
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Ej: 1Z999AA10123456784"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowTrackingInput(false);
                          setTrackingNumber('');
                        }}
                        className="flex-1 px-4 py-2 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleMarkReturnShipped}
                        disabled={isMarkingShipped}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isMarkingShipped ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </span>
                        ) : 'Confirmar envío'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Show shipped status message */}
            {existingReturn.status === 'shipped' && (
              <div className="bg-purple-500/10 border-t border-purple-500/20 p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-purple-500 font-medium">
                    Tu paquete está en camino. Te notificaremos cuando lo recibamos.
                  </p>
                </div>
              </div>
            )}
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

        {/* Return Window Expired */}
        {orderStatus === 'delivered' && !isReturnWindowValid() && !existingReturn && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              El plazo de 30 días para devoluciones ha expirado
            </p>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && createPortal(
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
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
