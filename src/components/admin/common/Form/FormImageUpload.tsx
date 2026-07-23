import { useState, useRef, useEffect } from 'react';
import { FormField } from './FormField';

interface FormImageUploadProps {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => void;
  uploading?: boolean;
  error?: string;
}

export function FormImageUpload({ label, currentUrl, onUpload, uploading, error }: FormImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  const displayUrl = preview ?? currentUrl ?? null;

  return (
    <FormField label={label} error={error}>
      <div className="space-y-2">
        {displayUrl && (
          <div className="relative w-full max-w-xs bg-gray-50 rounded-lg overflow-hidden border border-gray-200 aspect-video">
            <img src={displayUrl} alt={label} className="w-full h-full object-contain p-2" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 sm:px-3 sm:py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : currentUrl ? 'Reemplazar imagen' : 'Seleccionar imagen'}
          </button>
          <span className="text-xs text-gray-400">PNG, JPG, WebP, SVG · máx 5 MB</span>
        </div>
      </div>
    </FormField>
  );
}
