import { useRef } from 'react';
import { FormField } from './FormField';

interface FormFileUploadProps {
  label: string;
  currentUrl?: string | null;
  currentName?: string | null;
  onUpload: (file: File) => void;
  uploading?: boolean;
  error?: string;
  accept?: string;
}

export function FormFileUpload({ label, currentUrl, currentName, onUpload, uploading, error, accept }: FormFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <FormField label={label} error={error}>
      <div className="space-y-2">
        {currentName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-4 h-4 text-blue-500">📄</span>
            <span>{currentName}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={accept ?? '.pdf,.doc,.docx'}
            onChange={handleChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 sm:px-3 sm:py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : currentUrl ? 'Reemplazar archivo' : 'Seleccionar archivo'}
          </button>
          <span className="text-xs text-gray-400">PDF, DOC · máx 10 MB</span>
        </div>
      </div>
    </FormField>
  );
}
