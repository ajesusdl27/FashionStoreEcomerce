/**
 * Promotion Templates Configuration
 * Pre-defined templates for the promotion wizard
 */

export interface PromotionTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'seasonal' | 'permanent' | 'special';
  previewImage: string;
  defaults: {
    title: string;
    description?: string;
    cta_text: string;
    cta_link: string;
    style_config: {
      text_color: 'white' | 'black';
      text_align: 'left' | 'center' | 'right';
      overlay_enabled: boolean;
      overlay_position: 'left' | 'center' | 'right' | 'full';
      overlay_opacity: number;
    };
    suggested_duration_days?: number;
    suggested_locations: string[];
  };
}

export const PROMOTION_TEMPLATES: PromotionTemplate[] = [
  {
    id: 'rebajas',
    name: 'Rebajas',
    emoji: '🛍️',
    description: 'Descuento general de temporada. Ideal para rebajas de verano o invierno.',
    category: 'seasonal',
    previewImage: '/images/admin/templates/rebajas-preview.jpg',
    defaults: {
      title: '¡REBAJAS!',
      description: 'Hasta -50% en artículos seleccionados',
      cta_text: '¡Comprar ahora!',
      cta_link: '/ofertas',
      style_config: {
        text_color: 'white',
        text_align: 'left',
        overlay_enabled: true,
        overlay_position: 'left',
        overlay_opacity: 60
      },
      suggested_duration_days: 30,
      suggested_locations: ['home_hero', 'announcement_top']
    }
  },
  {
    id: 'san-valentin',
    name: 'San Valentín',
    emoji: '💝',
    description: 'Campaña romántica para febrero. Colores rosados y mensajes de amor.',
    category: 'seasonal',
    previewImage: '/images/admin/templates/san-valentin-preview.jpg',
    defaults: {
      title: 'Especial San Valentín',
      description: 'Regala con amor. Encuentra el regalo perfecto.',
      cta_text: 'Ver regalos',
      cta_link: '/productos',
      style_config: {
        text_color: 'white',
        text_align: 'center',
        overlay_enabled: true,
        overlay_position: 'center',
        overlay_opacity: 50
      },
      suggested_duration_days: 14,
      suggested_locations: ['home_hero']
    }
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    emoji: '🖤',
    description: 'El evento de descuentos más esperado del año. Diseño oscuro y llamativo.',
    category: 'special',
    previewImage: '/images/admin/templates/black-friday-preview.jpg',
    defaults: {
      title: 'BLACK FRIDAY',
      description: 'Los mejores descuentos del año. Solo por tiempo limitado.',
      cta_text: '¡No te lo pierdas!',
      cta_link: '/ofertas',
      style_config: {
        text_color: 'white',
        text_align: 'left',
        overlay_enabled: true,
        overlay_position: 'left',
        overlay_opacity: 70
      },
      suggested_duration_days: 4,
      suggested_locations: ['home_hero', 'announcement_top', 'product_page']
    }
  },
  {
    id: 'navidad',
    name: 'Navidad',
    emoji: '🎄',
    description: 'Campaña navideña con espíritu festivo. Perfecta para diciembre.',
    category: 'seasonal',
    previewImage: '/images/admin/templates/navidad-preview.jpg',
    defaults: {
      title: 'Felices Fiestas',
      description: 'Descubre nuestra colección navideña y sorprende a los tuyos.',
      cta_text: 'Ver colección',
      cta_link: '/productos',
      style_config: {
        text_color: 'white',
        text_align: 'center',
        overlay_enabled: true,
        overlay_position: 'center',
        overlay_opacity: 55
      },
      suggested_duration_days: 25,
      suggested_locations: ['home_hero', 'announcement_top']
    }
  },
  {
    id: 'nueva-coleccion',
    name: 'Nueva Colección',
    emoji: '🆕',
    description: 'Lanzamiento de nueva temporada. Diseño elegante y minimalista.',
    category: 'permanent',
    previewImage: '/images/admin/templates/nueva-coleccion-preview.jpg',
    defaults: {
      title: 'Nueva Colección',
      description: 'Descubre las últimas tendencias de la temporada.',
      cta_text: 'Explorar',
      cta_link: '/productos',
      style_config: {
        text_color: 'white',
        text_align: 'left',
        overlay_enabled: true,
        overlay_position: 'left',
        overlay_opacity: 45
      },
      suggested_duration_days: 60,
      suggested_locations: ['home_hero']
    }
  },
  {
    id: 'envio-gratis',
    name: 'Envío Gratis',
    emoji: '🚚',
    description: 'Promoción de envío gratuito. Ideal para la barra de anuncios.',
    category: 'permanent',
    previewImage: '/images/admin/templates/envio-gratis-preview.jpg',
    defaults: {
      title: '¡Envío Gratis!',
      description: 'En pedidos superiores a 50€',
      cta_text: 'Comprar',
      cta_link: '/productos',
      style_config: {
        text_color: 'white',
        text_align: 'center',
        overlay_enabled: false,
        overlay_position: 'full',
        overlay_opacity: 0
      },
      suggested_locations: ['announcement_top']
    }
  },
  {
    id: 'flash-sale',
    name: 'Venta Flash',
    emoji: '⚡',
    description: 'Oferta relámpago de tiempo limitado. Crea urgencia.',
    category: 'special',
    previewImage: '/images/admin/templates/flash-sale-preview.jpg',
    defaults: {
      title: '⚡ VENTA FLASH',
      description: 'Solo hoy: descuentos exclusivos',
      cta_text: '¡Aprovecha!',
      cta_link: '/ofertas',
      style_config: {
        text_color: 'white',
        text_align: 'center',
        overlay_enabled: true,
        overlay_position: 'full',
        overlay_opacity: 65
      },
      suggested_duration_days: 1,
      suggested_locations: ['home_hero', 'announcement_top', 'cart_sidebar']
    }
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromotionTemplate | undefined {
  return PROMOTION_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PromotionTemplate['category']): PromotionTemplate[] {
  return PROMOTION_TEMPLATES.filter(t => t.category === category);
}

/**
 * Location labels for display
 */
export const LOCATION_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  home_hero: {
    label: 'Banner de Inicio',
    description: 'Banner grande en la página principal',
    icon: '🏠'
  },
  announcement_top: {
    label: 'Barra Superior',
    description: 'Aviso fijo en la parte superior de todas las páginas',
    icon: '📢'
  },
  product_page: {
    label: 'Ficha de Producto',
    description: 'Banner en las páginas de producto individual',
    icon: '🏷️'
  },
  cart_sidebar: {
    label: 'Carrito',
    description: 'Banner dentro del carrito de compras',
    icon: '🛒'
  }
};
