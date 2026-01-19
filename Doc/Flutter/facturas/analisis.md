# Módulo Facturas - Análisis del Sistema

## 1. Modelo de Datos (de 024_create_invoices.sql)

### Tabla `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  order_id UUID UNIQUE REFERENCES orders(id),  -- 1 factura por pedido
  invoice_number TEXT UNIQUE NOT NULL,          -- FS-2025-00001
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,                                 -- URL del PDF en Storage
  
  -- Datos fiscales del cliente
  customer_nif TEXT NOT NULL,
  customer_fiscal_name TEXT NOT NULL,
  customer_fiscal_address TEXT NOT NULL,
  
  -- Importes desglosados
  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ
);
```

### Secuencia de Numeración
```sql
CREATE SEQUENCE invoice_number_seq START 1;
-- Formato: FS-2025-00001
```

---

## 2. Flujo de Solicitud de Factura

```
┌─────────────────┐
│ Detalle Pedido  │
│ (status: paid+) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ InvoiceButton   │
│ (comprueba si   │
│  ya existe)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│Descargar│ │RequestModal│
│(si URL) │ │(datos fisc)│
└────────┘ └─────┬──────┘
                 │
                 ▼
          ┌────────────┐
          │POST /api/  │
          │invoices/   │
          │request     │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │RPC create_ │
          │invoice     │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │Genera PDF  │
          │(react-pdf) │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │Sube a      │
          │Storage     │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │Retorna PDF │
          │+ URL       │
          └────────────┘
```

---

## 3. APIs

### GET /api/invoices/check
Verifica si ya existe factura para un pedido.

**Query Params:**
- `orderId`: UUID del pedido

**Response:**
```json
{
  "invoice": {
    "id": "uuid",
    "invoice_number": "FS-2025-00001",
    "pdf_url": "https://storage.../invoices/FS-2025-00001.pdf"
  }
}
// o null si no existe
```

### POST /api/invoices/request
Genera/regenera factura con datos fiscales.

**Request Body:**
```json
{
  "orderId": "uuid-del-pedido",
  "customerNif": "12345678A",
  "customerFiscalName": "Juan García López",
  "customerFiscalAddress": "Calle Mayor 123, 28001 Madrid"
}
```

**Response:**
- Content-Type: `application/pdf`
- Headers:
  - `X-Invoice-Number`: FS-2025-00001
  - `X-Invoice-Url`: URL del PDF en storage

---

## 4. Función RPC: create_invoice

```sql
CREATE OR REPLACE FUNCTION create_invoice(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  invoice_id UUID,
  invoice_number TEXT
)
```

### Operaciones:
1. Obtiene datos del pedido
2. Genera número correlativo: `FS-{AÑO}-{SECUENCIA}`
3. Calcula: subtotal = total / 1.21, IVA = total - subtotal
4. Inserta registro en `invoices`
5. Retorna ID y número de factura

---

## 5. Plantilla PDF (invoice-template.tsx)

La factura incluye:

| Sección | Contenido |
|---------|-----------|
| Header | Logo FASHIONSTORE + "FACTURA" + Número + Fecha |
| Emisor | Nombre empresa, NIF, Dirección, Email, Teléfono |
| Cliente | Nombre fiscal, NIF, Dirección fiscal |
| Referencia | Nº Pedido, Fecha pedido |
| Tabla Items | Descripción, Talla, Cantidad, Precio Unit., Importe |
| Totales | Base Imponible, IVA (21%), **TOTAL** |
| Legal | Nota conforme RD 1619/2012 |
| Footer | Datos empresa |

### Colores de marca:
- Acento: `#CCFF00` (verde neón)
- Fondo header: `#0a0a0a` (negro)

---

## 6. Storage de PDFs

- **Bucket:** `documents`
- **Path:** `invoices/{invoice_number}.pdf`
- **Permisos:** Público para lectura (URL firmada)

---

## 7. Datos Fiscales de la Empresa

Configurados en variables de entorno:
```env
COMPANY_NAME=FashionStore S.L.
COMPANY_NIF=B12345678
COMPANY_ADDRESS=Calle de la Moda 123, 28001 Madrid, España
COMPANY_EMAIL=info@fashionstore.es
COMPANY_PHONE=+34 912 345 678
```

---

## 8. Condiciones para Solicitar Factura

- **Status del pedido:** `paid`, `shipped`, o `delivered`
- **Autenticación:** Usuario debe estar autenticado
- **Propietario:** El pedido debe pertenecer al usuario (email coincide)

---

## 9. Regeneración de Facturas

Si ya existe una factura pero falló la generación del PDF (`pdf_url` es null):
1. Se actualizan los datos fiscales
2. Se regenera el PDF
3. Se actualiza la URL en la BD
