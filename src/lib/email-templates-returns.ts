/**
 * Email Templates para el Sistema de Devoluciones
 * Genera HTML para notificaciones de estado de devoluciones
 * Usa el layout base unificado de customer emails
 */

import { formatOrderId } from './order-utils';
import { formatPrice } from './formatters';
import { customerHeader, customerFooter, customerButton, type EmailTemplateOptions } from './email-templates';

// Valores por defecto (fallback si no se pasan opciones)
const getDefaultOptions = (): EmailTemplateOptions => ({
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
  contactEmail: import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
  storeName: 'FashionStore'
});

// Tipo para datos de email de devolución
export interface ReturnEmailData {
  returnId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  status: 'approved' | 'received' | 'completed' | 'rejected';
  refundAmount?: number;
  items?: {
    productName: string;
    size: string;
    quantity: number;
    reason: string;
  }[];
  rejectionReason?: string;
  returnAddress?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Tipo para datos del email de confirmación de devolución (solicitud recibida)
export interface ReturnConfirmationEmailData {
  returnId: string;
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerEmail: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    reason: string;
  }[];
}

// Labels de motivos de devolución
const reasonLabels: { [key: string]: string } = {
  size_mismatch: 'Talla incorrecta',
  defective: 'Producto defectuoso',
  not_as_described: 'No coincide con la descripción',
  changed_mind: 'Cambio de opinión',
  arrived_late: 'Llegó tarde',
  other: 'Otro motivo',
};

// ============================================
// 1. DEVOLUCIÓN APROBADA
// ============================================

export function generateReturnApprovedHTML(
  data: ReturnEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };
  const returnAddress = data.returnAddress || {
    name: storeName,
    street: 'Almacén de Devoluciones',
    city: 'Madrid',
    postalCode: '28001',
    country: 'España'
  };

  const itemsHTML = data.items?.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.productName}</strong><br>
        <span style="color: #666; font-size: 14px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 13px;">${item.reason}</td>
    </tr>
  `).join('') || '';

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Approved Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #ffffff;">&#10003;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Tu devolución ha sido aprobada</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, hemos revisado tu solicitud y ha sido aprobada.
              </p>
            </td>
          </tr>
          
          <!-- Return Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #666; font-size: 14px;">Pedido original</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${formatOrderId(data.orderNumber)}</p>
              </div>
            </td>
          </tr>

          <!-- Items to Return -->
          ${itemsHTML ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Artículos a devolver</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Motivo</th>
                </tr>
                ${itemsHTML}
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">¿Cómo enviar tu devolución?</h3>
              
              <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 15px; color: #0a0a0a; font-weight: bold;">Importante: Debes enviar el paquete para completar la devolución</p>
                <ol style="margin: 0; padding-left: 20px; color: #333; line-height: 2;">
                  <li><strong>Empaqueta los artículos</strong> de forma segura en su embalaje original si es posible</li>
                  <li><strong>Incluye una nota</strong> con tu número de pedido (${formatOrderId(data.orderNumber)})</li>
                  <li><strong>Envía a la dirección indicada abajo</strong> por la mensajería de tu preferencia</li>
                  <li><strong>Marca como "Enviado"</strong> en tu cuenta con el número de seguimiento (opcional)</li>
                  <li><strong>Espera nuestra inspección</strong> - Recibirás confirmación cuando llegue (2-5 días)</li>
                  <li><strong>Reembolso procesado</strong> en 1-2 días después de la inspección</li>
                </ol>
              </div>
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Consejo:</strong> Guarda el comprobante de envío. Recomendamos usar un servicio con seguimiento para tu tranquilidad.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Return Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Dirección de devolución</h3>
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #333; line-height: 1.6; font-weight: 500;">
                  ${returnAddress.name}<br>
                  ${returnAddress.street}<br>
                  ${returnAddress.postalCode} ${returnAddress.city}<br>
                  ${returnAddress.country}
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/cuenta/pedidos`, 'Ver estado de mi devolución')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 2. DEVOLUCIÓN RECIBIDA
// ============================================

