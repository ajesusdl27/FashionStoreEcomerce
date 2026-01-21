import { Package, Plus, Search } from 'lucide-react';

export interface CategoryEmptyProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  showSearchButton?: boolean;
  onCreate?: () => void;
  onSearch?: () => void;
  className?: string;
}

/**
 * Componente para mostrar estado vacío de categorías
 */
export default function CategoryEmpty({
  title = 'No hay categorías',
  description = 'Parece que aún no hay categorías disponibles. ¡Sé el primero en explorar cuando estén listas!',
  showCreateButton = false,
  showSearchButton = true,
  onCreate,
  onSearch,
  className = ''
}: CategoryEmptyProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center
      p-8 md:p-12 text-center
      bg-card border border-border rounded-2xl
      ${className}
    `}>
      {/* Ilustración */}
      <div className="
        w-20 h-20 mb-6 rounded-full 
        bg-muted/50 
        flex items-center justify-center
        relative overflow-hidden
      ">
        <Package className="w-10 h-10 text-muted-foreground/50" />
        
        {/* Efecto de partículas flotantes */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-3 w-1 h-1 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute bottom-3 right-2 w-1.5 h-1.5 bg-primary/20 rounded-full animate-ping animation-delay-300" />
          <div className="absolute top-4 right-4 w-1 h-1 bg-primary/40 rounded-full animate-ping animation-delay-700" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {/* Descripción */}
      <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
        {description}
      </p>
      
      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        {showCreateButton && onCreate && (
          <button
            onClick={onCreate}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-primary text-primary-foreground
              rounded-lg font-medium
              hover:bg-primary/90 
              focus:ring-2 focus:ring-primary focus:ring-offset-2
              transition-all duration-200
            "
          >
            <Plus className="w-4 h-4" />
            Crear categoría
          </button>
        )}
        
        {showSearchButton && onSearch && (
          <button
            onClick={onSearch}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-muted text-muted-foreground
              border border-border rounded-lg font-medium
              hover:bg-muted/80 hover:text-foreground
              focus:ring-2 focus:ring-muted focus:ring-offset-2
              transition-all duration-200
            "
          >
            <Search className="w-4 h-4" />
            Explorar productos
          </button>
        )}
      </div>
      
      {/* Mensaje adicional */}
      <p className="text-xs text-muted-foreground mt-6 opacity-70">
        Las categorías aparecerán aquí una vez que estén disponibles
      </p>
    </div>
  );
}

/**
 * Estado vacío compacto para usar en grids pequeños
 */
export function CategoryEmptyCompact({ 
  title = 'Sin categorías',
  className = ''
}: Pick<CategoryEmptyProps, 'title' | 'className'>) {
  return (
    <div className={`
      flex flex-col items-center justify-center
      p-6 text-center
      bg-muted/30 border-2 border-dashed border-muted
      rounded-xl
      ${className}
    `}>
      <Package className="w-8 h-8 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground font-medium">
        {title}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Próximamente
      </p>
    </div>
  );
}