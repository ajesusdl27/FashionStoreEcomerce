import { useState, useEffect } from 'react';

/**
 * Hook para detectar la preferencia del usuario por movimiento reducido
 * Respeta la configuración de accesibilidad del sistema operativo
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Establecer valor inicial
    setPrefersReducedMotion(mediaQuery.matches);

    // Listener para cambios
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Añadir listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Utilidad para obtener clases CSS condicionales basadas en preferencia de movimiento
 */
export function getMotionClasses(
  normalClasses: string, 
  reducedClasses: string = ''
): string {
  return `
    ${normalClasses}
    motion-reduce:${reducedClasses || 'transform-none motion-reduce:transition-none'}
  `.trim();
}

/**
 * Hook que devuelve configuración de animación basada en preferencias
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : 300,
    transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-out',
    scale: prefersReducedMotion ? 1 : 1.05,
    translateY: prefersReducedMotion ? 0 : -4,
  };
}