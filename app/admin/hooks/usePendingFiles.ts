'use client';

import { useState, useCallback } from 'react';
import { uploadImage } from '@/lib/storage';

export interface PendingFile {
  file: File;
  previewUrl: string;
  folder: string;
}

export interface UsePendingFilesReturn {
  // Map de id -> archivo pendiente
  pendingFiles: Map<string, PendingFile>;
  // Registrar un nuevo archivo pendiente
  addPendingFile: (id: string, file: File, previewUrl: string, folder: string) => void;
  // Eliminar un archivo pendiente
  removePendingFile: (id: string) => void;
  // Verificar si hay archivos pendientes
  hasPendingFiles: boolean;
  // Cantidad de archivos pendientes
  pendingCount: number;
  // Subir todos los archivos pendientes y obtener las URLs finales
  uploadAllPending: (onProgress?: (uploaded: number, total: number) => void) => Promise<Map<string, string>>;
  // Limpiar todos los pendientes (revocar blob URLs)
  clearAllPending: () => void;
  // Verificar si un ID tiene archivo pendiente
  isPending: (id: string) => boolean;
}

export function usePendingFiles(): UsePendingFilesReturn {
  const [pendingFiles, setPendingFiles] = useState<Map<string, PendingFile>>(new Map());

  const addPendingFile = useCallback((id: string, file: File, previewUrl: string, folder: string) => {
    setPendingFiles(prev => {
      const next = new Map(prev);
      // Si ya habia un archivo pendiente para este id, revocar el blob URL anterior
      const existing = next.get(id);
      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
      }
      next.set(id, { file, previewUrl, folder });
      return next;
    });
  }, []);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles(prev => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
      }
      next.delete(id);
      return next;
    });
  }, []);

  const uploadAllPending = useCallback(async (
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<Map<string, string>> => {
    const results = new Map<string, string>();
    const entries = Array.from(pendingFiles.entries());
    const total = entries.length;
    let uploaded = 0;

    for (const [id, pending] of entries) {
      try {
        const result = await uploadImage(pending.file, pending.folder);

        if (result.success && result.url) {
          results.set(id, result.url);
          // Revocar el blob URL
          URL.revokeObjectURL(pending.previewUrl);
        }

        uploaded++;
        onProgress?.(uploaded, total);
      } catch (error) {
        console.error(`Error uploading file for ${id}:`, error);
      }
    }

    // Limpiar todos los pendientes que se subieron exitosamente
    setPendingFiles(prev => {
      const next = new Map(prev);
      for (const id of results.keys()) {
        next.delete(id);
      }
      return next;
    });

    return results;
  }, [pendingFiles]);

  const clearAllPending = useCallback(() => {
    // Revocar todos los blob URLs
    for (const pending of pendingFiles.values()) {
      URL.revokeObjectURL(pending.previewUrl);
    }
    setPendingFiles(new Map());
  }, [pendingFiles]);

  const isPending = useCallback((id: string) => {
    return pendingFiles.has(id);
  }, [pendingFiles]);

  return {
    pendingFiles,
    addPendingFile,
    removePendingFile,
    hasPendingFiles: pendingFiles.size > 0,
    pendingCount: pendingFiles.size,
    uploadAllPending,
    clearAllPending,
    isPending
  };
}
