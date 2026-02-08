/**
 * Validaciones centralizadas para FashionStore
 * Usar tanto en cliente como en servidor
 * 
 * @module validators
 */

// ============================================
// VALIDACIONES INDIVIDUALES
// ============================================

/**
 * Valida formato de email según RFC 5322 mejorado
 * Rechaza: a@b.c (sin TLD válido), emails sin punto después @
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  // RFC 5322 mejorado: requiere TLD de al menos 2 caracteres
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  return emailRegex.test(trimmed) && trimmed.length <= 254;
};

/**
 * Valida código postal español (00000-52999)
 * Los códigos postales españoles tienen 5 dígitos:
 * - Primeros 2 dígitos: provincia (00-52)
 * - Últimos 3 dígitos: zona dentro de la provincia
 * Acepta: 00000-00999 (parciales Canarias), 01000-52999 (todo territorio)
 */
export const validatePostalCode = (code: string): boolean => {
  if (!code) return false;
  const trimmed = code.trim();
  // Acepta códigos de 00000 a 52999
  return /^(?:[0-4]\d|5[0-2])\d{3}$/.test(trimmed) && trimmed.length === 5;
};

/**
 * Valida teléfono español (opcional)
 * Acepta móviles (6xx, 7xx) y fijos (8xx, 9xx)
 * EXACTAMENTE 9 dígitos sin espacios ni guiones
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Es opcional
  const cleaned = phone.replace(/[\s\-\.]/g, '').trim();
  // Móviles: 6xx, 7xx | Fijos: 8xx, 9xx - EXACTAMENTE 9 dígitos
  return /^[6789]\d{8}$/.test(cleaned) && cleaned.length === 9;
};

/**
 * Sanitiza campos de texto (nombre, dirección, ciudad)
 * Rechaza caracteres especiales peligrosos
 */
