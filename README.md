# Tekny Campo Soluciones Agropecuarias

Página web corporativa de **Tekny Campo Soluciones Agropecuarias**, una empresa colombiana dedicada a brindar soluciones integrales para el sector agropecuario: insumos, asistencia técnica, capacitación y acompañamiento a productores rurales.

## Características

- Diseño moderno y totalmente responsivo
- Navegación con menús desplegables animados
- Secciones: Inicio, Tekny Campo, Servicios, Experiencia, Noticias, Trabaja con Nosotros y Contacto
- Formulario de contacto y postulación laboral con envío a Supabase
- Modal de noticias con vista completa de artículos
- Fondos con imágenes locales y efectos glassmorphism
- Animaciones suaves con scroll

## Tecnologías utilizadas

- **React 18** con TypeScript
- **Vite 5** (bundler)
- **Tailwind CSS 3** (estilos)
- **Framer Motion** (animaciones)
- **React Router DOM v7** (enrutamiento)
- **Lucide React** (iconos)
- **Supabase** (backend opcional para formularios)

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos con TypeScript |

## Estructura del proyecto

```
src/
├── assets/images/     # Imágenes locales (logo, fondos, noticias)
├── components/        # Componentes de la landing page
├── pages/             # Páginas completas (servicios, noticias, etc.)
├── data/              # Datos estáticos (servicios, noticias, entidades)
├── hooks/             # Hooks personalizados (formularios)
├── lib/               # Cliente de Supabase
├── App.tsx            # Router y layout principal
└── main.tsx           # Punto de entrada
```

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase es opcional. Si no se configura, los formularios funcionan en modo demostración (`console.warn`).

## Autor

**Keiner García Ortiz**
