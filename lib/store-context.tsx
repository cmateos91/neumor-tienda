'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import {
  SitioConfig,
  SitioProductoCategoria,
  SitioProduct,
  SitioGaleria,
  SitioFeature,
  TextosInicio,
  TextosMenu,
  TextosGaleria,
  TextosPedidos,
  TextosContacto,
  TextosNav,
  defaultTextosInicio,
  defaultTextosMenu,
  defaultTextosGaleria,
  defaultTextosPedidos,
  defaultTextosContacto,
  defaultTextosNav
} from './database.types';
import { PageSection, defaultHomeLayout } from './page-builder.types';

// Tipos para el contexto
interface StoreTextos {
  inicio: TextosInicio;
  menu: TextosMenu;
  galeria: TextosGaleria;
  pedidos: TextosPedidos;
  contacto: TextosContacto;
  nav: TextosNav;
}

interface StoreData {
  sitioId: string | null;
  config: SitioConfig | null;
  textos: StoreTextos;
  categorias: SitioProductoCategoria[];
  productos: SitioProduct[];
  galeria: SitioGaleria[];
  galeriaHome: SitioGaleria[];
  features: SitioFeature[];
  pageLayout: PageSection[];
}

interface StoreContextValue extends StoreData {
  loading: boolean;
  error: string | null;
  // Funciones para actualizar desde el admin (preview en tiempo real)
  updateConfig: (data: Partial<SitioConfig>) => void;
  updateTextos: (pagina: keyof StoreTextos, textos: Partial<StoreTextos[keyof StoreTextos]>) => void;
  updateMenu: (categorias: SitioProductoCategoria[], items: SitioProduct[]) => void;
  updateGaleria: (items: SitioGaleria[]) => void;
  updateFeatures: (items: SitioFeature[]) => void;
}

// Valores por defecto
const defaultTextos: StoreTextos = {
  inicio: defaultTextosInicio,
  menu: defaultTextosMenu,
  galeria: defaultTextosGaleria,
  pedidos: defaultTextosPedidos,
  contacto: defaultTextosContacto,
  nav: defaultTextosNav
};

const defaultContextValue: StoreContextValue = {
  sitioId: null,
  config: null,
  textos: defaultTextos,
  categorias: [],
  productos: [],
  galeria: [],
  galeriaHome: [],
  features: [],
  pageLayout: defaultHomeLayout.sections,
  loading: true,
  error: null,
  updateConfig: () => {},
  updateTextos: () => {},
  updateMenu: () => {},
  updateGaleria: () => {},
  updateFeatures: () => {}
};

// Crear el contexto
const StoreContext = createContext<StoreContextValue>(defaultContextValue);

// Hook para usar el contexto
export function useRestaurant() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRestaurant debe usarse dentro de StoreProvider');
  }
  return context;
}

