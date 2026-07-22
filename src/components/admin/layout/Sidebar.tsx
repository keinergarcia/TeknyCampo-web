import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Building2, Newspaper, GraduationCap,
  Briefcase, Heart, MessageSquare, Phone, BarChart3, Info,
  ThumbsUp, Share2, Settings, Users, FileText,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { to: '/admin/hero', label: 'Hero', icon: BarChart3 },
      { to: '/admin/about', label: 'Nosotros', icon: Info },
      { to: '/admin/services', label: 'Servicios', icon: ClipboardList },
      { to: '/admin/experience', label: 'Experiencia', icon: FileText },
      { to: '/admin/entities', label: 'Entidades', icon: Building2 },
      { to: '/admin/news', label: 'Noticias', icon: Newspaper },
      { to: '/admin/trainings', label: 'Capacitaciones', icon: GraduationCap },
      { to: '/admin/benefits', label: 'Beneficios', icon: Heart },
      { to: '/admin/why-choose-us', label: '¿Por qué elegirnos?', icon: ThumbsUp },
      { to: '/admin/jobs', label: 'Trabaja con Nosotros', icon: Briefcase },
    ],
  },
  {
    label: 'Interacción',
    items: [
      { to: '/admin/messages', label: 'Mensajes', icon: MessageSquare },
      { to: '/admin/applications', label: 'Postulaciones', icon: Users },
      { to: '/admin/contact-info', label: 'Información de Contacto', icon: Phone },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { to: '/admin/social-links', label: 'Redes Sociales', icon: Share2 },
      { to: '/admin/site-config', label: 'Configuración General', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to ||
                (item.to !== '/admin' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
