import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import { PROMOTION_TEMPLATES, LOCATION_LABELS, type PromotionTemplate } from '@/lib/promotionTemplates';
import { 
  Clipboard, 
  Image as ImageIcon, 
  Type, 
  Calendar as CalendarIcon, 
  Trash2, 
  Check, 
  Sparkles
} from "lucide-react";

// Types
interface PromotionData {
  title: string;
  description: string;
  image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_link: string;
  cta_link_type: 'products' | 'offers' | 'category' | 'product';
  cta_link_category?: string;
  coupon_id: string | null;
  locations: string[];
  priority: number;
  style_config: {
    text_color: 'white' | 'black';
    text_align: 'left' | 'center' | 'right';
    overlay_enabled: boolean;
    overlay_position: 'left' | 'center' | 'right' | 'full';
    overlay_opacity: number;
  };
  start_date: string;
  end_date: string;
  template_id?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Coupon {
  id: string;
  code: string;
}

interface PromotionWizardProps {
  categories: Category[];
  coupons: Coupon[];
  existingDraft?: any;
}

const defaultPromotionData: PromotionData = {
  title: '',
  description: '',
  image_url: '',
  mobile_image_url: '',
  cta_text: 'Ver más',
  cta_link: '/productos',
  cta_link_type: 'products',
  coupon_id: null,
  locations: ['home_hero'],
  priority: 10,
  style_config: {
    text_color: 'white',
    text_align: 'left',
    overlay_enabled: true,
    overlay_position: 'left',
    overlay_opacity: 50
  },
  start_date: new Date().toISOString().slice(0, 16),
  end_date: ''
};

// Image Drop Zone Component for upload
interface ImageDropZoneProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  placeholder?: string;
}