export const sanitizeTextField = (value: string): string => {
  if (!value || typeof value !== 'string') return '';
  // Rechaza: < > / \ { } ( ) [ ] ; : ' " & caracteres de control
  return value
    .replace(/[<>\/\\{}\\'\"&;:\[\]()]/g, '')
    .replace(/\s+/g, ' ') // Normaliza espacios múltiples
    .trim();
};

/** * Sanitiza campos de texto en tiempo real (sin trim final)
 * Permite espacios al escribir, mantiene cursor en posición correcta
 */
export const sanitizeTextFieldLive = (value: string): string => {
  if (!value || typeof value !== 'string') return '';
  // Rechaza: < > / \ { } ( ) [ ] ; : ' " & caracteres de control
  return value
    .replace(/[<>\/\\{}\\'\";:\[\]()]/g, '')
    .replace(/\s+/g, ' '); // Normaliza espacios múltiples, pero sin .trim()
};

/** * Valida que el texto sanitizado sea seguro (sin cambios significativos)
 */
export const isTextSafe = (original: string, sanitized: string): boolean => {
  // Si el texto sanitizado cambió más del 10% de caracteres, rechazar
  const maxRemovable = Math.ceil(original.length * 0.1);
  return original.length - sanitized.length <= maxRemovable;
};

/**
 * Valida nombre (no vacío, mínimo 2 caracteres, sin caracteres especiales)
 */
export const validateName = (name: string): boolean => {
  const sanitized = sanitizeTextField(name);
  return sanitized.length >= 2 && isTextSafe(name, sanitized);
};

/**
 * Valida dirección (no vacía, mínimo 5 caracteres, sin caracteres especiales)
 */
export const validateAddress = (address: string): boolean => {
  const sanitized = sanitizeTextField(address);
  return sanitized.length >= 5 && isTextSafe(address, sanitized);
};

/**
 * Valida ciudad (no vacía, mínimo 2 caracteres, sin caracteres especiales)
 */
export const validateCity = (city: string): boolean => {
  const sanitized = sanitizeTextField(city);
  return sanitized.length >= 2 && isTextSafe(city, sanitized);
};

// ============================================
// MENSAJES DE ERROR
// ============================================

export const ValidationMessages = {
  customerName: {
    required: 'Por favor, introduce tu nombre completo',
    invalid: 'El nombre debe tener al menos 2 caracteres y sin caracteres especiales',
  },
  customerEmail: {
    required: 'Por favor, introduce tu email',
    invalid: 'Introduce un email válido con TLD (ejemplo: tu@email.com)',
  },
  customerPhone: {
    invalid: 'El teléfono debe tener exactamente 9 dígitos (ejemplo: 612345678)',
  },
  shippingAddress: {
    required: 'Por favor, introduce tu dirección de envío',
    invalid: 'La dirección debe tener al menos 5 caracteres y sin caracteres especiales',
  },
  shippingCity: {
    required: 'Por favor, introduce tu ciudad',
    invalid: 'Introduce una ciudad válida sin caracteres especiales',
  },
  shippingPostalCode: {
    required: 'Por favor, introduce tu código postal',
    invalid: 'El código postal debe ser válido (5 dígitos, ejemplo: 28001)',
  },
} as const;

// ============================================
// VALIDACIÓN POR CAMPO
// ============================================

export type FieldName = 
  | 'customerName' 
  | 'customerEmail' 
  | 'customerPhone' 
  | 'shippingAddress' 
  | 'shippingCity' 
  | 'shippingPostalCode';

/**
 * Obtiene mensaje de error específico para un campo
 * @returns Mensaje de error o null si es válido
 */
export const getFieldError = (field: FieldName, value: string): string | null => {
  switch (field) {
    case 'customerName':
      if (!value?.trim()) return ValidationMessages.customerName.required;
      if (!validateName(value)) return ValidationMessages.customerName.invalid;
      break;
    case 'customerEmail':
      if (!value?.trim()) return ValidationMessages.customerEmail.required;
      if (!validateEmail(value)) return ValidationMessages.customerEmail.invalid;
      break;
    case 'customerPhone':
      if (value && !validatePhone(value)) return ValidationMessages.customerPhone.invalid;
      break;
    case 'shippingAddress':
      if (!value?.trim()) return ValidationMessages.shippingAddress.required;
      if (!validateAddress(value)) return ValidationMessages.shippingAddress.invalid;
      break;
    case 'shippingCity':
      if (!value?.trim()) return ValidationMessages.shippingCity.required;
      if (!validateCity(value)) return ValidationMessages.shippingCity.invalid;
      break;
    case 'shippingPostalCode':
      if (!value?.trim()) return ValidationMessages.shippingPostalCode.required;
      if (!validatePostalCode(value)) return ValidationMessages.shippingPostalCode.invalid;
      break;
  }
  return null;
};

// ============================================
// VALIDACIÓN DE FORMULARIO COMPLETO
// ============================================

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<FieldName, string>>;
  firstError: string | null;
}

/**
 * Valida el paso 1 del checkout (datos personales)
 */
export const validateStep1 = (data: Pick<CheckoutFormData, 'customerName' | 'customerEmail' | 'customerPhone'>): ValidationResult => {
  const errors: Partial<Record<FieldName, string>> = {};
  
  const nameError = getFieldError('customerName', data.customerName);
  if (nameError) errors.customerName = nameError;
  
  const emailError = getFieldError('customerEmail', data.customerEmail);
  if (emailError) errors.customerEmail = emailError;
  
  if (data.customerPhone) {
    const phoneError = getFieldError('customerPhone', data.customerPhone);
    if (phoneError) errors.customerPhone = phoneError;
  }
  
  const errorValues = Object.values(errors);
  
  return {
    isValid: errorValues.length === 0,
    errors,
    firstError: errorValues[0] || null
  };
};

/**
 * Valida el paso 2 del checkout (dirección de envío)
 */
export const validateStep2 = (data: Pick<CheckoutFormData, 'shippingAddress' | 'shippingCity' | 'shippingPostalCode'>): ValidationResult => {
  const errors: Partial<Record<FieldName, string>> = {};
  
  const addressError = getFieldError('shippingAddress', data.shippingAddress);
  if (addressError) errors.shippingAddress = addressError;
  
  const cityError = getFieldError('shippingCity', data.shippingCity);
  if (cityError) errors.shippingCity = cityError;
  
  const postalError = getFieldError('shippingPostalCode', data.shippingPostalCode);
  if (postalError) errors.shippingPostalCode = postalError;
  
  const errorValues = Object.values(errors);
  
  return {
    isValid: errorValues.length === 0,
    errors,
    firstError: errorValues[0] || null
  };
};

/**
 * Valida todo el formulario de checkout
 */
export const validateCheckoutForm = (data: CheckoutFormData): ValidationResult => {
  const step1 = validateStep1(data);
  const step2 = validateStep2(data);
  
  return {
    isValid: step1.isValid && step2.isValid,
    errors: { ...step1.errors, ...step2.errors },
    firstError: step1.firstError || step2.firstError
  };
};

// ============================================
// UTILIDADES DE FORMATO
// ============================================

/**
 * Formatea teléfono para mostrar (XXX XXX XXX)
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 9) return phone;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

/**
 * Limpia código postal (solo dígitos, máximo 5)
 */
export const cleanPostalCode = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 5);
};

/**
 * Limpia teléfono (solo dígitos, máximo 9)
 */
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 9);
};
