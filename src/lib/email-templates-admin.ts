/**
 * Email Templates para Notificaciones al Administrador
 * - Nuevo pedido pagado
 * - Nueva solicitud de devolución
 * - Reporte diario de stock bajo
 */

import { formatOrderId } from './order-utils';
import type { EmailTemplateOptions } from './email-templates';

// Valores por defecto
const getDefaultOptions = (): EmailTemplateOptions => ({
  siteUrl: import.meta.env?.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
  contactEmail: import.meta.env?.CONTACT_EMAIL || 'info@fashionstore.es',
  storeName: 'FashionStore'
});

// ============================================
// LAYOUT BASE ADMIN
// ============================================

function adminHeader(storeName: string): string {
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
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #CCFF00; font-size: 22px; font-weight: bold; letter-spacing: 2px;">${storeName}</h1>
                    <p style="margin: 4px 0 0; color: #8892b0; font-size: 12px; letter-spacing: 1px;">PANEL DE ADMINISTRACIÓN</p>
                  </td>
                  <td style="text-align: right;">
                    <span style="background-color: rgba(204,255,0,0.15); color: #CCFF00; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">ADMIN</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function adminFooter(siteUrl: string): string {
  return `
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px; color: #666; font-size: 13px;">
                Este es un email automático del sistema de notificaciones.
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} FashionStore — <a href="${siteUrl}/admin" style="color: #16213e; text-decoration: none;">Ir al Panel Admin</a>
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

// ============================================
// 1. NUEVO PEDIDO PAGADO
// ============================================

export interface AdminOrderNotificationData {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  shippingCity?: string;
  shippingAddress?: string;
}

export function generateAdminOrderNotificationHTML(
  data: AdminOrderNotificationData,
  options?: Partial<EmailTemplateOptions>
): string {
  const opts = { ...getDefaultOptions(), ...options };
  const siteUrl = opts.siteUrl;
  const storeName = opts.storeName || 'FashionStore';
  const displayOrderId = formatOrderId(data.orderNumber);

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
        <strong>${item.productName}</strong>
        <br><span style="color: #888; font-size: 12px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${item.price.toFixed(2)}€</td>
    </tr>
  `).join('');

  return `${adminHeader(storeName)}
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Alert Banner -->
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <span style="font-size: 36px; color: #ffffff;">&#8364;</span>
                <h2 style="margin: 10px 0 5px; color: #ffffff; font-size: 20px;">Nuevo Pedido Pagado</h2>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">Se ha recibido un nuevo pago</p>
              </div>

              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #f8f9fa; border-radius: 8px; padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Pedido:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: bold; text-align: right;">${displayOrderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Cliente:</td>
                        <td style="padding: 6px 0; font-size: 14px; text-align: right;">${data.customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Email:</td>
                        <td style="padding: 6px 0; font-size: 14px; text-align: right;">
                          <a href="mailto:${data.customerEmail}" style="color: #16213e;">${data.customerEmail}</a>
                        </td>
                      </tr>
                      ${data.shippingCity ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Envío a:</td>
                        <td style="padding: 6px 0; font-size: 14px; text-align: right;">${data.shippingCity}</td>
                      </tr>` : ''}
                      <tr>
                        <td colspan="2" style="padding-top: 10px; border-top: 2px solid #CCFF00;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 16px; font-weight: bold; color: #0a0a0a;">Total:</td>
                              <td style="font-size: 20px; font-weight: bold; color: #22c55e; text-align: right;">${data.totalAmount.toFixed(2)}€</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="margin: 0 0 12px; font-size: 15px; color: #333;">Artículos del pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden; margin-bottom: 25px;">
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">Producto</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #666; text-transform: uppercase;">Cant.</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #666; text-transform: uppercase;">Precio</th>
                </tr>
                ${itemsHtml}
              </table>

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${siteUrl}/admin/pedidos" 
                   style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #CCFF00; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                  Ver Pedido en Admin →
                </a>
              </div>
            </td>
          </tr>
