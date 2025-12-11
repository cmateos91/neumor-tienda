'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import {
  SitioConfig,
  SitioMenuCategoria,
  SitioMenuItem,
  SitioGaleria,
  SitioFeature,
  TextosInicio,
  TextosMenu,
  TextosGaleria,
  TextosReservas,
  TextosContacto,
  TextosNav,
  defaultTextosInicio,
  defaultTextosMenu,
  defaultTextosGaleria,
  defaultTextosReservas,
  defaultTextosContacto,
  defaultTextosNav
} from './database.types';

// Tipos para el contexto
interface RestaurantTextos {
  inicio: TextosInicio;
  menu: TextosMenu;
  galeria: TextosGaleria;
  reservas: TextosReservas;
  contacto: TextosContacto;
  nav: TextosNav;
}

interface RestaurantData {
  sitioId: string | null;
  config: SitioConfig | null;
  textos: RestaurantTextos;
  categorias: SitioMenuCategoria[];
  menuItems: SitioMenuItem[];
  galeria: SitioGaleria[];
  galeriaHome: SitioGaleria[];
  features: SitioFeature[];
}

interface RestaurantContextValue extends RestaurantData {
  loading: boolean;
  error: string | null;
  // Funciones para actualizar desde el admin (preview en tiempo real)
  updateConfig: (data: Partial<SitioConfig>) => void;
  updateTextos: (pagina: keyof RestaurantTextos, textos: Partial<RestaurantTextos[keyof RestaurantTextos]>) => void;
  updateMenu: (categorias: SitioMenuCategoria[], items: SitioMenuItem[]) => void;
  updateGaleria: (items: SitioGaleria[]) => void;
  updateFeatures: (items: SitioFeature[]) => void;
}

// Valores por defecto
const defaultTextos: RestaurantTextos = {
  inicio: defaultTextosInicio,
  menu: defaultTextosMenu,
  galeria: defaultTextosGaleria,
  reservas: defaultTextosReservas,
  contacto: defaultTextosContacto,
  nav: defaultTextosNav
};

const defaultContextValue: RestaurantContextValue = {
  sitioId: null,
  config: null,
  textos: defaultTextos,
  categorias: [],
  menuItems: [],
  galeria: [],
  galeriaHome: [],
  features: [],
  loading: true,
  error: null,
  updateConfig: () => {},
  updateTextos: () => {},
  updateMenu: () => {},
  updateGaleria: () => {},
  updateFeatures: () => {}
};

// Crear el contexto
const RestaurantContext = createContext<RestaurantContextValue>(defaultContextValue);

// Hook para usar el contexto
export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant debe usarse dentro de RestaurantProvider');
  }
  return context;
}

