import { FormField } from './FormField';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

export function FormTextarea({ label, value, onChange, error, required, rows = 4, placeholder }: FormTextareaProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
      />
    </FormField>
  );
}
