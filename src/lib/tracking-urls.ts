/**
 * Patrones de URL de seguimiento para transportistas
 * Genera URLs de tracking automáticamente basadas en el transportista y número de seguimiento
 */

export interface CarrierPattern {
  name: string;
  urlPattern: (trackingNumber: string) => string;
}

/**
 * Mapeo de transportistas a sus URLs de seguimiento
 */
export const CARRIER_TRACKING_PATTERNS: Record<string, CarrierPattern> = {
  'SEUR': {
    name: 'SEUR',
    urlPattern: (trackingNumber: string) => 
      `https://www.seur.com/laben/seguimiento.do?segDistribucionWeb.codigo=${trackingNumber}`
  },
  'MRW': {
    name: 'MRW',
    urlPattern: (trackingNumber: string) => 
      `https://www.mrw.es/seguimiento_envios/MRW_resultados_consultas.asp?modo=nacional&envio=${trackingNumber}`
  },
  'GLS': {
    name: 'GLS',
    urlPattern: (trackingNumber: string) => 
      `https://www.gls-spain.es/es/seguimiento-de-envios/?match=${trackingNumber}`
  },
  'Correos': {
    name: 'Correos',
    urlPattern: (trackingNumber: string) => 
      `https://www.correos.es/es/es/herramientas/localizador/envios?text=${trackingNumber}`
  },
  'Correos Express': {
    name: 'Correos Express',
    urlPattern: (trackingNumber: string) => 
      `https://www.correosexpress.com/web/correosexpress/seguimiento?envio=${trackingNumber}`
  },
  'DHL': {
    name: 'DHL',
    urlPattern: (trackingNumber: string) => 
      `https://www.dhl.com/es-es/home/tracking.html?tracking-id=${trackingNumber}`
  },
  'UPS': {
    name: 'UPS',
    urlPattern: (trackingNumber: string) => 
      `https://www.ups.com/track?tracknum=${trackingNumber}`
  },
  'FedEx': {
    name: 'FedEx',
    urlPattern: (trackingNumber: string) => 
      `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  },
  'Nacex': {
    name: 'Nacex',
    urlPattern: (trackingNumber: string) => 
      `https://www.nacex.es/irCliente.do?method=buscarEnvio&codigoEnvio=${trackingNumber}`
  },
  'CTT Express': {
    name: 'CTT Express',
    urlPattern: (trackingNumber: string) => 
      `https://www.cttexpresso.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${trackingNumber}`
  }
};

/**
 * Genera una URL de seguimiento basada en el transportista y número de seguimiento
 * @param carrier Nombre del transportista
 * @param trackingNumber Número de seguimiento del paquete
 * @returns URL de seguimiento o null si el transportista no tiene patrón definido
 */
export function generateTrackingUrl(carrier: string, trackingNumber: string): string | null {
  // Validar inputs
  if (!carrier || !trackingNumber) {
    return null;
  }

  // Limpiar el número de seguimiento (eliminar espacios)
  const cleanTrackingNumber = trackingNumber.trim();
  
  if (cleanTrackingNumber.length === 0) {
    return null;
  }

  // Buscar el patrón del transportista
  const pattern = CARRIER_TRACKING_PATTERNS[carrier];
  
  if (!pattern) {
    return null;
  }

  // Generar y retornar la URL
  return pattern.urlPattern(cleanTrackingNumber);
}

/**
 * Verifica si un transportista tiene patrón de URL definido
 * @param carrier Nombre del transportista
 * @returns true si el transportista tiene patrón de URL
 */
export function hasTrackingPattern(carrier: string): boolean {
  return carrier in CARRIER_TRACKING_PATTERNS;
}
