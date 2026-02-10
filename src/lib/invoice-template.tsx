import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  invoiceLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
    fontWeight: 'bold',
  },
  twoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 4,
  },
  infoText: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 8,
    color: '#888888',
    marginTop: 4,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    padding: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colProduct: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    paddingLeft: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  grandTotalValue: {
    fontSize: 12,
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
  legalNote: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  legalText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  orderDate: string;
  // Emisor (empresa)
  companyName: string;
  companyNif: string;
  companyAddress: string;
  companyEmail?: string;
  companyPhone?: string;
  // Cliente
  customerFiscalName: string;
  customerNif: string;
  customerFiscalAddress: string;
  // Artículos
  items: {
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }[];
  // Importes
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
  discountAmount?: number;
  shippingCost?: number;
}

export const InvoiceTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} €`;
  const shortOrderId = data.orderId.slice(0, 8).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>FASHIONSTORE</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceLabel}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={{ fontSize: 9, color: '#666666', marginTop: 4 }}>
              Fecha: {data.invoiceDate}
            </Text>
          </View>
        </View>

        {/* Two columns: Emisor and Cliente */}
        <View style={styles.twoColumns}>
          {/* Emisor */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Emisor</Text>
            <Text style={[styles.infoText, { fontWeight: 'bold' }]}>{data.companyName}</Text>
            <Text style={styles.infoText}>NIF: {data.companyNif}</Text>
            <Text style={styles.infoText}>{data.companyAddress}</Text>
            {data.companyEmail && <Text style={styles.infoText}>{data.companyEmail}</Text>}
            {data.companyPhone && <Text style={styles.infoText}>{data.companyPhone}</Text>}
          </View>

          {/* Cliente */}
          <View style={[styles.column, { marginLeft: 30 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={[styles.infoText, { fontWeight: 'bold' }]}>{data.customerFiscalName}</Text>
            <Text style={styles.infoText}>NIF: {data.customerNif}</Text>
            <Text style={styles.infoText}>{data.customerFiscalAddress}</Text>
            <Text style={styles.infoLabel}>Pedido: #{shortOrderId}</Text>
            <Text style={styles.infoLabel}>Fecha pedido: {data.orderDate}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cantidad</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Importe</Text>
          </View>
          {data.items.map((item, index) => (
            <View style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]} key={index}>
              <View style={styles.colProduct}>
                <Text style={{ fontWeight: 'bold' }}>{item.productName}</Text>
                <Text style={{ fontSize: 8, color: '#888888' }}>Talla: {item.size}</Text>
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          {(() => {
            const itemsSubtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
            const hasDiscount = data.discountAmount != null && data.discountAmount > 0;
            const hasShipping = data.shippingCost != null && data.shippingCost > 0;
            const showBreakdown = hasDiscount || hasShipping;

            return (
              <>
                {showBreakdown && (
                  <>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal artículos</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(itemsSubtotal)}
                      </Text>
                    </View>
                    {hasShipping && (
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Gastos de envío</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.shippingCost!)}</Text>
                      </View>
                    )}
                    {hasDiscount && (
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Descuento{data.couponCode ? ` (${data.couponCode})` : ''}</Text>
                        <Text style={[styles.totalValue, { color: '#16a34a' }]}>-{formatCurrency(data.discountAmount!)}</Text>
                      </View>
                    )}
                  </>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Base Imponible</Text>
                  <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IVA ({data.taxRate}%)</Text>
                  <Text style={styles.totalValue}>{formatCurrency(data.taxAmount)}</Text>
                </View>
                <View style={styles.grandTotal}>
                  <Text style={styles.grandTotalLabel}>TOTAL</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
                </View>
              </>
            );
          })()}
        </View>

        {/* Legal note */}
        <View style={styles.legalNote}>
          <Text style={styles.legalText}>
            Factura emitida conforme al Real Decreto 1619/2012, de 30 de noviembre.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{data.companyName} · NIF: {data.companyNif}</Text>
          <Text style={{ marginTop: 2 }}>{data.companyAddress}</Text>
        </View>
      </Page>
    </Document>
  );
};
