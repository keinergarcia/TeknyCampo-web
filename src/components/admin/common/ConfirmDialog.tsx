interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColor = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-green-700 hover:bg-green-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel} onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }} role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-3 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel ?? 'Cancelar'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-3 sm:px-4 sm:py-2 text-sm text-white rounded-lg disabled:opacity-50 ${confirmColor}`}
          >
            {loading ? 'Procesando...' : (confirmLabel ?? 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
}
