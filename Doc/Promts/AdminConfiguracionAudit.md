# Prompt: Auditoría Profunda del Módulo CONFIGURACIÓN - Admin Panel

## Contexto del Proyecto

Estás trabajando en **FashionStore**, un e-commerce completo desarrollado con:

- **Frontend**: Astro + React + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Usuarios objetivo**: Marketing managers y administradores NO técnicos

## Tu Rol

Actúa como un **Desarrollador Senior Full-Stack con +10 años de experiencia** especializado en:

- Arquitectura de aplicaciones empresariales
- Sistemas de configuración y parametrización
- Gestión de estados complejos
- UX/UI para usuarios no técnicos
- Seguridad y validación de datos críticos
- Integración de módulos interdependientes

## Objetivo Principal

Realizar una **auditoría técnica exhaustiva** del módulo **"CONFIGURACIÓN"** del panel de administración, evaluando:

1. **Funcionalidad y Lógica**
2. **Errores e Inconsistencias**
3. **Integración con otros módulos**
4. **Experiencia de Usuario para perfiles NO técnicos**
5. **Seguridad y validaciones**
6. **Rendimiento y escalabilidad**
7. **Mantenibilidad del código**

---

## Áreas Específicas a Analizar

### 1. **Funcionalidad Core**

Examina todos los aspectos del módulo de Configuración:

#### A) Configuración General de Tienda

- **Información básica**: Nombre, descripción, logo, favicon
- **Datos de contacto**: Email, teléfono, dirección física
- **Redes sociales**: Enlaces a perfiles sociales
- **Configuración de moneda** y formato de precios
- **Zona horaria** y localización

#### B) Configuración de E-commerce

- **Métodos de pago**: Activación/desactivación, credenciales, webhooks
- **Métodos de envío**: Costos, zonas, tiempos de entrega
- **Configuración de inventario**: Stock mínimo, alertas, reservas
- **Política de devoluciones**: Días permitidos, condiciones
- **Taxes/Impuestos**: IVA, tasas regionales

#### C) Configuración de Email/Notificaciones

- **Proveedor de email** (SMTP, Resend, SendGrid, etc.)
- **Plantillas de email**: Pedidos, devoluciones, marketing
- **Notificaciones push** (si aplica)
- **Configuración de Newsletter**

#### D) Configuración de Seguridad

- **Políticas de privacidad** y términos de servicio
- **Configuración de cookies** y GDPR
- **Autenticación de administradores**: 2FA, roles, permisos
- **Logs de auditoría**: Registro de cambios críticos

#### E) Configuración Avanzada/Técnica

- **API Keys** (Cloudinary, servicios externos)
- **Variables de entorno** expuestas de forma segura
- **Caché y optimización**
- **Modo mantenimiento**

**Para cada área, evalúa:**

- ¿Existe esta funcionalidad? Si no, ¿debería existir?
- ¿Funciona correctamente?
- ¿Está completa o le faltan opciones críticas?
- ¿Los cambios se persisten correctamente en la base de datos?
- ¿Hay validaciones adecuadas (frontend + backend)?

---

### 2. **Identificación de Errores e Inconsistencias**

#### A) Errores Técnicos

- **API Endpoints**:
  - ¿Existen endpoints para todas las configuraciones?
  - ¿Validan correctamente los datos recibidos?
  - ¿Manejan errores de forma apropiada?
  - ¿Requieren autenticación/autorización adecuada?
- **Base de Datos**:
  - ¿Existe una tabla/estructura para almacenar configuraciones?
  - ¿Está normalizada correctamente?
  - ¿Hay RLS (Row Level Security) policies adecuadas?
  - ¿Se usan transacciones donde es necesario?

- **Frontend**:
  - ¿Se muestran correctamente los valores actuales?
  - ¿Los formularios validan antes de enviar?
  - ¿Hay estados de carga y error?
  - ¿Se actualizan los valores en tiempo real tras guardar?

#### B) Inconsistencias de Diseño

- ¿El diseño es consistente con el resto del admin panel?
- ¿Los componentes reutilizan el sistema de diseño existente?
- ¿Hay elementos hardcodeados que deberían ser configurables?

#### C) Lógica de Negocio

