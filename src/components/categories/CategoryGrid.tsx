import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import LazyCategory from '@/components/ui/LazyCategory';
import CategorySkeleton, { CategoryGridSkeleton, CategoryCarouselSkeleton } from '@/components/ui/CategorySkeleton';
import CategoryError from '@/components/ui/CategoryError';
import CategoryEmpty from '@/components/ui/CategoryEmpty';

export interface CategoryGridProps {
  layout?: 'grid' | 'carousel' | 'auto';
  maxItems?: number;
  showFeaturedOnly?: boolean;
  showHeader?: boolean;
  enableLazyLoad?: boolean;
  className?: string;
  onCategoryClick?: (categorySlug: string) => void;
}

/**
 * Componente principal para mostrar grid/carousel de categorías
 */
export default function CategoryGrid({
  layout = 'auto',
  maxItems,
  showFeaturedOnly = false,
  showHeader = true,
  enableLazyLoad = true,
  className = '',
  onCategoryClick
}: CategoryGridProps) {
  const { categories, featuredCategories, isLoading, error, refetch } = useCategories();
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'carousel'>('grid');
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Determinar layout basado en viewport y configuración
  useEffect(() => {
    if (layout === 'auto') {
      const updateLayout = () => {
        setCurrentLayout(window.innerWidth < 768 ? 'carousel' : 'grid');
      };
      
      updateLayout();
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    } else {
      setCurrentLayout(layout);
    }
  }, [layout]);

  // Datos a mostrar
  const displayCategories = showFeaturedOnly ? featuredCategories : categories;
  const limitedCategories = maxItems ? displayCategories.slice(0, maxItems) : displayCategories;

  // Handlers
  const handleCategoryClick = (categorySlug: string) => {
    if (onCategoryClick) {
      onCategoryClick(categorySlug);
    } else {
      window.location.href = `/categoria/${categorySlug}`;
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // Carousel controls
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scrollAmount = 280; // Ancho de tarjeta + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(carousel.scrollWidth - carousel.clientWidth, scrollPosition + scrollAmount);

    carousel.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className={`py-12 md:py-16 ${className}`}>
        {showHeader && (
          <div className="container mx-auto px-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          {currentLayout === 'carousel' ? (
            <CategoryCarouselSkeleton />
          ) : (
            <CategoryGridSkeleton />
          )}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-12 md:py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <CategoryError 
            error={error}
            onRetry={handleRetry}
            onGoHome={() => window.location.href = '/'}
          />
        </div>
      </section>
    );
  }

  // Empty state
  if (limitedCategories.length === 0) {
    return (
      <section className={`py-12 md:py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <CategoryEmpty 
            onSearch={() => window.location.href = '/productos'}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                {showFeaturedOnly ? 'Categorías Destacadas' : 'Categorías'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explora nuestra colección
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Carousel controls */}
              {currentLayout === 'carousel' && limitedCategories.length > 2 && (
                <>
                  <button
                    onClick={() => scrollCarousel('left')}
                    disabled={scrollPosition <= 0}
                    className="
                      p-2 rounded-lg border border-border
                      hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                    "
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    disabled={scrollPosition >= (carouselRef.current?.scrollWidth || 0) - (carouselRef.current?.clientWidth || 0)}
                    className="
                      p-2 rounded-lg border border-border
                      hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                    "
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {/* Ver todo link */}
              {maxItems && displayCategories.length > maxItems && (
                <a 
                  href="/productos" 
                  className="admin-btn-secondary text-sm"
                >
                  Ver todo
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Grid/Carousel Content */}
        {currentLayout === 'carousel' ? (
          /* Carousel Layout */
          <div className="relative">
            <div
              ref={carouselRef}
              className="
                flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory
                scroll-smooth
              "
              onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
            >
              {limitedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 w-64 snap-start"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <LazyCategory
                    category={category}
                    index={index}
                    size="md"
                    lazyLoad={enableLazyLoad}
                    showProductCount={false}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid Layout */
          <div className="
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
            gap-4 md:gap-6
          ">
            {limitedCategories.map((category, index) => (
              <LazyCategory
                key={category.id}
                category={category}
                index={index}
                size="md"
                lazyLoad={enableLazyLoad}
                showProductCount={false}
                onClick={() => handleCategoryClick(category.slug)}
              />
            ))}
          </div>
        )}

        {/* Indicadores de scroll para carousel */}
        {currentLayout === 'carousel' && limitedCategories.length > 3 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.ceil(limitedCategories.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-colors duration-200
                  ${Math.floor(scrollPosition / 280) === index 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                  }
                `}
                onClick={() => {
                  const targetPosition = index * 280 * 3;
                  carouselRef.current?.scrollTo({ left: targetPosition, behavior: 'smooth' });
                }}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}