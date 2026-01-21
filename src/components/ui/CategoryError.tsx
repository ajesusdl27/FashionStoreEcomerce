import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export interface CategoryErrorProps {
  error?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

/**
 * Componente para mostrar errores en la carga de categorías
 */
export default function CategoryError({ 
  error = 'Error al cargar categorías',
  onRetry,
  onGoHome,
  className = ''
}: CategoryErrorProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center
      p-8 md:p-12 text-center
      bg-card border border-border rounded-2xl
      ${className}
    `}>
      {/* Icono de error */}
      <div className="
        w-16 h-16 mb-6 rounded-full 
        bg-red-500/10 dark:bg-red-500/20
        flex items-center justify-center
      ">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      {/* Título */}
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        Oops, algo salió mal
      </h3>
      
      {/* Mensaje de error */}
      <p className="text-muted-foreground mb-6 max-w-sm">
        {error}. Por favor, intenta de nuevo o contacta con soporte si el problema persiste.
      </p>
      
      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-primary text-primary-foreground
              rounded-lg font-medium
              hover:bg-primary/90 
              focus:ring-2 focus:ring-primary focus:ring-offset-2
              transition-all duration-200
            "
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-muted text-muted-foreground
              border border-border rounded-lg font-medium
              hover:bg-muted/80 hover:text-foreground
              focus:ring-2 focus:ring-muted focus:ring-offset-2
              transition-all duration-200
            "
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Error compacto para usar en grids
 */
export function CategoryErrorCompact({ 
  error = 'Error de carga',
  onRetry,
  className = ''
}: Pick<CategoryErrorProps, 'error' | 'onRetry' | 'className'>) {
  return (
    <div className={`
      flex flex-col items-center justify-center
      p-6 text-center
      bg-red-50 dark:bg-red-950/20
      border border-red-200 dark:border-red-800/30
      rounded-xl
      ${className}
    `}>
      <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-1 px-3 py-1.5
            text-xs font-medium
            bg-red-100 dark:bg-red-900/30 
            text-red-700 dark:text-red-300
            border border-red-300 dark:border-red-700
            rounded-md
            hover:bg-red-200 dark:hover:bg-red-900/50
            transition-colors duration-200
          "
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar
        </button>
      )}
    </div>
  );
}