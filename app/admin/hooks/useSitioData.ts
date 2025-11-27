'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Sitio,
  SitioConfig,
  SitioTextos,
  SitioMenuCategoria,
  SitioMenuItem,
  SitioGaleria,
  SitioFeature
} from '@/lib/database.types';

// Tipo para el formulario de restaurante
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

// Valores por defecto del formulario
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

// Interface para el estado del hook
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

// Interface para las acciones del hook
export interface SitioDataActions {
  loadAllData: () => Promise<void>;
  setFormRestaurante: React.Dispatch<React.SetStateAction<FormRestaurante>>;
  setCategorias: React.Dispatch<React.SetStateAction<SitioMenuCategoria[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<SitioMenuItem[]>>;
  setGaleria: React.Dispatch<React.SetStateAction<SitioGaleria[]>>;
  setFeatures: React.Dispatch<React.SetStateAction<SitioFeature[]>>;
  saveRestaurante: (updatedData?: { galeria?: SitioGaleria[]; menuItems?: SitioMenuItem[] }) => Promise<boolean>;
  addCategoria: (nombre: string) => Promise<boolean>;
  addMenuItem: (categoriaId: string) => Promise<boolean>;
  updateMenuItem: (id: string, field: string, value: string | number | boolean) => void;
  deleteMenuItem: (id: string) => Promise<boolean>;
  addGaleriaItem: (url: string) => Promise<string | null>;
  toggleGaleriaHome: (id: string, current: boolean) => void;
  toggleGaleriaVisible: (id: string, current: boolean) => void;
  updateGaleriaItem: (id: string, field: string, value: string) => void;
  deleteGaleriaItem: (id: string) => Promise<boolean>;
  addFeature: () => Promise<boolean>;
  updateFeature: (id: string, field: string, value: string) => void;
  deleteFeature: (id: string) => Promise<boolean>;
}

export type UseSitioDataReturn = SitioDataState & SitioDataActions;

export function useSitioData(): UseSitioDataReturn {
  // Estados principales
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [sitioConfig, setSitioConfig] = useState<SitioConfig | null>(null);
  const [sitioTextos, setSitioTextos] = useState<Record<string, Record<string, string>>>({});
  const [categorias, setCategorias] = useState<SitioMenuCategoria[]>([]);
  const [menuItems, setMenuItems] = useState<SitioMenuItem[]>([]);
  const [galeria, setGaleria] = useState<SitioGaleria[]>([]);
  const [features, setFeatures] = useState<SitioFeature[]>([]);
  const [formRestaurante, setFormRestaurante] = useState<FormRestaurante>(defaultFormRestaurante);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar sitio activo
      const { data: sitioData, error: sitioError } = await supabase
        .from('sitios')
        .select('*')
        .eq('activo', true)
        .limit(1)
        .single();

      if (sitioError && sitioError.code !== 'PGRST116') {
        throw sitioError;
      }

      if (sitioData) {
        setSitio(sitioData);

        // Cargar config y textos del sitio en paralelo
        const [configRes, textosRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitioData.id).single(),
          supabase.from('sitio_textos').select('*').eq('sitio_id', sitioData.id)
        ]);

        const config = configRes.data;
        if (config) {
          setSitioConfig(config);
        }

        // Organizar textos por pagina
        const textosMap: Record<string, Record<string, string>> = {};
        if (textosRes.data) {
          textosRes.data.forEach((t: SitioTextos) => {
            textosMap[t.pagina] = t.textos;
          });
        }
        setSitioTextos(textosMap);

        // Mapear a formRestaurante
        const inicioTextos = textosMap['inicio'] || {};
        const menuTextos = textosMap['menu'] || {};
        const galeriaTextos = textosMap['galeria'] || {};
        const reservasTextos = textosMap['reservas'] || {};
        const contactoTextos = textosMap['contacto'] || {};

