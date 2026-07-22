import { useState, useCallback, useRef } from 'react';

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

interface UseConfirmReturn {
  confirm: (title: string, message: string, variant?: 'danger' | 'warning') => Promise<boolean>;
  dialogProps: ConfirmDialogProps;
}

export function useConfirm(): UseConfirmReturn {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'warning';
  }>({ open: false, title: '', message: '' });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((title: string, message: string, variant?: 'danger' | 'warning') => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, title, message, variant });
    });
  }, []);

  const onConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const onCancel = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  return {
    confirm,
    dialogProps: {
      open: state.open,
      title: state.title,
      message: state.message,
      variant: state.variant,
      onConfirm,
      onCancel,
    },
  };
}
