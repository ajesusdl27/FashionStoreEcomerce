import { forwardRef } from 'react';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';
import CategoryCard from './CategoryCard';
import CategorySkeleton from './CategorySkeleton';
import type { Category } from '@/hooks/useCategories';
import type { CategoryCardProps } from './CategoryCard';

export interface LazyCategoryProps extends CategoryCardProps {
  index: number;
  lazyLoad?: boolean;
}

/**
 * Componente CategoryCard con lazy loading automático
 */
const LazyCategory = forwardRef<HTMLDivElement, LazyCategoryProps>(({
  index,
  lazyLoad = true,
  ...props
}, forwardedRef) => {
  const { ref, isVisible } = useLazyLoad({
    rootMargin: '50px' // Cargar 50px antes de que sea visible
  });

  // Si no queremos lazy loading, renderizar directamente
  if (!lazyLoad) {
    return <CategoryCard ref={forwardedRef} {...props} />;
  }

  return (
    <div 
      ref={ref}
      style={{ 
        animationDelay: `${index * 100}ms`,
        minHeight: '200px' // Evitar CLS
      }}
    >
      {isVisible ? (
        <CategoryCard 
          ref={forwardedRef}
          {...props}
          className={`animate-fade-up ${props.className || ''}`}
        />
      ) : (
        <CategorySkeleton size={props.size} />
      )}
    </div>
  );
});

LazyCategory.displayName = 'LazyCategory';

export default LazyCategory;