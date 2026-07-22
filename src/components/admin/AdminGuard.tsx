import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ error: 'Acceso denegado. No tienes permisos de administrador.' }}
        replace
      />
    );
  }

  return <>{children}</>;
}
