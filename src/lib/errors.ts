export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const ERROR_MAP: Record<string, [string, string]> = {
  'Invalid login credentials': ['Credenciales inválidas', 'INVALID_CREDENTIALS'],
  'Email not confirmed': ['Correo electrónico no confirmado', 'EMAIL_NOT_CONFIRMED'],
  'Email link is invalid or has expired': ['Enlace inválido o expirado. Solicite uno nuevo.', 'LINK_EXPIRED'],
  'Password should be at least 6 characters': ['La contraseña debe tener al menos 6 caracteres', 'WEAK_PASSWORD'],
  'honeypot_triggered': ['Solicitud rechazada por protección anti-spam', 'HONEYPOT_TRIGGERED'],
  'rate_limit_exceeded': ['Demasiados envíos. Espere un momento.', 'RATE_LIMIT_EXCEEDED'],
};

interface ErrorLike {
  message?: string;
  error_description?: string;
  details?: string;
}

function isErrorLike(e: unknown): e is ErrorLike {
  return typeof e === 'object' && e !== null;
}

export function handleSupabaseError(error: unknown): AppError {
  if (!error) return new AppError('Error desconocido', 'UNKNOWN');

  const msg = typeof error === 'string'
    ? error
    : isErrorLike(error)
      ? error.message || error.error_description || 'Error de conexión con el servidor'
      : 'Error de conexión con el servidor';
  const detail = isErrorLike(error) ? error.details || '' : '';

  for (const [key, [userMsg, code]] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) {
      return new AppError(detail || userMsg, code, detail);
    }
  }

  if (msg.includes('JWT')) return new AppError('Sesión expirada. Inicie sesión nuevamente.', 'SESSION_EXPIRED');
  if (msg.includes('network') || msg.includes('fetch')) return new AppError('Error de conexión. Verifique su internet.', 'NETWORK_ERROR');
  if (msg.includes('duplicate') || msg.includes('unique')) return new AppError('Este valor ya está registrado.', 'DUPLICATE');

  return new AppError(msg, 'UNKNOWN_ERROR');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ha ocurrido un error inesperado';
}
