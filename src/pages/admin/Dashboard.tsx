import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ClipboardList, Building2, Newspaper, GraduationCap,
  Briefcase, Heart, MessageSquare, Phone, BarChart3, Info,
  ThumbsUp, Share2, Settings, Users, FileText,
} from 'lucide-react';

const MODULES = [
  { to: '/admin/hero', label: 'Hero Stats', icon: BarChart3, desc: 'Estadísticas del hero section' },
  { to: '/admin/about', label: 'Nosotros', icon: Info, desc: 'Secciones de la página Acerca de' },
  { to: '/admin/services', label: 'Servicios', icon: ClipboardList, desc: 'Servicios ofrecidos' },
  { to: '/admin/experience', label: 'Experiencia', icon: FileText, desc: 'Línea de experiencia' },
  { to: '/admin/entities', label: 'Entidades', icon: Building2, desc: 'Entidades aliadas' },
  { to: '/admin/news', label: 'Noticias', icon: Newspaper, desc: 'Noticias y artículos' },
  { to: '/admin/trainings', label: 'Capacitaciones', icon: GraduationCap, desc: 'Cursos y talleres' },
  { to: '/admin/benefits', label: 'Beneficios', icon: Heart, desc: 'Beneficios de trabajar con nosotros' },
  { to: '/admin/why-choose-us', label: '¿Por qué elegirnos?', icon: ThumbsUp, desc: 'Razones para elegirnos' },
  { to: '/admin/jobs', label: 'Vacantes', icon: Briefcase, desc: 'Ofertas laborales' },
  { to: '/admin/messages', label: 'Mensajes', icon: MessageSquare, desc: 'Mensajes de contacto' },
  { to: '/admin/applications', label: 'Postulaciones', icon: Users, desc: 'Postulaciones laborales' },
  { to: '/admin/contact-info', label: 'Info. Contacto', icon: Phone, desc: 'Información de contacto' },
  { to: '/admin/social-links', label: 'Redes Sociales', icon: Share2, desc: 'Enlaces a redes sociales' },
  { to: '/admin/site-config', label: 'Configuración', icon: Settings, desc: 'Configuración general del sitio' },
];

export function Dashboard() {
  const { session } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenido al panel de administración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Sesión</h2>
          <p className="text-sm text-gray-700 truncate">{session?.user?.email}</p>
          <p className="text-xs text-green-600 mt-2">Administrador verificado</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Módulos disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    {mod.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{mod.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
