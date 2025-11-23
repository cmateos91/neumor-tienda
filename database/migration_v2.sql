-- ============================================
-- MIGRACIÓN v2: Sistema Multi-Plantilla
-- ============================================
-- Este script migra el schema actual a uno escalable
-- para soportar múltiples tipos de plantillas.
--
-- IMPORTANTE: Ejecutar en orden y hacer backup antes
-- ============================================

-- ============================================
-- PASO 1: Crear nuevas tablas
-- ============================================

-- Tabla maestra de sitios
CREATE TABLE IF NOT EXISTS public.sitios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'restaurante',
  slug text UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitios_pkey PRIMARY KEY (id),
  CONSTRAINT sitios_tipo_check CHECK (tipo IN ('restaurante', 'gimnasio', 'hotel', 'peluqueria', 'clinica'))
);

-- Configuración general del sitio (datos compartidos por todas las plantillas)
CREATE TABLE IF NOT EXISTS public.sitio_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  nombre text NOT NULL,
  tagline text,
  descripcion text,
  telefono text,
  telefono_secundario text,
  email text,
  email_secundario text,
  direccion_calle text,
  direccion_ciudad text,
  direccion_cp text,
  direccion_pais text DEFAULT 'España',
  horario_semana text,
  horario_finde text,
  instagram text,
  facebook text,
  twitter text,
  tiktok text,
  web text,
  mapa_embed_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitio_config_pkey PRIMARY KEY (id),
  CONSTRAINT sitio_config_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE,
  CONSTRAINT sitio_config_sitio_id_unique UNIQUE (sitio_id)
);

-- Textos personalizables por página (flexible con JSONB)
CREATE TABLE IF NOT EXISTS public.sitio_textos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  pagina text NOT NULL,
  textos jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitio_textos_pkey PRIMARY KEY (id),
  CONSTRAINT sitio_textos_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE,
  CONSTRAINT sitio_textos_unique UNIQUE (sitio_id, pagina)
);

-- Galería (genérica para todas las plantillas)
CREATE TABLE IF NOT EXISTS public.sitio_galeria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  url text NOT NULL,
  titulo text,
  descripcion text,
  es_home boolean DEFAULT false,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitio_galeria_pkey PRIMARY KEY (id),
  CONSTRAINT sitio_galeria_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE
);

-- Features/Características (genérica para todas las plantillas)
CREATE TABLE IF NOT EXISTS public.sitio_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  icono text DEFAULT 'Star',
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitio_features_pkey PRIMARY KEY (id),
  CONSTRAINT sitio_features_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE
);

-- Reservas/Citas (genérica - sirve para restaurantes, peluquerías, clínicas, etc.)
CREATE TABLE IF NOT EXISTS public.sitio_reservas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  fecha date NOT NULL,
  hora time without time zone NOT NULL,
  personas integer DEFAULT 1,
  servicio text,
  notas text,
  estado text DEFAULT 'pendiente',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sitio_reservas_pkey PRIMARY KEY (id),
  CONSTRAINT sitio_reservas_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE,
  CONSTRAINT sitio_reservas_estado_check CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'))
);

-- ============================================
-- PASO 2: Tablas específicas de RESTAURANTE
-- ============================================

CREATE TABLE IF NOT EXISTS public.restaurante_menu_categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT restaurante_menu_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT restaurante_menu_categorias_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.restaurante_menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sitio_id uuid NOT NULL,
  categoria_id uuid,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  imagen_url text,
  alergenos text[],
  disponible boolean DEFAULT true,
  destacado boolean DEFAULT false,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT restaurante_menu_items_pkey PRIMARY KEY (id),
  CONSTRAINT restaurante_menu_items_sitio_id_fkey FOREIGN KEY (sitio_id) REFERENCES public.sitios(id) ON DELETE CASCADE,
  CONSTRAINT restaurante_menu_items_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.restaurante_menu_categorias(id) ON DELETE SET NULL
);

-- ============================================
-- PASO 3: Migrar datos existentes
-- ============================================

