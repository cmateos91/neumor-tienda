'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Sitio, SitioConfig, SitioTextos, RestauranteMenuCategoria, RestauranteMenuItem, SitioGaleria, SitioFeature } from '@/lib/database.types';
import { PageSection, defaultHomeLayout } from '@/lib/page-builder.types';
import {
  Monitor, Tablet, Smartphone, RefreshCw, ExternalLink,
  Store, UtensilsCrossed, Image, Sparkles, ChevronDown, ChevronRight,
  Save, Plus, Trash2, GripVertical, Eye, EyeOff, Loader2,
  Instagram, Facebook, Twitter, MapPin, Home, CalendarCheck, Phone, Mail,
  ChefHat, Award, Clock, Wine, Star, Heart, Users, Leaf, Flame, Coffee, Info,
  MousePointer2, Pencil, Upload, X, Sun, Moon, Move, Layers,
  type LucideIcon
} from 'lucide-react';

// Iconos disponibles para features
const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'ChefHat', icon: ChefHat },
  { name: 'Award', icon: Award },
  { name: 'Clock', icon: Clock },
  { name: 'MapPin', icon: MapPin },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Wine', icon: Wine },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Users', icon: Users },
  { name: 'Leaf', icon: Leaf },
  { name: 'Flame', icon: Flame },
  { name: 'Coffee', icon: Coffee },
  { name: 'Sparkles', icon: Sparkles }
];

const getIconByName = (name: string): LucideIcon => {
  return availableIcons.find(i => i.name === name)?.icon || Star;
};

type Tab = 'restaurante' | 'menu' | 'galeria' | 'features';
type Device = 'desktop' | 'tablet' | 'mobile';

