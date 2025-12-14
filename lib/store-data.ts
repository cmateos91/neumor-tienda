import { supabase } from './supabase';
import {
  Sitio,
  SitioConfig,
  SitioGaleria,
  SitioFeature,
  SitioPedido,
  SitioProductoCategoria,
  SitioProduct,
  TiendaData,
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
  defaultTextosNav,
  SitioPedidoInsert,
  SitioConfigUpdate,
  SitioGaleriaInsert,
  SitioFeatureInsert,
  SitioProductoCategoriaInsert,
  SitioProductInsert
} from './database.types';

// ============================================
// FUNCIONES DE LECTURA - SITIO GENÉRICO
// ============================================

/**
 * Obtiene el sitio según variable de entorno SITIO_SLUG
 * Permite multi-tenant: cada deploy de Vercel carga su sitio
 */
export async function getSitio(sitioId?: string): Promise<Sitio | null> {
  try {
    let query = supabase.from('sitios').select('*');

    if (sitioId) {
      // Si se proporciona ID específico, usarlo
      query = query.eq('id', sitioId);
    } else if (process.env.NEXT_PUBLIC_SITIO_SLUG) {
      // Si hay variable de entorno, usar el slug
      query = query.eq('slug', process.env.NEXT_PUBLIC_SITIO_SLUG);
    } else {
      // Fallback: primer sitio activo
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
  productos: TextosMenu;
  galeria: TextosGaleria;
  pedidos: TextosPedidos;
  contacto: TextosContacto;
  nav: TextosNav;
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
      productos: { ...defaultTextosMenu, ...textosMap['productos'] } as TextosMenu,
      galeria: { ...defaultTextosGaleria, ...textosMap['galeria'] } as TextosGaleria,
      pedidos: { ...defaultTextosPedidos, ...textosMap['pedidos'] } as TextosPedidos,
      contacto: { ...defaultTextosContacto, ...textosMap['contacto'] } as TextosContacto,
      nav: { ...defaultTextosNav, ...textosMap['nav'] } as TextosNav
    };
  } catch {
    return {
      inicio: defaultTextosInicio,
      productos: defaultTextosMenu,
      galeria: defaultTextosGaleria,
      pedidos: defaultTextosPedidos,
      contacto: defaultTextosContacto,
      nav: defaultTextosNav
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
 * Obtiene las pedidos de un sitio
 */
export async function getSitioPedidos(sitioId: string): Promise<SitioPedido[]> {
  const { data } = await supabase
    .from('sitio_pedidos')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ============================================
// FUNCIONES DE LECTURA - RESTAURANTE ESPECÍFICO
// ============================================

/**
 * Obtiene las categorías del menú de un sitio
 */
export async function getMenuCategorias(sitioId: string): Promise<SitioProductoCategoria[]> {
  const { data } = await supabase
    .from('sitio_producto_categorias')
    .select('*')
    .eq('sitio_id', sitioId)
    .order('orden');
  return data || [];
}

/**
 * Obtiene los items del menú de un sitio
 */
export async function getProducts(sitioId: string, soloDisponibles = true): Promise<SitioProduct[]> {
  let query = supabase
    .from('sitio_productos')
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
    getProducts(sitioId)
  ]);

  return { categorias, items };
}

// ============================================
// FUNCIÓN PRINCIPAL - CARGA COMPLETA RESTAURANTE
// ============================================

/**
 * Carga todos los datos de un tienda en una sola llamada
 * Optimizado con Promise.all para cargas en paralelo
 */
export async function getRestaurantData(): Promise<TiendaData | null> {
  try {
    // Primero obtener el sitio
    const sitio = await getSitio();

    if (!sitio) {
      console.log('No se encontró ningún sitio activo');
      return null;
    }

    // Cargar todo en paralelo
    const [config, textos, categorias, productos, galeria, features] = await Promise.all([
      getSitioConfig(sitio.id),
      getSitioTextos(sitio.id),
      getMenuCategorias(sitio.id),
      getProducts(sitio.id),
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
      productos,
      galeria,
      galeriaHome: galeria.filter(g => g.es_home),
      features
    };
  } catch (error) {
    console.error('Error cargando datos del tienda:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE ESCRITURA - RESERVAS
// ============================================

/**
 * Crea una nueva pedido
 */
export async function crearPedido(pedido: SitioPedidoInsert): Promise<SitioPedido | null> {
  const { data, error } = await supabase
    .from('sitio_pedidos')
    .insert(pedido)
    .select()
    .single();

  if (error) {
    console.error('Error creando pedido:', error);
    return null;
  }

  return data;
}

/**
 * Actualiza el estado de una pedido
 */
export async function actualizarEstadoPedido(
  pedidoId: string,
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_pedidos')
    .update({ estado })
    .eq('id', pedidoId);

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
  categoria: SitioProductoCategoriaInsert
): Promise<SitioProductoCategoria | null> {
  const { data, error } = await supabase
    .from('sitio_producto_categorias')
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
  updates: Partial<SitioProductoCategoria>
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_producto_categorias')
    .update(updates)
    .eq('id', categoriaId);

  return !error;
}

export async function eliminarMenuCategoria(categoriaId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_producto_categorias')
    .delete()
    .eq('id', categoriaId);

  return !error;
}

export async function agregarProduct(
  item: SitioProductInsert
): Promise<SitioProduct | null> {
  const { data, error } = await supabase
    .from('sitio_productos')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error agregando item al menú:', error);
    return null;
  }

  return data;
}

export async function actualizarProduct(
  itemId: string,
  updates: Partial<SitioProduct>
): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_productos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  return !error;
}

export async function eliminarProduct(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sitio_productos')
    .delete()
    .eq('id', itemId);

  return !error;
}