function ImageDropZone({ imageUrl, onImageChange, placeholder }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputId = useId();

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al subir la imagen');
    }

    const data = await response.json();
    return data.url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file);
      onImageChange(url);
    } catch (err: any) {
      setError(err.message || 'Error al subir');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (imageUrl) {
    return (
      <div className="relative border-2 border-border rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={() => onImageChange('')}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          aria-label="Eliminar imagen"
        >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById(fileInputId)?.click()}
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
        ${isUploading ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      <input
        type="file"
        id={fileInputId}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      {isUploading ? (
        <div className="py-6">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
        </div>
      ) : (
        <>
          <svg 
            className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            {isDragging ? (
              <span className="text-primary font-medium">Suelta la imagen aquí</span>
            ) : (
              <>
                <span className="text-primary font-medium">Click para seleccionar</span>
                {' '}o arrastra una imagen
              </>
            )}
          </p>
          {placeholder && (
            <p className="text-xs text-muted-foreground/70 mt-1">{placeholder}</p>
          )}
        </>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}

export default function PromotionWizard({ categories, coupons, existingDraft }: PromotionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PromotionData>(defaultPromotionData);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Load draft on mount
  useEffect(() => {
    if (existingDraft?.promotion_data) {
      setShowDraftRecovery(true);
    }
  }, [existingDraft]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const currentDataStr = JSON.stringify(data);
    
    if (currentDataStr !== lastSavedDataRef.current && data.title) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 30000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data]);

  const saveDraft = async () => {
    if (!data.title) return;
    
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/admin/promociones/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotion_data: data,
          wizard_step: currentStep
        })
      });
      
      if (response.ok) {
        setSaveStatus('saved');
        lastSavedDataRef.current = JSON.stringify(data);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const deleteDraft = async () => {
    try {
      await fetch('/api/admin/promociones/drafts', { method: 'DELETE' });
    } catch {
      // Ignore errors
    }
  };

  const recoverDraft = () => {
    if (existingDraft?.promotion_data) {
      setData({ ...defaultPromotionData, ...existingDraft.promotion_data });
      setCurrentStep(existingDraft.wizard_step || 1);
      setShowDraftRecovery(false);
    }
  };

  const discardDraft = async () => {
    await deleteDraft();
    setShowDraftRecovery(false);
  };

  const updateData = useCallback((updates: Partial<PromotionData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStyleConfig = useCallback((updates: Partial<PromotionData['style_config']>) => {
    setData(prev => ({
      ...prev,
      style_config: { ...prev.style_config, ...updates }
    }));
  }, []);

  const selectTemplate = (template: PromotionTemplate) => {
    setSelectedTemplate(template.id);
    updateData({
      title: template.defaults.title,
      description: template.defaults.description || '',
      cta_text: template.defaults.cta_text,
      cta_link: template.defaults.cta_link,
      cta_link_type: template.defaults.cta_link === '/ofertas' ? 'offers' : 'products',
      locations: template.defaults.suggested_locations,
      style_config: template.defaults.style_config,
      template_id: template.id
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 2:
        if (!data.image_url) newErrors.image_url = 'Se requiere una imagen';
        break;
      case 3:
        if (!data.title || data.title.length < 3) newErrors.title = 'El título debe tener al menos 3 caracteres';
        break;
      case 4:
        if (data.locations.length === 0) newErrors.locations = 'Selecciona al menos una ubicación';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          mobile_image_url: data.mobile_image_url || null,
          cta_text: data.cta_text,
          cta_link: data.cta_link,
          coupon_id: data.coupon_id,
          locations: data.locations,
          priority: data.priority,
          style_config: data.style_config,
          start_date: data.start_date || new Date().toISOString(),
          end_date: data.end_date || null
        })
      });

      if (response.ok) {
        await deleteDraft();
        sessionStorage.setItem('toast', JSON.stringify({
          type: 'success',
          message: '¡Promoción creada correctamente!'
        }));
        window.location.href = '/admin/promociones';
      } else {
        const error = await response.json();
        setErrors({ submit: error.error || 'Error al crear la promoción' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexión' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLocation = (location: string) => {
    updateData({
      locations: data.locations.includes(location)
        ? data.locations.filter(l => l !== location)
        : [...data.locations, location]
    });
  };

  const steps = [
    { number: 1, title: 'Plantilla', icon: <Clipboard className="w-5 h-5" /> },
    { number: 2, title: 'Imágenes', icon: <ImageIcon className="w-5 h-5" /> },
    { number: 3, title: 'Contenido', icon: <Type className="w-5 h-5" /> },
    { number: 4, title: 'Programar', icon: <CalendarIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Draft Recovery Modal */}
      {showDraftRecovery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">📝 Borrador encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tienes un borrador guardado de una promoción anterior. ¿Quieres continuar donde lo dejaste?
            </p>
            <div className="flex gap-3">
              <button
                onClick={discardDraft}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={recoverDraft}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Recuperar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  disabled={step.number > currentStep}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                    step.number === currentStep
                      ? 'bg-primary text-primary-foreground scale-110'
                      : step.number < currentStep
                      ? 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.icon}
                </button>
                <span className={`text-xs mt-2 ${step.number === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step.number < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
          saveStatus === 'saving' ? 'bg-blue-500/10 text-blue-400' :
          saveStatus === 'saved' ? 'bg-green-500/10 text-green-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {saveStatus === 'saving' && (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando borrador...
            </>
          )}
          {saveStatus === 'saved' && '✓ Borrador guardado'}
          {saveStatus === 'error' && '✗ Error al guardar'}
        </div>
      )}

      {/* Step Content */}
      <div className="admin-card p-6">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Elige una plantilla</h2>
              <p className="text-sm text-muted-foreground">
                Selecciona una plantilla para empezar rápidamente o empieza desde cero.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Start from scratch */}
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setData(defaultPromotionData);
                }}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  !selectedTemplate
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="mb-3 text-primary"><Sparkles className="w-10 h-10" /></div>
                <h3 className="font-medium">Desde cero</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Crea tu promoción personalizada
                </p>
                {!selectedTemplate && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>

              {/* Templates */}
              {PROMOTION_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-3">{template.emoji}</div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded ${
                    template.category === 'seasonal' ? 'bg-orange-500/10 text-orange-400' :
                    template.category === 'special' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {template.category === 'seasonal' ? 'Estacional' :
                     template.category === 'special' ? 'Especial' : 'Permanente'}
                  </span>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Images */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Imágenes del Banner</h2>
              <p className="text-sm text-muted-foreground">
                Sube las imágenes para tu promoción. La imagen de escritorio es obligatoria.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Desktop Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🖥️ Imagen escritorio <span className="text-red-400">*</span>
                </label>
                <ImageDropZone
                  imageUrl={data.image_url}
                  onImageChange={(url) => updateData({ image_url: url })}
                  placeholder="Imagen principal (1920x800 recomendado)"
                />
                {errors.image_url && (
                  <p className="text-red-400 text-xs mt-1">{errors.image_url}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Recomendado: 1920x800 píxeles
                </p>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📱 Imagen móvil <span className="text-muted-foreground">(opcional)</span>
                </label>
                <ImageDropZone
                  imageUrl={data.mobile_image_url}
                  onImageChange={(url) => updateData({ mobile_image_url: url })}
                  placeholder="Imagen para móviles (800x600 recomendado)"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recomendado: 800x600 píxeles
                </p>
              </div>
            </div>

            {/* Style Options */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium mb-4">Opciones de estilo</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Text Color */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Color del texto</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStyleConfig({ text_color: 'white' })}
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
                        data.style_config.text_color === 'white'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs text-black">Aa</span>
                      Blanco
                    </button>
                    <button
                      onClick={() => updateStyleConfig({ text_color: 'black' })}
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
                        data.style_config.text_color === 'black'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-black border border-gray-600 flex items-center justify-center text-xs text-white">Aa</span>
                      Negro
                    </button>
                  </div>
                </div>

                {/* Text Align */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Alineación del texto</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => updateStyleConfig({ text_align: align })}
                        className={`flex-1 px-3 py-2 rounded border transition-all ${
                          data.style_config.text_align === align
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {align === 'left' ? '◀' : align === 'center' ? '●' : '▶'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overlay */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={data.style_config.overlay_enabled}
                      onChange={(e) => updateStyleConfig({ overlay_enabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Añadir capa oscura para mejorar legibilidad</span>
                  </label>
                  
                  {data.style_config.overlay_enabled && (
                    <div className="ml-6 mt-2">
                      <label className="block text-xs text-muted-foreground mb-2">
                        Opacidad: {data.style_config.overlay_opacity}%
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={data.style_config.overlay_opacity}
                        onChange={(e) => updateStyleConfig({ overlay_opacity: parseInt(e.target.value) })}
                        className="w-full max-w-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Content */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Contenido de la Promoción</h2>
              <p className="text-sm text-muted-foreground">
                Escribe el texto que verán los clientes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateData({ title: e.target.value })}
                  placeholder="Ej: ¡REBAJAS DE VERANO!"
                  className={`admin-input w-full ${errors.title ? 'border-red-400' : ''}`}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                <p className="text-xs text-muted-foreground mt-1">{data.title.length}/100 caracteres</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción <span className="text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  placeholder="Ej: Hasta -50% en artículos seleccionados"
                  className="admin-input w-full h-20 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">{data.description.length}/200 caracteres</p>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Texto del botón</label>
                  <input
                    type="text"
                    value={data.cta_text}
                    onChange={(e) => updateData({ cta_text: e.target.value })}
                    placeholder="Ej: Comprar ahora"
                    className="admin-input w-full"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">¿A dónde lleva?</label>
                  <select
                    value={data.cta_link_type}
                    onChange={(e) => {
                      const type = e.target.value as PromotionData['cta_link_type'];
                      updateData({ cta_link_type: type });
                      if (type === 'products') updateData({ cta_link: '/productos' });
                      else if (type === 'offers') updateData({ cta_link: '/ofertas' });
                    }}
                    className="admin-input w-full"
                  >
                    <option value="products">Todos los productos</option>
                    <option value="offers">Página de ofertas</option>
                    <option value="category">Una categoría</option>
                  </select>
                </div>
              </div>

              {/* Category selector */}
              {data.cta_link_type === 'category' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Selecciona categoría</label>
                  <select
                    value={data.cta_link_category || ''}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      updateData({ 
                        cta_link_category: e.target.value,
                        cta_link: cat ? `/categoria/${cat.slug}` : '/productos'
                      });
                    }}
                    className="admin-input w-full"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Coupon */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vincular cupón <span className="text-muted-foreground">(opcional)</span>
                </label>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
                  <p className="text-xs text-muted-foreground">
                    💡 Si vinculas un cupón, el código aparecerá en el banner y los clientes podrán copiarlo.
                  </p>
                </div>
                <select
                  value={data.coupon_id || ''}
                  onChange={(e) => updateData({ coupon_id: e.target.value || null })}
                  className="admin-input w-full"
                >
                  <option value="">Sin cupón</option>
                  {coupons.map(coupon => (
                    <option key={coupon.id} value={coupon.id}>{coupon.code}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Scheduling */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Programación</h2>
              <p className="text-sm text-muted-foreground">
                Define cuándo y dónde se mostrará tu promoción.
              </p>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium mb-3">
                ¿Dónde mostrar? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(LOCATION_LABELS).map(([key, loc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleLocation(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      data.locations.includes(key)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{loc.icon}</span>
                      <span className="font-medium">{loc.label}</span>
                      {data.locations.includes(key) && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{loc.description}</p>
                  </button>
                ))}
              </div>
              {errors.locations && <p className="text-red-400 text-xs mt-2">{errors.locations}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  📅 Fecha de inicio
                </label>
                <input
                  type="datetime-local"
                  value={data.start_date}
                  onChange={(e) => updateData({ start_date: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  📅 Fecha de fin <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.end_date}
                  onChange={(e) => updateData({ end_date: e.target.value })}
                  className="admin-input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">Déjalo vacío si no tiene fin</p>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Orden de aparición
                <span className="text-xs text-muted-foreground" title="Si hay varias promociones, la de número más bajo aparece primero">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.priority}
                onChange={(e) => updateData({ priority: parseInt(e.target.value) || 10 })}
                className="admin-input w-24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número más bajo = aparece primero (1 = primera posición)
              </p>
            </div>

            {/* Error display */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ← Anterior
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : '✓ Crear Promoción'}
            </button>
          )}
        </div>
      </div>

      {/* Live Preview (Floating) */}
      {(currentStep >= 2 && data.image_url) && (
        <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-40">
          <div className="p-2 bg-muted border-b border-border flex items-center gap-2">
            <span className="text-xs text-muted-foreground">👁️ Vista previa</span>
          </div>
          <div className="relative aspect-[21/9]">
            <img 
              src={data.image_url} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {data.style_config.overlay_enabled && (
              <div 
                className={`absolute inset-0 ${
                  data.style_config.overlay_position === 'left' ? 'bg-gradient-to-r from-black to-transparent' :
                  data.style_config.overlay_position === 'right' ? 'bg-gradient-to-l from-black to-transparent' :
                  data.style_config.overlay_position === 'center' ? 'bg-gradient-to-r from-transparent via-black to-transparent' :
                  'bg-black'
                }`}
                style={{ opacity: data.style_config.overlay_opacity / 100 }}
              />
            )}
            <div className={`absolute inset-0 flex flex-col justify-center p-4 ${
              data.style_config.text_align === 'center' ? 'items-center text-center' :
              data.style_config.text_align === 'right' ? 'items-end text-right' :
              'items-start text-left'
            }`}>
              <h3 className={`text-lg font-bold ${data.style_config.text_color === 'white' ? 'text-white' : 'text-black'}`}>
                {data.title || 'Tu título aquí'}
              </h3>
              {data.description && (
                <p className={`text-xs mt-1 ${data.style_config.text_color === 'white' ? 'text-white/80' : 'text-black/80'}`}>
                  {data.description}
                </p>
              )}
              {data.cta_text && (
                <button className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded">
                  {data.cta_text}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