export default function AdminEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('restaurante');
  const [device, setDevice] = useState<Device>('desktop');
  const [currentPage, setCurrentPage] = useState('/');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editMode, setEditMode] = useState(false); // Modo navegacion por defecto
  const [showSaveModal, setShowSaveModal] = useState(false); // Modal de confirmacion
  const [darkMode, setDarkMode] = useState(false); // Tema claro por defecto
  const [pageBuilderMode, setPageBuilderMode] = useState(false); // Modo page builder
  const [pageLayout, setPageLayout] = useState<PageSection[]>(defaultHomeLayout.sections);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Data states
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [sitioConfig, setSitioConfig] = useState<SitioConfig | null>(null);
  const [sitioTextos, setSitioTextos] = useState<Record<string, Record<string, string>>>({});
  const [categorias, setCategorias] = useState<RestauranteMenuCategoria[]>([]);
  const [menuItems, setMenuItems] = useState<RestauranteMenuItem[]>([]);
  const [galeria, setGaleria] = useState<SitioGaleria[]>([]);
  const [features, setFeatures] = useState<SitioFeature[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for restaurante
  const [formRestaurante, setFormRestaurante] = useState({
    // Inicio - Hero
    nombre: '',
    tagline: '',
    descripcion: '',
    inicio_btn_menu: 'Ver Menu',
    inicio_btn_reservas: 'Reservar Mesa',
    // Inicio - Seccion Features
    inicio_features_titulo: 'Por Que Elegirnos',
    inicio_features_subtitulo: 'Comprometidos con la excelencia en cada detalle',
    // Inicio - Seccion Galeria
    inicio_galeria_titulo: 'Ambiente Unico',
    inicio_galeria_subtitulo: 'Un espacio diseñado para crear momentos memorables',
    inicio_galeria_btn: 'Ver Galeria Completa',
    // Menu
    menu_titulo: 'Nuestro Menú',
    menu_subtitulo: 'Descubre una selección de platos elaborados con ingredientes frescos y de temporada',
    menu_filtro_todos: 'Todos',
    menu_sin_items: 'No hay items en esta categoria',
    // Galeria
    galeria_titulo: 'Galería',
    galeria_subtitulo: 'Déjate inspirar por nuestros platos y ambiente',
    // Reservas
    reservas_titulo: 'Reserva tu Mesa',
    reservas_subtitulo: 'Asegura tu lugar en una experiencia culinaria excepcional',
    reservas_exito_titulo: '¡Reserva Confirmada!',
    reservas_exito_mensaje: 'Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.',
    reservas_btn_confirmar: 'Confirmar Reserva',
    reservas_btn_enviando: 'Enviando...',
    // Contacto
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
  });

  // Expanded sections - organized by page
  const [expandedPage, setExpandedPage] = useState<string | null>('inicio');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Selected element from iframe
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Enviar datos al iframe en tiempo real (definido antes de usarse)
  const sendToIframe = useCallback((type: string, data: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: `admin:${type}`, data },
        window.location.origin
      );
    }
  }, []);

  // Mapeo de elementId a navegacion en el admin
  const elementToNavigation: Record<string, { tab: Tab; page?: string; inputName?: string }> = {
    // INICIO - Hero
    'inicio.hero.nombre': { tab: 'restaurante', page: 'inicio', inputName: 'nombre' },
    'inicio.hero.tagline': { tab: 'restaurante', page: 'inicio', inputName: 'tagline' },
    'inicio.hero.btn_menu': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_btn_menu' },
    'inicio.hero.btn_reservas': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_btn_reservas' },
    // INICIO - Features
    'inicio.features.titulo': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_features_titulo' },
    'inicio.features.subtitulo': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_features_subtitulo' },
    'inicio.features.items': { tab: 'features' },
    // INICIO - Galeria
    'inicio.galeria.titulo': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_galeria_titulo' },
    'inicio.galeria.subtitulo': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_galeria_subtitulo' },
    'inicio.galeria.btn': { tab: 'restaurante', page: 'inicio', inputName: 'inicio_galeria_btn' },
    'inicio.galeria.items': { tab: 'galeria' },
    // MENU
    'menu.titulo': { tab: 'restaurante', page: 'menu', inputName: 'menu_titulo' },
    'menu.subtitulo': { tab: 'restaurante', page: 'menu', inputName: 'menu_subtitulo' },
    'menu.items': { tab: 'menu' },
    // GALERIA
    'galeria.titulo': { tab: 'restaurante', page: 'galeria', inputName: 'galeria_titulo' },
    'galeria.subtitulo': { tab: 'restaurante', page: 'galeria', inputName: 'galeria_subtitulo' },
    // RESERVAS
    'reservas.titulo': { tab: 'restaurante', page: 'reservas', inputName: 'reservas_titulo' },
    'reservas.subtitulo': { tab: 'restaurante', page: 'reservas', inputName: 'reservas_subtitulo' },
    'reservas.btn': { tab: 'restaurante', page: 'reservas', inputName: 'reservas_btn_confirmar' },
    // CONTACTO
    'contacto.titulo': { tab: 'restaurante', page: 'contacto', inputName: 'contacto_titulo' },
    'contacto.subtitulo': { tab: 'restaurante', page: 'contacto', inputName: 'contacto_subtitulo' },
    'contacto.info.titulo': { tab: 'restaurante', page: 'contacto', inputName: 'contacto_info_titulo' },
    'contacto.info.descripcion': { tab: 'restaurante', page: 'contacto', inputName: 'contacto_info_descripcion' }
  };

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};

      if (type === 'iframe:elementClick') {
        const elementId = data.elementId;
        const nav = elementToNavigation[elementId];

        if (nav) {
          // Cambiar al tab correcto
          setActiveTab(nav.tab);

          // Expandir la pagina correcta si aplica
          if (nav.page) {
            setExpandedPage(nav.page);
          }

          // Marcar elemento como seleccionado
          setSelectedElement(elementId);

          // Notificar al iframe que seleccionamos este elemento
          sendToIframe('select', { elementId });

          // Hacer scroll al input correspondiente despues de un pequeno delay
          if (nav.inputName) {
            setTimeout(() => {
              const input = document.querySelector(`[data-field="${nav.inputName}"]`);
              if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (input as HTMLInputElement).focus();
                // Añadir highlight temporal
                input.classList.add('input-highlight');
                setTimeout(() => input.classList.remove('input-highlight'), 2000);
              }
            }, 300);
          }
        }
      }

      // Page Builder: layout changed
      if (type === 'preview:layout-changed') {
        const sections = event.data.sections;
        if (sections) setPageLayout(sections);
      }

      // Page Builder: section selected
      if (type === 'preview:section-selected') {
        setSelectedSection(event.data.sectionId ?? null);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [formRestaurante, sendToIframe]);

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      // Cargar sitio activo
      const { data: sitioData } = await supabase
        .from('sitios')
        .select('*')
        .eq('activo', true)
        .limit(1)
        .single();

      if (sitioData) {
        setSitio(sitioData);

        // Cargar config y textos del sitio
        const [configRes, textosRes] = await Promise.all([
          supabase.from('sitio_config').select('*').eq('sitio_id', sitioData.id).single(),
          supabase.from('sitio_textos').select('*').eq('sitio_id', sitioData.id)
        ]);

        const config = configRes.data;
        if (config) {
          setSitioConfig(config);
        }

        // Organizar textos por página
        const textosMap: Record<string, Record<string, string>> = {};
        if (textosRes.data) {
          textosRes.data.forEach((t: SitioTextos) => {
            textosMap[t.pagina] = t.textos;
          });
        }
        setSitioTextos(textosMap);

        // Mapear a formRestaurante para mantener compatibilidad con el editor
        const inicioTextos = textosMap['inicio'] || {};
        const menuTextos = textosMap['menu'] || {};
        const galeriaTextos = textosMap['galeria'] || {};
        const reservasTextos = textosMap['reservas'] || {};
        const contactoTextos = textosMap['contacto'] || {};

        setFormRestaurante({
          // Inicio - Hero
          nombre: config?.nombre || '',
          tagline: config?.tagline || '',
          descripcion: config?.descripcion || '',
          inicio_btn_menu: inicioTextos.btn_menu || 'Ver Menu',
          inicio_btn_reservas: inicioTextos.btn_reservas || 'Reservar Mesa',
          // Inicio - Seccion Features
          inicio_features_titulo: inicioTextos.features_titulo || 'Por Que Elegirnos',
          inicio_features_subtitulo: inicioTextos.features_subtitulo || 'Comprometidos con la excelencia en cada detalle',
          // Inicio - Seccion Galeria
          inicio_galeria_titulo: inicioTextos.galeria_titulo || 'Ambiente Unico',
          inicio_galeria_subtitulo: inicioTextos.galeria_subtitulo || 'Un espacio diseñado para crear momentos memorables',
          inicio_galeria_btn: inicioTextos.galeria_btn || 'Ver Galeria Completa',
          // Menu
          menu_titulo: menuTextos.titulo || 'Nuestro Menú',
          menu_subtitulo: menuTextos.subtitulo || 'Descubre una selección de platos elaborados con ingredientes frescos y de temporada',
          menu_filtro_todos: menuTextos.filtro_todos || 'Todos',
          menu_sin_items: menuTextos.sin_items || 'No hay items en esta categoria',
          // Galeria
          galeria_titulo: galeriaTextos.titulo || 'Galería',
          galeria_subtitulo: galeriaTextos.subtitulo || 'Déjate inspirar por nuestros platos y ambiente',
          // Reservas
          reservas_titulo: reservasTextos.titulo || 'Reserva tu Mesa',
          reservas_subtitulo: reservasTextos.subtitulo || 'Asegura tu lugar en una experiencia culinaria excepcional',
          reservas_exito_titulo: reservasTextos.exito_titulo || '¡Reserva Confirmada!',
          reservas_exito_mensaje: reservasTextos.exito_mensaje || 'Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.',
          reservas_btn_confirmar: reservasTextos.btn_confirmar || 'Confirmar Reserva',
          reservas_btn_enviando: reservasTextos.btn_enviando || 'Enviando...',
          // Contacto
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

        // Cargar datos específicos del restaurante
        const [catRes, itemsRes, galRes, featRes] = await Promise.all([
          supabase.from('restaurante_menu_categorias').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('restaurante_menu_items').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_galeria').select('*').eq('sitio_id', sitioData.id).order('orden'),
          supabase.from('sitio_features').select('*').eq('sitio_id', sitioData.id).order('orden')
        ]);

        setCategorias(catRes.data || []);
        setMenuItems(itemsRes.data || []);
        setGaleria(galRes.data || []);
        setFeatures(featRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const refreshIframe = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  // Enviar cambios de restaurante al iframe cuando cambia el form
  useEffect(() => {
    sendToIframe('restaurante', formRestaurante);
  }, [formRestaurante, sendToIframe]);

  // Enviar cambios de menu al iframe
  useEffect(() => {
    sendToIframe('menu', { categorias, items: menuItems });
  }, [categorias, menuItems, sendToIframe]);

  // Enviar cambios de galeria al iframe
  useEffect(() => {
    sendToIframe('galeria', { items: galeria });
  }, [galeria, sendToIframe]);

  // Enviar cambios de features al iframe
  useEffect(() => {
    sendToIframe('features', { items: features });
  }, [features, sendToIframe]);

  // Enviar estado de editMode al iframe
  useEffect(() => {
    sendToIframe('editMode', { enabled: editMode });
  }, [editMode, sendToIframe]);

  // Enviar estado de pageBuilderMode al iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: pageBuilderMode ? 'pagebuilder:enter-edit' : 'pagebuilder:exit-edit' },
        window.location.origin
      );
    }
  }, [pageBuilderMode]);

  // Toggle Page Builder Mode
  const togglePageBuilderMode = () => {
    if (!pageBuilderMode && currentPage !== '/') {
      // Solo disponible en pagina de inicio por ahora
      setCurrentPage('/');
      setTimeout(() => setPageBuilderMode(true), 500);
    } else {
      setPageBuilderMode(!pageBuilderMode);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Save restaurante
  const saveRestaurante = async () => {
    if (!sitio) return;

    setSaving(true);
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

      // Preparar textos por página
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

      // Guardar textos (upsert)
      for (const textoData of textosUpdates) {
        await supabase
          .from('sitio_textos')
          .upsert({
            sitio_id: sitio.id,
            pagina: textoData.pagina,
            textos: textoData.textos
          }, {
            onConflict: 'sitio_id,pagina'
          });
      }

      // Guardar items del menú
      for (const item of menuItems) {
        await supabase
          .from('restaurante_menu_items')
          .update({
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: item.precio,
            imagen_url: item.imagen_url,
            disponible: item.disponible,
            destacado: item.destacado,
            orden: item.orden
          })
          .eq('id', item.id);
      }

      // Guardar items de galería
      for (const item of galeria) {
        await supabase
          .from('sitio_galeria')
          .update({
            url: item.url,
            titulo: item.titulo,
            descripcion: item.descripcion,
            es_home: item.es_home,
            orden: item.orden
          })
          .eq('id', item.id);
      }

      // Guardar features
      for (const feature of features) {
        await supabase
          .from('sitio_features')
          .update({
            titulo: feature.titulo,
            descripcion: feature.descripcion,
            icono: feature.icono,
            orden: feature.orden
          })
          .eq('id', feature.id);
      }

      showMessage('success', 'Publicado correctamente');
      setTimeout(refreshIframe, 500);
    } catch (error) {
      console.error('Error saving:', error);
      showMessage('error', 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Menu functions
  const addCategoria = async () => {
    if (!sitio) return;
    const nombre = prompt('Nombre de la categoria:');
    if (!nombre) return;

    try {
      const { error } = await supabase.from('restaurante_menu_categorias').insert({
        sitio_id: sitio.id,
        nombre,
        orden: categorias.length
      });
      if (error) throw error;
      loadAllData();
      showMessage('success', 'Categoria creada');
    } catch (error) {
      showMessage('error', 'Error al crear categoria');
    }
  };

  const addMenuItem = async (categoriaId: string) => {
    if (!sitio) return;

    try {
      const { error } = await supabase.from('restaurante_menu_items').insert({
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
      loadAllData();
    } catch (error) {
      showMessage('error', 'Error al crear item');
    }
  };

  // Actualizar item del menú (solo estado local, se guarda al publicar)
  const updateMenuItem = (id: string, field: string, value: string | number | boolean) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Eliminar este plato?')) return;
    try {
      await supabase.from('restaurante_menu_items').delete().eq('id', id);
      loadAllData();
    } catch (error) {
      showMessage('error', 'Error al eliminar');
    }
  };

  // Galeria functions
  const addGaleriaItem = async () => {
    if (!sitio) return;
    const url = prompt('URL de la imagen:');
    if (!url) return;

    try {
      const { error } = await supabase.from('sitio_galeria').insert({
        sitio_id: sitio.id,
        url,
        es_home: false,
        orden: galeria.length
      });
      if (error) throw error;
      loadAllData();
      showMessage('success', 'Imagen agregada');
    } catch (error) {
      showMessage('error', 'Error al agregar imagen');
    }
  };

  // Toggle galería home (solo estado local, se guarda al publicar)
  const toggleGaleriaHome = (id: string, current: boolean) => {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, es_home: !current } : g));
  };

  // Actualizar item de galería (solo estado local, se guarda al publicar)
  const updateGaleriaItem = (id: string, field: string, value: string) => {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const deleteGaleriaItem = async (id: string) => {
    if (!confirm('Eliminar esta imagen?')) return;
    try {
      await supabase.from('sitio_galeria').delete().eq('id', id);
      loadAllData();
    } catch (error) {
      showMessage('error', 'Error al eliminar');
    }
  };

  // Features functions
  const addFeature = async () => {
    if (!sitio) return;

    try {
      const { error } = await supabase.from('sitio_features').insert({
        sitio_id: sitio.id,
        titulo: 'Nueva caracteristica',
        icono: 'Star',
        orden: features.length
      });
      if (error) throw error;
      loadAllData();
    } catch (error) {
      showMessage('error', 'Error al crear');
    }
  };

  // Actualizar feature (solo estado local, se guarda al publicar)
  const updateFeature = (id: string, field: string, value: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteFeature = async (id: string) => {
    if (!confirm('Eliminar esta caracteristica?')) return;
    try {
      await supabase.from('sitio_features').delete().eq('id', id);
      loadAllData();
    } catch (error) {
      showMessage('error', 'Error al eliminar');
    }
  };

  const pages = [
    { label: 'Inicio', value: '/' },
    { label: 'Menu', value: '/menu' },
    { label: 'Galeria', value: '/galeria' },
    { label: 'Reservas', value: '/reservas' },
    { label: 'Contacto', value: '/contacto' }
  ];

  const tabs = [
    { id: 'restaurante' as Tab, label: 'Info', icon: Store },
    { id: 'menu' as Tab, label: 'Menu', icon: UtensilsCrossed },
    { id: 'galeria' as Tab, label: 'Galeria', icon: Image },
    { id: 'features' as Tab, label: 'Features', icon: Sparkles }
  ];

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className={`admin-panel h-screen flex flex-col overflow-hidden p-4 gap-4 ${darkMode ? 'dark' : ''}`}>
      {/* Alert if no site */}
      {!sitio && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Store className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>No hay sitio configurado.</strong> Ve a la seccion "Info", llena los datos y haz clic en "Publicar" para comenzar.
          </p>
        </div>
      )}

      {/* Top Bar */}
      <div className="neuro-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-700">Editor Visual</h1>
          <div className="h-6 w-px bg-gray-300" />
          <select
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            className="neuro-select text-sm"
          >
            {pages.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Page Builder Mode Button */}
          <button
            onClick={togglePageBuilderMode}
            className={`neuro-btn px-3 py-2 flex items-center gap-2 text-sm transition-all ${
              pageBuilderMode ? 'neuro-btn-primary' : ''
            }`}
            title="Page Builder: Arrastra y reordena secciones"
          >
            <Layers className={`w-4 h-4 ${pageBuilderMode ? 'text-white' : ''}`} />
            <span className={`hidden md:inline ${pageBuilderMode ? 'text-white' : ''}`}>
              {pageBuilderMode ? 'Builder ON' : 'Page Builder'}
            </span>
          </button>

          <div className="h-6 w-px bg-gray-300" />

          {/* Edit Mode Toggle Switch */}
          <div className="flex items-center gap-2">
            <MousePointer2 className={`w-4 h-4 transition-colors ${!editMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
            <button
              onClick={() => setEditMode(!editMode)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                editMode
                  ? 'bg-[#d4af37]'
                  : 'neuro-inset'
              }`}
              title={editMode ? 'Modo Edicion: clic en elementos para editarlos' : 'Modo Navegacion: navega por la web normalmente'}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                  editMode
                    ? 'right-1 bg-white shadow-md'
                    : 'left-1 bg-gray-400'
                }`}
              />
            </button>
            <Pencil className={`w-4 h-4 transition-colors ${editMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Theme Toggle Switch */}
          <div className="flex items-center gap-2">
            <Sun className={`w-4 h-4 transition-colors ${!darkMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-[#d4af37]'
                  : 'neuro-inset'
              }`}
              title={darkMode ? 'Tema oscuro' : 'Tema claro'}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                  darkMode
                    ? 'right-1 bg-white shadow-md'
                    : 'left-1 bg-gray-400'
                }`}
              />
            </button>
            <Moon className={`w-4 h-4 transition-colors ${darkMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Device selector */}
          <div className="neuro-card-sm flex p-1 gap-1">
            {[
              { id: 'desktop' as Device, icon: Monitor },
              { id: 'tablet' as Device, icon: Tablet },
              { id: 'mobile' as Device, icon: Smartphone }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`p-2 rounded-lg transition-all ${
                  device === d.id ? 'neuro-tab active' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <d.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button onClick={refreshIframe} className="neuro-btn p-2" title="Refrescar">
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={currentPage}
            target="_blank"
            rel="noopener noreferrer"
            className="neuro-btn p-2"
            title="Abrir en nueva ventana"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="h-6 w-px bg-gray-300" />

          {/* Boton Publicar */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="neuro-btn neuro-btn-primary px-4 py-2 flex items-center gap-2"
            title="Publicar cambios"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Publicar</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`fixed top-20 right-8 z-50 neuro-card px-4 py-3 animate-fadeIn ${
          message.type === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Editor */}
        <div className="w-96 flex flex-col gap-4">
          {/* Page Builder Panel - cuando está activo */}
          {pageBuilderMode && (
            <div className="neuro-card p-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-semibold text-gray-700">Page Builder</h3>
                <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full ml-auto">Beta</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Haz clic en una seccion del preview y arrastrala para reordenar. Mantén pulsado para activar el modo arrastre.
              </p>
              <div className="space-y-2">
                {pageLayout.sort((a, b) => a.order - b.order).map((section, index) => (
                  <div
                    key={section.id}
                    className={`neuro-card-sm p-3 flex items-center gap-3 transition-all ${
                      selectedSection === section.id ? 'ring-2 ring-[#d4af37]' : ''
                    }`}
                  >
                    <div className="neuro-inset w-8 h-8 rounded-lg flex items-center justify-center text-gray-400">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 capitalize">{section.type.replace('-', ' ')}</p>
                      <p className="text-xs text-gray-400">Orden: {index + 1}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newLayout = pageLayout.map(s =>
                          s.id === section.id ? { ...s, visible: !s.visible } : s
                        );
                        setPageLayout(newLayout);
                        // Enviar al iframe
                        if (iframeRef.current?.contentWindow) {
                          iframeRef.current.contentWindow.postMessage(
                            { type: 'pagebuilder:update-layout', data: { sections: newLayout } },
                            window.location.origin
                          );
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        section.visible ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Los cambios de layout se guardan al publicar
                </p>
              </div>
            </div>
          )}

          {/* Tabs - solo si no está en page builder mode */}
          {!pageBuilderMode && (
            <div className="neuro-card p-2 flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`neuro-tab flex-1 flex items-center justify-center gap-2 ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Panel Content - solo si no está en page builder mode */}
          {!pageBuilderMode && (
          <div className="flex-1 neuro-card p-4 overflow-y-auto neuro-scroll">
            {/* RESTAURANTE TAB */}
            {activeTab === 'restaurante' && (
              <div className="space-y-3 animate-fadeIn">
                {/* ===== INICIO ===== */}
                <div className="neuro-card-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedPage(expandedPage === 'inicio' ? null : 'inicio')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${expandedPage === 'inicio' ? 'neuro-pressed' : 'neuro-flat'}`}>
                      <Home className={`w-4 h-4 ${expandedPage === 'inicio' ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Inicio</span>
                    {expandedPage === 'inicio' ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedPage === 'inicio' && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* HERO - Lo primero que se ve */}
                      <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Hero - Lo primero que se ve</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Nombre del restaurante</label>
                          <input type="text" data-field="nombre" value={formRestaurante.nombre} onChange={(e) => setFormRestaurante(f => ({ ...f, nombre: e.target.value }))} className="neuro-input text-sm" placeholder="Nombre del restaurante" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Frase destacada</label>
                          <input type="text" data-field="tagline" value={formRestaurante.tagline} onChange={(e) => setFormRestaurante(f => ({ ...f, tagline: e.target.value }))} className="neuro-input text-sm" placeholder="Ej: Cocina tradicional desde 1990" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Descripcion (opcional)</label>
                          <textarea value={formRestaurante.descripcion} onChange={(e) => setFormRestaurante(f => ({ ...f, descripcion: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} placeholder="Descripcion breve del restaurante" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Boton 1</label>
                            <input type="text" data-field="inicio_btn_menu" value={formRestaurante.inicio_btn_menu} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_btn_menu: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Boton 2</label>
                            <input type="text" data-field="inicio_btn_reservas" value={formRestaurante.inicio_btn_reservas} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_btn_reservas: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* SECCION CARACTERISTICAS */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Seccion Caracteristicas</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo de la seccion</label>
                          <input type="text" data-field="inicio_features_titulo" value={formRestaurante.inicio_features_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_features_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                          <input type="text" data-field="inicio_features_subtitulo" value={formRestaurante.inicio_features_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_features_subtitulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <p className="text-xs text-gray-400 italic">Las caracteristicas se editan en el tab "Features"</p>
                      </div>

                      {/* SECCION GALERIA DESTACADA */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Seccion Galeria Destacada</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo de la seccion</label>
                          <input type="text" data-field="inicio_galeria_titulo" value={formRestaurante.inicio_galeria_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_galeria_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                          <input type="text" data-field="inicio_galeria_subtitulo" value={formRestaurante.inicio_galeria_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_galeria_subtitulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Texto del boton</label>
                          <input type="text" data-field="inicio_galeria_btn" value={formRestaurante.inicio_galeria_btn} onChange={(e) => setFormRestaurante(f => ({ ...f, inicio_galeria_btn: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <p className="text-xs text-gray-400 italic">Las imagenes se editan en el tab "Galeria" (marcadas como "Home")</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== MENU ===== */}
                <div className="neuro-card-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedPage(expandedPage === 'menu' ? null : 'menu')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${expandedPage === 'menu' ? 'neuro-pressed' : 'neuro-flat'}`}>
                      <UtensilsCrossed className={`w-4 h-4 ${expandedPage === 'menu' ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Menu</span>
                    {expandedPage === 'menu' ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedPage === 'menu' && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* Encabezado de pagina */}
                      <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Encabezado de pagina</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo</label>
                          <input type="text" value={formRestaurante.menu_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, menu_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                          <textarea value={formRestaurante.menu_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, menu_subtitulo: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} />
                        </div>
                      </div>
                      {/* Filtro de categorias */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Filtro de categorias</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Texto "Ver todos"</label>
                          <input type="text" value={formRestaurante.menu_filtro_todos} onChange={(e) => setFormRestaurante(f => ({ ...f, menu_filtro_todos: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <p className="text-xs text-gray-400 italic">Las categorias y platos se editan en el tab "Menu"</p>
                      </div>
                      {/* Mensajes */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mensajes</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Sin items en categoria</label>
                          <input type="text" value={formRestaurante.menu_sin_items} onChange={(e) => setFormRestaurante(f => ({ ...f, menu_sin_items: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== GALERIA ===== */}
                <div className="neuro-card-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedPage(expandedPage === 'galeria' ? null : 'galeria')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${expandedPage === 'galeria' ? 'neuro-pressed' : 'neuro-flat'}`}>
                      <Image className={`w-4 h-4 ${expandedPage === 'galeria' ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Galeria</span>
                    {expandedPage === 'galeria' ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedPage === 'galeria' && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                      <div className="pt-3">
                        <label className="text-xs text-gray-500 mb-1 block">Titulo de pagina</label>
                        <input type="text" value={formRestaurante.galeria_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, galeria_titulo: e.target.value }))} className="neuro-input text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                        <textarea value={formRestaurante.galeria_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, galeria_subtitulo: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== RESERVAS ===== */}
                <div className="neuro-card-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedPage(expandedPage === 'reservas' ? null : 'reservas')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${expandedPage === 'reservas' ? 'neuro-pressed' : 'neuro-flat'}`}>
                      <CalendarCheck className={`w-4 h-4 ${expandedPage === 'reservas' ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Reservas</span>
                    {expandedPage === 'reservas' ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedPage === 'reservas' && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* Encabezado de pagina */}
                      <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Encabezado de pagina</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo</label>
                          <input type="text" value={formRestaurante.reservas_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                          <textarea value={formRestaurante.reservas_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_subtitulo: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} />
                        </div>
                      </div>
                      {/* Boton de envio */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Boton de envio</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Texto normal</label>
                            <input type="text" value={formRestaurante.reservas_btn_confirmar} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_btn_confirmar: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Texto enviando</label>
                            <input type="text" value={formRestaurante.reservas_btn_enviando} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_btn_enviando: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Mensaje de confirmacion */}
                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#d4af37] rounded-full"></div>
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mensaje de exito</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo</label>
                          <input type="text" value={formRestaurante.reservas_exito_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_exito_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Mensaje</label>
                          <textarea value={formRestaurante.reservas_exito_mensaje} onChange={(e) => setFormRestaurante(f => ({ ...f, reservas_exito_mensaje: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== CONTACTO ===== */}
                <div className="neuro-card-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedPage(expandedPage === 'contacto' ? null : 'contacto')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${expandedPage === 'contacto' ? 'neuro-pressed' : 'neuro-flat'}`}>
                      <Phone className={`w-4 h-4 ${expandedPage === 'contacto' ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Contacto</span>
                    {expandedPage === 'contacto' ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedPage === 'contacto' && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* Textos de pagina */}
                      <div className="pt-3 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Textos de pagina</p>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo</label>
                          <input type="text" value={formRestaurante.contacto_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, contacto_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Subtitulo</label>
                          <textarea value={formRestaurante.contacto_subtitulo} onChange={(e) => setFormRestaurante(f => ({ ...f, contacto_subtitulo: e.target.value }))} className="neuro-input text-sm resize-none" rows={2} />
                        </div>
                      </div>
                      {/* Telefonos */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Telefonos</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Principal</label>
                            <input type="tel" value={formRestaurante.telefono} onChange={(e) => setFormRestaurante(f => ({ ...f, telefono: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Secundario</label>
                            <input type="tel" value={formRestaurante.telefono_secundario} onChange={(e) => setFormRestaurante(f => ({ ...f, telefono_secundario: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Emails */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Emails</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Principal</label>
                            <input type="email" value={formRestaurante.email} onChange={(e) => setFormRestaurante(f => ({ ...f, email: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Reservas</label>
                            <input type="email" value={formRestaurante.email_reservas} onChange={(e) => setFormRestaurante(f => ({ ...f, email_reservas: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Direccion */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Direccion</p>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Calle</label>
                          <input type="text" value={formRestaurante.direccion_calle} onChange={(e) => setFormRestaurante(f => ({ ...f, direccion_calle: e.target.value }))} className="neuro-input text-sm" placeholder="Calle y numero" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Ciudad</label>
                            <input type="text" value={formRestaurante.direccion_ciudad} onChange={(e) => setFormRestaurante(f => ({ ...f, direccion_ciudad: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">CP</label>
                            <input type="text" value={formRestaurante.direccion_cp} onChange={(e) => setFormRestaurante(f => ({ ...f, direccion_cp: e.target.value }))} className="neuro-input text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Pais</label>
                          <input type="text" value={formRestaurante.direccion_pais} onChange={(e) => setFormRestaurante(f => ({ ...f, direccion_pais: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                      </div>
                      {/* Horarios */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Horarios</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Lun - Vie</label>
                            <input type="text" value={formRestaurante.horario_semana} onChange={(e) => setFormRestaurante(f => ({ ...f, horario_semana: e.target.value }))} className="neuro-input text-sm" placeholder="12:00 - 23:00" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Fin de semana</label>
                            <input type="text" value={formRestaurante.horario_finde} onChange={(e) => setFormRestaurante(f => ({ ...f, horario_finde: e.target.value }))} className="neuro-input text-sm" placeholder="12:00 - 00:00" />
                          </div>
                        </div>
                      </div>
                      {/* Redes sociales */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Redes sociales</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-gray-400" />
                            <input type="text" value={formRestaurante.instagram} onChange={(e) => setFormRestaurante(f => ({ ...f, instagram: e.target.value }))} className="neuro-input text-sm flex-1" placeholder="@usuario" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-gray-400" />
                            <input type="text" value={formRestaurante.facebook} onChange={(e) => setFormRestaurante(f => ({ ...f, facebook: e.target.value }))} className="neuro-input text-sm flex-1" placeholder="URL de Facebook" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-gray-400" />
                            <input type="text" value={formRestaurante.twitter} onChange={(e) => setFormRestaurante(f => ({ ...f, twitter: e.target.value }))} className="neuro-input text-sm flex-1" placeholder="@usuario" />
                          </div>
                        </div>
                      </div>
                      {/* Mapa */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Mapa</p>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">URL de Google Maps Embed</label>
                          <textarea value={formRestaurante.mapa_embed_url} onChange={(e) => setFormRestaurante(f => ({ ...f, mapa_embed_url: e.target.value }))} className="neuro-input text-sm resize-none font-mono text-xs" rows={2} placeholder="https://www.google.com/maps/embed?pb=..." />
                        </div>
                      </div>
                      {/* Info adicional */}
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Informacion adicional</p>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Titulo</label>
                          <input type="text" value={formRestaurante.contacto_info_titulo} onChange={(e) => setFormRestaurante(f => ({ ...f, contacto_info_titulo: e.target.value }))} className="neuro-input text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Descripcion</label>
                          <textarea value={formRestaurante.contacto_info_descripcion} onChange={(e) => setFormRestaurante(f => ({ ...f, contacto_info_descripcion: e.target.value }))} className="neuro-input text-sm resize-none" rows={3} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-4 animate-fadeIn">
                {!sitio && (
                  <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
                    Primero debes crear un restaurante en la seccion "Info"
                  </div>
                )}
                <button
                  onClick={addCategoria}
                  disabled={!sitio}
                  className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="w-4 h-4" />
                  Nueva categoria
                </button>

                {categorias.map(cat => (
                  <div key={cat.id} className="neuro-card-sm overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between bg-gray-100/50">
                      <span className="font-medium text-gray-700">{cat.nombre}</span>
                      <button
                        onClick={() => addMenuItem(cat.id)}
                        className="text-[#d4af37] hover:text-[#b8962f] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-200/50">
                      {menuItems.filter(i => i.categoria_id === cat.id).map(item => (
                        <div key={item.id} className="px-4 py-3 space-y-2">
                          <div className="flex items-center gap-2">
                            {item.imagen_url && (
                              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 neuro-inset">
                                <img src={item.imagen_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <input
                              type="text"
                              value={item.nombre}
                              onChange={(e) => updateMenuItem(item.id, 'nombre', e.target.value)}
                              className="neuro-input text-sm flex-1"
                            />
                            <button
                              onClick={() => updateMenuItem(item.id, 'disponible', !item.disponible)}
                              className={`cursor-pointer ${item.disponible ? 'text-green-500' : 'text-gray-400'}`}
                            >
                              {item.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteMenuItem(item.id)}
                              className="text-red-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2 pl-6">
                            <input
                              type="number"
                              value={item.precio}
                              onChange={(e) => updateMenuItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                              className="neuro-input text-sm w-20"
                              placeholder="Precio"
                            />
                            <input
                              type="text"
                              value={item.descripcion || ''}
                              onChange={(e) => updateMenuItem(item.id, 'descripcion', e.target.value)}
                              className="neuro-input text-sm flex-1"
                              placeholder="Descripcion"
                            />
                          </div>
                          <div className="pl-6">
                            <input
                              type="text"
                              value={item.imagen_url || ''}
                              onChange={(e) => updateMenuItem(item.id, 'imagen_url', e.target.value)}
                              className="neuro-input text-xs w-full font-mono"
                              placeholder="URL de imagen (opcional)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {categorias.length === 0 && sitio && (
                  <div className="neuro-card-sm p-8 text-center">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-2">No hay categorias en el menu</p>
                    <p className="text-gray-400 text-xs">Haz clic en "Nueva categoria" para comenzar</p>
                  </div>
                )}

                <button
                  onClick={refreshIframe}
                  className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar preview
                </button>
              </div>
            )}

            {/* GALERIA TAB */}
            {activeTab === 'galeria' && (
              <div className="space-y-4 animate-fadeIn">
                {!sitio && (
                  <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
                    Primero debes crear un restaurante en la seccion "Info"
                  </div>
                )}
                <button
                  onClick={addGaleriaItem}
                  disabled={!sitio}
                  className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="w-4 h-4" />
                  Agregar imagen
                </button>

                <div className="space-y-3">
                  {galeria.map(img => (
                    <div key={img.id} className="neuro-card-sm p-3 space-y-2">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg overflow-hidden neuro-inset flex-shrink-0">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={img.titulo || ''}
                            onChange={(e) => updateGaleriaItem(img.id, 'titulo', e.target.value)}
                            className="neuro-input text-sm w-full"
                            placeholder="Titulo de la imagen"
                          />
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => updateGaleriaItem(img.id, 'url', e.target.value)}
                            className="neuro-input text-xs w-full font-mono"
                            placeholder="URL de la imagen"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleGaleriaHome(img.id, img.es_home)}
                          className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                            img.es_home
                              ? 'bg-[#d4af37] text-white'
                              : 'neuro-flat text-gray-600'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          {img.es_home ? 'Visible en Home' : 'Mostrar en Home'}
                        </button>
                        <button
                          onClick={() => deleteGaleriaItem(img.id)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {galeria.length === 0 && sitio && (
                  <div className="neuro-card-sm p-8 text-center">
                    <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-2">No hay imagenes en la galeria</p>
                    <p className="text-gray-400 text-xs">Haz clic en "Agregar imagen" para comenzar</p>
                  </div>
                )}

                <button
                  onClick={refreshIframe}
                  className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar preview
                </button>
              </div>
            )}

            {/* FEATURES TAB */}
            {activeTab === 'features' && (
              <div className="space-y-4 animate-fadeIn">
                {!sitio && (
                  <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
                    Primero debes crear un restaurante en la seccion "Info"
                  </div>
                )}
                <button
                  onClick={addFeature}
                  disabled={!sitio}
                  className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="w-4 h-4" />
                  Nueva caracteristica
                </button>

                {features.map(feat => {
                  const IconComponent = getIconByName(feat.icono);
                  return (
                    <div key={feat.id} className="neuro-card-sm p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="neuro-pressed rounded-lg p-2 flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-[#d4af37]" />
                        </div>
                        <input
                          type="text"
                          value={feat.titulo}
                          onChange={(e) => updateFeature(feat.id, 'titulo', e.target.value)}
                          className="neuro-input text-sm flex-1"
                          placeholder="Titulo"
                        />
                        <button
                          onClick={() => deleteFeature(feat.id)}
                          className="text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={feat.descripcion || ''}
                        onChange={(e) => updateFeature(feat.id, 'descripcion', e.target.value)}
                        className="neuro-input text-sm resize-none"
                        rows={2}
                        placeholder="Descripcion"
                      />
                      {/* Selector de icono */}
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Icono</label>
                        <div className="flex flex-wrap gap-1">
                          {availableIcons.map(({ name, icon: Icon }) => (
                            <button
                              key={name}
                              onClick={() => updateFeature(feat.id, 'icono', name)}
                              className={`p-2 rounded-lg transition-all cursor-pointer ${
                                feat.icono === name
                                  ? 'neuro-pressed text-[#d4af37]'
                                  : 'neuro-flat text-gray-500 hover:text-gray-700'
                              }`}
                              title={name}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {features.length === 0 && sitio && (
                  <div className="neuro-card-sm p-8 text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-2">No hay caracteristicas</p>
                    <p className="text-gray-400 text-xs">Haz clic en "Nueva caracteristica" para comenzar</p>
                  </div>
                )}

                <button
                  onClick={refreshIframe}
                  className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar preview
                </button>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 neuro-card p-4 flex flex-col">
          <div
            className="flex-1 iframe-container p-2 flex items-center justify-center"
          >
            <div
              className="h-full bg-white rounded-lg overflow-hidden transition-all duration-300"
              style={{ width: deviceWidths[device] }}
            >
              <iframe
                ref={iframeRef}
                src={currentPage}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmacion */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowSaveModal(false)}
          />

          {/* Modal */}
          <div className="relative neuro-card p-8 max-w-md w-full mx-4 animate-fadeIn">
            {/* Boton cerrar */}
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icono */}
            <div className="neuro-inset w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#d4af37]" />
            </div>

            {/* Contenido */}
            <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
              Publicar cambios
            </h3>
            <p className="text-gray-500 text-center mb-8">
              Los cambios se guardaran y seran visibles en la web publica. ¿Deseas continuar?
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 neuro-btn py-3 text-gray-600 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setShowSaveModal(false);
                  await saveRestaurante();
                }}
                disabled={saving}
                className="flex-1 neuro-btn neuro-btn-primary py-3 font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
