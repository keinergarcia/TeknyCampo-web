import { Link, useLocation } from 'react-router-dom';

const LABEL_MAP: Record<string, string> = {
  'admin': 'Inicio',
  'services': 'Servicios',
  'experience': 'Experiencia',
  'entities': 'Entidades',
  'news': 'Noticias',
  'trainings': 'Capacitaciones',
  'jobs': 'Trabaja con Nosotros',
  'benefits': 'Beneficios',
  'applications': 'Postulaciones',
  'messages': 'Mensajes',
  'contact-info': 'Información de Contacto',
  'hero': 'Hero',
  'about': 'Nosotros',
  'why-choose-us': '¿Por qué elegirnos?',
  'social-links': 'Redes Sociales',
  'site-config': 'Configuración General',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = LABEL_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-2">
          {crumb.isLast ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <>
              <Link to={crumb.path} className="hover:text-green-700 transition-colors">{crumb.label}</Link>
              <span>/</span>
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
