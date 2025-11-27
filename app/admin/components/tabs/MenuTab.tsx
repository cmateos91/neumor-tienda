'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, RefreshCw, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { RestauranteMenuCategoria, RestauranteMenuItem } from '@/lib/database.types';
import { ImageUploader } from '../ui/ImageUploader';
import { deleteImage, isSupabaseStorageUrl } from '@/lib/storage';

interface MenuTabProps {
  sitio: { id: string } | null;
  categorias: RestauranteMenuCategoria[];
  menuItems: RestauranteMenuItem[];
  onAddCategoria: (nombre: string) => Promise<boolean>;
  onAddMenuItem: (categoriaId: string) => Promise<boolean>;
  onUpdateMenuItem: (id: string, field: string, value: string | number | boolean) => void;
  onDeleteMenuItem: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  // Dialog functions
  promptText: (title: string, placeholder?: string) => Promise<string | null>;
  confirmDelete: (itemName: string) => Promise<boolean>;
}

export function MenuTab({
  sitio,
  categorias,
  menuItems,
  onAddCategoria,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onRefresh,
  promptText,
  confirmDelete
}: MenuTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleAddCategoria = async () => {
    const nombre = await promptText('Nueva categoria', 'Nombre de la categoria');
    if (nombre) {
      await onAddCategoria(nombre);
    }
  };

  const handleDeleteMenuItem = async (item: RestauranteMenuItem) => {
    const confirmed = await confirmDelete(item.nombre);
    if (confirmed) {
      // Si tiene imagen del storage, eliminarla
      if (item.imagen_url && isSupabaseStorageUrl(item.imagen_url)) {
        await deleteImage(item.imagen_url);
      }
      await onDeleteMenuItem(item.id);
    }
  };

  // Cambiar imagen de un item
  const handleImageChange = async (item: RestauranteMenuItem, newUrl: string) => {
    // Si la imagen anterior era del storage y la nueva es diferente, eliminar la anterior
    if (item.imagen_url && isSupabaseStorageUrl(item.imagen_url) && newUrl !== item.imagen_url) {
      await deleteImage(item.imagen_url);
    }
    onUpdateMenuItem(item.id, 'imagen_url', newUrl);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {!sitio && (
        <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
          Primero debes crear un restaurante en la seccion "Info"
        </div>
      )}

      <button
        onClick={handleAddCategoria}
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
              onClick={() => onAddMenuItem(cat.id)}
              className="text-[#d4af37] hover:text-[#b8962f] cursor-pointer"
              title="Agregar item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-200/50">
            {menuItems.filter(i => i.categoria_id === cat.id).map(item => (
              <div key={item.id} className="px-4 py-3 space-y-2">
                {/* Fila principal */}
                <div className="flex items-center gap-2">
                  {/* Preview de imagen */}
                  {item.imagen_url ? (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 neuro-inset relative group">
                      <img src={item.imagen_url} alt="" className="w-full h-full object-cover" />
                      {isSupabaseStorageUrl(item.imagen_url) && (
                        <div className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded flex-shrink-0 neuro-inset flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) => onUpdateMenuItem(item.id, 'nombre', e.target.value)}
                    className="neuro-input text-sm flex-1"
                    placeholder="Nombre del plato"
                  />
                  <button
                    onClick={() => onUpdateMenuItem(item.id, 'disponible', !item.disponible)}
                    className={`cursor-pointer p-1 ${item.disponible ? 'text-green-500' : 'text-gray-400'}`}
                    title={item.disponible ? 'Disponible' : 'No disponible'}
                  >
                    {item.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Mas opciones"
                  >
                    {expandedItem === item.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item)}
                    className="text-red-400 hover:text-red-600 cursor-pointer p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Precio y descripcion */}
                <div className="flex gap-2 pl-12">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={item.precio}
                      onChange={(e) => onUpdateMenuItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                      className="neuro-input text-sm w-24 pl-5"
                      placeholder="0.00"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.descripcion || ''}
                    onChange={(e) => onUpdateMenuItem(item.id, 'descripcion', e.target.value)}
                    className="neuro-input text-sm flex-1"
                    placeholder="Descripcion"
                  />
                </div>

                {/* Panel expandido con imagen */}
                {expandedItem === item.id && (
                  <div className="pl-12 pt-2 animate-fadeIn">
                    <p className="text-xs text-gray-500 mb-2">Imagen del plato (opcional):</p>
                    <ImageUploader
                      value={item.imagen_url || ''}
                      onChange={(url) => handleImageChange(item, url)}
                      onDelete={() => handleImageChange(item, '')}
                      folder="menu"
                      placeholder="Arrastra una imagen o haz clic"
                      showUrlInput={true}
                    />
                  </div>
                )}
              </div>
            ))}
            {menuItems.filter(i => i.categoria_id === cat.id).length === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                Sin items. Haz clic en + para agregar.
              </div>
            )}
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
        onClick={onRefresh}
        className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Actualizar preview
      </button>
    </div>
  );
}

export default MenuTab;
