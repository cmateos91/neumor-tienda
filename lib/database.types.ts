// ============================================
// Tipos para el sistema multi-plantilla v2
// ============================================

// Tipos de plantillas disponibles
export type TipoPlantilla = 'tienda' | 'gimnasio' | 'hotel' | 'peluqueria' | 'clinica';

// Estados de pedido
export type EstadoPedido = 'pendiente' | 'confirmado' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';

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
  page_layout: any | null; // PageLayout del Page Builder
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

export interface SitioPedido {
  id: string;
  sitio_id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion_envio: string | null;
  items: any; // JSONB con array de productos
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
  metodo_pago: string | null;
  notas: string | null;
  estado: EstadoPedido;
  created_at: string;
  updated_at: string;
}

// ============================================
// TABLAS DE PRODUCTOS (para tiendas)
// ============================================

export interface SitioProductoCategoria {
  id: string;
  sitio_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
}

export interface SitioProduct {
  id: string;
  sitio_id: string;
  categoria_id: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  stock: number;
  sku: string | null;
  disponible: boolean;
  destacado: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

// Aliases para compatibilidad
export type SitioProductCategoria = SitioProductoCategoria;
/** @deprecated Use SitioProduct instead */
export type TiendaProduct = SitioProduct;

// ============================================
// TIPOS DE TEXTOS POR PÁGINA
// ============================================

export interface TextosInicio {
  btn_productos: string;
  btn_pedidos: string;
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

export interface TextosPedidos {
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
  nav_productos: string;
  nav_galeria: string;
  nav_pedidos: string;
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
    productos: TextosMenu;
    galeria: TextosGaleria;
    pedidos: TextosPedidos;
    contacto: TextosContacto;
    nav: TextosNav;
  };
}

export interface TiendaData {
  sitio: Sitio;
  config: SitioConfig;
  textos: {
    inicio: TextosInicio;
    productos: TextosMenu;
    galeria: TextosGaleria;
    pedidos: TextosPedidos;
    contacto: TextosContacto;
    nav: TextosNav;
  };
  categorias: SitioProductoCategoria[];
  productos: SitioProduct[];
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
export type SitioPedidoInsert = Omit<SitioPedido, 'id' | 'created_at'>;
export type SitioProductoCategoriaInsert = Omit<SitioProductoCategoria, 'id' | 'created_at'>;
export type SitioProductInsert = Omit<SitioProduct, 'id' | 'created_at' | 'updated_at'>;

// Aliases deprecated
/** @deprecated Use SitioProductoCategoriaInsert instead */
export type TiendaMenuCategoriaInsert = SitioProductoCategoriaInsert;
/** @deprecated Use SitioProductInsert instead */
export type TiendaProductInsert = SitioProductInsert;

// ============================================
// TIPOS PARA UPDATE (parciales)
// ============================================

export type SitioUpdate = Partial<Omit<Sitio, 'id' | 'created_at'>>;
export type SitioConfigUpdate = Partial<Omit<SitioConfig, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioGaleriaUpdate = Partial<Omit<SitioGaleria, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioFeatureUpdate = Partial<Omit<SitioFeature, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioProductoCategoriaUpdate = Partial<Omit<SitioProductoCategoria, 'id' | 'sitio_id' | 'created_at'>>;
export type SitioProductUpdate = Partial<Omit<SitioProduct, 'id' | 'sitio_id' | 'created_at'>>;

// Aliases deprecated
/** @deprecated Use SitioProductoCategoriaUpdate instead */
export type TiendaMenuCategoriaUpdate = SitioProductoCategoriaUpdate;
/** @deprecated Use SitioProductUpdate instead */
export type TiendaProductUpdate = SitioProductUpdate;

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
  btn_productos: 'Ver Catálogo',
  btn_pedidos: 'Hacer Pedido',
  features_titulo: 'Por Qué Comprar con Nosotros',
  features_subtitulo: 'Calidad y servicio excepcional en cada compra',
  galeria_titulo: 'Nuestros Productos Destacados',
  galeria_subtitulo: 'Descubre nuestra selección de productos premium',
  galeria_btn: 'Ver Todos los Productos'
};

export const defaultTextosMenu: TextosMenu = {
  titulo: 'Nuestros Productos',
  subtitulo: 'Descubre nuestra selección de productos de calidad',
  filtro_todos: 'Todos',
  sin_items: 'No hay productos en esta categoría'
};

export const defaultTextosGaleria: TextosGaleria = {
  titulo: 'Galería de Productos',
  subtitulo: 'Explora nuestro catálogo visual'
};

export const defaultTextosPedidos: TextosPedidos = {
  titulo: 'Realizar Pedido',
  subtitulo: 'Completa tu compra de forma rápida y segura',
  exito_titulo: '¡Pedido Confirmado!',
  exito_mensaje: 'Recibirás un email con los detalles de tu compra',
  btn_confirmar: 'Confirmar Pedido',
  btn_enviando: 'Procesando...'
};

export const defaultTextosContacto: TextosContacto = {
  titulo: 'Contacto',
  subtitulo: 'Estamos aquí para atenderte',
  info_titulo: 'Cómo Llegar',
  info_descripcion: 'Ubicados en pleno corazón de la ciudad'
};

export const defaultTextosNav: TextosNav = {
  nav_inicio: 'Inicio',
  nav_productos: 'Productos',
  nav_galeria: 'Galería',
  nav_pedidos: 'Carrito',
  nav_contacto: 'Contacto'
};