        setFormRestaurante({
          nombre: config?.nombre || '',
          tagline: config?.tagline || '',
          descripcion: config?.descripcion || '',
          inicio_btn_menu: inicioTextos.btn_menu || 'Ver Menu',
          inicio_btn_reservas: inicioTextos.btn_reservas || 'Reservar Mesa',
          inicio_features_titulo: inicioTextos.features_titulo || 'Por Que Elegirnos',
          inicio_features_subtitulo: inicioTextos.features_subtitulo || 'Comprometidos con la excelencia en cada detalle',
          inicio_galeria_titulo: inicioTextos.galeria_titulo || 'Ambiente Unico',
          inicio_galeria_subtitulo: inicioTextos.galeria_subtitulo || 'Un espacio diseñado para crear momentos memorables',
          inicio_galeria_btn: inicioTextos.galeria_btn || 'Ver Galeria Completa',
          menu_titulo: menuTextos.titulo || 'Nuestro Menú',
          menu_subtitulo: menuTextos.subtitulo || 'Descubre una selección de platos elaborados con ingredientes frescos y de temporada',
          menu_filtro_todos: menuTextos.filtro_todos || 'Todos',
          menu_sin_items: menuTextos.sin_items || 'No hay items en esta categoria',
          galeria_titulo: galeriaTextos.titulo || 'Galería',
          galeria_subtitulo: galeriaTextos.subtitulo || 'Déjate inspirar por nuestros platos y ambiente',
          reservas_titulo: reservasTextos.titulo || 'Reserva tu Mesa',
          reservas_subtitulo: reservasTextos.subtitulo || 'Asegura tu lugar en una experiencia culinaria excepcional',
          reservas_exito_titulo: reservasTextos.exito_titulo || '¡Reserva Confirmada!',
          reservas_exito_mensaje: reservasTextos.exito_mensaje || 'Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.',
          reservas_btn_confirmar: reservasTextos.btn_confirmar || 'Confirmar Reserva',
          reservas_btn_enviando: reservasTextos.btn_enviando || 'Enviando...',
          contacto_titulo: contactoTextos.titulo || 'Contacto',
          contacto_subtitulo: contactoTextos.subtitulo || 'Estamos aquí para atenderte y hacer de tu visita una experiencia memorable',
          telefono: config?.telefono || '',
          telefono_secundario: config?.telefono_secundario || '',
          email: config?.email || '',
          email_reservas: config?.email_secundario || '',
          direccion_calle: config?.direccion_calle || '',
          direccion_ciudad: config?.direccion_ciudad || '',
          direccion_cp: config?.direccion_cp || '',
          direccion_pais: config?.direccion_pais || '',
          horario_semana: config?.horario_semana || '',
          horario_finde: config?.horario_finde || '',
          instagram: config?.instagram || '',
          facebook: config?.facebook || '',
          twitter: config?.twitter || '',
          mapa_embed_url: config?.mapa_embed_url || '',
          contacto_info_titulo: contactoTextos.info_titulo || 'Cómo Llegar',
          contacto_info_descripcion: contactoTextos.info_descripcion || 'Ubicados en pleno corazón de la ciudad, cerca de las principales estaciones de transporte público.'
        });

