# Code Club - Landing Page & Admin Dashboard

Esta es la plataforma oficial del **Club de Desarrollo de Proyectos Tecnológicos**, un espacio dedicado a la comunidad donde el código cobra vida. El proyecto funciona como una aplicación web completa con base de datos, panel de administración, sistema de correos y portafolio de proyectos.

## Características de la Plataforma

- **Landing Page Dinámica:** Presenta la propuesta de valor del club, principios, metas del roadmap, horarios del club y un log de actividades alimentado en tiempo real desde Supabase.
- **Horarios del Club:** Sección de disponibilidad con días, horas y lugar, administrables desde el Dashboard. Ordenados lógicamente de Lunes a Domingo.
- **Integración con Google Calendar:** Botones en actividades y horarios para que los visitantes agenden eventos directamente en su calendario personal, con soporte de recurrencia semanal (RRULE).
- **Muro de Proyectos (Portafolio):** Galería pública de tarjetas interactivas que muestran los proyectos del club con imagen de portada, tecnologías usadas, y enlaces directos a GitHub y Demo en Vivo. Administrable desde el Dashboard con subida de imágenes al Storage de Supabase.
- **Sistema de Solicitudes de Ingreso:** Formulario público de postulación con validación de duplicidad (RUT y correo). Protegido por políticas RLS.
- **Panel de Administración Protegido:** Ruta exclusiva (`/admin/dashboard`) con autenticación. Incluye:
  - Gestión de miembros con **buscador dinámico** (por nombre, correo o RUT) y **paginación** (5 por página).
  - **Notificaciones Toast** estéticas en lugar de alertas nativas del navegador.
  - Gestión completa de actividades con fechas de inicio y término, lugar, y botón de Google Calendar.
  - **Botón de Aviso Manual** (📢) para enviar correos masivos a miembros aprobados antes de que inicie una actividad.
  - Gestión de horarios del club (día, horas, lugar).
  - CRUD completo de portafolio de proyectos.
- **Notificaciones por Correo:** Al aprobar un miembro, se despacha automáticamente un correo de bienvenida vía Resend. Los avisos de actividades se envían manualmente desde el Dashboard.
- **Diseño Moderno (Cyberpunk/Terminal):** Estructura responsiva con efectos de *glassmorphism*, *glow* y estética de consola lograda con Tailwind CSS.

## Tecnologías Utilizadas

- **Frontend:** React + Vite + Tailwind CSS
- **Enrutamiento:** React Router v6
- **Backend & Base de Datos:** Supabase (PostgreSQL + GoTrue Auth + Storage)
  - Políticas de seguridad estrictas (RLS - Row Level Security) en todas las tablas y buckets.
- **Serverless & Hosting:** Vercel Hosting + Vercel Serverless Functions (`api/sendEmail.js`, `api/sendReminder.js`)
- **Correos:** Resend API

## Estructura de Base de Datos

El sistema corre sobre 5 tablas principales en Supabase:
1. `miembros`: Postulantes y miembros aprobados (rut, email, intereses, bio, estado).
2. `activities`: Log de eventos del club con fecha de inicio (`fecha_evento`), fecha de término (`fecha_fin`), lugar, estado y control de recordatorios (`reminder_sent`).
3. `horarios_club`: Horarios fijos del club (día, horas, lugar).
4. `proyectos`: Portafolio de proyectos (título, descripción, imagen, repo_url, demo_url, tecnologías).
5. `admin_roles`: Control de acceso con los IDs de usuarios administradores.

**Storage Bucket:** `projects` — Almacena las imágenes de portada de los proyectos.

## Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL="tu_url_de_supabase"
VITE_SUPABASE_ANON_KEY="tu_anon_key"
SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
RESEND_API_KEY="tu_api_key_de_resend"
```

## Cómo Ejecutar el Proyecto Localmente

1. Clona el repositorio y ve al directorio del proyecto:
   ```bash
   cd Page-Club-Projects
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno creando un archivo `.env` con las claves listadas arriba.

4. Ejecuta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en la URL que indique la consola (usualmente `http://localhost:5173/`).

*Nota: Si no configuras `RESEND_API_KEY`, el sistema simulará los correos sin fallos para que puedas probar la lógica localmente.*
