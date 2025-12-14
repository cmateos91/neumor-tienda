'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, RefreshCw, UtensilsCrossed, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { SitioProductoCategoria, SitioProduct } from '@/lib/database.types';
import Image from 'next/image';
import { ImageUploader } from '../ui/ImageUploader';
import { FormTienda } from '../../hooks/useSitioData';

interface ProductosTabProps {
  sitio: { id: string } | null;
  categorias: SitioProductoCategoria[];
  productos: SitioProduct[];
  formTienda: FormTienda;
  setFormTienda: React.Dispatch<React.SetStateAction<FormTienda>>;
  onAddCategoria: (nombre: string) => Promise<boolean>;
  onAddProduct: (categoriaId: string) => Promise<boolean>;
  onUpdateProduct: (id: string, field: string, value: string | number | boolean) => void;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  // Dialog functions
  promptText: (title: string, placeholder?: string) => Promise<string | null>;
  // Pending files - modo diferido
  addPendingFile?: (id: string, file: File, previewUrl: string, folder: string) => void;
  removePendingFile?: (id: string) => void;
  isPending?: (id: string) => boolean;
  // Pending deletes - eliminaciones diferidas
  markForDeletion?: (id: string, type: 'galeria' | 'productos', imageUrl?: string) => void;
  unmarkForDeletion?: (id: string) => void;
  isMarkedForDeletion?: (id: string) => boolean;
}

