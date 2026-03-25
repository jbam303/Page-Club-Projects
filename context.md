# Contexto para Agentes de IA

Este documento proporciona el contexto principal sobre el proyecto "Code Club Landing Page" para que los agentes de IA comprendan su estructura, requisitos y lineamientos clave al momento de sugerir o implementar cambios.

## Resumen del Proyecto
El proyecto ha evolucionado de un simple sitio informativo a una aplicación web dinámica (SPA) construida con **React**, manejada mediante **Vite**, conectada a **Supabase** y desplegada en **Vercel** usando sus funciones *Serverless*. Sirve como la principal puerta de enlace y administración del "Club de Desarrollo de Proyectos Tecnológicos".

## Arquitectura y Estructura
- **Frameworks Base:** React + Vite.
- **Enrutamiento:** `react-router-dom` con rutas públicas (`/`, `/registrocode`, `/admin/login`) y rutas protegidas (`/admin/dashboard` controlada por `ProtectedRoute.jsx`).
- **Carpetas Importantes:**
  - `src/pages/`: Vistas completas.
  - `src/components/`: Componentes modulares UI. Las lógicas de fetch y manipulación de datos principales están en `ActivityList.jsx`, `MemberList.jsx`, `ProjectUpload.jsx`.
  - `src/lib/`: Instancia cliente de Supabase.
  - `api/`: Funciones Serverless de Vercel (ej. `sendEmail.js`).
  - `TEST/`: Scripts de python/SQL usados en configuraciones previas estructurantes de DB.

## Estilos y Diseño Visual
Se utiliza fuertemente **Tailwind CSS** para crear una estética "Ciberpunk" o "Terminal Hack":
- Colores representativos como fondos oscuros (`bg-surface`, `bg-background`) y texto/detalles verde neón (`text-[#00FF9D]`).
- Componentes unificados bajo clases base en archivos CSS como `glass-card` y `terminal-glow`.

## Base de Datos y Seguridad (Supabase)
Todo está estrictamente protegido usando las reglas RLS (Row Level Security) nativas de PostgreSQL:
- **Tablas Activas:**
  1. `activities` (Pública lectura, Privada escritura).
  2. `admin_roles` (Mapea UUIDs directos de `auth.users` hacia cuentas root).
  3. `miembros` (RUT y Correo con constrain unique. Permite `INSERT` público anónimo para recoger postulaciones desde `/registrocode`, pero bloquea absolutamente el `SELECT`/`UPDATE` para que solo los usuarios en `admin_roles` puedan leer/administrar la tabla).
- Las conexiones directas nunca exponen la `service_role` de BD; todo depende de `VITE_SUPABASE_ANON_KEY` y la validación a nivel base de datos, lo que mitiga cualquier inyección de solicitudes por red o manipulación frontend.

## Vercel Serverless Functions
Para ocultar secretos como llaves de API (Ej: Resend Email API), el proyecto hace uso del enrutamiento de Vercel. Al hacer fetch a `/api/sendEmail`, el frontend se comunica con el backend de Vercel para ejecutar de forma aislada scripts intermedios de Node.js.

## Reglas y Directrices para IA
1. **Idioma Estricto:** **TODO** el contenido visible para los usuarios y los READMEs deben generarse y mantenerse en **español**.
2. **Consistencia:** Mantén siempre la paleta predefinida, no inyectes colores en duro que rompan la línea `text-primary-container`.
3. **Seguridad Backend:** Nunca escribas componentes React que inyecten contraseñas o asuman lógicas administrativas sin comprobar contra Supabase RLS. No configures llamadas directas a APIs de terceros sensibles desde clientes; usa `api/` para intermediarios serverless.
4. **Respeto Z-Index:** Al agregar modales, revisa siempre que no entren en conflicto con las cajas declaradas como `glass-card`.
