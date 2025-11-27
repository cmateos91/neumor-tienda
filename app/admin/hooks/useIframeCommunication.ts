'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageSection } from '@/lib/page-builder.types';
import { FormRestaurante } from './useSitioData';
import { RestauranteMenuCategoria, RestauranteMenuItem, SitioGaleria, SitioFeature } from '@/lib/database.types';

// Tipos de mensajes que enviamos al iframe
export type IframeMessageType =
  | 'restaurante'
  | 'menu'
  | 'galeria'
  | 'features'
  | 'editMode'
  | 'select';

// Mapeo de elementId a navegacion en el admin
export type Tab = 'restaurante' | 'menu' | 'galeria' | 'features';

export interface ElementNavigation {
  tab: Tab;
  page?: string;
  inputName?: string;
}

// Mapeo completo de elementos editables
export const elementToNavigation: Record<string, ElementNavigation> = {
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

// Interface para los callbacks de eventos del iframe
export interface IframeEventHandlers {
  onElementClick?: (elementId: string, nav: ElementNavigation) => void;
  onLayoutChanged?: (sections: PageSection[]) => void;
  onSectionSelected?: (sectionId: string | null) => void;
}

// Interface para el estado del hook
export interface IframeCommunicationState {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  selectedElement: string | null;
  pageBuilderMode: boolean;
  editMode: boolean;
}

// Interface para las acciones del hook
export interface IframeCommunicationActions {
  sendToIframe: (type: IframeMessageType, data: Record<string, unknown>) => void;
  refreshIframe: () => void;
  setEditMode: (enabled: boolean) => void;
  setPageBuilderMode: (enabled: boolean) => void;
  setSelectedElement: (elementId: string | null) => void;
  sendRestauranteData: (data: FormRestaurante) => void;
  sendMenuData: (categorias: RestauranteMenuCategoria[], items: RestauranteMenuItem[]) => void;
  sendGaleriaData: (items: SitioGaleria[]) => void;
  sendFeaturesData: (items: SitioFeature[]) => void;
  sendPageBuilderCommand: (command: 'enter-edit' | 'exit-edit' | 'update-layout', data?: { sections: PageSection[] }) => void;
}

export type UseIframeCommunicationReturn = IframeCommunicationState & IframeCommunicationActions;

export interface UseIframeCommunicationOptions {
  eventHandlers?: IframeEventHandlers;
}

export function useIframeCommunication(options: UseIframeCommunicationOptions = {}): UseIframeCommunicationReturn {
  const { eventHandlers } = options;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [pageBuilderMode, setPageBuilderMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Enviar mensaje generico al iframe
  const sendToIframe = useCallback((type: IframeMessageType, data: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: `admin:${type}`, data },
        window.location.origin
      );
    }
  }, []);

  // Refrescar iframe
  const refreshIframe = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  // Enviar datos de restaurante
  const sendRestauranteData = useCallback((data: FormRestaurante) => {
    sendToIframe('restaurante', data as unknown as Record<string, unknown>);
  }, [sendToIframe]);

  // Enviar datos de menu (convierte blob URLs a data URLs para el iframe)
  const sendMenuData = useCallback(async (categorias: RestauranteMenuCategoria[], items: RestauranteMenuItem[]) => {
    // Convertir blob URLs a data URLs para que funcionen en el iframe
    const processedItems = await Promise.all(
      items.map(async (item) => {
        if (item.imagen_url?.startsWith('blob:')) {
          try {
            const response = await fetch(item.imagen_url);
            const blob = await response.blob();
            return new Promise<RestauranteMenuItem>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({ ...item, imagen_url: reader.result as string });
              };
              reader.readAsDataURL(blob);
            });
          } catch {
            return item;
          }
        }
        return item;
      })
    );
    sendToIframe('menu', { categorias, items: processedItems });
  }, [sendToIframe]);

  // Enviar datos de galeria (convierte blob URLs a data URLs para el iframe)
  const sendGaleriaData = useCallback(async (items: SitioGaleria[]) => {
    // Convertir blob URLs a data URLs para que funcionen en el iframe
    const processedItems = await Promise.all(
      items.map(async (item) => {
        if (item.url?.startsWith('blob:')) {
          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            return new Promise<SitioGaleria>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({ ...item, url: reader.result as string });
              };
              reader.readAsDataURL(blob);
            });
          } catch {
            // Si falla, devolver el item sin cambios
            return item;
          }
        }
        return item;
      })
    );
    sendToIframe('galeria', { items: processedItems });
  }, [sendToIframe]);

  // Enviar datos de features
  const sendFeaturesData = useCallback((items: SitioFeature[]) => {
    sendToIframe('features', { items });
  }, [sendToIframe]);

  // Enviar comando de page builder
  const sendPageBuilderCommand = useCallback((
    command: 'enter-edit' | 'exit-edit' | 'update-layout',
    data?: { sections: PageSection[] }
  ) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: `pagebuilder:${command}`,
          ...(data && { data })
        },
        window.location.origin
      );
    }
  }, []);

  // Efecto para enviar editMode cuando cambia
  useEffect(() => {
    sendToIframe('editMode', { enabled: editMode });
  }, [editMode, sendToIframe]);

  // Efecto para enviar pageBuilderMode cuando cambia
  useEffect(() => {
    sendPageBuilderCommand(pageBuilderMode ? 'enter-edit' : 'exit-edit');
  }, [pageBuilderMode, sendPageBuilderCommand]);

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};

      // Clic en elemento editable
      if (type === 'iframe:elementClick') {
        const elementId = data?.elementId;
        const nav = elementToNavigation[elementId];

        if (nav) {
          setSelectedElement(elementId);

          // Notificar al iframe que seleccionamos este elemento
          sendToIframe('select', { elementId });

          // Llamar callback si existe
          eventHandlers?.onElementClick?.(elementId, nav);
        }
      }

      // Page Builder: layout changed
      if (type === 'preview:layout-changed') {
        const sections = data?.sections;
        if (sections) {
          eventHandlers?.onLayoutChanged?.(sections);
        }
      }

      // Page Builder: section selected
      if (type === 'preview:section-selected') {
        eventHandlers?.onSectionSelected?.(data?.sectionId ?? null);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [sendToIframe, eventHandlers]);

  return {
    // Estado
    iframeRef,
    selectedElement,
    pageBuilderMode,
    editMode,
    // Acciones
    sendToIframe,
    refreshIframe,
    setEditMode,
    setPageBuilderMode,
    setSelectedElement,
    sendRestauranteData,
    sendMenuData,
    sendGaleriaData,
    sendFeaturesData,
    sendPageBuilderCommand
  };
}

// Utilidad para hacer scroll y highlight a un input
export function scrollToAndHighlightInput(inputName: string) {
  setTimeout(() => {
    const input = document.querySelector(`[data-field="${inputName}"]`);
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (input as HTMLInputElement).focus();
      input.classList.add('input-highlight');
      setTimeout(() => input.classList.remove('input-highlight'), 2000);
    }
  }, 300);
}
