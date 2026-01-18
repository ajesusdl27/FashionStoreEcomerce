// ============================================
// NEWSLETTER CONSTANTS
// FashionStore - Centralized configuration
// ============================================

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  PAUSED: 'paused',
} as const;

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];

export const SEND_LOG_STATUS = {
  SENT: 'sent',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked',
} as const;

export type SendLogStatus = typeof SEND_LOG_STATUS[keyof typeof SEND_LOG_STATUS];

// Configuración de envío
export const NEWSLETTER_CONFIG = {
  CHUNK_SIZE: 5,                          // Emails por request
  DELAY_MS: 1000,                         // Delay entre emails (ms)
  MAX_RETRIES: 3,                         // Reintentos máximos por chunk
  RETRY_BACKOFF: [3000, 6000, 12000],     // Backoff exponencial (ms)
  RATE_LIMIT_MAX_ATTEMPTS: 5,             // Max suscripciones por IP
  RATE_LIMIT_WINDOW_MINUTES: 60,          // Ventana de tiempo (minutos)
} as const;

// Regex validación email (RFC 5322 simplificado)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Validar email con regex robusto
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return false; // RFC 5321
  return EMAIL_REGEX.test(trimmed);
}

// Labels para UI
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CAMPAIGN_STATUS.DRAFT]: 'Borrador',
  [CAMPAIGN_STATUS.SENDING]: 'Enviando...',
  [CAMPAIGN_STATUS.SENT]: 'Enviada',
  [CAMPAIGN_STATUS.FAILED]: 'Fallida',
  [CAMPAIGN_STATUS.PAUSED]: 'Pausada',
};

// Colores para badges
export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  [CAMPAIGN_STATUS.DRAFT]: 'bg-muted text-muted-foreground',
  [CAMPAIGN_STATUS.SENDING]: 'bg-yellow-500/20 text-yellow-400',
  [CAMPAIGN_STATUS.SENT]: 'bg-green-500/20 text-green-400',
  [CAMPAIGN_STATUS.FAILED]: 'bg-red-500/20 text-red-400',
  [CAMPAIGN_STATUS.PAUSED]: 'bg-orange-500/20 text-orange-400',
};