-- 3.1 Crear sitio desde restaurante existente
INSERT INTO public.sitios (id, tipo, slug, activo, created_at, updated_at)
SELECT
  id,
  'restaurante',
  LOWER(REPLACE(REPLACE(nombre, ' ', '-'), '''', '')),
  true,
  created_at,
  updated_at
FROM public.restaurantes
ON CONFLICT (id) DO NOTHING;

-- 3.2 Migrar configuración
INSERT INTO public.sitio_config (
  sitio_id, nombre, tagline, descripcion, telefono, telefono_secundario,
  email, email_secundario, direccion_calle, direccion_ciudad, direccion_cp,
  direccion_pais, horario_semana, horario_finde, instagram, facebook, twitter,
  mapa_embed_url, created_at, updated_at
)
SELECT
  id,
  nombre, tagline, descripcion, telefono, telefono_secundario,
  email, email_reservas, direccion_calle, direccion_ciudad, direccion_cp,
  direccion_pais, horario_semana, horario_finde, instagram, facebook, twitter,
  mapa_embed_url, created_at, updated_at
FROM public.restaurantes
ON CONFLICT (sitio_id) DO NOTHING;

-- 3.3 Migrar textos a formato JSONB por página
-- Página: inicio
INSERT INTO public.sitio_textos (sitio_id, pagina, textos)
SELECT
  id,
  'inicio',
  jsonb_build_object(
    'btn_menu', COALESCE(inicio_btn_menu, 'Ver Menú'),
    'btn_reservas', COALESCE(inicio_btn_reservas, 'Reservar Mesa'),
    'features_titulo', COALESCE(inicio_features_titulo, 'Por Qué Elegirnos'),
    'features_subtitulo', COALESCE(inicio_features_subtitulo, 'Comprometidos con la excelencia'),
    'galeria_titulo', COALESCE(inicio_galeria_titulo, 'Ambiente Único'),
    'galeria_subtitulo', COALESCE(inicio_galeria_subtitulo, 'Un espacio para momentos memorables'),
    'galeria_btn', COALESCE(inicio_galeria_btn, 'Ver Galería Completa')
  )
FROM public.restaurantes
ON CONFLICT (sitio_id, pagina) DO NOTHING;

-- Página: menu
INSERT INTO public.sitio_textos (sitio_id, pagina, textos)
SELECT
  id,
  'menu',
  jsonb_build_object(
    'titulo', COALESCE(menu_titulo, 'Nuestro Menú'),
    'subtitulo', COALESCE(menu_subtitulo, 'Descubre nuestra selección'),
    'filtro_todos', COALESCE(menu_filtro_todos, 'Todos'),
    'sin_items', COALESCE(menu_sin_items, 'No hay items en esta categoría')
  )
FROM public.restaurantes
ON CONFLICT (sitio_id, pagina) DO NOTHING;

-- Página: galeria
INSERT INTO public.sitio_textos (sitio_id, pagina, textos)
SELECT
  id,
  'galeria',
  jsonb_build_object(
    'titulo', COALESCE(galeria_titulo, 'Galería'),
    'subtitulo', COALESCE(galeria_subtitulo, 'Déjate inspirar')
  )
FROM public.restaurantes
ON CONFLICT (sitio_id, pagina) DO NOTHING;

-- Página: reservas
INSERT INTO public.sitio_textos (sitio_id, pagina, textos)
SELECT
  id,
  'reservas',
  jsonb_build_object(
    'titulo', COALESCE(reservas_titulo, 'Reserva tu Mesa'),
    'subtitulo', COALESCE(reservas_subtitulo, 'Asegura tu lugar'),
    'exito_titulo', COALESCE(reservas_exito_titulo, '¡Reserva Confirmada!'),
    'exito_mensaje', COALESCE(reservas_exito_mensaje, 'Te enviaremos confirmación por email'),
    'btn_confirmar', COALESCE(reservas_btn_confirmar, 'Confirmar Reserva'),
    'btn_enviando', COALESCE(reservas_btn_enviando, 'Enviando...')
  )
FROM public.restaurantes
ON CONFLICT (sitio_id, pagina) DO NOTHING;

-- Página: contacto
INSERT INTO public.sitio_textos (sitio_id, pagina, textos)
SELECT
  id,
  'contacto',
  jsonb_build_object(
    'titulo', COALESCE(contacto_titulo, 'Contacto'),
    'subtitulo', COALESCE(contacto_subtitulo, 'Estamos aquí para atenderte'),
    'info_titulo', COALESCE(contacto_info_titulo, 'Cómo Llegar'),
    'info_descripcion', COALESCE(contacto_info_descripcion, 'Ubicados en el corazón de la ciudad')
  )
FROM public.restaurantes
ON CONFLICT (sitio_id, pagina) DO NOTHING;

-- 3.4 Migrar galería
INSERT INTO public.sitio_galeria (id, sitio_id, url, titulo, es_home, orden, created_at)
SELECT id, restaurante_id, url, titulo, es_home, orden, created_at
FROM public.galeria
WHERE restaurante_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3.5 Migrar features
INSERT INTO public.sitio_features (id, sitio_id, titulo, descripcion, icono, orden, created_at)
SELECT id, restaurante_id, titulo, descripcion, icono, orden, created_at
FROM public.features
WHERE restaurante_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3.6 Migrar reservas
INSERT INTO public.sitio_reservas (id, sitio_id, nombre, email, telefono, fecha, hora, personas, notas, estado, created_at)
SELECT id, restaurante_id, nombre, email, telefono, fecha, hora, personas, notas, estado, created_at
FROM public.reservas
WHERE restaurante_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3.7 Migrar categorías del menú
INSERT INTO public.restaurante_menu_categorias (id, sitio_id, nombre, orden, created_at)
SELECT id, restaurante_id, nombre, orden, created_at
FROM public.menu_categorias
WHERE restaurante_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3.8 Migrar items del menú
INSERT INTO public.restaurante_menu_items (id, sitio_id, categoria_id, nombre, descripcion, precio, imagen_url, disponible, orden, created_at, updated_at)
SELECT id, restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, disponible, orden, created_at, updated_at
FROM public.menu_items
WHERE restaurante_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 4: Crear índices para rendimiento
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sitio_config_sitio_id ON public.sitio_config(sitio_id);
CREATE INDEX IF NOT EXISTS idx_sitio_textos_sitio_id ON public.sitio_textos(sitio_id);
CREATE INDEX IF NOT EXISTS idx_sitio_galeria_sitio_id ON public.sitio_galeria(sitio_id);
CREATE INDEX IF NOT EXISTS idx_sitio_features_sitio_id ON public.sitio_features(sitio_id);
CREATE INDEX IF NOT EXISTS idx_sitio_reservas_sitio_id ON public.sitio_reservas(sitio_id);
CREATE INDEX IF NOT EXISTS idx_sitio_reservas_fecha ON public.sitio_reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_sitio_reservas_estado ON public.sitio_reservas(estado);
CREATE INDEX IF NOT EXISTS idx_restaurante_menu_categorias_sitio_id ON public.restaurante_menu_categorias(sitio_id);
CREATE INDEX IF NOT EXISTS idx_restaurante_menu_items_sitio_id ON public.restaurante_menu_items(sitio_id);
CREATE INDEX IF NOT EXISTS idx_restaurante_menu_items_categoria_id ON public.restaurante_menu_items(categoria_id);

-- ============================================
-- PASO 5: Crear funciones helper
-- ============================================

-- Función para obtener textos de una página con defaults
CREATE OR REPLACE FUNCTION get_sitio_textos(p_sitio_id uuid, p_pagina text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT textos INTO result
  FROM public.sitio_textos
  WHERE sitio_id = p_sitio_id AND pagina = p_pagina;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 6: (OPCIONAL) Eliminar tablas antiguas
-- ============================================
-- IMPORTANTE: Solo ejecutar después de verificar que la migración fue exitosa
--
-- DROP TABLE IF EXISTS public.menu_items CASCADE;
-- DROP TABLE IF EXISTS public.menu_categorias CASCADE;
-- DROP TABLE IF EXISTS public.reservas CASCADE;
-- DROP TABLE IF EXISTS public.features CASCADE;
-- DROP TABLE IF EXISTS public.galeria CASCADE;
-- DROP TABLE IF EXISTS public.restaurantes CASCADE;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
-- Ejecuta estas queries para verificar:
--
-- SELECT COUNT(*) as sitios FROM sitios;
-- SELECT COUNT(*) as configs FROM sitio_config;
-- SELECT COUNT(*) as textos FROM sitio_textos;
-- SELECT COUNT(*) as galeria FROM sitio_galeria;
-- SELECT COUNT(*) as features FROM sitio_features;
-- SELECT COUNT(*) as reservas FROM sitio_reservas;
-- SELECT COUNT(*) as categorias FROM restaurante_menu_categorias;
-- SELECT COUNT(*) as items FROM restaurante_menu_items;
