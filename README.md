# Tekny Campo Soluciones Agropecuarias

Página web corporativa de **Tekny Campo Soluciones Agropecuarias**, una empresa colombiana dedicada a brindar soluciones integrales para el sector agropecuario: insumos, asistencia técnica, capacitación y acompañamiento a productores rurales.

## Características

- Diseño moderno y totalmente responsivo
- Navegación con menús desplegables animados
- Secciones: Inicio, Tekny Campo, Servicios, Experiencia, Noticias, Trabaja con Nosotros y Contacto
- Formulario de contacto, postulación laboral e inscripción a capacitaciones con envío a Supabase
- Protección anti-spam mediante campo honeypot en todos los formularios públicos
- Modal de noticias con vista completa de artículos
- Fondos con imágenes locales y efectos glassmorphism
- Animaciones suaves con scroll (Framer Motion)
- Panel de administración protegido con autenticación (CRUD completo de contenido)
- Lazy loading de secciones below-the-fold para optimizar rendimiento
- SEO dinámico: meta tags, Open Graph, JSON-LD, canonical URL configurable
- Optimización automática de imágenes en build (WebP, compresión)
- Sitemap XML y robots.txt para motores de búsqueda
- Routing SPA compatible con GitHub Pages (404.html con redirect preservando ruta)
- Accesibilidad WCAG 2.1 AA (roles ARIA, contraste, enfoque visible, landmarks)

## Tecnologías utilizadas

- **React 18** con TypeScript
- **Vite 5** (bundler)
- **Tailwind CSS 3** (estilos)
- **Framer Motion** (animaciones)
- **React Router DOM v7** (enrutamiento)
- **Lucide React** (iconos)
- **Supabase** (backend: autenticación, base de datos, storage)
- **GitHub Actions** (CI/CD: deploy automático a GitHub Pages)

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos con TypeScript |
| `node scripts/convert-to-webp.mjs` | Convierte imágenes PNG/JPG a WebP |

## Estructura del proyecto

```
src/
├── assets/images/       # Imágenes locales (logo, fondos, noticias)
├── components/          # Componentes públicos (Navbar, Footer, SEO, etc.)
│   └── admin/           # Componentes del panel de administración
├── pages/               # Páginas completas (servicios, noticias, admin, etc.)
├── data/                # Datos estáticos (servicios, noticias, entidades)
├── hooks/               # Hooks personalizados (formularios, notificaciones)
├── lib/                 # Cliente Supabase, tipos, helpers, utilidades
├── App.tsx              # Router y layout principal (con lazy loading)
└── main.tsx             # Punto de entrada
public/
├── 404.html             # SPA fallback para GitHub Pages
├── robots.txt           # Configuración para crawlers
├── sitemap.xml          # Mapa del sitio para SEO
├── favicon.svg/png      # Favicons en múltiples formatos
└── og-image.jpg         # Imagen para Open Graph
scripts/
└── convert-to-webp.mjs  # Utilidad de conversión batch a WebP
```

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://teknycampo.com
VITE_BASE_PATH=/TeknyCampo-web
```

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | Sí (formularios) | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí (formularios) | Anon key pública de Supabase |
| `VITE_SITE_URL` | No | URL canónica para SEO. Default: `window.location.origin + base path` |
| `VITE_BASE_PATH` | No | Base path para assets y router. Default: `/TeknyCampo-web` |

Supabase es opcional. Si no se configura, los formularios funcionan en modo demostración (`console.warn`).

## Despliegue

El proyecto se despliega automáticamente a GitHub Pages mediante GitHub Actions al hacer push a `main`. El workflow:

1. Construye el proyecto con `npm run build`
2. Sube el artefacto `github-pages`
3. Publica en `https://keinergarcia.github.io/TeknyCampo-web/`

Para usar un dominio personalizado, configurar `VITE_SITE_URL` y `VITE_BASE_PATH=/` en el CI/CD.

## Autor

**Keiner García Ortiz**
