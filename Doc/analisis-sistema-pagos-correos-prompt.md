# PROMPT DE ANÁLISIS: Sistema de Pagos y Correos - Parte del Cliente

## CONTEXTO Y ROL

Eres un **desarrollador senior con más de 10 años de experiencia** en desarrollo full-stack, especializado en:
- Sistemas de pago (Stripe, PayPal, etc.)
- Integración de pasarelas de pago
- Sistemas de notificaciones por email
- Experiencia de usuario (UX) en e-commerce
- Arquitectura de aplicaciones web modernas
- Manejo de errores y casos edge
- Seguridad en transacciones

Tu tarea es realizar un **análisis exhaustivo y profundo** del sistema de pagos y correos electrónicos de la **parte del cliente** (frontend y flujos de usuario) de FashionStore, identificando:

1. **Errores y bugs** potenciales o reales
2. **Inconsistencias** en el código, flujos o UX
3. **Problemas de integración** entre componentes
4. **Mejoras de experiencia de usuario** para usuarios no técnicos
5. **Problemas de seguridad** o vulnerabilidades
6. **Optimizaciones** y mejores prácticas

---

## ALCANCE DEL ANÁLISIS

### 1. SISTEMA DE PAGOS

#### Archivos clave a analizar:
- `src/pages/checkout.astro` - Página principal de checkout
- `src/components/islands/CheckoutForm.tsx` - Formulario de checkout
- `src/pages/api/checkout/create-session.ts` - Creación de sesión de pago
- `src/pages/checkout/exito.astro` - Página de éxito post-pago
- `src/pages/checkout/cancelado.astro` - Página de cancelación
- `src/pages/api/webhooks/stripe.ts` - Webhook de Stripe
- `src/lib/stripe.ts` - Configuración de Stripe
- `src/pages/api/coupons/validate.ts` - Validación de cupones

#### Aspectos a revisar:

**1.1 Flujo de Checkout:**
- ¿El formulario valida correctamente todos los campos?
- ¿Hay validación en cliente y servidor?
- ¿Se manejan correctamente los errores de validación?
- ¿La experiencia es clara para usuarios no técnicos?
- ¿Hay feedback visual adecuado durante el proceso?
- ¿Se previenen errores comunes (emails inválidos, códigos postales, etc.)?

**1.2 Integración con Stripe:**
- ¿La creación de sesión de pago es robusta?
- ¿Se manejan correctamente los errores de Stripe?
- ¿Hay rollback adecuado si falla la creación de sesión?
- ¿La reserva de stock se gestiona correctamente?
- ¿Se restauran los stocks si el pago falla o expira?
- ¿Los timeouts y expiraciones están bien configurados?

**1.3 Manejo de Cupones:**
- ¿La validación de cupones es correcta?
- ¿Se aplican los descuentos correctamente?
- ¿Se registra el uso de cupones de forma idempotente?
- ¿Hay feedback claro cuando un cupón es válido/inválido?
- ¿Se previene el uso múltiple de cupones de un solo uso?

**1.4 Páginas de Resultado:**
- ¿La página de éxito maneja correctamente todos los casos?
- ¿Se evitan emails duplicados entre webhook y página de éxito?
- ¿La página de cancelación restaura correctamente el stock?
- ¿Hay mensajes claros y útiles para el usuario?
- ¿Se manejan casos edge (sesión expirada, pago duplicado, etc.)?

**1.5 Experiencia de Usuario:**
- ¿Los mensajes de error son claros y accionables?
- ¿Hay indicadores de carga apropiados?
- ¿El proceso es intuitivo para usuarios no técnicos?
- ¿Se proporciona información suficiente en cada paso?
- ¿Hay ayuda contextual o tooltips donde sea necesario?
- ¿Los textos son claros y no usan jerga técnica?

---

### 2. SISTEMA DE CORREOS ELECTRÓNICOS

#### Archivos clave a analizar:
- `src/lib/email.ts` - Funciones de envío de emails
- `src/lib/email-templates.ts` - Plantillas HTML de emails
- `src/lib/pdf-generator.ts` - Generación de PDFs adjuntos
- `src/pages/api/webhooks/stripe.ts` - Trigger de emails post-pago

