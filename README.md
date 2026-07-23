<p align="center">
  <img src="public/favicon.svg" alt="Tekny Campo" width="80" />
</p>

<h1 align="center">Tekny Campo Soluciones Agropecuarias</h1>

<p align="center">
  <strong>Plataforma web corporativa — Gestión de contenido, servicios y formularios</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/deployments/keinergarcia/TeknyCampo-web/github-pages?style=flat-square&label=deploy&color=059669" alt="Deploy status" />
  <img src="https://img.shields.io/github/last-commit/keinergarcia/TeknyCampo-web?style=flat-square&color=059669" alt="Last commit" />
  <img src="https://img.shields.io/github/package-json/v/keinergarcia/TeknyCampo-web?style=flat-square&color=059669" alt="Version" />
  <img src="https://img.shields.io/github/license/keinergarcia/TeknyCampo-web?style=flat-square&color=059669" alt="License" />
</p>

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Funcionalidades del panel admin](#funcionalidades-del-panel-admin)
- [Autor](#autor)

---

## Descripción

Página web corporativa de **Tekny Campo Soluciones Agropecuarias**, una empresa colombiana dedicada a brindar soluciones integrales para el sector agropecuario mediante la comercialización de insumos, asistencia técnica, capacitación y acompañamiento a productores rurales.

La plataforma combina un frontend moderno con un panel de administración completo que permite gestionar todo el contenido del sitio en tiempo real a través de **Supabase**, eliminando la necesidad de modificar código para actualizar información.

---

## Características

### Público

- Diseño responsive optimizado para móviles, tablets y escritorio
- Navegación con menús desplegables animados y transiciones fluidas
- Secciones: Inicio, Tekny Campo, Servicios, Experiencia, Noticias, Capacitaciones, Trabaja con Nosotros y Contacto
- Formularios de contacto, postulación laboral e inscripción a capacitaciones con envío a Supabase
- Protección anti-spam mediante honeypot en todos los formularios públicos
- Validación de campos y expresiones regulares para correos electrónicos
- Noticias con vista completa mediante modal
- Optimización SEO: meta tags, Open Graph, JSON-LD, canonical URL dinámica, sitemap XML y robots.txt
- Lazy loading de secciones below-the-fold para rendimiento óptimo
- Accesibilidad WCAG 2.1 AA (roles ARIA, contraste, enfoque visible, landmarks)
- Routing SPA compatible con GitHub Pages mediante fallback 404.html

### Administración

- Panel protegido con autenticación mediante Supabase Auth
- CRUD completo de servicios, noticias, capacitaciones, experiencias, entidades, beneficios y más
- Gestión de imágenes con subida, reemplazo y eliminación desde Storage
- Gestión de postulaciones laborales y mensajes de contacto
- Configuración dinámica del sitio (información de contacto, redes sociales, hero stats)
- Roles de administrador con RLS (Row Level Security)

---

## Tecnologías

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18 | Librería UI |
| TypeScript | 5.6 | Tipado estático |
| Vite | 5 | Bundler y dev server |
| Tailwind CSS | 3 | Estilos utilitarios |
| Framer Motion | 11 | Animaciones |
| React Router DOM | 7 | Enrutamiento SPA |
| Lucide React | — | Iconos SVG |

### Backend

| Tecnología | Propósito |
|-----------|-----------|
| Supabase | Base de datos PostgreSQL, autenticación, storage, RLS |
| PostgreSQL | Base de datos relacional |

### DevOps

| Herramienta | Propósito |
|------------|-----------|
| GitHub Actions | CI/CD — build y deploy automático |
| GitHub Pages | Hosting del frontend |
| ViteImageOptimizer | Optimización automática de imágenes en build |

---

## Estructura del proyecto

```
teknycampo-web/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD a GitHub Pages
├── public/
│   ├── 404.html                # SPA fallback para GitHub Pages
│   ├── favicon.svg
│   ├── favicon.png
│   ├── og-image.jpg            # Imagen Open Graph
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── convert-to-webp.mjs     # Conversión batch de imágenes a WebP
├── src/
│   ├── assets/images/          # Imágenes estáticas
│   ├── components/
│   │   ├── admin/              # Componentes del panel admin
│   │   │   └── common/Form/    # Formularios reutilizables
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── SEO.tsx             # Meta tags dinámicos
│   │   └── ...
│   ├── data/                   # Datos estáticos
│   ├── hooks/                  # Hooks personalizados
│   │   └── admin/              # Hooks del panel admin
│   ├── lib/
│   │   ├── admin/              # Funciones CRUD del admin
│   │   ├── errors.ts           # Manejo de errores
│   │   ├── public.ts           # Consultas públicas a Supabase
│   │   ├── storage.ts          # Operaciones de Storage
│   │   └── supabase.ts         # Cliente Supabase
│   ├── pages/
│   │   ├── admin/              # Páginas del panel admin
│   │   ├── AcercaDePage.tsx
│   │   ├── CapacitacionesPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── Home.tsx
│   │   ├── NewsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── WorkWithUsPage.tsx
│   ├── types/
│   │   └── admin.ts            # Tipos TypeScript
│   ├── App.tsx                 # Router y layout
│   └── main.tsx                # Punto de entrada
└── supabase/
    └── migrations/             # Migraciones SQL (001–016)
```

---

## Instalación

### Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Cuenta en [Supabase](https://supabase.com)
- Git

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/keinergarcia/TeknyCampo-web.git
cd TeknyCampo-web

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://localhost:5173`.

---

## Variables de entorno

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://teknycampo.com
VITE_BASE_PATH=/TeknyCampo-web
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | **Sí** | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | **Sí** | Clave anónima pública de Supabase |
| `VITE_SITE_URL` | No | URL canónica para SEO. Default: `window.location.origin` + base path |
| `VITE_BASE_PATH` | No | Base path para assets y router. Default: `/TeknyCampo-web` |

> **Nota:** El sitio depende de Supabase para cargar el contenido dinámico (servicios, noticias, capacitaciones, configuración, redes sociales y formularios). Sin estas variables el frontend se renderiza pero muestra datos vacíos.

### En producción (GitHub Pages)

Las variables deben configurarse como **secrets** en el repositorio:

1. Ir a **Settings → Secrets and variables → Actions**
2. Agregar los secrets:

| Secret | Valor |
|--------|-------|
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` (tu anon key) |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila el proyecto para producción |
| `npm run preview` | Vista previa local del build de producción |
| `npm run lint` | Ejecuta ESLint en todo el proyecto |
| `npm run typecheck` | Verifica tipos con TypeScript (`tsc --noEmit`) |
| `node scripts/convert-to-webp.mjs` | Convierte imágenes PNG/JPG a WebP en `src/assets/images/` |

---

## Despliegue

El proyecto utiliza **GitHub Actions** para desplegar automáticamente a **GitHub Pages** con cada push a la rama `main`.

### Flujo del pipeline

1. `actions/checkout@v4` — clona el repositorio
2. `actions/setup-node@v4` — configura Node.js 20
3. `npm ci` — instala dependencias
4. `npm run build` — compila el proyecto con las variables de entorno inyectadas desde secrets
5. `actions/configure-pages@v4` — configura GitHub Pages
6. `actions/upload-pages-artifact@v3` — sube el directorio `dist/`
7. `actions/deploy-pages@v4` — publica en GitHub Pages

### Sitio publicado

```
https://keinergarcia.github.io/TeknyCampo-web/
```

### Dominio personalizado

Para usar un dominio personalizado, configurar en el CI/CD:

```env
VITE_SITE_URL=https://tudominio.com
VITE_BASE_PATH=/
```

Y agregar el dominio en **Settings → Pages** del repositorio.

---

## Funcionalidades del panel admin

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Resumen del sistema |
| **Servicios** | CRUD de servicios con íconos, colores y enlace a tienda |
| **Noticias** | CRUD de noticias con imagen, categoría, autor y featured |
| **Capacitaciones** | CRUD con imagen, modalidad, precio, instructor y certificado |
| **Experiencia** | CRUD de items de experiencia empresarial |
| **Entidades** | CRUD de entidades aliadas con logo |
| **Beneficios** | CRUD de beneficios laborales con íconos |
| **Why Choose Us** | CRUD de razones de por qué elegirnos |
| **Nosotros** | Edición de secciones institucionales (historia, misión, visión, etc.) |
| **Hero Stats** | CRUD de estadísticas del hero |
| **Contacto** | Gestión de información de contacto y ubicación |
| **Redes Sociales** | CRUD de enlaces a redes sociales |
| **Postulaciones** | Bandeja de postulaciones laborales recibidas |
| **Mensajes** | Bandeja de mensajes de contacto |
| **Configuración** | Configuración general del sitio |

---

## Autor

**Keiner García Ortiz** — Desarrollador Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-keinergarcia-059669?style=flat-square&logo=github)](https://github.com/keinergarcia)

---

<p align="center">
  <sub>Desarrollado para Tekny Campo Soluciones Agropecuarias · Todos los derechos reservados</sub>
</p>
