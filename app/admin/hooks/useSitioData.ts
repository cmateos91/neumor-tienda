'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sitio, SitioConfig, SitioTextos, SitioProductoCategoria, SitioProduct, SitioGaleria, SitioFeature } from '@/lib/database.types';
import type { PageSection } from '@/lib/page-builder.types';
import { defaultHomeLayout } from '@/lib/page-builder.types';

// Tipos
import {
  FormTienda,
  defaultFormTienda,
  UseSitioDataReturn
} from './useSitioData.types';

// Re-exportar tipos para compatibilidad
export type { FormTienda, UseSitioDataReturn } from './useSitioData.types';
export { defaultFormTienda } from './useSitioData.types';

export function useSitioData(): UseSitioDataReturn {
  // Estados principales
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [sitioConfig, setSitioConfig] = useState<SitioConfig | null>(null);
  const [sitioTextos, setSitioTextos] = useState<Record<string, Record<string, string>>>({});
  const [formTienda, setFormTienda] = useState<FormTienda>(defaultFormTienda);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [categorias, setCategorias] = useState<SitioProductoCategoria[]>([]);
  const [productos, setProducts] = useState<SitioProduct[]>([]);
  const [galeria, setGaleria] = useState<SitioGaleria[]>([]);
  const [features, setFeatures] = useState<SitioFeature[]>([]);
  const [pageLayout, setPageLayout] = useState<PageSection[] | null>(null);

  // ===== CARGAR DATOS =====
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener sitio según SLUG (igual que en StoreProvider)
      const slug = process.env.NEXT_PUBLIC_SITIO_SLUG;
      console.log('[useSitioData] Buscando sitio con slug:', slug);

      let query = supabase.from('sitios').select('*');

      if (slug) {
        query = query.eq('slug', slug);
      } else {
        console.warn('[useSitioData] No hay NEXT_PUBLIC_SITIO_SLUG, usando primer sitio activo');
        query = query.eq('activo', true).limit(1);
      }

      const { data: sitioData, error: sitioError } = await query.single();

      if (sitioError && sitioError.code !== 'PGRST116') throw sitioError;

      console.log('[useSitioData] Sitio cargado para admin:', sitioData?.id, sitioData?.slug);

      if (sitioData) {
        setSitio(sitioData);

        const [configRes, textosRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitioData.id).single(),
          supabase.from('sitio_textos').select('*').eq('sitio_id', sitioData.id)
        ]);

        const config = configRes.data;
        if (config) {
          setSitioConfig(config);
          // Cargar pageLayout desde la BD o usar default
          if (config.page_layout?.sections) {
            console.log('[useSitioData] Cargando pageLayout desde BD:', config.page_layout.sections);
            setPageLayout(config.page_layout.sections);
          } else {
            console.log('[useSitioData] Usando pageLayout por defecto');
            setPageLayout(defaultHomeLayout.sections);
          }
        }

        const textosMap: Record<string, Record<string, string>> = {};
        if (textosRes.data) {
          textosRes.data.forEach((t: SitioTextos) => { textosMap[t.pagina] = t.textos; });
        }
        setSitioTextos(textosMap);

        // Mapear textos a form
        const i = textosMap['inicio'] || {};
        const m = textosMap['productos'] || {};
        const g = textosMap['galeria'] || {};
        const r = textosMap['pedidos'] || {};
        const c = textosMap['contacto'] || {};
        const nav = textosMap['nav'] || {};

        setFormTienda({
          nombre: config?.nombre || '', tagline: config?.tagline || '', descripcion: config?.descripcion || '',
          inicio_btn_productos: i.btn_productos || 'Ver Productos', inicio_btn_pedidos: i.btn_pedidos || 'Hacer Pedido',
          inicio_features_titulo: i.features_titulo || 'Por Que Elegirnos',
          inicio_features_subtitulo: i.features_subtitulo || 'Comprometidos con la excelencia en cada detalle',
          inicio_galeria_titulo: i.galeria_titulo || 'Ambiente Unico',
          inicio_galeria_subtitulo: i.galeria_subtitulo || 'Un espacio diseñado para crear momentos memorables',
          inicio_galeria_btn: i.galeria_btn || 'Ver Galeria Completa',
          nav_inicio: nav.nav_inicio || 'Inicio',
          nav_productos: nav.nav_productos || 'Productos',
          nav_galeria: nav.nav_galeria || 'Galeria',
          nav_pedidos: nav.nav_pedidos || 'Pedidor',
          nav_contacto: nav.nav_contacto || 'Contacto',
          productos_titulo: m.titulo || 'Nuestros Productos',
          productos_subtitulo: m.subtitulo || 'Descubre nuestra selección de productos de calidad',
          productos_filtro_todos: m.filtro_todos || 'Todos', productos_sin_items: m.sin_items || 'No hay items en esta categoria',
          galeria_titulo: g.titulo || 'Galería', galeria_subtitulo: g.subtitulo || 'Déjate inspirar por nuestros platos y ambiente',
          pedidos_titulo: r.titulo || 'Pedido tu Mesa',
          pedidos_subtitulo: r.subtitulo || 'Asegura tu lugar en una experiencia culinaria excepcional',
          pedidos_exito_titulo: r.exito_titulo || '¡Pedido Confirmada!',
          pedidos_exito_mensaje: r.exito_mensaje || 'Hemos recibido tu pedido. Te enviaremos un email de confirmación pronto.',
          pedidos_btn_confirmar: r.btn_confirmar || 'Confirmar Pedido', pedidos_btn_enviando: r.btn_enviando || 'Enviando...',
          contacto_titulo: c.titulo || 'Contacto',
          contacto_subtitulo: c.subtitulo || 'Estamos aquí para atenderte y hacer de tu visita una experiencia memorable',
          telefono: config?.telefono || '', telefono_secundario: config?.telefono_secundario || '',
          email: config?.email || '', email_pedidos: config?.email_secundario || '',
          direccion_calle: config?.direccion_calle || '', direccion_ciudad: config?.direccion_ciudad || '',
          direccion_cp: config?.direccion_cp || '', direccion_pais: config?.direccion_pais || '',
          horario_semana: config?.horario_semana || '', horario_finde: config?.horario_finde || '',
          instagram: config?.instagram || '', facebook: config?.facebook || '', twitter: config?.twitter || '',
          mapa_embed_url: config?.mapa_embed_url || '',
          contacto_info_titulo: c.info_titulo || 'Cómo Llegar',
          contacto_info_descripcion: c.info_descripcion || 'Ubicados en pleno corazón de la ciudad, cerca de las principales estaciones de transporte público.'
        });

        const [catRes, itemsRes, galRes, featRes] = await Promise.all([
          supabase.from('sitio_producto_categorias').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_productos').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_galeria').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_features').select('*').eq('sitio_id', sitioData.id).order('orden')
        ]);

        setCategorias(catRes.data || []);
        setProducts(itemsRes.data || []);
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
  const saveTienda = useCallback(async (updatedData?: {
    galeria?: SitioGaleria[]; productos?: SitioProduct[]; pageLayout?: PageSection[];
  }): Promise<boolean> => {
    if (!sitio) return false;
    const galeriaToSave = updatedData?.galeria ?? galeria;
    const productosToSave = updatedData?.productos ?? productos;
    const pageLayoutSections = updatedData?.pageLayout ?? pageLayout;

    // Crear objeto PageLayout completo si hay secciones
    const pageLayoutToSave = pageLayoutSections ? {
      pageId: 'inicio',
      pageName: 'Inicio',
      sections: pageLayoutSections,
      lastModified: new Date().toISOString()
    } : null;

    console.log('[useSitioData] Guardando pageLayout con sections:', JSON.stringify(pageLayoutSections, null, 2));

    try {
      const { data: configData, error: configError } = await supabase.from('sitio_config').update({
        nombre: formTienda.nombre, tagline: formTienda.tagline, descripcion: formTienda.descripcion,
        telefono: formTienda.telefono, telefono_secundario: formTienda.telefono_secundario,
        email: formTienda.email, email_secundario: formTienda.email_pedidos,
        direccion_calle: formTienda.direccion_calle, direccion_ciudad: formTienda.direccion_ciudad,
        direccion_cp: formTienda.direccion_cp, direccion_pais: formTienda.direccion_pais,
        horario_semana: formTienda.horario_semana, horario_finde: formTienda.horario_finde,
        instagram: formTienda.instagram, facebook: formTienda.facebook, twitter: formTienda.twitter,
        mapa_embed_url: formTienda.mapa_embed_url,
        page_layout: pageLayoutToSave
      }).eq('sitio_id', sitio.id);

      if (configError) {
        console.error('[useSitioData] Error al guardar config:', configError);
        throw configError;
      }
      console.log('[useSitioData] Config guardado exitosamente:', configData);

      const textosUpdates = [
        { pagina: 'inicio', textos: { btn_productos: formTienda.inicio_btn_productos, btn_pedidos: formTienda.inicio_btn_pedidos, features_titulo: formTienda.inicio_features_titulo, features_subtitulo: formTienda.inicio_features_subtitulo, galeria_titulo: formTienda.inicio_galeria_titulo, galeria_subtitulo: formTienda.inicio_galeria_subtitulo, galeria_btn: formTienda.inicio_galeria_btn }},
        { pagina: 'nav', textos: { nav_inicio: formTienda.nav_inicio, nav_productos: formTienda.nav_productos, nav_galeria: formTienda.nav_galeria, nav_pedidos: formTienda.nav_pedidos, nav_contacto: formTienda.nav_contacto }},
        { pagina: 'productos', textos: { titulo: formTienda.productos_titulo, subtitulo: formTienda.productos_subtitulo, filtro_todos: formTienda.productos_filtro_todos, sin_items: formTienda.productos_sin_items }},
        { pagina: 'galeria', textos: { titulo: formTienda.galeria_titulo, subtitulo: formTienda.galeria_subtitulo }},
        { pagina: 'pedidos', textos: { titulo: formTienda.pedidos_titulo, subtitulo: formTienda.pedidos_subtitulo, exito_titulo: formTienda.pedidos_exito_titulo, exito_mensaje: formTienda.pedidos_exito_mensaje, btn_confirmar: formTienda.pedidos_btn_confirmar, btn_enviando: formTienda.pedidos_btn_enviando }},
        { pagina: 'contacto', textos: { titulo: formTienda.contacto_titulo, subtitulo: formTienda.contacto_subtitulo, info_titulo: formTienda.contacto_info_titulo, info_descripcion: formTienda.contacto_info_descripcion }}
      ];

      await Promise.all([
        ...textosUpdates.map(t => supabase.from('sitio_textos').upsert({ sitio_id: sitio.id, pagina: t.pagina, textos: t.textos }, { onConflict: 'sitio_id,pagina' })),
        ...productosToSave.map(item => supabase.from('sitio_productos').update({ nombre: item.nombre, descripcion: item.descripcion, precio: item.precio, imagen_url: item.imagen_url, disponible: item.disponible, destacado: item.destacado, orden: item.orden }).eq('id', item.id)),
        ...galeriaToSave.map(item => supabase.from('sitio_galeria').update({ url: item.url, titulo: item.titulo, descripcion: item.descripcion, es_home: item.es_home, visible: item.visible, orden: item.orden }).eq('id', item.id)),
        ...features.map(f => supabase.from('sitio_features').update({ titulo: f.titulo, descripcion: f.descripcion, icono: f.icono, orden: f.orden }).eq('id', f.id))
      ]);
      return true;
    } catch (err) {
      console.error('Error saving:', err);
      return false;
    }
  }, [sitio, formTienda, productos, galeria, features, pageLayout]);

  // ===== CRUD CATEGORÍAS =====
  const addCategoria = useCallback(async (nombre: string): Promise<boolean> => {
    if (!sitio || !nombre) return false;
    try {
      const { error } = await supabase.from('sitio_producto_categorias').insert({ sitio_id: sitio.id, nombre, orden: categorias.length });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) { console.error('Error creating categoria:', err); return false; }
  }, [sitio, categorias.length, loadAllData]);

  // ===== CRUD MENU ITEMS =====
  const addProduct = useCallback(async (categoriaId: string): Promise<boolean> => {
    if (!sitio) return false;
    try {
      const { error } = await supabase.from('sitio_productos').insert({
        sitio_id: sitio.id, categoria_id: categoriaId, nombre: 'Nuevo plato', precio: 0,
        disponible: true, destacado: false, stock: 0, sku: "", orden: productos.filter(i => i.categoria_id === categoriaId).length
      });
      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) { console.error('Error creating productos item:', err); return false; }
  }, [sitio, productos, loadAllData]);

  const updateProduct = useCallback((id: string, field: string, value: string | number | boolean) => {
    setProducts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setProducts(prev => prev.filter(item => item.id !== id));
      const { error } = await supabase.from('sitio_productos').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) { console.error('Error deleting productos item:', err); await loadAllData(); return false; }
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
    sitio, sitioConfig, sitioTextos, categorias, productos, galeria, features, formTienda, pageLayout, loading, error,
    loadAllData, setFormTienda, setCategorias, setProducts, setGaleria, setFeatures, setPageLayout, saveTienda,
    addCategoria, addProduct, updateProduct, deleteProduct,
    addGaleriaItem, toggleGaleriaHome, toggleGaleriaVisible, updateGaleriaItem, deleteGaleriaItem,
    addFeature, updateFeature, deleteFeature
  };
}
