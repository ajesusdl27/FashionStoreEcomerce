import { useMemo } from 'react';

export interface ThemeConfig {
  badgeColor: string;
  hoverColor: string;
}

export interface ThemeVariants {
  default: ThemeConfig;
  blue: ThemeConfig;
  green: ThemeConfig;
  purple: ThemeConfig;
  orange: ThemeConfig;
  red: ThemeConfig;
  pink: ThemeConfig;
  yellow: ThemeConfig;
}

/**
 * Configuración minimalista de temas para categorías
 * Solo cambia el color del icono y badges sutilmente
 */
const THEME_VARIANTS: ThemeVariants = {
  default: {
    badgeColor: 'bg-primary/20 text-primary',
    hoverColor: 'group-hover:border-primary/30'
  },
  blue: {
    badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    hoverColor: 'group-hover:border-blue-400/30'
  },
  green: {
    badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    hoverColor: 'group-hover:border-emerald-400/30'
  },
  purple: {
    badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    hoverColor: 'group-hover:border-purple-400/30'
  },
  orange: {
    badgeColor: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    hoverColor: 'group-hover:border-orange-400/30'
  },
  red: {
    badgeColor: 'bg-red-500/20 text-red-600 dark:text-red-400',
    hoverColor: 'group-hover:border-red-400/30'
  },
  pink: {
    badgeColor: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    hoverColor: 'group-hover:border-pink-400/30'
  },
  yellow: {
    badgeColor: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    hoverColor: 'group-hover:border-yellow-400/30'
  }
};

/**
 * Hook para obtener configuración de tema visual minimalista
 */
export function useVisualTheme(themeName: string = 'default'): ThemeConfig {
  const theme = useMemo(() => {
    const normalizedTheme = themeName.toLowerCase() as keyof ThemeVariants;
    return THEME_VARIANTS[normalizedTheme] || THEME_VARIANTS.default;
  }, [themeName]);

  return theme;
}

/**
 * Lista de temas disponibles para selección
 */
export const AVAILABLE_THEMES = [
  { value: 'default', label: 'Por defecto', color: '#64748b' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'green', label: 'Verde', color: '#10b981' },
  { value: 'purple', label: 'Morado', color: '#8b5cf6' },
  { value: 'orange', label: 'Naranja', color: '#f97316' },
  { value: 'red', label: 'Rojo', color: '#ef4444' },
  { value: 'pink', label: 'Rosa', color: '#ec4899' },
  { value: 'yellow', label: 'Amarillo', color: '#eab308' }
] as const;