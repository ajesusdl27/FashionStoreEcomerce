import { useState, useCallback } from "react";

interface LogoUploaderProps {
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  inputName?: string;
  label?: string;
  helpText?: string;
}

export default function LogoUploader({
  initialUrl = "",
  onUrlChange,
  inputName,
  label = "Logo",
  helpText = "PNG o SVG, máx 2MB",
}: LogoUploaderProps) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Error al subir la imagen");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("El archivo debe ser una imagen");
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("El archivo es demasiado grande (máx 2MB)");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const uploadedUrl = await uploadImage(file);
        setUrl(uploadedUrl);
        onUrlChange?.(uploadedUrl);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    },
    [onUrlChange],
  );

  const handleRemove = useCallback(() => {
    setUrl("");
    onUrlChange?.("");
  }, [onUrlChange]);

  return (
    <div className="space-y-3">
      {inputName && <input type="hidden" name={inputName} value={url} />}

      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="w-24 h-24 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : url ? (
            <img
              src={url}
              alt={label}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <svg
              className="w-8 h-8 text-muted-foreground"
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
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <label className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg cursor-pointer transition-colors text-sm font-medium text-center">
            {url ? "Cambiar" : "Subir"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {url && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}
