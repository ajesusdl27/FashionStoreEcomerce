export interface CategorySkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
}

/**
 * Componente skeleton para estado de carga de categorías
 */
export default function CategorySkeleton({ 
  size = 'md', 
  count = 1,
  className = '' 
}: CategorySkeletonProps) {
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'p-4 rounded-lg h-32',
      icon: 'w-8 h-8',
      title: 'h-5 w-24',
      description: 'h-4 w-32',
      badge: 'h-4 w-12'
    },
    md: {
      container: 'p-6 rounded-xl h-40',
      icon: 'w-12 h-12',
      title: 'h-6 w-32',
      description: 'h-4 w-40',
      badge: 'h-5 w-16'
    },
    lg: {
      container: 'p-8 rounded-2xl h-48',
      icon: 'w-16 h-16',
      title: 'h-7 w-40',
      description: 'h-5 w-48',
      badge: 'h-6 w-20'
    }
  };

  const config = sizeConfig[size];

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={className}>
          {/* Skeleton tipográfico */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-card border border-border animate-pulse flex flex-col items-center justify-center p-6">
            {/* Badge skeleton en esquina */}
            <div className="absolute top-3 right-3 w-6 h-4 bg-muted-foreground/20 rounded-full" />
            
            {/* Título skeleton centrado */}
            <div className="h-7 w-24 bg-muted-foreground/30 rounded mb-2" />
            
            {/* Línea decorativa skeleton */}
            <div className="absolute bottom-6 w-8 h-0.5 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton específico para grid de categorías
 */
export function CategoryGridSkeleton({ 
  columns = 4, 
  rows = 2,
  size = 'md' 
}: {
  columns?: number;
  rows?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const totalItems = columns * rows;
  
  return (
    <div className={`
      grid gap-4 md:gap-6
      grid-cols-2 md:grid-cols-${Math.min(columns, 4)}
    `}>
      <CategorySkeleton count={totalItems} size={size} />
    </div>
  );
}

/**
 * Skeleton para carousel móvil
 */
export function CategoryCarouselSkeleton({ 
  count = 6,
  size = 'md' 
}: {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-40">
          <CategorySkeleton size={size} />
        </div>
      ))}
    </div>
  );
}