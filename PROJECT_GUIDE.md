# Guía del Proyecto: NeumorStudio (Plantilla Restaurante)

Este documento sirve como guía maestra para el desarrollo, mantenimiento y evolución del proyecto **NeumorStudio**, una solución web moderna con estética neumórfica diseñada para restaurantes de alta gama.

## 1. Visión General del Proyecto

**NeumorStudio** es una plataforma web construida con **Next.js 14**, **Tailwind CSS** y **Supabase**. Su principal diferenciador es su diseño **Neumórfico (Soft UI)**, que ofrece una experiencia de usuario táctil, moderna y minimalista.

El objetivo es ofrecer a los clientes (restaurantes) una presencia web impactante que no solo muestre su menú y local, sino que también gestione reservas y contacto de manera eficiente.

### Objetivos Principales
- **Impacto Visual**: Diseño premium que justifica precios altos.
- **Autonomía del Cliente**: Panel de administración visual ("Visual Editor") para que el dueño del restaurante cambie textos, precios y fotos sin código.
- **Conversión**: Flujos claros para reservas y contacto.

---

## 2. Estado Actual y Características

### Parte Pública (Cliente)
La interfaz pública está completamente diseñada con componentes neumórficos.

*   **Inicio (Landing Page)**:
    *   Hero section con imagen de fondo y CTAs claros.
    *   Sección de "Características" (Features) con iconos.
    *   Galería destacada.
    *   *Estado*: ✅ Implementado.
*   **Menú Digital**:
    *   Listado de platos con filtrado por categorías (Entradas, Platos Principales, etc.).
    *   Diseño de tarjetas para cada plato con foto, descripción y precio.
    *   *Estado*: ✅ Implementado.
*   **Galería**:
    *   Grid de imágenes de alta calidad mostrando el ambiente y platos.
    *   *Estado*: ✅ Implementado.
*   **Reservas**:
    *   Formulario de reservas (Nombre, Fecha, Personas, etc.).
    *   Integración visual con el estilo del sitio.
    *   *Estado*: ✅ Frontend implementado (Lógica de envío pendiente de integración real de email/backend avanzado).
*   **Contacto**:
    *   Información de ubicación, horarios y redes sociales.
    *   Mapa integrado (Google Maps).
    *   *Estado*: ✅ Implementado.

### Panel de Administración (Admin)
Un potente editor visual que permite modificar la web en tiempo real.

*   **Editor Visual**:
    *   Interfaz WYSIWYG (What You See Is What You Get) mediante iframe.
    *   Edición de textos, imágenes, menú y configuración general.
    *   Soporte para modo claro/oscuro en el editor.
    *   Vista previa en diferentes dispositivos (Móvil, Tablet, Desktop).
    *   *Estado*: ✅ Implementado y funcional con Supabase.

---

## 3. Arquitectura Técnica

*   **Frontend**: Next.js 14 (App Router), React, TypeScript.
*   **Estilos**: Tailwind CSS + Variables CSS personalizadas para efectos neumórficos (`neumorph-restaurant.css`).
*   **Base de Datos**: Supabase (PostgreSQL) para persistencia de datos del restaurante, menú y configuraciones.
*   **Iconos**: Lucide React.

---

## 4. Hoja de Ruta (Roadmap) y Tareas Pendientes

Esta sección divide el trabajo restante en puntos claros para crear ramas de desarrollo (`git branch`).

### Fase 1: Funcionalidad Core y Backend <!-- id: roadmap-1 -->
*   [ ] **Gestión de Reservas (Backend)**
    *   Crear tabla `reservas` en Supabase.
    *   Conectar el formulario de reservas para guardar datos reales.
    *   Panel en Admin para ver/aceptar/rechazar reservas.
*   [ ] **Sistema de Notificaciones**
    *   Integrar servicio de email (ej. Resend o SendGrid).
    *   Enviar email de confirmación al cliente al reservar.
    *   Enviar alerta al restaurante cuando llega una nueva reserva.

### Fase 2: Expansión de Servicios <!-- id: roadmap-2 -->
*   [ ] **Módulo de Blog / Novedades**
    *   Crear sistema de posts para eventos o noticias del restaurante.
    *   Añadir sección "Blog" en el frontend.
    *   Añadir editor de texto enriquecido en el Admin.
*   [ ] **Integración de Pagos (Opcional)**
    *   Integrar Stripe para depósitos de reserva o pedidos online (Takeaway).
    *   Carrito de compras simple para pedidos.

### Fase 3: Optimización y SEO <!-- id: roadmap-3 -->
*   [ ] **SEO Técnico**
    *   Implementar metadatos dinámicos (Open Graph, Twitter Cards) basados en la config del restaurante.
    *   Generación de Sitemap.xml y Robots.txt.
*   [ ] **Performance**
    *   Optimización de imágenes (Next/Image) con carga diferida (lazy loading) agresiva en galería.
    *   Mejora de Core Web Vitals.

### Fase 4: Personalización Avanzada <!-- id: roadmap-4 -->
*   [ ] **Temas y Colores**
    *   Permitir al admin elegir la paleta de colores principal (actualmente hardcoded o semi-dinámica).
    *   Selector de tipografías.

---

## 5. Guía Visual (Capturas)

*(Espacio reservado para capturas de pantalla del estado actual)*

### Home Page
![Vista Principal](./public/screenshots/home_preview.png)
*La página de inicio con estilo neumórfico, destacando la marca y accesos rápidos.*

### Menú Interactivo
![Página de Menú](./public/screenshots/menu_preview.png)
*Listado de platos con tarjetas en relieve suave.*

### Panel de Administración
![Admin Panel](./public/screenshots/admin_preview.png)
*El editor visual permitiendo cambios en tiempo real.*

---

## Instrucciones para Colaboradores

1.  **Crear Rama**: Para trabajar en un punto del Roadmap, crea una rama: `git checkout -b feature/nombre-tarea`.
2.  **Desarrollar**: Implementa la funcionalidad siguiendo el estilo de código existente.
3.  **Probar**: Asegúrate de que no rompe el diseño neumórfico.
4.  **Merge**: Haz Pull Request para integrar los cambios.
