'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { SitioGaleria, defaultTextosGaleria } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';

interface PageTexts {
  titulo: string;
  subtitulo: string;
}

export default function Galeria() {
  const [gallery, setGallery] = useState<SitioGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTexts, setPageTexts] = useState<PageTexts>(defaultTextosGaleria);

  useEffect(() => {
    async function loadData() {
      try {
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

        // Cargar textos y galería en paralelo
        const [textosRes, galeriaRes] = await Promise.all([
          supabase
            .from('sitio_textos')
            .select('textos')
            .eq('sitio_id', sitio.id)
            .eq('pagina', 'galeria')
            .single(),
          supabase
            .from('sitio_galeria')
            .select('*')
            .eq('sitio_id', sitio.id)
            .eq('visible', true)
            .order('orden')
        ]);

        if (textosRes.data?.textos) {
          setPageTexts({
            titulo: textosRes.data.textos.titulo || defaultTextosGaleria.titulo,
            subtitulo: textosRes.data.textos.subtitulo || defaultTextosGaleria.subtitulo
          });
        }

        setGallery(galeriaRes.data || []);
      } catch (error) {
        console.error('Error cargando galería:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Live preview desde el admin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};

      if (type === 'admin:restaurante') {
        setPageTexts(prev => ({
          titulo: data.galeria_titulo ?? prev.titulo,
          subtitulo: data.galeria_subtitulo ?? prev.subtitulo
        }));
      }

      if (type === 'admin:galeria') {
        if (data.items) {
          setGallery(data.items);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="neuro-flat rounded-3xl p-12 text-center">
            <p className="text-[#666666] text-lg">
              No hay imagenes en la galeria todavia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((image) => (
              <div
                key={image.id}
                className="neuro-flat rounded-3xl p-4 neuro-hover group"
              >
                <div className="neuro-pressed rounded-2xl overflow-hidden h-80 relative">
                  <Image
                    src={image.url}
                    alt={image.titulo || 'Imagen'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <h3 className="text-white font-semibold text-lg">{image.titulo || 'Imagen'}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
