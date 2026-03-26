# Contexto para Agentes de IA

Este documento proporciona el contexto principal sobre el proyecto "Code Club Landing Page" para que los agentes de IA comprendan su estructura, requisitos y lineamientos clave al momento de sugerir o implementar cambios.

## Resumen del Proyecto
El proyecto es una aplicación web dinámica (SPA) construida con **React**, manejada mediante **Vite**, conectada a **Supabase** (PostgreSQL + Auth + Storage) y desplegada en **Vercel**. Sirve como plataforma integral del "Club de Desarrollo de Proyectos Tecnológicos": landing page pública, formulario de inscripción, panel de administración y portafolio de proyectos.

## Arquitectura y Estructura
- **Frameworks Base:** React + Vite.
- **Enrutamiento:** `react-router-dom` con rutas públicas (`/`, `/registrocode`, `/admin/login`) y rutas protegidas (`/admin/dashboard` controlada por `ProtectedRoute.jsx`).
- **Carpetas Importantes:**
  - `src/pages/`: Vistas completas (`LandingPage.jsx`, `RegistroPage.jsx`, `AdminDashboard.jsx`, `AdminLogin.jsx`).
  - `src/components/`: Componentes modulares UI:
    - `ActivityList.jsx` — CRUD de actividades con calendario, avisos manuales y fechas de inicio/fin.
    - `ActivityForm.jsx` — Modal de creación/edición de actividades con campos de lugar y fecha de término.
    - `MemberList.jsx` — Gestión de miembros con buscador dinámico, paginación (5/página) y notificaciones Toast.
    - `ProjectUpload.jsx` — CRUD completo de portafolio con subida de imágenes al bucket `projects`.
    - `ScheduleManager.jsx` — Gestión de horarios del club (día, horas, lugar).
  - `src/lib/`: Instancia cliente de Supabase.
  - `api/`: Funciones Serverless de Vercel:
    - `sendEmail.js` — Correo de bienvenida al aprobar miembros.
    - `sendReminder.js` — Correo de aviso manual de actividades (protegido por JWT + verificación de admin).
  - `TEST/`: Scripts de Python para migraciones de DB (setup de tablas, columnas, políticas RLS).

## Estilos y Diseño Visual
Se utiliza **Tailwind CSS** para crear una estética "Ciberpunk" o "Terminal Hack":
- Fondos oscuros (`bg-surface`, `bg-background`) y texto/detalles verde neón (`text-primary-container`, `text-[#00FF9D]`).
- Componentes unificados bajo clases base como `glass-card` y `terminal-glow`.
- Notificaciones internas tipo Toast animados (esquina inferior derecha) en lugar de `window.alert()`.

## Base de Datos y Seguridad (Supabase)
Todo está protegido con RLS (Row Level Security):
- **Tablas Activas:**
  1. `activities` — Pública lectura, privada escritura. Campos: `titulo`, `descripcion`, `fecha_evento`, `fecha_fin`, `lugar`, `estado`, `reminder_sent`.
  2. `admin_roles` — Mapea UUIDs de `auth.users` con cuentas administradoras.
  3. `miembros` — `INSERT` público anónimo desde `/registrocode`, lectura/escritura solo para admins.
  4. `horarios_club` — Lectura pública, escritura admin. Campos: `dia`, `horas`, `lugar`.
  5. `proyectos` — Lectura pública, escritura admin. Campos: `titulo`, `descripcion`, `imagen_url`, `repo_url`, `demo_url`, `tecnologias` (array).
- **Storage Bucket:** `projects` — Imágenes de portada de proyectos. RLS configurado: lectura pública, escritura autenticada.
- Las conexiones nunca exponen la `service_role`; el frontend usa `VITE_SUPABASE_ANON_KEY` y la validación se hace a nivel base de datos.

## Vercel Serverless Functions
Para ocultar secretos (API keys), el frontend se comunica con endpoints en `api/`:
- `POST /api/sendEmail` — Envía correo de bienvenida (protegido con JWT).
- `POST /api/sendReminder` — Envía aviso de actividad a todos los miembros aprobados (protegido con JWT + validación de admin_roles).

## Reglas y Directrices para IA
1. **Idioma Estricto:** **TODO** el contenido visible y los READMEs deben estar en **español**.
2. **Consistencia:** Mantén la paleta predefinida, no inyectes colores que rompan la línea `text-primary-container`.
3. **Seguridad Backend:** Nunca escribas código que asuma lógicas admin sin verificar Supabase RLS. Usa `api/` para intermediarios serverless.
4. **Respeto Z-Index:** Al agregar modales, revisa que no entren en conflicto con `glass-card` y otros z-indexes existentes.
5. **Migraciones DB:** Usa scripts Python en `TEST/` con `psycopg2`, incluir `conn.commit()` explícito y `NOTIFY pgrst, 'reload schema'` para refrescar el caché de PostgREST.
6. **Bucket Storage:** El bucket de imágenes se llama `projects` (no `proyectos`).
