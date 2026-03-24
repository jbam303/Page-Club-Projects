# Contexto para Agentes de IA

Este documento proporciona el contexto principal sobre el proyecto "Code Club Landing Page" para que los agentes de IA comprendan su estructura, requisitos y lineamientos clave al momento de sugerir o implementar cambios.

## Resumen del Proyecto
El proyecto es una aplicación web (Single Page Application) construida con **React** y manejada mediante **Vite**. Su propósito es servir como plataforma oficial de presentación y registro para el "Code Club", una comunidad de desarrollo colaborativa.

## Arquitectura y Estructura
- **Frameworks Base:** React + Vite.
- **Enrutamiento:** Se usa `react-router-dom` para la navegación (la landing page está en `/` y el registro en `/registrocode`).
- **Carpetas Importantes:**
  - `src/pages/`: Contiene las vistas completas de la aplicación (e.g. `LandingPage.jsx`, `RegistroPage.jsx`).
  - `src/components/`: Contiene los componentes reutilizables y secciones comunes del layout, como el encabezado (`LayoutHeader.jsx`) y el pie de página (`LayoutFooter.jsx`).

## Estilos y Diseño Visual
Se utiliza fuertemente **Tailwind CSS** para crear una estética "Ciberpunk" o "Terminal Hack":
- Colores representativos como fondos oscuros (`bg-surface`, `bg-background`) y texto/detalles verde neón o aguamarina (`text-[#00FF9D]`, `text-primary-container`).
- Se usa tipografía monoespaciada para elementos decorativos y de log (`font-mono`).
- Se ven a menudo efectos de resplandor mediante sombras (`shadow-[0_0_30px_rgba(0,255,157,0.2)]`) y bordes difuminados a los que se les llama `terminal-glow`.

## Reglas y Directrices para IA
1. **Idioma Estricto:** **TODO** el contenido visible para los usuarios, textos, etiquetas de botones y descripciones debe generarse y mantenerse en **español**.
2. **Consistencia:** Todo nuevo código UI debe mantener la estética de terminal oscura y colores neón que prevalecen en las páginas actuales. Usa las clases y colores semánticos definidos.
3. **Componentización Responsable:** Si una página se vuelve muy compleja, encapsula partes lógicas (como secciones del landing o pasos del formulario) en la carpeta `src/components/`. Mantén los archivos estructurados y limpios.
4. **Modificaciones de Paquetes:** Evita instalar nuevas dependencias sin consultar, a menos que sea estrictamente necesario o solicitado por el usuario (muchas veces las animaciones o estilos se pueden manejar de forma nativa con Tailwind).

## Características Actuales y Futuras
Actualmente el sitio es mayoritariamente estático e informativo con un formulario simulado. Posibles adiciones futuras requerirán conectar `/registrocode` a un backend o base de datos estructurada real, o implementar un sistema para visualizar los múltiples proyectos del Roadmap.

## Base de Datos y Seguridad (Supabase)
Se ha implementado la estructura de la base de datos en Supabase mediante un script automatizado en Python (`setup_supabase.py`), junto con las políticas de **Row Level Security (RLS)**:
- **Tablas:** Se crearon las tablas `activities`, `projects` y `admin_roles` (vinculada a `auth.users`).
- **Políticas RLS Habilitadas:** Se permite lectura pública (`SELECT`) en todas las tablas, mientras que las operaciones de mutación (`INSERT`, `UPDATE`, `DELETE`) están estrictamente restringidas a los UUIDs autenticados que existan en la tabla `admin_roles`.
