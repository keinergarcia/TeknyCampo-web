import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ClipboardList, Building2, Newspaper, GraduationCap,
  Briefcase, Heart, MessageSquare, Phone, BarChart3, Info,
  ThumbsUp, Share2, Settings, Users, FileText, User, ShieldCheck,
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
    <div className="space-y-10">
      <div className="flex items-start gap-4">
        <div className="w-1 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de administración de Tekny Campo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-green-200/60 shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Sesión activa</p>
            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-700 font-medium">Administrador verificado</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Módulos disponibles</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-200"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full group-hover:h-8 group-hover:opacity-100 opacity-0 transition-all duration-200" />
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 group-hover:from-green-500 group-hover:to-emerald-600 group-hover:text-white group-hover:shadow-md transition-all duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {mod.label}
                    </h3>
                    <p className="text-xs text-gray-400 group-hover:text-gray-500 mt-0.5 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
