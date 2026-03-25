# Code Club - Landing Page & Admin Dashboard

Esta es la plataforma oficial del **Club de Desarrollo de Proyectos Tecnológicos**, un espacio dedicado a la comunidad donde el código cobra vida. El proyecto no solo sirve como página de presentación, sino que funciona como una aplicación web completa con base de datos, panel de administración y sistema de correos automatizados.

## Características de la Plataforma

- **Landing Page Dinámica:** Presenta la propuesta de valor del club, principios y metas del roadmap. El log de actividades ("Actividades_Log") se alimenta directamente desde una base de datos en tiempo real.
- **Sistema de Solicitudes de Ingreso:** Los usuarios pueden enviar postulaciones con sus datos, RUT y áreas de interés. El sistema está protegido contra duplicidad de datos mediante validaciones en DB.
- **Panel de Administración Protegido:** Ruta exclusiva (`/admin/dashboard`) protegida por autenticación. Los administradores pueden gestionar (aprobar/eliminar) postulantes, registrar nuevas actividades y subir proyectos.
- **Notificaciones Automáticas por Correo:** Al aprobar la solicitud de un nuevo miembro desde el dashboard, una función *Serverless* despacha automáticamente un correo de bienvenida con accesos (Discord/WhatsApp) utilizando la API de Resend.
- **Diseño Moderno (Cyberpunk/Terminal):** Estructura responsiva con efectos de *glassmorphism*, *glow* y estética de consola puramente lograda con Tailwind CSS.

## Tecnologías Utilizadas

- **Frontend:** React + Vite + Tailwind CSS
- **Enrutamiento:** React Router v6
- **Backend & Base de Datos:** Supabase (PostgreSQL + GoTrue Auth)
  - Políticas de seguridad estrictas (RLS - Row Level Security) en todas las tablas.
- **Serverless & Hosting:** Vercel Hosting + Vercel Serverless Functions (`api/sendEmail.js`)
- **Correos:** Resend API

## Estructura de Base de Datos

El sistema corre sobre 4 tablas principales en Supabase:
1. `miembros`: Almacena postulantes y miembros aprobados (rut, email, intereses, etc).
2. `activities`: Contiene el log de los eventos del club, su fecha y su estado (completado/pendiente).
3. `projects`: (En estructuración) Para subir archivos log de proyectos.
4. `admin_roles`: Control de acceso. Contiene los IDs exactos de los usuarios que tienen permisos de administrador para saltarse las reglas RLS de lectura/escritura limitadas al público.

## Cómo Ejecutar el Proyecto Localmente

1. Clona el repositorio y ve al directorio del proyecto:
   ```bash
   cd Page-Club-Projects
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno creando un archivo `.env`:
   ```env
   VITE_SUPABASE_URL="tu_url_de_supabase"
   VITE_SUPABASE_ANON_KEY="tu_anon_key"
   ```

4. Ejecuta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en la URL que indique la consola (usualmente `http://localhost:5173/`).

*Nota sobre correos locales: Si pruebas el dashboard localmente sin configurar la llave de la API de Resend (`RESEND_API_KEY`), el servidor simulará el correo mediante la terminal para que puedas probar la lógica sin fallos.*
