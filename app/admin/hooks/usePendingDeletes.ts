'use client';

import { useState, useCallback } from 'react';
import { deleteImage, isSupabaseStorageUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export interface PendingDelete {
  id: string;
  type: 'galeria' | 'productos';
  imageUrl?: string; // URL de la imagen para eliminar del storage
}

export interface UsePendingDeletesReturn {
  // Set de IDs pendientes de eliminación
  pendingDeletes: Map<string, PendingDelete>;
  // Marcar un item para eliminación
  markForDeletion: (id: string, type: 'galeria' | 'productos', imageUrl?: string) => void;
  // Desmarcar un item (cancelar eliminación)
  unmarkForDeletion: (id: string) => void;
  // Verificar si un item está marcado para eliminación
  isMarkedForDeletion: (id: string) => boolean;
  // Verificar si hay items pendientes de eliminación
  hasPendingDeletes: boolean;
  // Cantidad de items pendientes
  pendingDeleteCount: number;
  // Ejecutar todas las eliminaciones pendientes
  executeAllDeletes: () => Promise<{ deletedGaleria: string[]; deletedMenu: string[] }>;
  // Limpiar todas las marcas de eliminación
  clearAllPendingDeletes: () => void;
}

export function usePendingDeletes(): UsePendingDeletesReturn {
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, PendingDelete>>(new Map());

  const markForDeletion = useCallback((id: string, type: 'galeria' | 'productos', imageUrl?: string) => {
    setPendingDeletes(prev => {
      const next = new Map(prev);
      next.set(id, { id, type, imageUrl });
      return next;
    });
  }, []);

  const unmarkForDeletion = useCallback((id: string) => {
    setPendingDeletes(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isMarkedForDeletion = useCallback((id: string) => {
    return pendingDeletes.has(id);
  }, [pendingDeletes]);

  const executeAllDeletes = useCallback(async (): Promise<{ deletedGaleria: string[]; deletedMenu: string[] }> => {
    const deletedGaleria: string[] = [];
    const deletedMenu: string[] = [];

    for (const [id, pending] of pendingDeletes) {
      try {
        // Eliminar imagen del storage si existe y es de Supabase
        if (pending.imageUrl && isSupabaseStorageUrl(pending.imageUrl)) {
          await deleteImage(pending.imageUrl);
        }

        // Eliminar de la base de datos
        if (pending.type === 'galeria') {
          const { error } = await supabase.from('sitio_galeria').delete().eq('id', id);
          if (!error) {
            deletedGaleria.push(id);
          }
        } else if (pending.type === 'productos') {
          const { error } = await supabase.from('sitio_productos').delete().eq('id', id);
          if (!error) {
            deletedMenu.push(id);
          }
        }
      } catch (error) {
        console.error(`Error deleting ${pending.type} item ${id}:`, error);
      }
    }

    // Limpiar los pendientes que se eliminaron exitosamente
    setPendingDeletes(prev => {
      const next = new Map(prev);
      for (const id of [...deletedGaleria, ...deletedMenu]) {
        next.delete(id);
      }
      return next;
    });

    return { deletedGaleria, deletedMenu };
  }, [pendingDeletes]);

  const clearAllPendingDeletes = useCallback(() => {
    setPendingDeletes(new Map());
  }, []);

  return {
    pendingDeletes,
    markForDeletion,
    unmarkForDeletion,
    isMarkedForDeletion,
    hasPendingDeletes: pendingDeletes.size > 0,
    pendingDeleteCount: pendingDeletes.size,
    executeAllDeletes,
    clearAllPendingDeletes
  };
}