export function generateReturnReceivedHTML(
  data: ReturnEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Received Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #ffffff;">&#9745;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Hemos recibido tu paquete</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, tu devolución ha llegado y estamos revisando los artículos.
              </p>
            </td>
          </tr>
          
          <!-- Return Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #ecfeff; border-radius: 8px; padding: 20px; border-left: 4px solid #06b6d4;">
                <p style="margin: 0; color: #666; font-size: 14px;">Pedido original</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${formatOrderId(data.orderNumber)}</p>
              </div>
            </td>
          </tr>
          
          <!-- What's Next -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">¿Qué sigue?</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  Nuestro equipo está inspeccionando los artículos. Este proceso toma <strong>1-2 días hábiles</strong>.
                </p>
                <p style="margin: 15px 0 0; color: #333; line-height: 1.6;">
                  Una vez completada la inspección, procesaremos tu reembolso y te enviaremos una confirmación.
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/cuenta/pedidos`, 'Ver estado de mi devolución')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 3. REEMBOLSO COMPLETADO
// ============================================

export function generateReturnCompletedHTML(
  data: ReturnEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Completed Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #ffffff;">&#8364;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Tu reembolso ha sido procesado</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, hemos completado tu devolución y procesado el reembolso.
              </p>
            </td>
          </tr>
          
          <!-- Refund Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #666; font-size: 14px;">Pedido original</p>
                <p style="margin: 5px 0 15px; color: #0a0a0a; font-size: 18px; font-weight: bold;">${formatOrderId(data.orderNumber)}</p>
                
                <p style="margin: 0; color: #666; font-size: 14px;">Importe reembolsado</p>
                <p style="margin: 5px 0 0; color: #10b981; font-size: 28px; font-weight: bold;">${data.refundAmount ? formatPrice(data.refundAmount) : '—'}</p>
              </div>
            </td>
          </tr>
          
          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Información del reembolso</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  El reembolso ha sido procesado a través del mismo método de pago original.
                </p>
                <p style="margin: 15px 0 0; color: #666; line-height: 1.6; font-size: 14px;">
                  <strong>Tiempo de procesamiento:</strong> El importe puede tardar entre 5-10 días hábiles en aparecer en tu cuenta.
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/productos`, 'Seguir comprando')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 4. DEVOLUCIÓN RECHAZADA
// ============================================

export function generateReturnRejectedHTML(
  data: ReturnEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Rejected Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #ffffff;">&#10005;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Solicitud de devolución no aprobada</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, lamentamos informarte que tu solicitud no ha podido ser aprobada.
              </p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #666; font-size: 14px;">Pedido</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${formatOrderId(data.orderNumber)}</p>
              </div>
            </td>
          </tr>
          
          <!-- Reason -->
          ${data.rejectionReason ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Motivo</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">${data.rejectionReason}</p>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Contact Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  Si crees que esto es un error, no dudes en contactarnos. Estamos aquí para ayudarte.
                </p>
              </div>
            </td>
          </tr>
          
          ${customerButton(`mailto:${contactEmail}`, 'Contactar con soporte')}
          
${customerFooter(contactEmail)}
  `.trim();
}

// ============================================
// 5. CONFIRMACIÓN DE SOLICITUD DE DEVOLUCIÓN
// ============================================

export function generateReturnConfirmationHTML(
  data: ReturnConfirmationEmailData,
  options?: Partial<EmailTemplateOptions>
): string {
  const { siteUrl, contactEmail, storeName } = { ...getDefaultOptions(), ...options };
  
  const displayOrderId = data.orderNumber 
    ? formatOrderId(data.orderNumber) 
    : `#${data.orderId.slice(0, 8).toUpperCase()}`;

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.productName}</strong><br>
        <span style="color: #666; font-size: 14px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${reasonLabels[item.reason] || item.reason}</td>
    </tr>
  `).join('');

  return `${customerHeader(storeName || 'FashionStore')}
          
          <!-- Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #CCFF00 0%, #a3cc00 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 36px; color: #0a0a0a;">&#9993;</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Solicitud de Devolución Recibida</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, hemos recibido tu solicitud de devolución.
              </p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; border-left: 4px solid #CCFF00;">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de pedido</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${displayOrderId}</p>
              </div>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Artículos a devolver</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Motivo</th>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Dirección para el envío</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  <strong>FashionStore Devoluciones</strong><br>
                  Calle de la Moda 123<br>
                  28001 Madrid<br>
                  España
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fffbeb; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 10px; color: #b45309; font-size: 16px;">Instrucciones importantes</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                  <li>Incluye el número de pedido visible en el paquete</li>
                  <li>Los artículos deben estar sin usar y con etiquetas originales</li>
                  <li>El reembolso se procesará en 5-7 días hábiles tras recibir el paquete</li>
                </ul>
              </div>
            </td>
          </tr>
          
          ${customerButton(`${siteUrl}/cuenta/pedidos`, 'Ver mis pedidos')}
          
${customerFooter(contactEmail)}
  `.trim();
}
