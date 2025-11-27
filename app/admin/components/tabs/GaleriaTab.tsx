'use client';

import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, RefreshCw, Image, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { SitioGaleria } from '@/lib/database.types';
import { ImageUploader } from '../ui/ImageUploader';
import { isSupabaseStorageUrl } from '@/lib/storage';

interface GaleriaTabProps {
  sitio: { id: string } | null;
  galeria: SitioGaleria[];
  onAddItem: (url: string) => Promise<string | null>;
  onToggleHome: (id: string, current: boolean) => void;
  onToggleVisible: (id: string, current: boolean) => void;
  onUpdateItem: (id: string, field: string, value: string) => void;
  onDeleteItem: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  // Pending files - modo diferido
  addPendingFile?: (id: string, file: File, previewUrl: string, folder: string) => void;
  removePendingFile?: (id: string) => void;
  isPending?: (id: string) => boolean;
  // Pending deletes - eliminaciones diferidas
  markForDeletion?: (id: string, type: 'galeria' | 'menu', imageUrl?: string) => void;
  unmarkForDeletion?: (id: string) => void;
  isMarkedForDeletion?: (id: string) => boolean;
}

export function GaleriaTab({
  sitio,
  galeria,
  onAddItem,
  onToggleHome,
  onToggleVisible,
  onUpdateItem,
  onRefresh,
  addPendingFile,
  removePendingFile,
  isPending,
  markForDeletion,
  unmarkForDeletion,
  isMarkedForDeletion
}: GaleriaTabProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Modo diferido activado si tenemos las funciones
  const deferredMode = !!(addPendingFile && removePendingFile);
  const deferredDeleteMode = !!(markForDeletion && unmarkForDeletion && isMarkedForDeletion);

  // Cuando se sube/selecciona una imagen nueva
  const handleNewImage = async (url: string) => {
    if (url) {
      const newId = await onAddItem(url);
      if (newId) {
        setNewImageUrl('');
      }
    }
  };

  // Cuando se selecciona un archivo en modo diferido (nueva imagen)
  const handleNewFileSelect = async (file: File, previewUrl: string) => {
    // Crear item con preview y obtener el ID real
    const newId = await onAddItem(previewUrl);
    if (newId && addPendingFile) {
      // Usar el ID real del item creado
      addPendingFile(`galeria-${newId}`, file, previewUrl, 'galeria');
      setNewImageUrl('');
    }
  };

  // Cuando se cambia la imagen de un item existente en modo diferido
  const handleExistingFileSelect = (itemId: string) => (file: File, previewUrl: string) => {
    if (addPendingFile) {
      addPendingFile(`galeria-${itemId}`, file, previewUrl, 'galeria');
    }
  };

  // Eliminar imagen - modo diferido (sin confirmación, se puede restaurar)
  const handleDeleteItem = (item: SitioGaleria) => {
    // Limpiar archivo pendiente si existe
    if (removePendingFile) {
      removePendingFile(`galeria-${item.id}`);
    }

    if (deferredDeleteMode) {
      // Modo diferido: solo marcar para eliminación
      markForDeletion!(item.id, 'galeria', item.url);
    }
  };

  // Restaurar item marcado para eliminación
  const handleRestoreItem = (id: string) => {
    if (unmarkForDeletion) {
      unmarkForDeletion(id);
    }
  };

  // Cambiar imagen de un item existente
  const handleImageChange = async (item: SitioGaleria, newUrl: string) => {
    onUpdateItem(item.id, 'url', newUrl);
  };

  // Verificar si un item tiene imagen pendiente
  const hasItemPending = (id: string) => {
    if (!isPending) return false;
    return isPending(`galeria-${id}`);
  };

  // Verificar si un item está marcado para eliminación
  const isItemMarkedForDeletion = (id: string) => {
    if (!isMarkedForDeletion) return false;
    return isMarkedForDeletion(id);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {!sitio && (
        <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
          Primero debes crear un restaurante en la seccion "Info"
        </div>
      )}

      {/* Agregar nueva imagen */}
      {sitio && (
        <div className="neuro-card-sm p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Agregar imagen</h4>
          <ImageUploader
            value={newImageUrl}
            onChange={handleNewImage}
            onDelete={() => setNewImageUrl('')}
            folder="galeria"
            placeholder="Arrastra una imagen o haz clic para seleccionar"
            deferred={deferredMode}
            onFileSelect={handleNewFileSelect}
          />
        </div>
      )}

      {/* Lista de imagenes */}
      <div className="space-y-3">
        {galeria.map(img => {
          const markedForDeletion = isItemMarkedForDeletion(img.id);

          return (
            <div
              key={img.id}
              className={`neuro-card-sm overflow-hidden transition-all ${
                markedForDeletion ? 'opacity-60 ring-2 ring-red-300' : ''
              } ${!markedForDeletion && !img.visible ? 'opacity-70' : ''}`}
            >
              {/* Header con preview y acciones rapidas */}
              <div className="p-3 flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden neuro-inset flex-shrink-0">
                  <img src={img.url} alt="" className={`w-full h-full object-cover ${!img.visible ? 'grayscale' : ''}`} />
                  {markedForDeletion && (
                    <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {!markedForDeletion && !img.visible && (
                    <div className="absolute inset-0 bg-gray-500/30 flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {!markedForDeletion && img.visible && hasItemPending(img.id) && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">Pendiente</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {markedForDeletion ? (
                    <p className="text-sm text-red-600 font-medium">Marcada para eliminar</p>
                  ) : (
                    <input
                      type="text"
                      value={img.titulo || ''}
                      onChange={(e) => onUpdateItem(img.id, 'titulo', e.target.value)}
                      className="neuro-input text-sm w-full"
                      placeholder="Titulo de la imagen"
                    />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {markedForDeletion ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Se eliminará al publicar
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onToggleVisible(img.id, img.visible)}
                          className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                            img.visible
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                          title={img.visible ? 'Visible en galeria' : 'Oculta en galeria'}
                        >
                          {img.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {img.visible ? 'Visible' : 'Oculta'}
                        </button>
                        <button
                          onClick={() => onToggleHome(img.id, img.es_home)}
                          className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                            img.es_home
                              ? 'bg-[#d4af37] text-white'
                              : 'neuro-flat text-gray-600 hover:text-gray-800'
                          }`}
                          title={img.es_home ? 'Se muestra en Home' : 'No se muestra en Home'}
                        >
                          <Eye className="w-3 h-3" />
                          {img.es_home ? 'En Home' : 'Home'}
                        </button>
                        {isSupabaseStorageUrl(img.url) && !hasItemPending(img.id) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Storage
                          </span>
                        )}
                        {hasItemPending(img.id) && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            Pendiente
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {markedForDeletion ? (
                    <button
                      onClick={() => handleRestoreItem(img.id)}
                      className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="Restaurar"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setExpandedItem(expandedItem === img.id ? null : img.id)}
                        className="p-1.5 rounded-lg neuro-flat text-gray-500 hover:text-gray-700"
                        title="Editar imagen"
                      >
                        {expandedItem === img.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(img)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Panel expandible para cambiar imagen */}
              {!markedForDeletion && expandedItem === img.id && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-100 animate-fadeIn">
                  <p className="text-xs text-gray-500 mb-2 pt-3">Cambiar imagen:</p>
                  <ImageUploader
                    value={img.url}
                    onChange={(url) => handleImageChange(img, url)}
                    folder="galeria"
                    showUrlInput={true}
                    deferred={deferredMode}
                    onFileSelect={handleExistingFileSelect(img.id)}
                    hasPendingFile={hasItemPending(img.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {galeria.length === 0 && sitio && (
        <div className="neuro-card-sm p-8 text-center">
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay imagenes en la galeria</p>
          <p className="text-gray-400 text-xs">Sube tu primera imagen usando el area de arriba</p>
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

export default GaleriaTab;
