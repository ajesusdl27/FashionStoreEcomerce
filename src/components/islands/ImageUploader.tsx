import { useState, useCallback, useEffect, useId } from 'react';

interface ImageUploaderProps {
  initialImages?: string[];
  onImagesChange?: (urls: string[]) => void;
  inputName?: string;
  inputId?: string;
}

interface UploadedImage {
  url: string;
  uploading: boolean;
  error?: string;
}

export default function ImageUploader({
  initialImages = [],
  onImagesChange,
  inputName,
  inputId,
}: ImageUploaderProps) {
  // Generate a unique ID for file input to avoid conflicts when multiple uploaders exist
  const uniqueId = useId();
  const fileInputId = inputId ? `file-input-${inputId}` : `file-input-${uniqueId}`;
  
  const [images, setImages] = useState<UploadedImage[]>(
    initialImages.map(url => ({ url, uploading: false }))
  );
  
  const [isDragging, setIsDragging] = useState(false);
  const [internalUrls, setInternalUrls] = useState<string[]>(initialImages);

  // Upload single image via API
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir la imagen');
    }

    const data = await response.json();
    return data.url;
  };

  // Handle file selection
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    // Add placeholders for uploading images
    const newImages: UploadedImage[] = imageFiles.map(() => ({
      url: '',
      uploading: true,
    }));

    setImages(prev => [...prev, ...newImages]);
    const startIndex = images.length;

    // Upload each image
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file) continue;

      try {
        const url = await uploadImage(file);
        
        setImages(prev => {
          const updated = [...prev];
          if (updated[startIndex + i]) {
            updated[startIndex + i] = { url, uploading: false };
          }
          return updated;
        });
      } catch (error: any) {
        setImages(prev => {
          const updated = [...prev];
          if (updated[startIndex + i]) {
            updated[startIndex + i] = { url: '', uploading: false, error: error.message };
          }
          return updated;
        });
      }
    }
  };

  // Update parent when images change
  const updateParent = useCallback((imgs: UploadedImage[]) => {
    const urls = imgs.filter(img => img.url && !img.uploading).map(img => img.url);
    setInternalUrls(urls);
    if (onImagesChange) {
      onImagesChange(urls);
    }
  }, [onImagesChange]);

  // Effect to notify parent of changes
  useEffect(() => {
    updateParent(images);
  }, [images, updateParent]);

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // Move image (reorder)
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    if (moved) {
      newImages.splice(to, 0, moved);
      setImages(newImages);
    }
  };

  // Drag and drop handlers
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
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {inputName && (
        <input 
          type="hidden" 
          name={inputName} 
          id={inputId} 
          value={JSON.stringify(internalUrls)} 
        />
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
        onClick={() => document.getElementById(fileInputId)?.click()}
      >
        <input
          type="file"
          id={fileInputId}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        
        <svg 
          className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
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
        
        <p className="text-muted-foreground">
          {isDragging ? (
            <span className="text-primary font-medium">Suelta las imágenes aquí</span>
          ) : (
            <>
              <span className="text-primary font-medium">Click para seleccionar</span>
              {' '}o arrastra imágenes aquí
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Se convertirán automáticamente a WebP • Máx 1200px
        </p>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div 
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              {img.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-accent/20 p-2">
                  <p className="text-xs text-accent text-center">{img.error}</p>
                </div>
              ) : (
                <>
                  <img 
                    src={img.url} 
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Move left */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Mover izquierda"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-accent/80 rounded-lg hover:bg-accent transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Move right */}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Mover derecha"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Order badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-medium">
                      Principal
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