export function ProductosTab({
  sitio,
  categorias,
  productos,
  formTienda,
  setFormTienda,
  onAddCategoria,
  onAddProduct,
  onUpdateProduct,
  onRefresh,
  promptText,
  addPendingFile,
  removePendingFile,
  isPending,
  markForDeletion,
  unmarkForDeletion,
  isMarkedForDeletion
}: ProductosTabProps) {
  const updateField = (field: keyof FormTienda, value: string) => {
    setFormTienda(prev => ({ ...prev, [field]: value }));
  };
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Modo diferido activado si tenemos las funciones
  const deferredMode = !!(addPendingFile && removePendingFile);
  const deferredDeleteMode = !!(markForDeletion && unmarkForDeletion && isMarkedForDeletion);

  const handleAddCategoria = async () => {
    const nombre = await promptText('Nueva categoria', 'Nombre de la categoria');
    if (nombre) {
      await onAddCategoria(nombre);
    }
  };

  // Eliminar item - modo diferido (sin confirmación, se puede restaurar)
  const handleDeleteProduct = (item: SitioProduct) => {
    // Limpiar archivo pendiente si existe
    if (removePendingFile) {
      removePendingFile(`menu-${item.id}`);
    }

    if (deferredDeleteMode) {
      // Modo diferido: solo marcar para eliminación
      markForDeletion!(item.id, 'productos', item.imagen_url || undefined);
    }
  };

  // Restaurar item marcado para eliminación
  const handleRestoreItem = (id: string) => {
    if (unmarkForDeletion) {
      unmarkForDeletion(id);
    }
  };

  // Cambiar imagen de un item en modo diferido
  const handleFileSelect = (itemId: string) => (file: File, previewUrl: string) => {
    if (addPendingFile) {
      addPendingFile(`menu-${itemId}`, file, previewUrl, 'productos');
    }
  };

  // Cambiar imagen de un item
  const handleImageChange = async (item: SitioProduct, newUrl: string) => {
    onUpdateProduct(item.id, 'imagen_url', newUrl);
  };

  // Verificar si un item tiene imagen pendiente
  const hasItemPending = (id: string) => {
    if (!isPending) return false;
    return isPending(`menu-${id}`);
  };

  // Verificar si un item está marcado para eliminación
  const isItemMarkedForDeletion = (id: string) => {
    if (!isMarkedForDeletion) return false;
    return isMarkedForDeletion(id);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Textos de página */}
      <div className="neuro-card-sm p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Textos de página</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Título</label>
          <input
            type="text"
            data-field="menu_titulo"
            value={formTienda.menu_titulo}
            onChange={(e) => updateField('menu_titulo', e.target.value)}
            className="neuro-input text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Subtítulo</label>
          <textarea
            data-field="menu_subtitulo"
            value={formTienda.menu_subtitulo}
            onChange={(e) => updateField('menu_subtitulo', e.target.value)}
            className="neuro-input text-sm resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Texto &quot;Ver todos&quot;</label>
          <input
            type="text"
            data-field="menu_filtro_todos"
            value={formTienda.menu_filtro_todos}
            onChange={(e) => updateField('menu_filtro_todos', e.target.value)}
            className="neuro-input text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mensaje sin items</label>
          <input
            type="text"
            data-field="menu_sin_items"
            value={formTienda.menu_sin_items}
            onChange={(e) => updateField('menu_sin_items', e.target.value)}
            className="neuro-input text-sm"
          />
        </div>
      </div>

      {/* Categorías y Platos */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Categorías y Platos</p>
      </div>

      {!sitio && (
        <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
          Primero debes crear un tienda en la seccion &quot;Info&quot;
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
              onClick={() => onAddProduct(cat.id)}
              className="text-[#d4af37] hover:text-[#b8962f] cursor-pointer"
              title="Agregar item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-200/50">
            {productos.filter(i => i.categoria_id === cat.id).map(item => {
              const markedForDeletion = isItemMarkedForDeletion(item.id);

              return (
                <div
                  key={item.id}
                  className={`px-4 py-3 space-y-2 transition-all ${
                    markedForDeletion ? 'opacity-60 bg-red-50' : ''
                  }`}
                >
                  {/* Fila principal */}
                  <div className="flex items-center gap-2">
                    {/* Preview de imagen */}
                    {item.imagen_url ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 neuro-inset">
                        <Image
                          src={item.imagen_url}
                          alt={item.nombre || 'Plato'}
                          className="w-full h-full object-cover"
                          fill
                        />
                        {markedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {!markedForDeletion && hasItemPending(item.id) && (
                          <div className="absolute inset-0 bg-amber-500/30" />
                        )}
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded flex-shrink-0 neuro-inset flex items-center justify-center ${
                        markedForDeletion ? 'bg-red-100' : ''
                      }`}>
                        {markedForDeletion ? (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    )}

                    {markedForDeletion ? (
                      <div className="flex-1">
                        <p className="text-sm text-red-600 font-medium line-through">{item.nombre}</p>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Se eliminará al publicar
                        </span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.nombre}
                        onChange={(e) => onUpdateProduct(item.id, 'nombre', e.target.value)}
                        className="neuro-input text-sm flex-1"
                        placeholder="Nombre del plato"
                      />
                    )}

                    {markedForDeletion ? (
                      <button
                        onClick={() => handleRestoreItem(item.id)}
                        className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50"
                        title="Restaurar"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onUpdateProduct(item.id, 'disponible', !item.disponible)}
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
                          onClick={() => handleDeleteProduct(item)}
                          className="text-red-400 hover:text-red-600 cursor-pointer p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Precio y descripcion - solo si no está marcado para eliminación */}
                  {!markedForDeletion && (
                    <div className="flex gap-2 pl-12">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={item.precio}
                          onChange={(e) => onUpdateProduct(item.id, 'precio', parseFloat(e.target.value) || 0)}
                          className="neuro-input text-sm w-24 pl-5"
                          placeholder="0.00"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.descripcion || ''}
                        onChange={(e) => onUpdateProduct(item.id, 'descripcion', e.target.value)}
                        className="neuro-input text-sm flex-1"
                        placeholder="Descripcion"
                      />
                    </div>
                  )}

                  {/* Panel expandido con imagen - solo si no está marcado para eliminación */}
                  {!markedForDeletion && expandedItem === item.id && (
                    <div className="pl-12 pt-2 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-gray-500">Imagen del plato (opcional):</p>
                        {hasItemPending(item.id) && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <ImageUploader
                        value={item.imagen_url || ''}
                        onChange={(url) => handleImageChange(item, url)}
                        onDelete={() => handleImageChange(item, '')}
                        folder="productos"
                        placeholder="Arrastra una imagen o haz clic"
                        showUrlInput={true}
                        deferred={deferredMode}
                        onFileSelect={handleFileSelect(item.id)}
                        hasPendingFile={hasItemPending(item.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {productos.filter(i => i.categoria_id === cat.id).length === 0 && (
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
          <p className="text-gray-400 text-xs">Haz clic en &quot;Nueva categoria&quot; para comenzar</p>
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

export default ProductosTab;
