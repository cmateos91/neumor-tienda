'use client';

import React from 'react';
import Image from 'next/image';
import { useRestaurant } from '@/lib/restaurant-context';
import EditableWrapper from '../_components/EditableWrapper';

export default function Galeria() {
  const { textos, galeria } = useRestaurant();
  const pageTexts = textos.galeria;

  // Filtrar solo las visibles (ya vienen filtradas del context, pero por si acaso)
  const visibleGallery = galeria.filter(g => g.visible !== false);

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableWrapper elementId="galeria.titulo" as="h1" className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </EditableWrapper>
          <EditableWrapper elementId="galeria.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </EditableWrapper>
        </div>

        {/* Gallery Grid */}
        {visibleGallery.length === 0 ? (
          <div className="neuro-flat rounded-3xl p-12 text-center">
            <p className="text-[#666666] text-lg">
              No hay imagenes en la galeria todavia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleGallery.map((image) => (
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