- ¿Hay configuraciones que deberían ser mutuamente excluyentes pero no lo son?
- ¿Se permite guardar configuraciones inválidas o incompletas?
- ¿Hay valores por defecto razonables?

---

### 3. **Integración con Otros Módulos**

Evalúa cómo el módulo de Configuración interactúa con:

- **Productos**: ¿La configuración de moneda/impuestos afecta correctamente los precios?
- **Pedidos**: ¿Los métodos de pago/envío configurados se reflejan en el checkout?
- **Email/Newsletter**: ¿Las credenciales SMTP funcionan correctamente?
- **Dashboard**: ¿Las estadísticas consideran la zona horaria configurada?
- **Frontend público**: ¿Los cambios en configuración se reflejan en el sitio sin reiniciar?

**Busca específicamente:**

- Configuraciones que NO se aplican donde deberían
- Caché no invalidado tras cambios
- Dependencias circulares o mal gestionadas

---

### 4. **Experiencia de Usuario (UX/UI) para NO Técnicos**

**Analiza desde la perspectiva de un marketing manager o administrador sin conocimientos técnicos:**

#### A) Claridad y Organización

- ¿La información está organizada lógicamente?
- ¿Hay pestañas/secciones claramente diferenciadas?
- ¿Los labels y descripciones son comprensibles?
- ¿Evita jerga técnica innecesaria?

#### B) Guías y Ayuda Contextual

- ¿Hay tooltips explicativos en campos complejos?
- ¿Existen ejemplos de valores válidos?
- ¿Hay enlaces a documentación cuando sea necesario?
- ¿Se muestran advertencias sobre cambios críticos?

#### C) Prevención de Errores

- ¿Los campos tienen el tipo de input correcto (number, email, URL, etc.)?
- ¿Hay validación visual inmediata?
- ¿Se deshabilitan opciones incompatibles automáticamente?
- ¿Hay confirmaciones para cambios peligrosos?

#### D) Feedback Visual

- ¿Hay indicadores de carga al guardar?
- ¿Se muestran mensajes de éxito/error claros?
- ¿Es evidente qué configuraciones están activas vs inactivas?
- ¿Hay previsualización cuando es relevante?

#### E) Accesibilidad

- ¿Funciona bien en móvil/tablet?
- ¿Los colores tienen suficiente contraste?
- ¿Es navegable por teclado?
- ¿Tiene ARIA labels donde corresponde?

---

### 5. **Seguridad y Validaciones**

#### A) Validación de Datos

- **Frontend**: Validación inmediata con mensajes claros
- **Backend**: Validación robusta que NO confía en el cliente
- **Tipos de datos**: Verificación estricta (emails válidos, URLs correctas, números en rangos permitidos)

#### B) Protección de Datos Sensibles

- ¿Las API keys se almacenan de forma segura?
- ¿Las credenciales SMTP están encriptadas?
- ¿Se ocultan valores sensibles en la UI (\*\*\* en lugar de mostrar)?
- ¿Hay logs de auditoría para cambios críticos?

#### C) Autorización

- ¿Solo administradores con permisos adecuados pueden modificar configuraciones?
- ¿Hay diferentes niveles de acceso (ej: ver vs editar)?
- ¿Se previene la escalada de privilegios?

#### D) Inyección y XSS

- ¿Los campos de texto están sanitizados?
- ¿Se previene la inyección SQL en cualquier query relacionada?
- ¿Los valores se escapan correctamente al renderizar?

---

### 6. **Rendimiento y Escalabilidad**

- ¿Las configuraciones se cachean apropiadamente?
- ¿Se minimizan las llamadas a la base de datos?
- ¿Los cambios invalidan el caché de forma inteligente?
- ¿Hay optimistic updates donde tiene sentido?
- ¿El módulo soportaría múltiples tiendas/tenants?

---

### 7. **Mantenibilidad y Buenas Prácticas**

#### A) Código

- ¿Está bien estructurado y modular?
- ¿Sigue convenciones del proyecto?
- ¿Hay duplicación de código que debería extraerse?
- ¿Los nombres de variables/funciones son descriptivos?

#### B) Tipado

- ¿Hay tipos TypeScript completos y correctos?
- ¿Se evita el uso de `any`?
- ¿Hay interfaces claramente definidas?

#### C) Testing

- ¿Existen tests para funcionalidades críticas?
- ¿Se pueden testear fácilmente los componentes?