#### Aspectos a revisar:

**2.1 Envío de Emails:**
- ¿Se envían emails en todos los momentos críticos?
- ¿Hay duplicación de emails?
- ¿Se manejan correctamente los errores de envío?
- ¿Hay fallbacks si el servicio de email falla?
- ¿Los emails se envían de forma idempotente?

**2.2 Plantillas de Email:**
- ¿Las plantillas son responsive y se ven bien en todos los clientes?
- ¿El contenido es claro y fácil de entender?
- ¿Hay información suficiente para el usuario?
- ¿Los CTAs (botones de acción) funcionan correctamente?
- ¿Los enlaces son correctos y apuntan a las URLs correctas?
- ¿Hay información de contacto clara?
- ¿Los emails son accesibles (contraste, tamaño de fuente, etc.)?

**2.3 Contenido y Mensajes:**
- ¿Los textos son claros para usuarios no técnicos?
- ¿Se evita jerga técnica innecesaria?
- ¿Los números de pedido son fáciles de encontrar?
- ¿Hay instrucciones claras cuando se requieren acciones del usuario?
- ¿Los mensajes de error o problemas son comprensibles?

**2.4 PDFs Adjuntos:**
- ¿Los PDFs se generan correctamente?
- ¿Contienen toda la información necesaria?
- ¿El formato es profesional y legible?
- ¿Se manejan errores si falla la generación del PDF?

**2.5 Tipos de Email:**
Revisar cada tipo de email:
- ✅ Confirmación de pedido
- 🚚 Pedido enviado
- 📦 Devoluciones
- ❌ Cancelaciones
- 💰 Reembolsos

¿Cada tipo tiene la información adecuada? ¿Falta algún tipo de email importante?

---

### 3. INTEGRACIÓN Y FLUJOS COMPLETOS

#### Flujos a analizar:

**3.1 Flujo de Compra Exitoso:**
```
Usuario → Checkout → Stripe → Pago Exitoso → Webhook → Email Confirmación
```
- ¿Hay race conditions?
- ¿Se manejan correctamente los casos donde el webhook llega antes/después que la página de éxito?
- ¿Hay idempotencia adecuada?
- ¿Se registran todos los datos correctamente?

**3.2 Flujo de Cancelación:**
```
Usuario → Checkout → Stripe → Cancelación → Restauración Stock → Página Cancelación
```
- ¿El stock se restaura correctamente?
- ¿Se actualiza el estado del pedido?
- ¿Hay emails de cancelación cuando corresponde?

**3.3 Flujo de Expiración:**
```
Sesión Stripe → Expira → Webhook → Restauración Stock → Actualización Estado
```
- ¿Se maneja correctamente la expiración?
- ¿El stock se restaura automáticamente?
- ¿Hay notificaciones al usuario?

**3.4 Flujo con Cupones:**
```
Usuario → Aplicar Cupón → Validación → Checkout → Pago → Registro Uso
```
- ¿El flujo es correcto end-to-end?
- ¿Se previene el uso múltiple?
- ¿Los descuentos se calculan correctamente?

---

### 4. EXPERIENCIA DE USUARIO PARA NO TÉCNICOS

#### Aspectos críticos:

**4.1 Claridad de Mensajes:**
- ¿Los mensajes de error son comprensibles?
- ¿Se evita jerga técnica (UUID, session_id, etc.)?
- ¿Los mensajes son accionables (dicen qué hacer)?

**4.2 Feedback Visual:**
- ¿Hay indicadores de carga claros?
- ¿Los estados de éxito/error son visibles?
- ¿Hay animaciones o transiciones que mejoren la experiencia?

**4.3 Guía del Usuario:**
- ¿El proceso es autoexplicativo?
- ¿Hay ayuda contextual donde se necesita?
- ¿Los pasos están claramente indicados?
- ¿Hay ejemplos o placeholders útiles?

**4.4 Manejo de Errores:**
- ¿Los errores se muestran de forma amigable?
- ¿Hay sugerencias de solución?
- ¿Se previenen errores comunes con validación proactiva?

