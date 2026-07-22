import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { Breadcrumbs } from './layout/Breadcrumbs';

export function AdminLayout() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden lg:flex">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Header adminName={session?.user?.email ?? 'Administrador'} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
