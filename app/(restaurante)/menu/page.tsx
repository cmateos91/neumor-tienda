'use client';

import React, { useState, useEffect } from 'react';
import MenuCard from '../Components/MenuCard';
import { supabase } from '@/lib/supabase';
import { RestauranteMenuCategoria, RestauranteMenuItem, defaultTextosMenu } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';

interface PageTexts {
  titulo: string;
  subtitulo: string;
  filtro_todos: string;
  sin_items: string;
}

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categorias, setCategorias] = useState<RestauranteMenuCategoria[]>([]);
  const [menuItems, setMenuItems] = useState<RestauranteMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTexts, setPageTexts] = useState<PageTexts>(defaultTextosMenu);

  useEffect(() => {
    async function loadMenu() {
      try {
        // Obtener sitio activo
        const { data: sitio } = await supabase
          .from('sitios')
          .select('id')
          .eq('activo', true)
          .limit(1)
          .single();

        if (!sitio) {
          setLoading(false);
          return;
        }

        // Cargar textos de la página
        const { data: textosData } = await supabase
          .from('sitio_textos')
          .select('textos')
          .eq('sitio_id', sitio.id)
          .eq('pagina', 'menu')
          .single();

        if (textosData?.textos) {
          setPageTexts({
            titulo: textosData.textos.titulo || defaultTextosMenu.titulo,
            subtitulo: textosData.textos.subtitulo || defaultTextosMenu.subtitulo,
            filtro_todos: textosData.textos.filtro_todos || defaultTextosMenu.filtro_todos,
            sin_items: textosData.textos.sin_items || defaultTextosMenu.sin_items
          });
          setSelectedCategory(textosData.textos.filtro_todos || defaultTextosMenu.filtro_todos);
        }

        // Cargar categorías y items en paralelo
        const [catRes, itemsRes] = await Promise.all([
          supabase
            .from('restaurante_menu_categorias')
            .select('*')
            .eq('sitio_id', sitio.id)
            .order('orden'),
          supabase
            .from('restaurante_menu_items')
            .select('*')
            .eq('sitio_id', sitio.id)
            .eq('disponible', true)
            .order('orden')
        ]);

        setCategorias(catRes.data || []);
        setMenuItems(itemsRes.data || []);
      } catch (error) {
        console.error('Error cargando menú:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  // Live preview desde el admin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};

      // Actualizar textos desde admin:restaurante
      if (type === 'admin:restaurante') {
        setPageTexts(prev => ({
          titulo: data.menu_titulo ?? prev.titulo,
          subtitulo: data.menu_subtitulo ?? prev.subtitulo,
          filtro_todos: data.menu_filtro_todos ?? prev.filtro_todos,
          sin_items: data.menu_sin_items ?? prev.sin_items
        }));
      }

      // Actualizar menú desde admin:menu
      if (type === 'admin:menu') {
        if (data.categorias) setCategorias(data.categorias);
        if (data.items) setMenuItems(data.items.filter((i: RestauranteMenuItem) => i.disponible));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Lista de categorías para el filtro
  const categoryNames = [pageTexts.filtro_todos, ...categorias.map(c => c.nombre)];

  // Preparar items para mostrar
  const allItems = menuItems.map(item => ({
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion || '',
    precio: item.precio,
    categoria: categorias.find(c => c.id === item.categoria_id)?.nombre || '',
    imagen_url: item.imagen_url || undefined,
    disponible: item.disponible
  }));

  const filteredItems = selectedCategory === pageTexts.filtro_todos
    ? allItems
    : allItems.filter(item => item.categoria === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </h1>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </p>
        </div>

        {/* Category Filter */}
        {categorias.length > 0 && (
          <div className="mb-12">
            <div className="neuro-flat rounded-3xl p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {categoryNames.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all cursor-pointer ${
                      selectedCategory === category
                        ? 'neuro-pressed text-[#d4af37]'
                        : 'neuro-flat neuro-hover text-[#2c2c2c]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="neuro-flat rounded-3xl p-12 text-center">
            <p className="text-[#666666] text-lg">
              {pageTexts.sin_items}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
