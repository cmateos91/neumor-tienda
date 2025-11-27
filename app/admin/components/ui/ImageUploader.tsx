'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link2, AlertCircle } from 'lucide-react';
import { uploadImage, validateFile, isSupabaseStorageUrl, UploadProgress } from '@/lib/storage';

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onDelete?: () => void;
  folder?: string;
  placeholder?: string;
  className?: string;
  showUrlInput?: boolean;
  compact?: boolean;
}

type Mode = 'upload' | 'url';

export function ImageUploader({
  value,
  onChange,
  onDelete,
  folder = 'uploads',
  placeholder = 'Arrastra una imagen o haz clic para seleccionar',
  className = '',
  showUrlInput = true,
  compact = false
}: ImageUploaderProps) {
  const [mode, setMode] = useState<Mode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProgress = useCallback((p: UploadProgress) => {
    setProgress(p.percent);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validar antes de subir
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo invalido');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const result = await uploadImage(file, folder, handleProgress);

    setIsUploading(false);

    if (result.success && result.url) {
      onChange(result.url);
    } else {
      setError(result.error || 'Error al subir');
    }
  }, [folder, onChange, handleProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Solo se permiten imagenes');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      // Validar que sea una URL
      try {
        new URL(urlInput);
        onChange(urlInput.trim());
        setUrlInput('');
        setError(null);
      } catch {
        setError('URL invalida');
      }
    }
  }, [urlInput, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    onDelete?.();
    setError(null);
  }, [onChange, onDelete]);

  // Vista compacta para usar inline
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {value ? (
          <>
            <div className="w-10 h-10 rounded-lg overflow-hidden neuro-inset flex-shrink-0">
              <img src={value} alt="" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleClear}
              className="text-red-400 hover:text-red-600 p-1"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="neuro-btn p-2 text-gray-500 hover:text-[#d4af37]"
              title="Subir imagen"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>
    );
  }

  // Vista completa
  return (
    <div className={className}>
      {/* Tabs de modo */}
      {showUrlInput && !value && (
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
              mode === 'upload'
                ? 'bg-[#d4af37] text-white'
                : 'neuro-flat text-gray-600 hover:text-gray-800'
            }`}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            Subir
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
              mode === 'url'
                ? 'bg-[#d4af37] text-white'
                : 'neuro-flat text-gray-600 hover:text-gray-800'
            }`}
          >
            <Link2 className="w-3 h-3 inline mr-1" />
            URL
          </button>
        </div>
      )}

      {/* Preview de imagen existente */}
      {value ? (
        <div className="relative group">
          <div className="aspect-video rounded-xl overflow-hidden neuro-inset">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100"
              title="Cambiar imagen"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              title="Eliminar imagen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isSupabaseStorageUrl(value) && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
              Storage
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : mode === 'upload' ? (
        /* Zona de drop */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-3
            ${isDragging
              ? 'border-[#d4af37] bg-[#d4af37]/10'
              : 'border-gray-300 hover:border-gray-400 neuro-inset'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d4af37] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">Subiendo... {progress}%</span>
            </>
          ) : (
            <>
              <div className={`p-3 rounded-full ${isDragging ? 'bg-[#d4af37]/20' : 'bg-gray-100'}`}>
                <ImageIcon className={`w-6 h-6 ${isDragging ? 'text-[#d4af37]' : 'text-gray-400'}`} />
              </div>
              <p className="text-sm text-gray-500 text-center px-4">{placeholder}</p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP o GIF (max 5MB)</p>
            </>
          )}
        </div>
      ) : (
        /* Input de URL */
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="neuro-input flex-1 text-sm"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="neuro-btn neuro-btn-primary px-4 disabled:opacity-50"
            >
              Usar
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Pega la URL de una imagen externa
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
