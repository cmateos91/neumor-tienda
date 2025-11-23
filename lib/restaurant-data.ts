import { supabase } from './supabase';
import {
  Sitio,
  SitioConfig,
  SitioTextos,
  SitioGaleria,
  SitioFeature,
  SitioReserva,
  RestauranteMenuCategoria,
  RestauranteMenuItem,
  RestauranteData,
  TextosInicio,
  TextosMenu,
  TextosGaleria,
  TextosReservas,
  TextosContacto,
  defaultTextosInicio,
  defaultTextosMenu,
  defaultTextosGaleria,
  defaultTextosReservas,
  defaultTextosContacto,
  SitioReservaInsert,
  SitioConfigUpdate,
  SitioGaleriaInsert,
  SitioFeatureInsert,
  RestauranteMenuCategoriaInsert,
  RestauranteMenuItemInsert
} from './database.types';

// ============================================
// FUNCIONES DE LECTURA - SITIO GENÉRICO
// ============================================

/**
 * Obtiene el primer sitio activo (para single-tenant)
 * En el futuro se puede filtrar por slug o id
 */
export async function getSitio(sitioId?: string): Promise<Sitio | null> {
  try {
    let query = supabase.from('sitios').select('*');

    if (sitioId) {
      query = query.eq('id', sitioId);
    } else {
      query = query.eq('activo', true).limit(1);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error cargando sitio:', error);
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Obtiene la configuración de un sitio
 */
export async function getSitioConfig(sitioId: string): Promise<SitioConfig | null> {
  try {
    const { data, error } = await supabase
      .from('sitio_config')
      .select('*')
      .eq('sitio_id', sitioId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error cargando config:', error);
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Obtiene todos los textos de un sitio organizados por página
 */
export async function getSitioTextos(sitioId: string): Promise<{
  inicio: TextosInicio;
  menu: TextosMenu;
  galeria: TextosGaleria;
  reservas: TextosReservas;
  contacto: TextosContacto;
}> {
  try {
    const { data } = await supabase
      .from('sitio_textos')
      .select('pagina, textos')
      .eq('sitio_id', sitioId);

    const textosMap: Record<string, Record<string, string>> = {};
    data?.forEach((row: { pagina: string; textos: Record<string, string> }) => {
      textosMap[row.pagina] = row.textos;
    });

    return {
      inicio: { ...defaultTextosInicio, ...textosMap['inicio'] } as TextosInicio,
      menu: { ...defaultTextosMenu, ...textosMap['menu'] } as TextosMenu,
      galeria: { ...defaultTextosGaleria, ...textosMap['galeria'] } as TextosGaleria,
      reservas: { ...defaultTextosReservas, ...textosMap['reservas'] } as TextosReservas,
      contacto: { ...defaultTextosContacto, ...textosMap['contacto'] } as TextosContacto
    };
  } catch {
    return {
      inicio: defaultTextosInicio,
      menu: defaultTextosMenu,
      galeria: defaultTextosGaleria,
      reservas: defaultTextosReservas,
      contacto: defaultTextosContacto
    };
  }
}

/**
 * Obtiene la galería de un sitio
 */
export async function getSitioGaleria(sitioId: string): Promise<SitioGaleria[]> {
  const { data } = await supabase
    .from('sitio_galeria')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('orden');
  return data || [];
}

/**
 * Obtiene las features de un sitio
 */
export async function getSitioFeatures(sitioId: string): Promise<SitioFeature[]> {
  const { data } = await supabase
    .from('sitio_features')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('orden');
  return data || [];
}

/**
 * Obtiene las reservas de un sitio
 */
export async function getSitioReservas(sitioId: string): Promise<SitioReserva[]> {
  const { data } = await supabase
    .from('sitio_reservas')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ============================================
// FUNCIONES DE LECTURA - RESTAURANTE ESPECÍFICO
// ============================================

/**
 * Obtiene las categorías del menú de un restaurante
 */
export async function getMenuCategorias(sitioId: string): Promise<RestauranteMenuCategoria[]> {
  const { data } = await supabase
    .from('restaurante_menu_categorias')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('orden');
  return data || [];
}

/**
 * Obtiene los items del menú de un restaurante
 */
export async function getMenuItems(sitioId: string, soloDisponibles = true): Promise<RestauranteMenuItem[]> {
  let query = supabase
    .from('restaurante_menu_items')
    .select('*')
    .eq('sitio_id', sitioId);

  if (soloDisponibles) {
    query = query.eq('disponible', true);
  }

  const { data } = await query.order('orden');
  return data || [];
}

/**
 * Obtiene el menú completo (categorías + items)
 */
export async function getMenuCompleto(sitioId: string) {
  const [categorias, items] = await Promise.all([
    getMenuCategorias(sitioId),
    getMenuItems(sitioId)
  ]);

  return { categorias, items };
}

// ============================================
// FUNCIÓN PRINCIPAL - CARGA COMPLETA RESTAURANTE
// ============================================

/**
 * Carga todos los datos de un restaurante en una sola llamada
 * Optimizado con Promise.all para cargas en paralelo
 */
export async function getRestaurantData(): Promise<RestauranteData | null> {
  try {
    // Primero obtener el sitio
    const sitio = await getSitio();

    if (!sitio) {
      console.log('No se encontró ningún sitio activo');
      return null;
    }

    // Cargar todo en paralelo
    const [config, textos, categorias, menuItems, galeria, features] = await Promise.all([
      getSitioConfig(sitio.id),
      getSitioTextos(sitio.id),
      getMenuCategorias(sitio.id),
      getMenuItems(sitio.id),
      getSitioGaleria(sitio.id),
      getSitioFeatures(sitio.id)
    ]);

    if (!config) {
      console.log('No se encontró configuración para el sitio');
      return null;
    }

    return {
      sitio,
      config,
      textos,
      categorias,
      menuItems,
      galeria,
      galeriaHome: galeria.filter(g => g.es_home),
      features
    };
  } catch (error) {
    console.error('Error cargando datos del restaurante:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE ESCRITURA - RESERVAS
// ============================================

/**
 * Crea una nueva reserva
 */
export async function crearReserva(reserva: SitioReservaInsert): Promise<SitioReserva | null> {
  const { data, error } = await supabase
    .from('sitio_reservas')
    .insert(reserva)
    .select()
    .single();

  if (error) {
    console.error('Error creando reserva:', error);
    return null;
  }

  return data;
}

/**
 * Actualiza el estado de una reserva
 */
export async function actualizarEstadoReserva(
  reservaId: string,
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_reservas')
    .update({ estado })
    .eq('id', reservaId);

  return !error;
}

// ============================================
// FUNCIONES DE ESCRITURA - CONFIG
// ============================================

/**
 * Actualiza la configuración de un sitio
 */
export async function actualizarSitioConfig(
  sitioId: string,
  config: SitioConfigUpdate
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_config')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('sitio_id', sitioId);

  return !error;
}

/**
 * Actualiza los textos de una página
 */
export async function actualizarSitioTextos(
  sitioId: string,
  pagina: string,
  textos: Record<string, string>
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_textos')
    .upsert({
      sitio_id: sitioId,
      pagina,
      textos,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'sitio_id,pagina'
    });

  return !error;
}

// ============================================
// FUNCIONES DE ESCRITURA - GALERÍA
// ============================================

export async function agregarGaleriaItem(item: SitioGaleriaInsert): Promise<SitioGaleria | null> {
  const { data, error } = await supabase
    .from('sitio_galeria')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error agregando item a galería:', error);
    return null;
  }

  return data;
}

export async function eliminarGaleriaItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_galeria')
    .delete()
    .eq('id', itemId);

  return !error;
}

export async function actualizarGaleriaOrden(items: { id: string; orden: number }[]): Promise<boolean> {
  const promises = items.map(item =>
    supabase
      .from('sitio_galeria')
      .update({ orden: item.orden })
      .eq('id', item.id)
  );

  const results = await Promise.all(promises);
  return results.every(r => !r.error);
}

// ============================================
// FUNCIONES DE ESCRITURA - FEATURES
// ============================================

export async function agregarFeature(feature: SitioFeatureInsert): Promise<SitioFeature | null> {
  const { data, error } = await supabase
    .from('sitio_features')
    .insert(feature)
    .select()
    .single();

  if (error) {
    console.error('Error agregando feature:', error);
    return null;
  }

  return data;
}

export async function actualizarFeature(
  featureId: string,
  updates: Partial<SitioFeature>
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_features')
    .update(updates)
    .eq('id', featureId);

  return !error;
}

export async function eliminarFeature(featureId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_features')
    .delete()
    .eq('id', featureId);

  return !error;
}

// ============================================
// FUNCIONES DE ESCRITURA - MENÚ
// ============================================

export async function agregarMenuCategoria(
  categoria: RestauranteMenuCategoriaInsert
): Promise<RestauranteMenuCategoria | null> {
  const { data, error } = await supabase
    .from('restaurante_menu_categorias')
    .insert(categoria)
    .select()
    .single();

  if (error) {
    console.error('Error agregando categoría:', error);
    return null;
  }

  return data;
}

export async function actualizarMenuCategoria(
  categoriaId: string,
  updates: Partial<RestauranteMenuCategoria>
): Promise<boolean> {
  const { error } = await supabase
    .from('restaurante_menu_categorias')
    .update(updates)
    .eq('id', categoriaId);

  return !error;
}

export async function eliminarMenuCategoria(categoriaId: string): Promise<boolean> {
  const { error } = await supabase
    .from('restaurante_menu_categorias')
    .delete()
    .eq('id', categoriaId);

  return !error;
}

export async function agregarMenuItem(
  item: RestauranteMenuItemInsert
): Promise<RestauranteMenuItem | null> {
  const { data, error } = await supabase
    .from('restaurante_menu_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error agregando item al menú:', error);
    return null;
  }

  return data;
}

export async function actualizarMenuItem(
  itemId: string,
  updates: Partial<RestauranteMenuItem>
): Promise<boolean> {
  const { error } = await supabase
    .from('restaurante_menu_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  return !error;
}

export async function eliminarMenuItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('restaurante_menu_items')
    .delete()
    .eq('id', itemId);

  return !error;
}
