import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // In production, send to error monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-md mx-auto px-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Algo salió mal</h2>
              <p className="text-slate-600 mb-6">
                Ocurrió un error inesperado. Por favor, recarga la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