// Provider del contexto
interface RestaurantProviderProps {
  children: ReactNode;
}

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const [data, setData] = useState<RestaurantData>({
    sitioId: null,
    config: null,
    textos: defaultTextos,
    categorias: [],
    menuItems: [],
    galeria: [],
    galeriaHome: [],
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los datos al inicio
  useEffect(() => {
    async function loadAllData() {
      try {
        // 1. Obtener sitio activo
        const { data: sitio, error: sitioError } = await supabase
          .from('sitios')
          .select('id')
          .eq('activo', true)
          .limit(1)
          .single();

        if (sitioError || !sitio) {
          setLoading(false);
          return;
        }

        // 2. Cargar todo en paralelo
        const [configRes, textosRes, categoriasRes, itemsRes, galeriaRes, featuresRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitio.id).single(),
          supabase.from('sitio_textos').select('pagina, textos').eq('sitio_id', sitio.id),
          supabase.from('sitio_menu_categorias').select('*').eq('sitio_id', sitio.id).order('orden'),
          supabase.from('sitio_menu_items').select('*').eq('sitio_id', sitio.id).eq('disponible', true).order('orden'),
          supabase.from('sitio_galeria').select('*').eq('sitio_id', sitio.id).eq('visible', true).order('orden'),
          supabase.from('sitio_features').select('*').eq('sitio_id', sitio.id).order('orden')
        ]);

        // 3. Procesar textos
        const textosMap: RestaurantTextos = { ...defaultTextos };
        textosRes.data?.forEach((t: { pagina: string; textos: Record<string, string> }) => {
          if (t.pagina === 'inicio') {
            textosMap.inicio = { ...defaultTextosInicio, ...t.textos } as TextosInicio;
          } else if (t.pagina === 'menu') {
            textosMap.menu = { ...defaultTextosMenu, ...t.textos } as TextosMenu;
          } else if (t.pagina === 'galeria') {
            textosMap.galeria = { ...defaultTextosGaleria, ...t.textos } as TextosGaleria;
          } else if (t.pagina === 'reservas') {
            textosMap.reservas = { ...defaultTextosReservas, ...t.textos } as TextosReservas;
          } else if (t.pagina === 'contacto') {
            textosMap.contacto = { ...defaultTextosContacto, ...t.textos } as TextosContacto;
          } else if (t.pagina === 'nav') {
            textosMap.nav = { ...defaultTextosNav, ...t.textos } as TextosNav;
          }
        });

        // 4. Filtrar galeria home
        const galeriaItems = galeriaRes.data || [];
        const galeriaHome = galeriaItems.filter(g => g.es_home);

        // 5. Actualizar estado
        setData({
          sitioId: sitio.id,
          config: configRes.data,
          textos: textosMap,
          categorias: categoriasRes.data || [],
          menuItems: itemsRes.data || [],
          galeria: galeriaItems,
          galeriaHome,
          features: featuresRes.data || []
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

  const updateTextos = useCallback((pagina: keyof RestaurantTextos, newTextos: Partial<RestaurantTextos[keyof RestaurantTextos]>) => {
    setData(prev => ({
      ...prev,
      textos: {
        ...prev.textos,
        [pagina]: { ...prev.textos[pagina], ...newTextos }
      }
    }));
  }, []);

  const updateMenu = useCallback((categorias: SitioMenuCategoria[], items: SitioMenuItem[]) => {
    setData(prev => ({
      ...prev,
      categorias,
      menuItems: items
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

      if (type === 'admin:restaurante' && msgData) {
        // Actualizar config
        updateConfig({
          nombre: msgData.nombre,
          tagline: msgData.tagline,
          descripcion: msgData.descripcion,
          telefono: msgData.telefono,
          telefono_secundario: msgData.telefono_secundario,
          email: msgData.email,
          email_secundario: msgData.email_reservas,
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
          btn_menu: msgData.inicio_btn_menu,
          btn_reservas: msgData.inicio_btn_reservas,
          features_titulo: msgData.inicio_features_titulo,
          features_subtitulo: msgData.inicio_features_subtitulo,
          galeria_titulo: msgData.inicio_galeria_titulo,
          galeria_subtitulo: msgData.inicio_galeria_subtitulo,
          galeria_btn: msgData.inicio_galeria_btn
        });
        updateTextos('menu', {
          titulo: msgData.menu_titulo,
          subtitulo: msgData.menu_subtitulo,
          filtro_todos: msgData.menu_filtro_todos,
          sin_items: msgData.menu_sin_items
        });
        updateTextos('galeria', {
          titulo: msgData.galeria_titulo,
          subtitulo: msgData.galeria_subtitulo
        });
        updateTextos('reservas', {
          titulo: msgData.reservas_titulo,
          subtitulo: msgData.reservas_subtitulo,
          exito_titulo: msgData.reservas_exito_titulo,
          exito_mensaje: msgData.reservas_exito_mensaje,
          btn_confirmar: msgData.reservas_btn_confirmar,
          btn_enviando: msgData.reservas_btn_enviando
        });
        updateTextos('contacto', {
          titulo: msgData.contacto_titulo,
          subtitulo: msgData.contacto_subtitulo,
          info_titulo: msgData.contacto_info_titulo,
          info_descripcion: msgData.contacto_info_descripcion
        });
        updateTextos('nav', {
          nav_inicio: msgData.nav_inicio,
          nav_menu: msgData.nav_menu,
          nav_galeria: msgData.nav_galeria,
          nav_reservas: msgData.nav_reservas,
          nav_contacto: msgData.nav_contacto
        });
      }

      if (type === 'admin:menu' && msgData) {
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

  const value: RestaurantContextValue = {
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
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
