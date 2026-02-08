import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Registrar fuente (opcional, usa la default si no está disponible)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#CCFF00',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a0a0a',
    letterSpacing: 2,
  },
  ticketLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  ticketNumber: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#666666',
    fontSize: 9,
  },
  value: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#666666',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  colProduct: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    paddingRight: 20,
    color: '#666666',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#CCFF00',
  },
  grandTotalLabel: {
    width: 120,
    textAlign: 'right',
    paddingRight: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  grandTotalValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999999',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 20,
  },
  ivaNote: {
    marginTop: 10,
    textAlign: 'right',
    fontSize: 9,
    color: '#888888',
    fontStyle: 'italic',
  },
});

export interface TicketData {
  orderId: string;
  orderDate: string;
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
  shippingCost?: number; // Optional, will calculate from items if not provided
  couponCode?: string;
  discountAmount?: number;
  companyName: string;
  companyNif: string;
  companyAddress: string;
}

export const TicketTemplate: React.FC<{ data: TicketData }> = ({ data }) => {
  const formatCurrency = (amount: number) => `${amount.toFixed(2)}€`;
  const shortOrderId = data.orderId.slice(0, 8).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>FASHIONSTORE</Text>
            <Text style={{ fontSize: 9, color: '#666666', marginTop: 4 }}>
              {data.companyName}
            </Text>
            <Text style={{ fontSize: 9, color: '#666666' }}>
              NIF: {data.companyNif}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.ticketLabel}>Ticket de Compra</Text>
            <Text style={styles.ticketNumber}>Pedido {shortOrderId}</Text>
            <Text style={{ fontSize: 9, color: '#888888', marginTop: 4 }}>
              {data.orderDate}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.customerEmail}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          <Text style={{ color: '#333333' }}>{data.shippingAddress}</Text>
          <Text style={{ color: '#333333' }}>
            {data.shippingPostalCode} {data.shippingCity}
          </Text>
          <Text style={{ color: '#333333' }}>{data.shippingCountry}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artículos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>Producto</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {data.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.colProduct}>
                  <Text style={{ fontWeight: 'bold' }}>{item.productName}</Text>
                  <Text style={{ fontSize: 8, color: '#888888' }}>Talla: {item.size}</Text>
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          {(() => {
            // Calculate subtotal from items
            const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            // Calculate shipping (difference between total and subtotal)
            const discount = data.discountAmount || 0;
            // Shipping = total + discount - subtotal (discount added back to recover original pre-discount total)
            const shippingCost = data.shippingCost !== undefined ? data.shippingCost : (data.totalAmount + discount - subtotal);
            // Base imponible (sin IVA)
            const baseImponible = data.totalAmount / 1.21;
            // IVA total
            const ivaAmount = data.totalAmount - baseImponible;
            
            return (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal productos:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                </View>
                {shippingCost > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Gastos de envío:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(shippingCost)}</Text>
                  </View>
                )}
                {data.discountAmount && data.discountAmount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Descuento{data.couponCode ? ` (${data.couponCode})` : ''}:</Text>
                    <Text style={[styles.totalValue, { color: '#16a34a' }]}>-{formatCurrency(data.discountAmount)}</Text>
                  </View>
                )}
                <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#eeeeee', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={styles.totalLabel}>Base Imponible:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(baseImponible)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IVA (21%):</Text>
                  <Text style={styles.totalValue}>{formatCurrency(ivaAmount)}</Text>
                </View>
                <View style={styles.grandTotal}>
                  <Text style={styles.grandTotalLabel}>TOTAL:</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(data.totalAmount)}</Text>
                </View>
              </>
            );
          })()}
          <Text style={styles.ivaNote}>IVA incluido</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{data.companyName} · {data.companyAddress}</Text>
          <Text style={{ marginTop: 4 }}>
            Este documento es un ticket de compra. Si necesita una factura, puede solicitarla desde su área de cliente.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
