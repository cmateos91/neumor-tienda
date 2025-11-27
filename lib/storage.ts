import { supabase } from './supabase';

// Nombre del bucket para imagenes
const BUCKET_NAME = 'imagenes';

// Tipos de archivos permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Tamano maximo en bytes (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Valida un archivo antes de subirlo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF'
    };
  }

  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Archivo muy grande (${sizeMB}MB). Maximo 5MB`
    };
  }

  return { valid: true };
}

/**
 * Genera un nombre unico para el archivo
 */
function generateFileName(originalName: string, folder?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = `${timestamp}-${random}.${extension}`;

  return folder ? `${folder}/${baseName}` : baseName;
}

/**
 * Sube una imagen a Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const filePath = generateFileName(file.name, folder);

  try {
    // Simular progreso ya que Supabase no tiene callback de progreso nativo
    // En produccion se podria usar XMLHttpRequest para progreso real
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percent: 0 });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Si el bucket no existe, dar instrucciones
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: `Bucket "${BUCKET_NAME}" no existe. Crealo en Supabase Dashboard > Storage`
        };
      }
      return { success: false, error: error.message };
    }

    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percent: 100 });
    }

    // Obtener URL publica
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (err) {
    console.error('Error uploading image:', err);
    return {
      success: false,
      error: 'Error al subir la imagen. Intenta de nuevo.'
    };
  }
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteImage(pathOrUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Si es una URL, extraer el path
    let path = pathOrUrl;

    if (pathOrUrl.startsWith('http')) {
      // Extraer path de la URL publica
      // Formato: https://xxx.supabase.co/storage/v1/object/public/imagenes/path/to/file.jpg
      const match = pathOrUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
      if (match) {
        path = match[1];
      } else {
        return { success: false, error: 'URL de imagen invalida' };
      }
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting image:', err);
    return { success: false, error: 'Error al eliminar la imagen' };
  }
}

/**
 * Obtiene la URL publica de una imagen por su path
 */
export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Verifica si una URL es del storage de Supabase
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('supabase.co/storage/v1/object/public/');
}

/**
 * Lista imagenes en una carpeta
 */
export async function listImages(folder?: string): Promise<{
  success: boolean;
  files?: { name: string; url: string }[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder || '', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const files = data
      .filter(item => !item.id.endsWith('/')) // Excluir carpetas
      .map(item => ({
        name: item.name,
        url: getImageUrl(folder ? `${folder}/${item.name}` : item.name)
      }));

    return { success: true, files };
  } catch (err) {
    console.error('Error listing images:', err);
    return { success: false, error: 'Error al listar imagenes' };
  }
}
