'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sitio, SitioConfig, SitioTextos, SitioMenuCategoria, SitioMenuItem, SitioGaleria, SitioFeature } from '@/lib/database.types';

// Tipos
import {
  FormRestaurante,
  defaultFormRestaurante,
  UseSitioDataReturn
} from './useSitioData.types';

// Re-exportar tipos para compatibilidad
export type { FormRestaurante, UseSitioDataReturn } from './useSitioData.types';
export { defaultFormRestaurante } from './useSitioData.types';

export function useSitioData(): UseSitioDataReturn {
  // Estados principales
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [sitioConfig, setSitioConfig] = useState<SitioConfig | null>(null);
  const [sitioTextos, setSitioTextos] = useState<Record<string, Record<string, string>>>({});
  const [formRestaurante, setFormRestaurante] = useState<FormRestaurante>(defaultFormRestaurante);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [categorias, setCategorias] = useState<SitioMenuCategoria[]>([]);
  const [menuItems, setMenuItems] = useState<SitioMenuItem[]>([]);
  const [galeria, setGaleria] = useState<SitioGaleria[]>([]);
  const [features, setFeatures] = useState<SitioFeature[]>([]);

  // ===== CARGAR DATOS =====
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: sitioData, error: sitioError } = await supabase
        .from('sitios')
        .select('*')
        .eq('activo', true)
        .limit(1)
        .single();

      if (sitioError && sitioError.code !== 'PGRST116') throw sitioError;

      if (sitioData) {
        setSitio(sitioData);

        const [configRes, textosRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitioData.id).single(),
          supabase.from('sitio_textos').select('*').eq('sitio_id', sitioData.id)
        ]);

        const config = configRes.data;
        if (config) setSitioConfig(config);

        const textosMap: Record<string, Record<string, string>> = {};
        if (textosRes.data) {
          textosRes.data.forEach((t: SitioTextos) => { textosMap[t.pagina] = t.textos; });
        }
        setSitioTextos(textosMap);

        // Mapear textos a form
        const i = textosMap['inicio'] || {};
        const m = textosMap['menu'] || {};
        const g = textosMap['galeria'] || {};
        const r = textosMap['reservas'] || {};
        const c = textosMap['contacto'] || {};
        const nav = textosMap['nav'] || {};

        setFormRestaurante({
          nombre: config?.nombre || '', tagline: config?.tagline || '', descripcion: config?.descripcion || '',
          inicio_btn_menu: i.btn_menu || 'Ver Menu', inicio_btn_reservas: i.btn_reservas || 'Reservar Mesa',
          inicio_features_titulo: i.features_titulo || 'Por Que Elegirnos',
          inicio_features_subtitulo: i.features_subtitulo || 'Comprometidos con la excelencia en cada detalle',
          inicio_galeria_titulo: i.galeria_titulo || 'Ambiente Unico',
          inicio_galeria_subtitulo: i.galeria_subtitulo || 'Un espacio diseñado para crear momentos memorables',
          inicio_galeria_btn: i.galeria_btn || 'Ver Galeria Completa',
          nav_inicio: nav.nav_inicio || 'Inicio',
          nav_menu: nav.nav_menu || 'Menu',
          nav_galeria: nav.nav_galeria || 'Galeria',
          nav_reservas: nav.nav_reservas || 'Reservar',
          nav_contacto: nav.nav_contacto || 'Contacto',
          menu_titulo: m.titulo || 'Nuestro Menú',
          menu_subtitulo: m.subtitulo || 'Descubre una selección de platos elaborados con ingredientes frescos y de temporada',
          menu_filtro_todos: m.filtro_todos || 'Todos', menu_sin_items: m.sin_items || 'No hay items en esta categoria',
          galeria_titulo: g.titulo || 'Galería', galeria_subtitulo: g.subtitulo || 'Déjate inspirar por nuestros platos y ambiente',
          reservas_titulo: r.titulo || 'Reserva tu Mesa',
          reservas_subtitulo: r.subtitulo || 'Asegura tu lugar en una experiencia culinaria excepcional',
          reservas_exito_titulo: r.exito_titulo || '¡Reserva Confirmada!',
          reservas_exito_mensaje: r.exito_mensaje || 'Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.',
          reservas_btn_confirmar: r.btn_confirmar || 'Confirmar Reserva', reservas_btn_enviando: r.btn_enviando || 'Enviando...',
          contacto_titulo: c.titulo || 'Contacto',
          contacto_subtitulo: c.subtitulo || 'Estamos aquí para atenderte y hacer de tu visita una experiencia memorable',
          telefono: config?.telefono || '', telefono_secundario: config?.telefono_secundario || '',
          email: config?.email || '', email_reservas: config?.email_secundario || '',
          direccion_calle: config?.direccion_calle || '', direccion_ciudad: config?.direccion_ciudad || '',
          direccion_cp: config?.direccion_cp || '', direccion_pais: config?.direccion_pais || '',
          horario_semana: config?.horario_semana || '', horario_finde: config?.horario_finde || '',
          instagram: config?.instagram || '', facebook: config?.facebook || '', twitter: config?.twitter || '',
          mapa_embed_url: config?.mapa_embed_url || '',
          contacto_info_titulo: c.info_titulo || 'Cómo Llegar',
          contacto_info_descripcion: c.info_descripcion || 'Ubicados en pleno corazón de la ciudad, cerca de las principales estaciones de transporte público.'
        });

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

  // ===== GUARDAR =====
  const saveRestaurante = useCallback(async (updatedData?: {
    galeria?: SitioGaleria[]; menuItems?: SitioMenuItem[];
  }): Promise<boolean> => {
    if (!sitio) return false;
    const galeriaToSave = updatedData?.galeria ?? galeria;
    const menuItemsToSave = updatedData?.menuItems ?? menuItems;

    try {
      await supabase.from('sitio_config').update({
        nombre: formRestaurante.nombre, tagline: formRestaurante.tagline, descripcion: formRestaurante.descripcion,
        telefono: formRestaurante.telefono, telefono_secundario: formRestaurante.telefono_secundario,
        email: formRestaurante.email, email_secundario: formRestaurante.email_reservas,
        direccion_calle: formRestaurante.direccion_calle, direccion_ciudad: formRestaurante.direccion_ciudad,
        direccion_cp: formRestaurante.direccion_cp, direccion_pais: formRestaurante.direccion_pais,
        horario_semana: formRestaurante.horario_semana, horario_finde: formRestaurante.horario_finde,
        instagram: formRestaurante.instagram, facebook: formRestaurante.facebook, twitter: formRestaurante.twitter,
        mapa_embed_url: formRestaurante.mapa_embed_url
      }).eq('sitio_id', sitio.id);

      const textosUpdates = [
        { pagina: 'inicio', textos: { btn_menu: formRestaurante.inicio_btn_menu, btn_reservas: formRestaurante.inicio_btn_reservas, features_titulo: formRestaurante.inicio_features_titulo, features_subtitulo: formRestaurante.inicio_features_subtitulo, galeria_titulo: formRestaurante.inicio_galeria_titulo, galeria_subtitulo: formRestaurante.inicio_galeria_subtitulo, galeria_btn: formRestaurante.inicio_galeria_btn }},
        { pagina: 'nav', textos: { nav_inicio: formRestaurante.nav_inicio, nav_menu: formRestaurante.nav_menu, nav_galeria: formRestaurante.nav_galeria, nav_reservas: formRestaurante.nav_reservas, nav_contacto: formRestaurante.nav_contacto }},
        { pagina: 'menu', textos: { titulo: formRestaurante.menu_titulo, subtitulo: formRestaurante.menu_subtitulo, filtro_todos: formRestaurante.menu_filtro_todos, sin_items: formRestaurante.menu_sin_items }},
        { pagina: 'galeria', textos: { titulo: formRestaurante.galeria_titulo, subtitulo: formRestaurante.galeria_subtitulo }},
        { pagina: 'reservas', textos: { titulo: formRestaurante.reservas_titulo, subtitulo: formRestaurante.reservas_subtitulo, exito_titulo: formRestaurante.reservas_exito_titulo, exito_mensaje: formRestaurante.reservas_exito_mensaje, btn_confirmar: formRestaurante.reservas_btn_confirmar, btn_enviando: formRestaurante.reservas_btn_enviando }},
        { pagina: 'contacto', textos: { titulo: formRestaurante.contacto_titulo, subtitulo: formRestaurante.contacto_subtitulo, info_titulo: formRestaurante.contacto_info_titulo, info_descripcion: formRestaurante.contacto_info_descripcion }}
      ];

      await Promise.all([
        ...textosUpdates.map(t => supabase.from('sitio_textos').upsert({ sitio_id: sitio.id, pagina: t.pagina, textos: t.textos }, { onConflict: 'sitio_id,pagina' })),
        ...menuItemsToSave.map(item => supabase.from('sitio_menu_items').update({ nombre: item.nombre, descripcion: item.descripcion, precio: item.precio, imagen_url: item.imagen_url, disponible: item.disponible, destacado: item.destacado, orden: item.orden }).eq('id', item.id)),
        ...galeriaToSave.map(item => supabase.from('sitio_galeria').update({ url: item.url, titulo: item.titulo, descripcion: item.descripcion, es_home: item.es_home, visible: item.visible, orden: item.orden }).eq('id', item.id)),
        ...features.map(f => supabase.from('sitio_features').update({ titulo: f.titulo, descripcion: f.descripcion, icono: f.icono, orden: f.orden }).eq('id', f.id))
      ]);
      return true;
    } catch (err) {
      console.error('Error saving:', err);
      return false;
    }
  }, [sitio, formRestaurante, menuItems, galeria, features]);

  // ===== CRUD CATEGORÍAS =====
  const addCategoria = useCallback(async (nombre: string): Promise<boolean> => {
    if (!sitio || !nombre) return false;
    try {
      const { error } = await supabase.from('sitio_menu_categorias').insert({ sitio_id: sitio.id, nombre, orden: categorias.length });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) { console.error('Error creating categoria:', err); return false; }
  }, [sitio, categorias.length, loadAllData]);

  // ===== CRUD MENU ITEMS =====
  const addMenuItem = useCallback(async (categoriaId: string): Promise<boolean> => {
    if (!sitio) return false;
    try {
      const { error } = await supabase.from('sitio_menu_items').insert({
        sitio_id: sitio.id, categoria_id: categoriaId, nombre: 'Nuevo plato', precio: 0,
        disponible: true, destacado: false, alergenos: [], orden: menuItems.filter(i => i.categoria_id === categoriaId).length
      });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) { console.error('Error creating menu item:', err); return false; }
  }, [sitio, menuItems, loadAllData]);

  const updateMenuItem = useCallback((id: string, field: string, value: string | number | boolean) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const deleteMenuItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      const { error } = await supabase.from('sitio_menu_items').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) { console.error('Error deleting menu item:', err); await loadAllData(); return false; }
  }, [loadAllData]);

  // ===== CRUD GALERÍA =====
  const addGaleriaItem = useCallback(async (url: string): Promise<string | null> => {
    if (!sitio || !url) return null;
    try {
      const { data, error } = await supabase.from('sitio_galeria').insert({
        sitio_id: sitio.id, url, es_home: false, visible: true, orden: galeria.length
      }).select('id').single();
      if (error) throw error;
      if (data) {
        setGaleria(prev => [...prev, { id: data.id, sitio_id: sitio.id, url, titulo: null, descripcion: null, es_home: false, visible: true, orden: galeria.length, created_at: new Date().toISOString() }]);
        return data.id;
      }
      return null;
    } catch (err) { console.error('Error adding galeria item:', err); return null; }
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
      setGaleria(prev => prev.filter(g => g.id !== id));
      const { error } = await supabase.from('sitio_galeria').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) { console.error('Error deleting galeria item:', err); await loadAllData(); return false; }
  }, [loadAllData]);

  // ===== CRUD FEATURES =====
  const addFeature = useCallback(async (): Promise<boolean> => {
    if (!sitio) return false;
    try {
      const { error } = await supabase.from('sitio_features').insert({ sitio_id: sitio.id, titulo: 'Nueva caracteristica', icono: 'Star', orden: features.length });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) { console.error('Error creating feature:', err); return false; }
  }, [sitio, features.length, loadAllData]);

  const updateFeature = useCallback((id: string, field: string, value: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }, []);

  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    try {
      setFeatures(prev => prev.filter(f => f.id !== id));
      const { error } = await supabase.from('sitio_features').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) { console.error('Error deleting feature:', err); await loadAllData(); return false; }
  }, [loadAllData]);

  // Cargar al montar
  useEffect(() => { loadAllData(); }, [loadAllData]);

  return {
    sitio, sitioConfig, sitioTextos, categorias, menuItems, galeria, features, formRestaurante, loading, error,
    loadAllData, setFormRestaurante, setCategorias, setMenuItems, setGaleria, setFeatures, saveRestaurante,
    addCategoria, addMenuItem, updateMenuItem, deleteMenuItem,
    addGaleriaItem, toggleGaleriaHome, toggleGaleriaVisible, updateGaleriaItem, deleteGaleriaItem,
    addFeature, updateFeature, deleteFeature
  };
}
