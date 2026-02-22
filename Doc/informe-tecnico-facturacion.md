# Memoria Técnica de Proyecto

## FashionStore: Justificación Tecnológica y Flujo de Facturación

---

## Portada

- **Proyecto:** Sistema de Gestión Empresarial - FashionStore
- **Ciclo / Asignatura:** Segundo Trimestre - Proyecto Integrado
- **Autor/a:** _Completar_
- **Centro:** _Completar_
- **Tutor/a:** _Completar_
- **Fecha:** 22/02/2026

---

## Índice

1. Resumen ejecutivo
2. Objetivos del proyecto
3. Justificación de tecnologías
4. Arquitectura funcional y técnica
5. Flujo de facturación (end-to-end)
6. Seguridad, consistencia e integridad
7. Resultados obtenidos
8. Riesgos y mejoras propuestas
9. Conclusiones
10. Referencias técnicas

---

## 1. Resumen ejecutivo

FashionStore implementa una solución e-commerce completa orientada a operación real de tienda: catálogo, carrito, checkout, backoffice, devoluciones y gestión fiscal. El sistema integra renderizado SSR con componentes interactivos tipo isla, base de datos relacional con políticas de seguridad, pasarela de pago y generación de documentos fiscales en PDF.

El objetivo principal de esta memoria es justificar técnicamente la selección de stack y describir con trazabilidad el flujo de facturación desde el pago del pedido hasta la emisión de factura rectificativa en devoluciones.

---

## 2. Objetivos del proyecto

### 2.1 Objetivo general

Desarrollar una plataforma de gestión empresarial para comercio de moda que garantice experiencia de compra, control administrativo y cumplimiento fiscal básico.

### 2.2 Objetivos específicos

1. Implementar un flujo de compra online seguro y trazable.
2. Gestionar estados de pedido, envío, cancelación y devolución.
3. Emitir documentos fiscales (ticket/factura/rectificativa) con persistencia documental.
4. Aplicar seguridad por autenticación y control de acceso a datos.
5. Mantener consistencia de inventario frente a concurrencia y errores de pago.

---

## 3. Justificación de tecnologías

### 3.1 Frontend y renderizado

- **Astro** permite rendimiento alto y separación entre contenido renderizado en servidor y zonas interactivas.
- **React (Islands)** se usa en módulos donde aporta valor real: carrito, buscador, dashboard, formularios dinámicos.
- **Tailwind CSS** reduce complejidad de estilos y acelera consistencia responsive.

**Justificación:** combinación adecuada para un e-commerce con exigencia de rendimiento, mantenibilidad y experiencia visual moderna.

### 3.2 Backend y datos

- **Supabase (PostgreSQL + Auth + Storage)** centraliza autenticación, base de datos relacional y ficheros.
- **RPC en PL/pgSQL** encapsula operaciones críticas (stock, devoluciones, documentos fiscales).
- **RLS** aplica seguridad por rol y por pertenencia del dato.

**Justificación:** reduce complejidad de infraestructura y mantiene lógica de negocio sensible junto a los datos.

### 3.3 Pagos y comunicación

- **Stripe** gestiona cobros, reembolsos y validación de eventos con webhooks.
- **Resend** permite notificaciones transaccionales (confirmaciones, cancelaciones, devoluciones).

**Justificación:** servicios especializados, robustos y compatibles con escalado en producción.

### 3.4 Operación y despliegue

- **Docker** aporta reproducibilidad entre desarrollo y producción.
- Compatible con despliegue en **VPS/Coolify** con variables de entorno y healthcheck.

---

## 4. Arquitectura funcional y técnica

### 4.1 Módulos de la aplicación

1. **Tienda pública:** catálogo, ficha de producto, buscador, filtros, carrito y checkout.
2. **Área de cliente:** seguimiento de pedidos y devoluciones.
3. **Backoffice administrativo:** inventario, pedidos, promociones, newsletter, métricas.
4. **Motor fiscal:** emisión de documentos y trazabilidad documental.

### 4.2 Modelo de datos (alto nivel)