${adminFooter(siteUrl)}`;
}

// ============================================
// 2. NUEVA SOLICITUD DE DEVOLUCIÓN
// ============================================

export interface AdminReturnNotificationData {
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

export function generateAdminReturnNotificationHTML(
  data: AdminReturnNotificationData,
  options?: Partial<EmailTemplateOptions>
): string {
  const opts = { ...getDefaultOptions(), ...options };
  const siteUrl = opts.siteUrl;
  const storeName = opts.storeName || 'FashionStore';
  const displayOrderId = data.orderNumber
    ? formatOrderId(data.orderNumber)
    : `#${data.orderId.slice(0, 8).toUpperCase()}`;

  const reasonLabels: { [key: string]: string } = {
    size_mismatch: 'Talla incorrecta',
    defective: 'Producto defectuoso',
    not_as_described: 'No coincide con la descripción',
    changed_mind: 'Cambio de opinión',
    arrived_late: 'Llegó tarde',
    other: 'Otro motivo',
  };

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
        <strong>${item.productName}</strong>
        <br><span style="color: #888; font-size: 12px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">
        <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${reasonLabels[item.reason] || item.reason}</span>
      </td>
    </tr>
  `).join('');

  const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);

  return `${adminHeader(storeName)}
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Alert Banner -->
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <span style="font-size: 36px; color: #ffffff;">&#9888;</span>
                <h2 style="margin: 10px 0 5px; color: #ffffff; font-size: 20px;">Nueva Solicitud de Devolución</h2>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">Un cliente ha solicitado una devolución</p>
              </div>

              <!-- Return Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #f8f9fa; border-radius: 8px; padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Pedido original:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: bold; text-align: right;">${displayOrderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Cliente:</td>
                        <td style="padding: 6px 0; font-size: 14px; text-align: right;">${data.customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Email:</td>
                        <td style="padding: 6px 0; font-size: 14px; text-align: right;">
                          <a href="mailto:${data.customerEmail}" style="color: #16213e;">${data.customerEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666;">Artículos a devolver:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: bold; text-align: right; color: #f59e0b;">${totalItems} unidad${totalItems > 1 ? 'es' : ''}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="margin: 0 0 12px; font-size: 15px; color: #333;">Artículos solicitados</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden; margin-bottom: 25px;">
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">Producto</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #666; text-transform: uppercase;">Cant.</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #666; text-transform: uppercase;">Motivo</th>
                </tr>
                ${itemsHtml}
              </table>

              <!-- Action Required -->
              <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Acción requerida:</strong> Revisa esta solicitud y apruébala o recházala desde el panel de administración.
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${siteUrl}/admin/devoluciones" 
                   style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #CCFF00; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                  Gestionar Devolución →
                </a>
              </div>
            </td>
          </tr>
${adminFooter(siteUrl)}`;
}

// ============================================
// 3. REPORTE DIARIO DE STOCK BAJO
// ============================================

export interface LowStockItem {
  productName: string;
  size: string;
  stock: number;
  productSlug?: string;
}

export interface LowStockAlertData {
  items: LowStockItem[];
  threshold: number;
  checkDate: Date;
}

export function generateLowStockAlertHTML(
  data: LowStockAlertData,
  options?: Partial<EmailTemplateOptions>
): string {
  const opts = { ...getDefaultOptions(), ...options };
  const siteUrl = opts.siteUrl;
  const storeName = opts.storeName || 'FashionStore';

  const outOfStock = data.items.filter(i => i.stock === 0);
  const lowStock = data.items.filter(i => i.stock > 0);

  const dateStr = data.checkDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function stockBadge(stock: number): string {
    if (stock === 0) {
      return `<span style="background-color: #fee2e2; color: #dc2626; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: bold;">SIN STOCK</span>`;
    }
    return `<span style="background-color: #fef3c7; color: #d97706; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: bold;">${stock} uds</span>`;
  }

  function buildItemRows(items: LowStockItem[]): string {
    return items.map(item => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
          <strong>${item.productName}</strong>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.size}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right;">${stockBadge(item.stock)}</td>
      </tr>
    `).join('');
  }

  const summaryCards = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr>
        <td width="48%" style="background-color: #fee2e2; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #dc2626;">${outOfStock.length}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #991b1b; text-transform: uppercase;">Sin Stock</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background-color: #fef3c7; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #d97706;">${lowStock.length}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #92400e; text-transform: uppercase;">Stock Bajo (≤${data.threshold})</p>
        </td>
      </tr>
    </table>`;

  let tablesHtml = '';

  if (outOfStock.length > 0) {
    tablesHtml += `
      <h3 style="margin: 25px 0 12px; font-size: 15px; color: #dc2626;"><span style="display: inline-block; width: 10px; height: 10px; background-color: #dc2626; border-radius: 50; margin-right: 6px;"></span>Sin Stock (${outOfStock.length})</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fee2e2; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
        <tr style="background-color: #fef2f2;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #991b1b; text-transform: uppercase;">Producto</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #991b1b; text-transform: uppercase;">Talla</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #991b1b; text-transform: uppercase;">Stock</th>
        </tr>
        ${buildItemRows(outOfStock)}
      </table>`;
  }

  if (lowStock.length > 0) {
    tablesHtml += `
      <h3 style="margin: 25px 0 12px; font-size: 15px; color: #d97706;"><span style="display: inline-block; width: 10px; height: 10px; background-color: #f59e0b; border-radius: 50; margin-right: 6px;"></span>Stock Bajo (${lowStock.length})</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fef3c7; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
        <tr style="background-color: #fffbeb;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #92400e; text-transform: uppercase;">Producto</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #92400e; text-transform: uppercase;">Talla</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #92400e; text-transform: uppercase;">Stock</th>
        </tr>
        ${buildItemRows(lowStock)}
      </table>`;
  }

  return `${adminHeader(storeName)}
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Alert Banner -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <span style="font-size: 36px; color: #ffffff;">&#9888;</span>
                <h2 style="margin: 10px 0 5px; color: #ffffff; font-size: 20px;">Reporte Diario de Stock</h2>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">${dateStr}</p>
              </div>

              <!-- Summary Cards -->
              ${summaryCards}

              <!-- Info -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;">
                  <strong>Umbral configurado:</strong> ${data.threshold} unidades · 
                  Total variantes afectadas: <strong>${data.items.length}</strong>
                </p>
              </div>

              <!-- Tables -->
              ${tablesHtml}

              <!-- CTA -->
              <div style="text-align: center; margin-top: 25px;">
                <a href="${siteUrl}/admin/inventario" 
                   style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #CCFF00; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                  Gestionar Inventario →
                </a>
              </div>
            </td>
          </tr>
${adminFooter(siteUrl)}`;
}
