'use client';

import { useState, useEffect } from 'react';

interface TiendaPreview {
  nombre?: string;
  tagline?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  direccion_calle?: string;
  direccion_ciudad?: string;
  horario_semana?: string;
  horario_finde?: string;
}

interface MenuPreview {
  categorias: Array<{ id: string; nombre: string; orden: number }>;
  items: Array<{
    id: string;
    categoria_id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagen_url?: string;
    disponible: boolean;
  }>;
}

interface GaleriaPreview {
  items: Array<{
    id: string;
    url: string;
    titulo?: string;
    es_home: boolean;
  }>;
}

interface FeaturePreview {
  items: Array<{
    id: string;
    titulo: string;
    descripcion?: string;
    icono: string;
  }>;
}

// Hook para tienda
export function useLiveTienda(initial: TiendaPreview) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'admin:tienda') {
        setData(prev => ({ ...prev, ...event.data.data }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return data;
}

// Hook para menu
export function useLiveMenu(initialCategorias: MenuPreview['categorias'], initialItems: MenuPreview['items']) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'admin:menu') {
        const { categorias: newCats, items: newItems } = event.data.data;
        if (newCats) setCategorias(newCats);
        if (newItems) setItems(newItems);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return { categorias, items };
}

// Hook para galeria
export function useLiveGaleria(initial: GaleriaPreview['items']) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'admin:galeria') {
        if (event.data.data.items) setItems(event.data.data.items);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return items;
}

// Hook para features
export function useLiveFeatures(initial: FeaturePreview['items']) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'admin:features') {
        if (event.data.data.items) setItems(event.data.data.items);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return items;
}

// Hook generico para escuchar cualquier mensaje del admin
export function useAdminMessage<T>(messageType: string, initial: T): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === `admin:${messageType}`) {
        setData(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [messageType]);

  return data;
}