// Provider del contexto
interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [data, setData] = useState<StoreData>({
    sitioId: null,
    config: null,
    textos: defaultTextos,
    categorias: [],
    productos: [],
    galeria: [],
    galeriaHome: [],
    features: [],
    pageLayout: defaultHomeLayout.sections
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los datos al inicio
  useEffect(() => {
    async function loadAllData() {
      try {
        // 1. Obtener sitio según SLUG
        const slug = process.env.NEXT_PUBLIC_SITIO_SLUG;
        console.log('[StoreContext] Buscando sitio con slug:', slug);

        let query = supabase.from('sitios').select('id');

        if (slug) {
          query = query.eq('slug', slug);
        } else {
          console.warn('[StoreContext] No hay NEXT_PUBLIC_SITIO_SLUG, usando primer sitio activo');
          query = query.eq('activo', true).limit(1);
        }

        const { data: sitio, error: sitioError } = await query.single();

        if (sitioError || !sitio) {
          console.error('[StoreContext] Error cargando sitio:', sitioError);
          setLoading(false);
          return;
        }

        console.log('[StoreContext] Sitio cargado, ID:', sitio.id);

        // 2. Cargar todo en paralelo
        const [configRes, textosRes, categoriasRes, itemsRes, galeriaRes, featuresRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitio.id).single(),
          supabase.from('sitio_textos').select('pagina, textos').eq('sitio_id', sitio.id),
          supabase.from('sitio_producto_categorias').select('*').eq('sitio_id', sitio.id).order('orden'),
          supabase.from('sitio_productos').select('*').eq('sitio_id', sitio.id).eq('disponible', true).order('orden'),
          supabase.from('sitio_galeria').select('*').eq('sitio_id', sitio.id).eq('visible', true).order('orden'),
          supabase.from('sitio_features').select('*').eq('sitio_id', sitio.id).order('orden')
        ]);

        // 3. Procesar textos
        const textosMap: StoreTextos = { ...defaultTextos };
        textosRes.data?.forEach((t: { pagina: string; textos: Record<string, string> }) => {
          if (t.pagina === 'inicio') {
            textosMap.inicio = { ...defaultTextosInicio, ...t.textos } as TextosInicio;
          } else if (t.pagina === 'productos') {
            textosMap.menu = { ...defaultTextosMenu, ...t.textos } as TextosMenu;
          } else if (t.pagina === 'galeria') {
            textosMap.galeria = { ...defaultTextosGaleria, ...t.textos } as TextosGaleria;
          } else if (t.pagina === 'pedidos') {
            textosMap.pedidos = { ...defaultTextosPedidos, ...t.textos } as TextosPedidos;
          } else if (t.pagina === 'contacto') {
            textosMap.contacto = { ...defaultTextosContacto, ...t.textos } as TextosContacto;
          } else if (t.pagina === 'nav') {
            textosMap.nav = { ...defaultTextosNav, ...t.textos } as TextosNav;
          }
        });

        // 4. Filtrar galeria home
        const galeriaItems = galeriaRes.data || [];
        const galeriaHome = galeriaItems.filter(g => g.es_home);

        // 5. Extraer pageLayout desde config o usar default
        const config = configRes.data;
        const pageLayoutSections = config?.page_layout?.sections || defaultHomeLayout.sections;

        console.log('[StoreContext] Cargando pageLayout:', pageLayoutSections);

        // 6. Actualizar estado
        setData({
          sitioId: sitio.id,
          config: config,
          textos: textosMap,
          categorias: categoriasRes.data || [],
          productos: itemsRes.data || [],
          galeria: galeriaItems,
          galeriaHome,
          features: featuresRes.data || [],
          pageLayout: pageLayoutSections
        });

      } catch (err) {
        console.error('Error cargando datos del restaurante:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Funciones para actualizar desde el admin (preview en tiempo real)
  const updateConfig = useCallback((newConfig: Partial<SitioConfig>) => {
    setData(prev => ({
      ...prev,
      config: prev.config ? { ...prev.config, ...newConfig } : null
    }));
  }, []);

  const updateTextos = useCallback((pagina: keyof StoreTextos, newTextos: Partial<StoreTextos[keyof StoreTextos]>) => {
    setData(prev => ({
      ...prev,
      textos: {
        ...prev.textos,
        [pagina]: { ...prev.textos[pagina], ...newTextos }
      }
    }));
  }, []);

  const updateMenu = useCallback((categorias: SitioProductoCategoria[], items: SitioProduct[]) => {
    setData(prev => ({
      ...prev,
      categorias,
      productos: items
    }));
  }, []);

  const updateGaleria = useCallback((items: SitioGaleria[]) => {
    setData(prev => ({
      ...prev,
      galeria: items,
      galeriaHome: items.filter(g => g.es_home)
    }));
  }, []);

  const updateFeatures = useCallback((items: SitioFeature[]) => {
    setData(prev => ({
      ...prev,
      features: items
    }));
  }, []);

  // Escuchar mensajes del admin para preview en tiempo real
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data: msgData } = event.data || {};

      if (type === 'admin:tienda' && msgData) {
        // Actualizar config
        updateConfig({
          nombre: msgData.nombre,
          tagline: msgData.tagline,
          descripcion: msgData.descripcion,
          telefono: msgData.telefono,
          telefono_secundario: msgData.telefono_secundario,
          email: msgData.email,
          email_secundario: msgData.email_pedidos,
          direccion_calle: msgData.direccion_calle,
          direccion_ciudad: msgData.direccion_ciudad,
          direccion_cp: msgData.direccion_cp,
          direccion_pais: msgData.direccion_pais,
          horario_semana: msgData.horario_semana,
          horario_finde: msgData.horario_finde,
          instagram: msgData.instagram,
          facebook: msgData.facebook,
          twitter: msgData.twitter,
          mapa_embed_url: msgData.mapa_embed_url
        } as Partial<SitioConfig>);

        // Actualizar textos
        updateTextos('inicio', {
          btn_productos: msgData.inicio_btn_productos,
          btn_pedidos: msgData.inicio_btn_pedidos,
          features_titulo: msgData.inicio_features_titulo,
          features_subtitulo: msgData.inicio_features_subtitulo,
          galeria_titulo: msgData.inicio_galeria_titulo,
          galeria_subtitulo: msgData.inicio_galeria_subtitulo,
          galeria_btn: msgData.inicio_galeria_btn
        });
        updateTextos('menu', {
          titulo: msgData.productos_titulo,
          subtitulo: msgData.productos_subtitulo,
          filtro_todos: msgData.productos_filtro_todos,
          sin_items: msgData.productos_sin_items
        });
        updateTextos('galeria', {
          titulo: msgData.galeria_titulo,
          subtitulo: msgData.galeria_subtitulo
        });
        updateTextos('pedidos', {
          titulo: msgData.pedidos_titulo,
          subtitulo: msgData.pedidos_subtitulo,
          exito_titulo: msgData.pedidos_exito_titulo,
          exito_mensaje: msgData.pedidos_exito_mensaje,
          btn_confirmar: msgData.pedidos_btn_confirmar,
          btn_enviando: msgData.pedidos_btn_enviando
        });
        updateTextos('contacto', {
          titulo: msgData.contacto_titulo,
          subtitulo: msgData.contacto_subtitulo,
          info_titulo: msgData.contacto_info_titulo,
          info_descripcion: msgData.contacto_info_descripcion
        });
        updateTextos('nav', {
          nav_inicio: msgData.nav_inicio,
          nav_productos: msgData.nav_productos,
          nav_galeria: msgData.nav_galeria,
          nav_pedidos: msgData.nav_pedidos,
          nav_contacto: msgData.nav_contacto
        });
      }

      if (type === 'admin:productos' && msgData) {
        updateMenu(msgData.categorias || [], msgData.items || []);
      }

      if (type === 'admin:galeria' && msgData) {
        updateGaleria(msgData.items || []);
      }

      if (type === 'admin:features' && msgData) {
        updateFeatures(msgData.items || []);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateConfig, updateTextos, updateMenu, updateGaleria, updateFeatures]);

  const value: StoreContextValue = {
    ...data,
    loading,
    error,
    updateConfig,
    updateTextos,
    updateMenu,
    updateGaleria,
    updateFeatures
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
