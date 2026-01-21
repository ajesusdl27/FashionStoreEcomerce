import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Trash2, AlertTriangle, Info, CheckCircle, Save, X } from 'lucide-react';

type ModalVariant = 'danger' | 'warning' | 'info' | 'success' | 'delete' | 'save' | 'cancel';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  /** Custom icon to override variant default */
  icon?: ReactNode;
  /** Additional content between message and buttons */
  children?: ReactNode;
  /** Disable backdrop click to close */
  disableBackdropClose?: boolean;
}

const variantStyles: Record<ModalVariant, {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonText: string;
  defaultConfirmText: string;
}> = {
  danger: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    buttonText: 'text-white',
    defaultConfirmText: 'Confirmar',
  },
  delete: {
    icon: <Trash2 className="w-6 h-6" />,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    buttonText: 'text-white',
    defaultConfirmText: 'Eliminar',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    buttonBg: 'bg-amber-500 hover:bg-amber-600',
    buttonText: 'text-white',
    defaultConfirmText: 'Confirmar',
  },
  info: {
    icon: <Info className="w-6 h-6" />,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    buttonText: 'text-white',
    defaultConfirmText: 'Aceptar',
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    buttonBg: 'bg-green-500 hover:bg-green-600',
    buttonText: 'text-white',
    defaultConfirmText: 'Aceptar',
  },
  save: {
    icon: <Save className="w-6 h-6" />,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    buttonBg: 'bg-primary hover:bg-primary/90',
    buttonText: 'text-primary-foreground',
    defaultConfirmText: 'Guardar',
  },
  cancel: {
    icon: <X className="w-6 h-6" />,
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    buttonBg: 'bg-muted hover:bg-muted/80',
    buttonText: 'text-foreground',
    defaultConfirmText: 'Descartar',
  },
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
  icon,
  children,
  disableBackdropClose = false,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];
  const finalConfirmText = confirmText || styles.defaultConfirmText;

  useEffect(() => {
    if (isOpen) {
      // Small delay for enter animation
      requestAnimationFrame(() => setIsVisible(true));
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      firstElement?.focus();
      
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isLoading && !disableBackdropClose) {
      onCancel();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-200 ${isVisible ? 'scale-100' : 'scale-95'}`}
      >
        <div className="p-6">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center ${styles.iconColor}`}>
              {icon || styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="modal-title" className="text-lg font-bold text-foreground mb-2">{title}</h3>
              {typeof message === 'string' ? (
                <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
              ) : (
                <div className="text-muted-foreground text-sm leading-relaxed">{message}</div>
              )}
            </div>
          </div>
          
          {/* Additional content */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 ${styles.buttonBg} ${styles.buttonText} font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                finalConfirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-built modal variants for common use cases
export function DeleteConfirmModal(props: Omit<ConfirmModalProps, 'variant'>) {
  return <ConfirmModal variant="delete" {...props} />;
}

export function SaveConfirmModal(props: Omit<ConfirmModalProps, 'variant'>) {
  return <ConfirmModal variant="save" {...props} />;
}

export function UnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}: {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="warning"
      title="Cambios sin guardar"
      message="Tienes cambios sin guardar. ¿Qué deseas hacer?"
      confirmText="Guardar"
      cancelText="Descartar"
      onConfirm={onSave}
      onCancel={onDiscard}
    >
      <button
        type="button"
        onClick={onCancel}
        className="w-full mt-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Seguir editando
      </button>
    </ConfirmModal>
  );
}
