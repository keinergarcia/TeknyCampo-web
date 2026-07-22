import { LogOut } from 'lucide-react';

interface HeaderProps {
  adminName: string;
  onLogout: () => void;
}

export function Header({ adminName, onLogout }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">TC</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Tekny Campo</h1>
          <p className="text-xs text-gray-400">Panel de administración</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{adminName}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