#### D) Documentación

- ¿Hay comentarios en código complejo?
- ¿Existe documentación de uso para administradores?

---

## Tareas Específicas

### 1. Análisis Exhaustivo

Realiza una revisión completa del código relacionado con el módulo de Configuración:

- Páginas/componentes del admin panel
- API endpoints relacionados
- Esquema de base de datos
- Lógica de negocio
- Integraciones con servicios externos

### 2. Documentación de Hallazgos

Para cada problema identificado, documenta:

- **Severidad**: CRÍTICO, ALTO, MEDIO, BAJO
- **Ubicación exacta**: Archivo y líneas de código
- **Descripción clara** del problema
- **Impacto**: ¿Cómo afecta a usuarios/sistema?
- **Reproducción**: Pasos para verificar el problema

### 3. Propuestas de Mejora

Para cada hallazgo, proporciona:

- **Solución recomendada**: Técnica y específica
- **Alternativas**: Si existen múltiples enfoques
- **Esfuerzo estimado**: Bajo/Medio/Alto
- **Prioridad**: Urgente/Alta/Media/Baja
- **Dependencias**: Qué otras tareas requiere

### 4. Plan de Implementación Detallado

Crea un plan estructurado por fases:

#### **FASE 1: Correcciones Críticas** (Bugs que rompen funcionalidad)

- [ ] Error 1: Descripción y solución
- [ ] Error 2: Descripción y solución
- ...

#### **FASE 2: Mejoras Funcionales** (Funcionalidad faltante importante)

- [ ] Mejora 1: Descripción y solución
- [ ] Mejora 2: Descripción y solución
- ...

#### **FASE 3: UX/UI para Usuarios NO Técnicos** (Facilitar uso)

- [ ] Mejora UX 1: Descripción y solución
- [ ] Mejora UX 2: Descripción y solución
- ...

#### **FASE 4: Optimizaciones y Refinamientos** (Nice to have)

- [ ] Optimización 1: Descripción y solución
- [ ] Optimización 2: Descripción y solución
- ...

### 5. Métricas de Éxito

Define cómo medir que las mejoras han sido exitosas:

- Reducción de errores de usuario en X%
- Tiempo de configuración reducido en X minutos
- 0 configuraciones inválidas guardadas
- 100% de cambios reflejados en frontend público
- Puntuación de usabilidad mejorada

---

## Formato de Entrega

Genera un documento markdown estructurado en:
**`Doc/PlanesDesarrollo/Admin/AdminConfiguracion/`**

Archivos esperados:

1. **`AnalisisCompleto.md`**: Análisis exhaustivo con todos los hallazgos
2. **`PlanImplementacion.md`**: Plan de implementación por fases
3. **`MejorasUX.md`**: Específico para mejoras de experiencia de usuario NO técnico
4. **`Checklist.md`**: Checklist verificable de todas las tareas

---

## Principios Guía

1. **Piensa como usuario final**: Un marketing manager debe poder configurar la tienda sin llamar a IT
2. **Prevención sobre corrección**: Mejor prevenir errores que mostrar mensajes de error
3. **Claridad sobre brevedad**: Mejor un mensaje largo y claro que uno corto y confuso
4. **Seguridad primero**: Las configuraciones son críticas, protégelas adecuadamente
5. **Consistencia**: Mantén coherencia con el resto del admin panel
6. **Escalabilidad**: Piensa en cómo evolucionará este módulo

---

## Notas Adicionales

- Considera patrones comunes de otros e-commerce (Shopify, WooCommerce, Magento)
- Prioriza mejoras que tengan el mayor impacto con el menor esfuerzo
- Si una funcionalidad NO existe pero debería, inclúyela en las propuestas
- Sé específico en las soluciones técnicas (nombres de tablas, endpoints, componentes)
- Incluye ejemplos de código cuando sea relevante

---

## Comienza el Análisis

Inicia con una exploración profunda de:

1. La estructura actual del módulo de Configuración (si existe)
2. Cómo se almacenan las configuraciones en la base de datos
3. Qué configuraciones son críticas para el funcionamiento del e-commerce
4. Qué configuraciones existen en otros módulos pero deberían centralizarse aquí

**¡Adelante, desarrollador senior! 🚀**