- Catálogo: `products`, `categories`, `product_variants`, `product_images`
- Venta: `orders`, `order_items`, `order_shipments`
- Postventa: `returns`, `return_items`, `return_images`, `return_audit_logs`
- Fiscalidad: `fiscal_documents` (y `invoices` legacy)
- Marketing/configuración: `coupons`, `promotions`, `settings`, `newsletter_*`

---

## 5. Flujo de facturación (end-to-end)

### 5.1 Creación de pedido y reserva de stock

1. El cliente inicia checkout.
2. Se crea sesión de pago con Stripe.
3. El pedido y sus líneas se registran en base de datos.
4. Se ejecuta reserva de stock por variante de forma atómica.
5. Si falla una parte del proceso, se restaura stock para evitar inconsistencia.

### 5.2 Confirmación de pago

1. Stripe emite evento de pago.
2. Webhook procesa el evento y actualiza estado del pedido.
3. Se envía comunicación de confirmación.

Resultado: el pedido queda en estado facturable (`paid` o superior).

### 5.3 Emisión de documento fiscal

1. Se genera documento fiscal en `fiscal_documents`.
2. Tipo documental según escenario:
   - `simplified` (ticket simplificado)
   - `invoice` (factura completa)
3. Se calculan subtotal, impuestos y total.
4. Se asigna numeración fiscal única.
5. Se genera PDF.
6. Se guarda PDF en almacenamiento de documentos y se persisten metadatos.

Resultado: documento fiscal trazable, descargable y auditable.

### 5.4 Devolución y factura rectificativa

1. Se solicita y procesa devolución.
2. Tras inspección y reembolso, se crea documento `rectifying`.
3. La rectificativa referencia el documento fiscal original.
4. El importe se registra en negativo para cuadrar caja.
5. Se genera PDF rectificativo y se notifica por email.

Resultado: regularización contable del ciclo de postventa.

---

## 6. Seguridad, consistencia e integridad

### 6.1 Integridad operativa

- Control de stock mediante RPC atómicas (reserva/restauración).
- Reversión de operaciones ante error de pago o fallo de checkout.
- Cancelación de pedido con restauración de inventario.

### 6.2 Seguridad de acceso

- RLS en tablas críticas.
- Middleware para rutas protegidas (admin/cuenta).
- Uso de claves sensibles en entorno servidor.

### 6.3 Trazabilidad

- Estados explícitos en pedido y devolución.
- Auditoría de eventos y documentos.
- Registro documental persistente con metadatos del PDF.

---

## 7. Resultados obtenidos

1. Plataforma funcional con flujo de venta y postventa completo.
2. Emisión documental integrada en el proceso real de negocio.
3. Integración entre pagos, facturación y devoluciones.
4. Base técnica preparada para operación continua y mejoras incrementales.

---

## 8. Riesgos y mejoras propuestas

### 8.1 Riesgos detectados

1. Coexistencia de capa legacy (`invoices`) con capa unificada (`fiscal_documents`).
2. Complejidad creciente en migraciones y compatibilidad histórica.
3. Dependencia de servicios externos (Stripe/Resend) ante incidentes de terceros.

### 8.2 Mejoras recomendadas

1. Consolidar definitivamente `fiscal_documents` como única fuente fiscal.
2. Añadir pruebas automáticas específicas de flujo contable.
3. Definir playbooks de contingencia para fallos de webhook/email.
4. Incluir cuadros KPI fiscales en panel administrativo.

---

## 9. Conclusiones

FashionStore presenta una arquitectura técnicamente sólida para una solución empresarial de e-commerce. El sistema integra adecuadamente experiencia de usuario, control operativo y trazabilidad financiera. El flujo de facturación, incluyendo rectificación por devoluciones, está diseñado para mantener coherencia de caja y alineación con la operativa real del negocio.

La base actual permite escalar funcionalidad y robustez sin rehacer fundamentos estructurales.

---

## 10. Referencias técnicas

- `README.md`
- `package.json`
- `Doc/esquema-completo-bd.md`
- `src/pages/api/checkout/create-session.ts`
- `src/pages/api/webhooks/stripe.ts`
- `src/pages/api/orders/cancel.ts`
- `src/pages/api/invoices/request.ts`
- `src/lib/fiscal-documents.ts`
- `src/lib/pdf-generator.ts`
- `supabase/functions/send-invoice-email/index.ts`
