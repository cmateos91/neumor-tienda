'use client';

import type {
  Sitio,
  SitioConfig,
  SitioProductoCategoria,
  SitioProduct,
  SitioGaleria,
  SitioFeature
} from '@/lib/database.types';
import type { PageSection } from '@/lib/page-builder.types';

// ===== FORM TIENDA =====

export interface FormTienda {
  // Inicio - Hero
  nombre: string;
  tagline: string;
  descripcion: string;
  inicio_btn_productos: string;
  inicio_btn_pedidos: string;
  // Inicio - Seccion Features
  inicio_features_titulo: string;
  inicio_features_subtitulo: string;
  // Inicio - Seccion Galeria
  inicio_galeria_titulo: string;
  inicio_galeria_subtitulo: string;
  inicio_galeria_btn: string;
  // Nav
  nav_inicio: string;
  nav_productos: string;
  nav_galeria: string;
  nav_pedidos: string;
  nav_contacto: string;
  // Productos
  productos_titulo: string;
  productos_subtitulo: string;
  productos_filtro_todos: string;
  productos_sin_items: string;
  // Galeria
  galeria_titulo: string;
  galeria_subtitulo: string;
  // Pedidos
  pedidos_titulo: string;
  pedidos_subtitulo: string;
  pedidos_exito_titulo: string;
  pedidos_exito_mensaje: string;
  pedidos_btn_confirmar: string;
  pedidos_btn_enviando: string;
  // Contacto
  contacto_titulo: string;
  contacto_subtitulo: string;
  telefono: string;
  telefono_secundario: string;
  email: string;
  email_pedidos: string;
  direccion_calle: string;
  direccion_ciudad: string;
  direccion_cp: string;
  direccion_pais: string;
  horario_semana: string;
  horario_finde: string;
  instagram: string;
  facebook: string;
  twitter: string;
  mapa_embed_url: string;
  contacto_info_titulo: string;
  contacto_info_descripcion: string;
}

export const defaultFormTienda: FormTienda = {
  nombre: '',
  tagline: '',
  descripcion: '',
  inicio_btn_productos: 'Ver Productos',
  inicio_btn_pedidos: 'Hacer Pedido',
  inicio_features_titulo: 'Por Que Elegirnos',
  inicio_features_subtitulo: 'Comprometidos con la excelencia en cada detalle',
  inicio_galeria_titulo: 'Ambiente Unico',
  inicio_galeria_subtitulo: 'Un espacio diseñado para crear momentos memorables',
  inicio_galeria_btn: 'Ver Galeria Completa',
  nav_inicio: 'Inicio',
  nav_productos: 'Productos',
  nav_galeria: 'Galeria',
  nav_pedidos: 'Pedidor',
  nav_contacto: 'Contacto',
  productos_titulo: 'Nuestros Productos',
  productos_subtitulo: 'Descubre nuestra selección de productos de calidad',
  productos_filtro_todos: 'Todos',
  productos_sin_items: 'No hay items en esta categoria',
  galeria_titulo: 'Galería',
  galeria_subtitulo: 'Déjate inspirar por nuestros platos y ambiente',
  pedidos_titulo: 'Pedido tu Mesa',
  pedidos_subtitulo: 'Asegura tu lugar en una experiencia culinaria excepcional',
  pedidos_exito_titulo: '¡Pedido Confirmada!',
  pedidos_exito_mensaje: 'Hemos recibido tu pedido. Te enviaremos un email de confirmación pronto.',
  pedidos_btn_confirmar: 'Confirmar Pedido',
  pedidos_btn_enviando: 'Enviando...',
  contacto_titulo: 'Contacto',
  contacto_subtitulo: 'Estamos aquí para atenderte y hacer de tu visita una experiencia memorable',
  telefono: '',
  telefono_secundario: '',
  email: '',
  email_pedidos: '',
  direccion_calle: '',
  direccion_ciudad: '',
  direccion_cp: '',
  direccion_pais: '',
  horario_semana: '',
  horario_finde: '',
  instagram: '',
  facebook: '',
  twitter: '',
  mapa_embed_url: '',
  contacto_info_titulo: 'Cómo Llegar',
  contacto_info_descripcion: 'Ubicados en pleno corazón de la ciudad, cerca de las principales estaciones de transporte público.'
};

// ===== STATE INTERFACES =====

export interface SitioDataState {
  sitio: Sitio | null;
  sitioConfig: SitioConfig | null;
  sitioTextos: Record<string, Record<string, string>>;
  categorias: SitioProductoCategoria[];
  productos: SitioProduct[];
  galeria: SitioGaleria[];
  features: SitioFeature[];
  formTienda: FormTienda;
  pageLayout: PageSection[] | null;
  loading: boolean;
  error: string | null;
}

// ===== ACTIONS INTERFACES =====

export interface ProductsActions {
  addCategoria: (nombre: string) => Promise<boolean>;
  addProduct: (categoriaId: string) => Promise<boolean>;
  updateProduct: (id: string, field: string, value: string | number | boolean) => void;
  deleteProduct: (id: string) => Promise<boolean>;
  setCategorias: React.Dispatch<React.SetStateAction<SitioProductoCategoria[]>>;
  setProducts: React.Dispatch<React.SetStateAction<SitioProduct[]>>;
}

export interface GaleriaActions {
  addGaleriaItem: (url: string) => Promise<string | null>;
  toggleGaleriaHome: (id: string, current: boolean) => void;
  toggleGaleriaVisible: (id: string, current: boolean) => void;
  updateGaleriaItem: (id: string, field: string, value: string) => void;
  deleteGaleriaItem: (id: string) => Promise<boolean>;
  setGaleria: React.Dispatch<React.SetStateAction<SitioGaleria[]>>;
}

export interface FeaturesActions {
  addFeature: () => Promise<boolean>;
  updateFeature: (id: string, field: string, value: string) => void;
  deleteFeature: (id: string) => Promise<boolean>;
  setFeatures: React.Dispatch<React.SetStateAction<SitioFeature[]>>;
}

export interface SitioDataActions extends ProductsActions, GaleriaActions, FeaturesActions {
  loadAllData: () => Promise<void>;
  setFormTienda: React.Dispatch<React.SetStateAction<FormTienda>>;
  setPageLayout: React.Dispatch<React.SetStateAction<PageSection[] | null>>;
  saveTienda: (updatedData?: { galeria?: SitioGaleria[]; productos?: SitioProduct[]; pageLayout?: PageSection[] }) => Promise<boolean>;
}

export type UseSitioDataReturn = SitioDataState & SitioDataActions;
