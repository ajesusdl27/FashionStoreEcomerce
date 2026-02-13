import type { OrderEmailData, CancellationEmailData } from './email';
import { formatOrderId } from './order-utils';
import { formatPrice } from './formatters';

// Opciones de configuración para templates de email
export interface EmailTemplateOptions {
  siteUrl: string;
  contactEmail: string;
  storeName?: string;
}

// Valores por defecto (fallback si no se pasan opciones)
const getDefaultOptions = (): EmailTemplateOptions => ({
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
  contactEmail: import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
  storeName: 'FashionStore'
});

// ============================================
// LAYOUT BASE CLIENTE
// ============================================

/**
 * Header unificado para todos los emails de cliente
 */
export function customerHeader(storeName: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${storeName?.toUpperCase() || 'FASHIONSTORE'}</h1>
            </td>
          </tr>`;
}

/**
 * Footer unificado para todos los emails de cliente
 */
export function customerFooter(contactEmail: string): string {
  return `
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                ¿Tienes alguna pregunta? Contáctanos en <a href="mailto:${contactEmail}" style="color: #0a0a0a;">${contactEmail}</a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Botón CTA estándar para emails de cliente
 */
export function customerButton(href: string, text: string): string {
  return `
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${href}" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${text}
              </a>
            </td>
          </tr>`;
}

// ============================================
// 1. CONFIRMACIÓN DE PEDIDO
// ============================================

// Genera el HTML del email de confirmación de pedido
export function generateOrderConfirmationHTML(
  order: OrderEmailData, 
  formattedOrderId: string,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };

  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.productName}</strong><br>
        <span style="color: #666; font-size: 14px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Confirmation Message -->
          <tr>
            <td style="padding: 40px 30px 20px;">
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Gracias por tu pedido, ${order.customerName}</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Tu pedido ha sido confirmado y está siendo procesado. Recibirás otra notificación cuando sea enviado.
              </p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; border-left: 4px solid #CCFF00;">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de pedido</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${formattedOrderId}</p>
              </div>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Resumen del pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Precio</th>
                </tr>
                ${itemsHTML}
                ${(function() {
                  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  const discount = order.discountAmount || 0;
                  // Use shippingCost from order data if available, fallback to formula for legacy orders
                  const shippingCost = order.shippingCost != null ? order.shippingCost : (order.totalAmount + discount - subtotal);
                  let rows = '';
                  
                  if (shippingCost > 0.01) {
                    rows += `
                    <tr>
                      <td colspan="2" style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; color: #666;">Envío</td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; color: #666;">${formatPrice(shippingCost)}</td>
                    </tr>
                    `;
                  }
                  
                  if (discount > 0) {
                    rows += `
                    <tr>
                      <td colspan="2" style="padding: 12px; border-bottom: 2px solid #0a0a0a; text-align: right; color: #16a34a; font-weight: bold;">Descuento${order.couponCode ? ` (${order.couponCode})` : ''}</td>
                      <td style="padding: 12px; border-bottom: 2px solid #0a0a0a; text-align: right; color: #16a34a; font-weight: bold;">-${formatPrice(discount)}</td>
                    </tr>
                    `;
                  }
                  
                  return rows;
                })()}
                <tr style="background-color: #0a0a0a;">
                  <td colspan="2" style="padding: 15px; color: #fff; font-weight: bold;">Total</td>
                  <td style="padding: 15px; color: #CCFF00; font-weight: bold; text-align: right; font-size: 18px;">${formatPrice(order.totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Dirección de envío</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  ${order.customerName}<br>
                  ${order.shippingAddress}<br>
                  ${order.shippingPostalCode} ${order.shippingCity}<br>
                  ${order.shippingCountry}
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/cuenta/pedidos`, 'Ver mis pedidos')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 2. PEDIDO ENVIADO
// ============================================

// Datos para el email de envío
export interface OrderShippedData {
  orderId: string;
  orderNumber?: number;  // Número secuencial (opcional para compatibilidad)
  customerName: string;
  customerEmail: string;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

// Genera el HTML del email de pedido enviado
export function generateOrderShippedHTML(
  data: OrderShippedData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };

  const trackingSection = data.trackingUrl ? `
    <!-- Tracking Button -->
    <tr>
      <td style="padding: 0 30px 30px; text-align: center;">
        <a href="${data.trackingUrl}" 
           target="_blank"
           style="display: inline-block; background-color: #CCFF00; color: #0a0a0a; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Seguir mi pedido
        </a>
      </td>
    </tr>
  ` : '';

  const trackingInfoSection = data.trackingNumber ? `
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0; color: #666; font-size: 14px;">Número de seguimiento</p>
      <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 16px; font-weight: bold; font-family: monospace;">${data.trackingNumber}</p>
    </div>
  ` : '';

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Shipped Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #CCFF00 0%, #a3cc00 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #0a0a0a;">&#10140;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Tu pedido está en camino</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, tu pedido ha sido enviado y pronto llegará a tu dirección.
              </p>
            </td>
          </tr>
          
          <!-- Order & Carrier Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; border-left: 4px solid #CCFF00;">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de pedido</p>
                <p style="margin: 5px 0 15px; color: #0a0a0a; font-size: 18px; font-weight: bold;">${data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`}</p>
                
                <p style="margin: 0; color: #666; font-size: 14px;">Transportista</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 16px; font-weight: bold;">${data.carrier}</p>
                
                ${trackingInfoSection}
              </div>
            </td>
          </tr>
          
          ${trackingSection}
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Dirección de entrega</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  ${data.customerName}<br>
                  ${data.shippingAddress}<br>
                  ${data.shippingPostalCode} ${data.shippingCity}<br>
                  ${data.shippingCountry}
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/cuenta/pedidos`, 'Ver mis pedidos')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 3. PEDIDO CANCELADO
// ============================================

// Genera el HTML del email de pedido cancelado
export function generateOrderCancelledHTML(
  data: CancellationEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };
  
  const displayOrderId = formatOrderId(data.orderNumber);
  const refundText = data.refundAmount 
    ? `Si se realizó algún cargo, el reembolso de <strong>${data.refundAmount.toFixed(2)}€</strong> se procesará automáticamente en 3-5 días hábiles.`
    : 'Si se realizó algún cargo, el reembolso se procesará automáticamente en 3-5 días hábiles.';

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Cancelled Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #ffffff;">&#10005;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Pedido Cancelado</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, tu pedido ${displayOrderId} ha sido cancelado${data.reason ? ': ' + data.reason : ''}.
              </p>
            </td>
          </tr>
          
          <!-- Refund Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  ${refundText}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Contact -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                Si tienes alguna pregunta, contáctanos en 
                <a href="mailto:${contactEmail}" style="color: #0a0a0a;">${contactEmail}</a>
              </p>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}`, 'Seguir comprando')}
          
${customerFooter(contactEmail)}
  `.trim();
}