        // Cargar datos especificos del restaurante en paralelo
        const [catRes, itemsRes, galRes, featRes] = await Promise.all([
          supabase.from('sitio_menu_categorias').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_menu_items').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_galeria').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_features').select('*').eq('sitio_id', sitioData.id).order('orden')
        ]);

        setCategorias(catRes.data || []);
        setMenuItems(itemsRes.data || []);
        setGaleria(galRes.data || []);
        setFeatures(featRes.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar restaurante (acepta datos actualizados opcionales para evitar problemas de closure)
  const saveRestaurante = useCallback(async (updatedData?: {
    galeria?: SitioGaleria[];
    menuItems?: SitioMenuItem[];
  }): Promise<boolean> => {
    if (!sitio) return false;

    // Usar datos actualizados si se proporcionan, sino usar el estado actual
    const galeriaToSave = updatedData?.galeria ?? galeria;
    const menuItemsToSave = updatedData?.menuItems ?? menuItems;

    try {
      // Actualizar sitio_config
      const configData = {
        nombre: formRestaurante.nombre,
        tagline: formRestaurante.tagline,
        descripcion: formRestaurante.descripcion,
        telefono: formRestaurante.telefono,
        telefono_secundario: formRestaurante.telefono_secundario,
        email: formRestaurante.email,
        email_secundario: formRestaurante.email_reservas,
        direccion_calle: formRestaurante.direccion_calle,
        direccion_ciudad: formRestaurante.direccion_ciudad,
        direccion_cp: formRestaurante.direccion_cp,
        direccion_pais: formRestaurante.direccion_pais,
        horario_semana: formRestaurante.horario_semana,
        horario_finde: formRestaurante.horario_finde,
        instagram: formRestaurante.instagram,
        facebook: formRestaurante.facebook,
        twitter: formRestaurante.twitter,
        mapa_embed_url: formRestaurante.mapa_embed_url
      };

      await supabase
        .from('sitio_config')
        .update(configData)
        .eq('sitio_id', sitio.id);

      // Preparar textos por pagina
      const textosUpdates = [
        {
          pagina: 'inicio',
          textos: {
            btn_menu: formRestaurante.inicio_btn_menu,
            btn_reservas: formRestaurante.inicio_btn_reservas,
            features_titulo: formRestaurante.inicio_features_titulo,
            features_subtitulo: formRestaurante.inicio_features_subtitulo,
            galeria_titulo: formRestaurante.inicio_galeria_titulo,
            galeria_subtitulo: formRestaurante.inicio_galeria_subtitulo,
            galeria_btn: formRestaurante.inicio_galeria_btn
          }
        },
        {
          pagina: 'menu',
          textos: {
            titulo: formRestaurante.menu_titulo,
            subtitulo: formRestaurante.menu_subtitulo,
            filtro_todos: formRestaurante.menu_filtro_todos,
            sin_items: formRestaurante.menu_sin_items
          }
        },
        {
          pagina: 'galeria',
          textos: {
            titulo: formRestaurante.galeria_titulo,
            subtitulo: formRestaurante.galeria_subtitulo
          }
        },
        {
          pagina: 'reservas',
          textos: {
            titulo: formRestaurante.reservas_titulo,
            subtitulo: formRestaurante.reservas_subtitulo,
            exito_titulo: formRestaurante.reservas_exito_titulo,
            exito_mensaje: formRestaurante.reservas_exito_mensaje,
            btn_confirmar: formRestaurante.reservas_btn_confirmar,
            btn_enviando: formRestaurante.reservas_btn_enviando
          }
        },
        {
          pagina: 'contacto',
          textos: {
            titulo: formRestaurante.contacto_titulo,
            subtitulo: formRestaurante.contacto_subtitulo,
            info_titulo: formRestaurante.contacto_info_titulo,
            info_descripcion: formRestaurante.contacto_info_descripcion
          }
        }
      ];

      // Guardar textos (upsert) en paralelo
      await Promise.all(textosUpdates.map(textoData =>
        supabase
          .from('sitio_textos')
          .upsert({
            sitio_id: sitio.id,
            pagina: textoData.pagina,
            textos: textoData.textos
          }, {
            onConflict: 'sitio_id,pagina'
          })
      ));

      // Guardar items del menu en paralelo
      await Promise.all(menuItemsToSave.map(item =>
        supabase
          .from('sitio_menu_items')
          .update({
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: item.precio,
            imagen_url: item.imagen_url,
            disponible: item.disponible,
            destacado: item.destacado,
            orden: item.orden
          })
          .eq('id', item.id)
      ));

      // Guardar items de galeria en paralelo
      await Promise.all(galeriaToSave.map(item =>
        supabase
          .from('sitio_galeria')
          .update({
            url: item.url,
            titulo: item.titulo,
            descripcion: item.descripcion,
            es_home: item.es_home,
            visible: item.visible,
            orden: item.orden
          })
          .eq('id', item.id)
      ));

      // Guardar features en paralelo
      await Promise.all(features.map(feature =>
        supabase
          .from('sitio_features')
          .update({
            titulo: feature.titulo,
            descripcion: feature.descripcion,
            icono: feature.icono,
            orden: feature.orden
          })
          .eq('id', feature.id)
      ));

      return true;
    } catch (err) {
      console.error('Error saving:', err);
      return false;
    }
  }, [sitio, formRestaurante, menuItems, galeria, features]);

  // === CRUD Categorias ===
  const addCategoria = useCallback(async (nombre: string): Promise<boolean> => {
    if (!sitio || !nombre) return false;

    try {
      const { error } = await supabase.from('sitio_menu_categorias').insert({
        sitio_id: sitio.id,
        nombre,
        orden: categorias.length
      });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Error creating categoria:', err);
      return false;
    }
  }, [sitio, categorias.length, loadAllData]);

  // === CRUD Menu Items ===
  const addMenuItem = useCallback(async (categoriaId: string): Promise<boolean> => {
    if (!sitio) return false;

    try {
      const { error } = await supabase.from('sitio_menu_items').insert({
        sitio_id: sitio.id,
        categoria_id: categoriaId,
        nombre: 'Nuevo plato',
        precio: 0,
        disponible: true,
        destacado: false,
        alergenos: [],
        orden: menuItems.filter(i => i.categoria_id === categoriaId).length
      });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Error creating menu item:', err);
      return false;
    }
  }, [sitio, menuItems, loadAllData]);

  const updateMenuItem = useCallback((id: string, field: string, value: string | number | boolean) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const deleteMenuItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Actualizar estado local inmediatamente
      setMenuItems(prev => prev.filter(item => item.id !== id));
      // Borrar de la BD
      const { error } = await supabase.from('sitio_menu_items').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      // En caso de error, recargar para restaurar estado correcto
      await loadAllData();
      return false;
    }
  }, [loadAllData]);

  // === CRUD Galeria ===
  const addGaleriaItem = useCallback(async (url: string): Promise<string | null> => {
    if (!sitio || !url) return null;

    try {
      const { data, error } = await supabase.from('sitio_galeria').insert({
        sitio_id: sitio.id,
        url,
        es_home: false,
        visible: true,
        orden: galeria.length
      }).select('id').single();
      if (error) throw error;

      // Actualizar estado local con el nuevo item
      if (data) {
        setGaleria(prev => [...prev, {
          id: data.id,
          sitio_id: sitio.id,
          url,
          titulo: null,
          descripcion: null,
          es_home: false,
          visible: true,
          orden: galeria.length,
          created_at: new Date().toISOString()
        }]);
        return data.id;
      }
      return null;
    } catch (err) {
      console.error('Error adding galeria item:', err);
      return null;
    }
  }, [sitio, galeria.length]);

  const toggleGaleriaHome = useCallback((id: string, current: boolean) => {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, es_home: !current } : g));
  }, []);

  const toggleGaleriaVisible = useCallback((id: string, current: boolean) => {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, visible: !current } : g));
  }, []);

  const updateGaleriaItem = useCallback((id: string, field: string, value: string) => {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  }, []);

  const deleteGaleriaItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Actualizar estado local inmediatamente
      setGaleria(prev => prev.filter(g => g.id !== id));
      // Borrar de la BD
      const { error } = await supabase.from('sitio_galeria').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting galeria item:', err);
      // En caso de error, recargar para restaurar estado correcto
      await loadAllData();
      return false;
    }
  }, [loadAllData]);

  // === CRUD Features ===
  const addFeature = useCallback(async (): Promise<boolean> => {
    if (!sitio) return false;

    try {
      const { error } = await supabase.from('sitio_features').insert({
        sitio_id: sitio.id,
        titulo: 'Nueva caracteristica',
        icono: 'Star',
        orden: features.length
      });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Error creating feature:', err);
      return false;
    }
  }, [sitio, features.length, loadAllData]);

  const updateFeature = useCallback((id: string, field: string, value: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }, []);

  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Actualizar estado local inmediatamente
      setFeatures(prev => prev.filter(f => f.id !== id));
      // Borrar de la BD
      const { error } = await supabase.from('sitio_features').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting feature:', err);
      // En caso de error, recargar para restaurar estado correcto
      await loadAllData();
      return false;
    }
  }, [loadAllData]);

  // Cargar datos al montar
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Estado
    sitio,
    sitioConfig,
    sitioTextos,
    categorias,
    menuItems,
    galeria,
    features,
    formRestaurante,
    loading,
    error,
    // Acciones
    loadAllData,
    setFormRestaurante,
    setCategorias,
    setMenuItems,
    setGaleria,
    setFeatures,
    saveRestaurante,
    addCategoria,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addGaleriaItem,
    toggleGaleriaHome,
    toggleGaleriaVisible,
    updateGaleriaItem,
    deleteGaleriaItem,
    addFeature,
    updateFeature,
    deleteFeature
  };
}
