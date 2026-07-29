<p align="center">
  <img src="https://raw.githubusercontent.com/keinergarcia/TeknyCampo-web/main/public/favicon.png" alt="Tekny Campo" width="80" />
</p>

<h1 align="center">Tekny Campo Soluciones Agropecuarias</h1>

<p align="center">
  <strong>Sitio web corporativo — Información, servicios y contacto</strong>
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
- [Autor](#autor)

---

## Descripción

Página web corporativa de **Tekny Campo Soluciones Agropecuarias**, una empresa colombiana dedicada a brindar soluciones integrales para el sector agropecuario mediante la comercialización de insumos, asistencia técnica, capacitación y acompañamiento a productores rurales.

El sitio web presenta la información institucional, servicios, productos, noticias y canales de contacto de la empresa.

---

## Características

- Diseño responsive optimizado para móviles, tablets y escritorio
- Navegación con menús desplegables animados y transiciones fluidas
- Secciones: Inicio, Tekny Campo, Servicios, Experiencia, Noticias, Capacitaciones, Trabaja con Nosotros y Contacto
- Formularios de contacto, postulación laboral e inscripción a capacitaciones
- Protección anti-spam mediante honeypot en formularios públicos
- Noticias con vista completa mediante modal
- Optimización SEO: meta tags, Open Graph, JSON-LD, canonical URL dinámica, sitemap XML y robots.txt
- Lazy loading de secciones below-the-fold para rendimiento óptimo
- Accesibilidad WCAG 2.1 AA (roles ARIA, contraste, enfoque visible, landmarks)
- Routing SPA compatible con GitHub Pages mediante fallback 404.html

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
| Supabase | Base de datos PostgreSQL y storage |
| PostgreSQL | Base de datos relacional |

### DevOps

| Herramienta | Propósito |
|------------|-----------|
| GitHub Actions | CI/CD — build y deploy automático |
| GitHub Pages | Hosting del frontend |

---

## Estructura del proyecto

```
teknycampo-web/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── 404.html
│   ├── favicon.png
│   ├── og-image.jpg
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── convert-to-webp.mjs
├── src/
│   ├── assets/images/
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── SEO.tsx
│   │   └── ...
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   │   ├── errors.ts
│   │   ├── public.ts
│   │   ├── storage.ts
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── AcercaDePage.tsx
│   │   ├── CapacitacionesPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── Home.tsx
│   │   ├── NewsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── WorkWithUsPage.tsx
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
└── supabase/
    └── migrations/
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

> **Nota:** El sitio depende de Supabase para cargar el contenido dinámico (servicios, noticias, capacitaciones, configuración y formularios). Sin estas variables el frontend se renderiza pero muestra datos vacíos.

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
https://teknycampo.com
```

---

## Autor

**Keiner García Ortiz** — Desarrollador

[![GitHub](https://img.shields.io/badge/GitHub-keinergarcia-059669?style=flat-square&logo=github)](https://github.com/keinergarcia)

---

<p align="center">
  <sub>Desarrollado para Tekny Campo Soluciones Agropecuarias · Todos los derechos reservados</sub>
</p>