**4.5 Información y Transparencia:**
- ¿El usuario sabe qué está pasando en cada momento?
- ¿Hay información sobre tiempos de procesamiento?
- ¿Se explica claramente qué pasará después de cada acción?

---

### 5. SEGURIDAD Y ROBUSTEZ

**5.1 Validación:**
- ¿Toda la validación se hace en servidor?
- ¿Hay validación en cliente para mejor UX?
- ¿Se sanitizan todos los inputs?

**5.2 Manejo de Errores:**
- ¿Los errores no exponen información sensible?
- ¿Hay logging adecuado para debugging?
- ¿Se manejan todos los casos edge?

**5.3 Idempotencia:**
- ¿Las operaciones críticas son idempotentes?
- ¿Se previenen duplicados (emails, registros, etc.)?

**5.4 Transacciones:**
- ¿Las operaciones críticas son atómicas?
- ¿Hay rollback adecuado en caso de fallos?

---

## FORMATO DEL ANÁLISIS

Para cada punto identificado, proporciona:

1. **Tipo de Problema:**
   - 🐛 Bug
   - ⚠️ Inconsistencia
   - 🔒 Seguridad
   - 🎨 UX/UI
   - ⚡ Performance
   - 📝 Mejora

2. **Severidad:**
   - 🔴 Crítico (afecta funcionalidad core)
   - 🟠 Alto (afecta experiencia significativamente)
   - 🟡 Medio (mejora importante)
   - 🟢 Bajo (nice to have)

3. **Descripción:**
   - Qué es el problema
   - Dónde ocurre (archivo, línea, función)
   - Por qué es un problema

4. **Impacto:**
   - Cómo afecta al usuario
   - Cómo afecta al negocio
   - Frecuencia estimada

5. **Solución Propuesta:**
   - Código o pseudocódigo si es relevante
   - Pasos para implementar
   - Consideraciones adicionales

6. **Prioridad de Implementación:**
   - Urgente (arreglar inmediatamente)
   - Alta (arreglar pronto)
   - Media (planificar)
   - Baja (mejora futura)

---

## ESTRUCTURA DEL REPORTE

El análisis debe incluir:

### A. RESUMEN EJECUTIVO
- Problemas críticos encontrados
- Estado general del sistema
- Recomendaciones principales

### B. ANÁLISIS DETALLADO POR SECCIÓN
1. Sistema de Pagos
2. Sistema de Correos
3. Integración y Flujos
4. Experiencia de Usuario
5. Seguridad y Robustez

### C. MEJORAS PRIORIZADAS
- Lista ordenada por prioridad
- Estimación de esfuerzo
- Impacto esperado

### D. RECOMENDACIONES ESTRATÉGICAS
- Mejoras arquitectónicas
- Mejoras de UX a largo plazo
- Consideraciones de escalabilidad

---

## INSTRUCCIONES ESPECÍFICAS

1. **Sé exhaustivo**: No dejes pasar ningún detalle, incluso si parece menor
2. **Sé constructivo**: No solo critiques, propón soluciones
3. **Piensa en el usuario final**: Prioriza la experiencia de usuarios no técnicos
4. **Considera casos edge**: Piensa en escenarios poco comunes pero posibles
5. **Documenta bien**: Explica el "por qué" además del "qué"
6. **Prioriza**: No todos los problemas son igual de importantes
7. **Sé específico**: Indica archivos, líneas, funciones específicas cuando sea posible

---

## CONTEXTO ADICIONAL

- **Stack Tecnológico**: Astro, React, TypeScript, Stripe, Resend, Supabase
- **Audiencia**: Usuarios españoles, principalmente no técnicos
- **Negocio**: E-commerce de moda (FashionStore)
- **Volumen**: Esperado medio-alto de transacciones

---

## ENTREGABLES ESPERADOS

1. **Reporte completo** en formato Markdown
2. **Lista priorizada** de acciones a tomar
3. **Código de ejemplo** para las correcciones más importantes
4. **Diagramas de flujo** mejorados si es necesario
5. **Checklist de validación** para verificar las correcciones

---

**¡Comienza el análisis!** Sé meticuloso, crítico pero constructivo, y piensa siempre en cómo hacer la experiencia más fácil para usuarios no técnicos.
