// ============================================
// Tipos para el sistema multi-plantilla v2
// ============================================

// Tipos de plantillas disponibles
export type TipoPlantilla = 'restaurante' | 'gimnasio' | 'hotel' | 'peluqueria' | 'clinica';

// Estados de reserva
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

// ============================================
// TABLAS GENÉRICAS (todas las plantillas)
// ============================================

export interface Sitio {
  id: string;
  tipo: TipoPlantilla;
  slug: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitioConfig {
  id: string;
  sitio_id: string;
  nombre: string;
  tagline: string | null;
  descripcion: string | null;
  telefono: string | null;
  telefono_secundario: string | null;
  email: string | null;
  email_secundario: string | null;
  direccion_calle: string | null;
  direccion_ciudad: string | null;
  direccion_cp: string | null;
  direccion_pais: string | null;
  horario_semana: string | null;
  horario_finde: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  tiktok: string | null;
  web: string | null;
  mapa_embed_url: string | null;
  created_at: string;
  updated_at: string;
}

// Textos JSONB por página
export interface SitioTextos {
  id: string;
  sitio_id: string;
  pagina: string;
  textos: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SitioGaleria {
  id: string;
  sitio_id: string;
  url: string;
  titulo: string | null;
  descripcion: string | null;
  es_home: boolean;
  visible: boolean;
  orden: number;
  created_at: string;
}

export interface SitioFeature {
  id: string;
  sitio_id: string;
  titulo: string;
  descripcion: string | null;
  icono: string;
  orden: number;
  created_at: string;
}

export interface SitioReserva {
  id: string;
  sitio_id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fecha: string;
  hora: string;
  personas: number;
  servicio: string | null;
  notas: string | null;
  estado: EstadoReserva;
  created_at: string;
}

// ============================================
// TABLAS DE MENU (genéricas para cualquier tipo de sitio)
// ============================================

export interface SitioMenuCategoria {
  id: string;
  sitio_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
}

export interface SitioMenuItem {
  id: string;
  sitio_id: string;
  categoria_id: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  alergenos: string[] | null;
  disponible: boolean;
  destacado: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

// Aliases para compatibilidad (deprecated, usar SitioMenu*)
/** @deprecated Use SitioMenuCategoria instead */
export type RestauranteMenuCategoria = SitioMenuCategoria;
/** @deprecated Use SitioMenuItem instead */
export type RestauranteMenuItem = SitioMenuItem;

// ============================================
// TIPOS DE TEXTOS POR PÁGINA
// ============================================

export interface TextosInicio {
  btn_menu: string;
  btn_reservas: string;
  features_titulo: string;
  features_subtitulo: string;
  galeria_titulo: string;
  galeria_subtitulo: string;
  galeria_btn: string;
}

export interface TextosMenu {
  titulo: string;
  subtitulo: string;
  filtro_todos: string;
  sin_items: string;
}

export interface TextosGaleria {
  titulo: string;
  subtitulo: string;
}

export interface TextosReservas {
  titulo: string;
  subtitulo: string;
  exito_titulo: string;
  exito_mensaje: string;
  btn_confirmar: string;
  btn_enviando: string;
}

export interface TextosContacto {
  titulo: string;
  subtitulo: string;
  info_titulo: string;
  info_descripcion: string;
}

export interface TextosNav {
  nav_inicio: string;
  nav_menu: string;
  nav_galeria: string;
  nav_reservas: string;
  nav_contacto: string;
}

// ============================================
// TIPOS COMBINADOS PARA CARGAS COMPLETAS
// ============================================

export interface SitioCompleto {
  sitio: Sitio;
  config: SitioConfig;
  textos: {
    inicio: TextosInicio;
    menu: TextosMenu;
    galeria: TextosGaleria;
    reservas: TextosReservas;
    contacto: TextosContacto;
    nav: TextosNav;
  };
}

export interface RestauranteData {
  sitio: Sitio;
  config: SitioConfig;
  textos: {
    inicio: TextosInicio;
    menu: TextosMenu;
    galeria: TextosGaleria;
    reservas: TextosReservas;
    contacto: TextosContacto;
    nav: TextosNav;
  };
  categorias: SitioMenuCategoria[];
  menuItems: SitioMenuItem[];
  galeria: SitioGaleria[];
  galeriaHome: SitioGaleria[];
  features: SitioFeature[];
}

// ============================================
// TIPOS PARA INSERT (sin id ni timestamps)
// ============================================

export type SitioInsert = Omit<Sitio, 'id' | 'created_at' | 'updated_at'>;
export type SitioConfigInsert = Omit<SitioConfig, 'id' | 'created_at' | 'updated_at'>;
export type SitioTextosInsert = Omit<SitioTextos, 'id' | 'created_at' | 'updated_at'>;
export type SitioGaleriaInsert = Omit<SitioGaleria, 'id' | 'created_at'>;
export type SitioFeatureInsert = Omit<SitioFeature, 'id' | 'created_at'>;
export type SitioReservaInsert = Omit<SitioReserva, 'id' | 'created_at'>;
export type SitioMenuCategoriaInsert = Omit<SitioMenuCategoria, 'id' | 'created_at'>;
export type SitioMenuItemInsert = Omit<SitioMenuItem, 'id' | 'created_at' | 'updated_at'>;

// Aliases deprecated
/** @deprecated Use SitioMenuCategoriaInsert instead */
export type RestauranteMenuCategoriaInsert = SitioMenuCategoriaInsert;
/** @deprecated Use SitioMenuItemInsert instead */
export type RestauranteMenuItemInsert = SitioMenuItemInsert;

// ============================================
// TIPOS PARA UPDATE (parciales)
// ============================================

export type SitioUpdate = Partial<Omit<Sitio, 'id' | 'created_at'>>;
export type SitioConfigUpdate = Partial<Omit<SitioConfig, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioGaleriaUpdate = Partial<Omit<SitioGaleria, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioFeatureUpdate = Partial<Omit<SitioFeature, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioMenuCategoriaUpdate = Partial<Omit<SitioMenuCategoria, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioMenuItemUpdate = Partial<Omit<SitioMenuItem, 'id' | 'sitio_id' | 'created_at'>>;

// Aliases deprecated
/** @deprecated Use SitioMenuCategoriaUpdate instead */
export type RestauranteMenuCategoriaUpdate = SitioMenuCategoriaUpdate;
/** @deprecated Use SitioMenuItemUpdate instead */
export type RestauranteMenuItemUpdate = SitioMenuItemUpdate;

// ============================================
// TABLA INDEPENDIENTE (leads de marketing)
// ============================================

export interface ClientePotencial {
  id: number;
  nombre: string;
  email: string;
  tipo_negocio: string;
  mensaje: string | null;
  created_at: string;
}

export type ClientePotencialInsert = Omit<ClientePotencial, 'id' | 'created_at'>;

// ============================================
// DEFAULTS PARA TEXTOS
// ============================================

export const defaultTextosInicio: TextosInicio = {
  btn_menu: 'Ver Menú',
  btn_reservas: 'Reservar Mesa',
  features_titulo: 'Por Qué Elegirnos',
  features_subtitulo: 'Comprometidos con la excelencia en cada detalle',
  galeria_titulo: 'Ambiente Único',
  galeria_subtitulo: 'Un espacio diseñado para crear momentos memorables',
  galeria_btn: 'Ver Galería Completa'
};

export const defaultTextosMenu: TextosMenu = {
  titulo: 'Nuestro Menú',
  subtitulo: 'Descubre nuestra selección de platos',
  filtro_todos: 'Todos',
  sin_items: 'No hay items en esta categoría'
};

export const defaultTextosGaleria: TextosGaleria = {
  titulo: 'Galería',
  subtitulo: 'Déjate inspirar por nuestros platos'
};

export const defaultTextosReservas: TextosReservas = {
  titulo: 'Reserva tu Mesa',
  subtitulo: 'Asegura tu lugar para una experiencia única',
  exito_titulo: '¡Reserva Confirmada!',
  exito_mensaje: 'Te enviaremos un email de confirmación',
  btn_confirmar: 'Confirmar Reserva',
  btn_enviando: 'Enviando...'
};

export const defaultTextosContacto: TextosContacto = {
  titulo: 'Contacto',
  subtitulo: 'Estamos aquí para atenderte',
  info_titulo: 'Cómo Llegar',
  info_descripcion: 'Ubicados en pleno corazón de la ciudad'
};

export const defaultTextosNav: TextosNav = {
  nav_inicio: 'Inicio',
  nav_menu: 'Menu',
  nav_galeria: 'Galeria',
  nav_reservas: 'Reservar',
  nav_contacto: 'Contacto'
};
