'use client';

import React, { useState } from 'react';
import MenuCard from '../_components/MenuCard';
import { useRestaurant } from '@/lib/restaurant-context';
import EditableWrapper from '../_components/EditableWrapper';

export default function Menu() {
  const { textos, categorias, menuItems } = useRestaurant();
  const pageTexts = textos.menu;

  const [selectedCategory, setSelectedCategory] = useState(pageTexts.filtro_todos);

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

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableWrapper elementId="menu.titulo" as="h1" className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </EditableWrapper>
          <EditableWrapper elementId="menu.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </EditableWrapper>
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
            <EditableWrapper elementId="menu.sin_items" as="p" className="text-[#666666] text-lg">
              {pageTexts.sin_items}
            </EditableWrapper>
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
