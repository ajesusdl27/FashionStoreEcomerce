import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { TicketTemplate, type TicketData } from './ticket-template';
import { InvoiceTemplate, type InvoiceData } from './invoice-template';

// Configuración de la empresa (desde variables de entorno)
const getCompanyInfo = () => ({
  companyName: import.meta.env.COMPANY_NAME || 'FashionStore S.L.',
  companyNif: import.meta.env.COMPANY_NIF || 'B12345678',
  companyAddress: import.meta.env.COMPANY_ADDRESS || 'Calle de la Moda 123, 28001 Madrid, España',
  companyEmail: import.meta.env.COMPANY_EMAIL || 'info@fashionstore.es',
  companyPhone: import.meta.env.COMPANY_PHONE || '+34 912 345 678',
});

/**
 * Genera un ticket de compra en PDF
 */
export async function generateTicketPDF(data: {
  orderId: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  shippingCost?: number;
}): Promise<Buffer> {
  const companyInfo = getCompanyInfo();
  
  const ticketData: TicketData = {
    orderId: data.orderId,
    orderDate: data.orderDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    shippingAddress: data.shippingAddress,
    shippingCity: data.shippingCity,
    shippingPostalCode: data.shippingPostalCode,
    shippingCountry: data.shippingCountry,
    items: data.items,
    totalAmount: data.totalAmount,
    couponCode: data.couponCode,
    discountAmount: data.discountAmount,
    shippingCost: data.shippingCost,
    ...companyInfo,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(TicketTemplate, { data: ticketData }) as any
  );

  return Buffer.from(pdfBuffer);
}

/**
 * Genera una factura completa en PDF
 */
export async function generateInvoicePDF(data: {
  invoiceNumber: string;
  invoiceDate: Date;
  orderId: string;
  orderDate: Date;
  customerFiscalName: string;
  customerNif: string;
  customerFiscalAddress: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
  discountAmount?: number;
  shippingCost?: number;
}): Promise<Buffer> {
  const companyInfo = getCompanyInfo();
  
  const invoiceData: InvoiceData = {
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    orderId: data.orderId,
    orderDate: data.orderDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    customerFiscalName: data.customerFiscalName,
    customerNif: data.customerNif,
    customerFiscalAddress: data.customerFiscalAddress,
    items: data.items,
    subtotal: data.subtotal,
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
    total: data.total,
    couponCode: data.couponCode,
    discountAmount: data.discountAmount,
    shippingCost: data.shippingCost,
    ...companyInfo,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoiceTemplate, { data: invoiceData }) as any
  );

  return Buffer.from(pdfBuffer);
}

// Re-export types
export type { TicketData, InvoiceData };
