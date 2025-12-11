'use client';

import type {
  Sitio,
  SitioConfig,
  SitioMenuCategoria,
  SitioMenuItem,
  SitioGaleria,
  SitioFeature
} from '@/lib/database.types';

// ===== FORM RESTAURANTE =====

export interface FormRestaurante {
  // Inicio - Hero
  nombre: string;
  tagline: string;
  descripcion: string;
  inicio_btn_menu: string;
  inicio_btn_reservas: string;
  // Inicio - Seccion Features
  inicio_features_titulo: string;
  inicio_features_subtitulo: string;
  // Inicio - Seccion Galeria
  inicio_galeria_titulo: string;
  inicio_galeria_subtitulo: string;
  inicio_galeria_btn: string;
  // Nav
  nav_inicio: string;
  nav_menu: string;
  nav_galeria: string;
  nav_reservas: string;
  nav_contacto: string;
  // Menu
  menu_titulo: string;
  menu_subtitulo: string;
  menu_filtro_todos: string;
  menu_sin_items: string;
  // Galeria
  galeria_titulo: string;
  galeria_subtitulo: string;
  // Reservas
  reservas_titulo: string;
  reservas_subtitulo: string;
  reservas_exito_titulo: string;
  reservas_exito_mensaje: string;
  reservas_btn_confirmar: string;
  reservas_btn_enviando: string;
  // Contacto
  contacto_titulo: string;
  contacto_subtitulo: string;
  telefono: string;
  telefono_secundario: string;
  email: string;
  email_reservas: string;
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

export const defaultFormRestaurante: FormRestaurante = {
  nombre: '',
  tagline: '',
  descripcion: '',
  inicio_btn_menu: 'Ver Menu',
  inicio_btn_reservas: 'Reservar Mesa',
  inicio_features_titulo: 'Por Que Elegirnos',
  inicio_features_subtitulo: 'Comprometidos con la excelencia en cada detalle',
  inicio_galeria_titulo: 'Ambiente Unico',
  inicio_galeria_subtitulo: 'Un espacio diseñado para crear momentos memorables',
  inicio_galeria_btn: 'Ver Galeria Completa',
  nav_inicio: 'Inicio',
  nav_menu: 'Menu',
  nav_galeria: 'Galeria',
  nav_reservas: 'Reservar',
  nav_contacto: 'Contacto',
  menu_titulo: 'Nuestro Menú',
  menu_subtitulo: 'Descubre una selección de platos elaborados con ingredientes frescos y de temporada',
  menu_filtro_todos: 'Todos',
  menu_sin_items: 'No hay items en esta categoria',
  galeria_titulo: 'Galería',
  galeria_subtitulo: 'Déjate inspirar por nuestros platos y ambiente',
  reservas_titulo: 'Reserva tu Mesa',
  reservas_subtitulo: 'Asegura tu lugar en una experiencia culinaria excepcional',
  reservas_exito_titulo: '¡Reserva Confirmada!',
  reservas_exito_mensaje: 'Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.',
  reservas_btn_confirmar: 'Confirmar Reserva',
  reservas_btn_enviando: 'Enviando...',
  contacto_titulo: 'Contacto',
  contacto_subtitulo: 'Estamos aquí para atenderte y hacer de tu visita una experiencia memorable',
  telefono: '',
  telefono_secundario: '',
  email: '',
  email_reservas: '',
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
  categorias: SitioMenuCategoria[];
  menuItems: SitioMenuItem[];
  galeria: SitioGaleria[];
  features: SitioFeature[];
  formRestaurante: FormRestaurante;
  loading: boolean;
  error: string | null;
}

// ===== ACTIONS INTERFACES =====

export interface MenuItemsActions {
  addCategoria: (nombre: string) => Promise<boolean>;
  addMenuItem: (categoriaId: string) => Promise<boolean>;
  updateMenuItem: (id: string, field: string, value: string | number | boolean) => void;
  deleteMenuItem: (id: string) => Promise<boolean>;
  setCategorias: React.Dispatch<React.SetStateAction<SitioMenuCategoria[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<SitioMenuItem[]>>;
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

export interface SitioDataActions extends MenuItemsActions, GaleriaActions, FeaturesActions {
  loadAllData: () => Promise<void>;
  setFormRestaurante: React.Dispatch<React.SetStateAction<FormRestaurante>>;
  saveRestaurante: (updatedData?: { galeria?: SitioGaleria[]; menuItems?: SitioMenuItem[] }) => Promise<boolean>;
}

export type UseSitioDataReturn = SitioDataState & SitioDataActions;
