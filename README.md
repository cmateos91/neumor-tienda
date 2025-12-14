# Neumor - Plantilla para Tienda Online

Plantilla completa y profesional para tiendas online con panel de administración integrado. Construida con Next.js, TypeScript, Tailwind CSS y Supabase.

## Características

### Sitio Web Público
- Página principal con productos destacados
- Catálogo de productos con categorías
- Galería de imágenes
- Formulario de contacto
- Sistema de pedidos online
- Componentes editables en tiempo real

### Panel de Administración
- Dashboard con estadísticas y métricas
- Gestión completa de productos (crear, editar, eliminar, ordenar)
- Gestión de pedidos
- Gestión de galería de imágenes
- Sistema de leads y clientes potenciales
- Automatizaciones de mensajes
- Integraciones con Meta (Facebook/Instagram)
- Webhooks con n8n

## Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de datos**: Supabase
- **Emails**: Resend
- **Drag & Drop**: dnd-kit
- **Iconos**: Lucide React

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
NEXT_PUBLIC_SITIO_SLUG=tienda-demo
RESEND_API_KEY=tu_resend_key
```

**Importante:** La variable `NEXT_PUBLIC_SITIO_SLUG` determina qué sitio se carga desde Supabase. Cada deploy puede tener un slug diferente para mostrar contenido distinto.

4. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm test` - Ejecuta validaciones de esquemas y componentes editables

## Estructura del Proyecto

```
app/
├── (tienda)/          # Sitio web público
│   ├── productos/     # Catálogo de productos
│   ├── pedidos/       # Sistema de pedidos
│   ├── galeria/       # Galería de imágenes
│   └── contacto/      # Formulario de contacto
├── admin/             # Panel de administración
│   ├── productos/     # Gestión de productos
│   ├── pedidos/       # Gestión de pedidos
│   ├── galeria/       # Gestión de galería
│   └── tienda/        # Configuración de la tienda
└── api/               # API Routes
    ├── productos/     # Endpoints de productos
    ├── pedidos/       # Endpoints de pedidos
    └── automations/   # Sistema de automatizaciones
```

## Arquitectura Multi-Tenant

Esta plantilla soporta múltiples clientes usando una sola base de datos Supabase:

### Cómo Funciona

1. **Una base de datos** con todos los sitios
2. **Un proyecto Vercel por cliente**
3. Cada proyecto usa **la misma base de datos** pero carga datos diferentes

### Configuración en Vercel

Para cada cliente, crea un proyecto separado en Vercel con estas variables de entorno:

**Proyecto 1 - Tienda:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_SITIO_SLUG=tienda-demo
```

**Proyecto 2 - Restaurante:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # misma BD
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx                 # misma key
NEXT_PUBLIC_SITIO_SLUG=demo                       # diferente slug
```

### Ventajas

- ✅ Una sola base de datos para gestionar
- ✅ Actualizaciones del código benefician a todos los clientes
- ✅ Datos completamente separados por `sitio_id`
- ✅ Cada cliente puede tener su dominio personalizado
- ✅ Económico: un proyecto Supabase para todos

## Licencia

Propiedad de Neumor Studio.
