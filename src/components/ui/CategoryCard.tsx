import { forwardRef } from 'react';
import { useVisualTheme } from '@/hooks/useVisualTheme';
import type { Category } from '@/hooks/useCategories';

export interface CategoryCardProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  showProductCount?: boolean;
  showFeaturedBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Componente de tarjeta de categoría con enfoque tipográfico
 * Diseño minimalista y elegante centrado en la tipografía
 */
const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(({
  category,
  size = 'md',
  showDescription = true,
  showProductCount = false, // Deshabilitado por defecto
  showFeaturedBadge = true,
  className = '',
  onClick
}, ref) => {
  const theme = useVisualTheme(category.color_theme);
  
  return (
    <div
      ref={ref}
      className={`group cursor-pointer ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver categoría ${category.name}${category.description ? `. ${category.description}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Tarjeta tipográfica */}
      <div className={`
        relative aspect-square rounded-xl overflow-hidden 
        bg-card border border-border ${theme.hoverColor}
        transition-all duration-300 
        group-hover:shadow-lg group-hover:-translate-y-1
        flex flex-col items-center justify-center p-6 text-center
      `}>
        {/* Badge destacada en esquina superior */}
        {showFeaturedBadge && category.featured && (
          <div className="absolute top-3 right-3">
            <span className={`${theme.badgeColor} text-xs px-2 py-1 rounded-full font-medium`}>
              ★
            </span>
          </div>
        )}
        
        {/* Nombre de la categoría - tipografía principal */}
        <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
          {category.name}
        </h3>
        
        {/* Descripción sutil */}
        {showDescription && category.description && (
          <p className="text-sm text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {category.description}
          </p>
        )}
        
        {/* Línea decorativa que aparece en hover */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-12 h-0.5 bg-primary transition-all duration-300" />
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;