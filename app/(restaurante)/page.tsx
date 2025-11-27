'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import EditableWrapper from './_components/EditableWrapper';
import EditableSection from './_components/EditableSection';
import { PageSection, defaultHomeLayout } from '@/lib/page-builder.types';
import { supabase } from '@/lib/supabase';
import { defaultTextosInicio, TextosInicio } from '@/lib/database.types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee
};

interface HomeData {
  sitioId: string;
  config: {
    nombre: string;
    tagline: string;
  };
  textos: TextosInicio;
  features: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
  }>;
  homeGallery: Array<{
    id: string;
    url: string;
    titulo: string | null;
  }>;
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<PageSection[]>(defaultHomeLayout.sections);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        // Cargar sitio activo
        const { data: sitioData } = await supabase
          .from('sitios')
          .select('*')
          .eq('activo', true)
          .limit(1)
          .single();

        if (sitioData) {
          // Cargar todo en paralelo
          const [configRes, textosRes, featuresRes, galeriaRes] = await Promise.all([
            supabase.from('sitio_config').select('*').eq('sitio_id', sitioData.id).single(),
            supabase.from('sitio_textos').select('pagina, textos').eq('sitio_id', sitioData.id),
            supabase.from('sitio_features').select('*').eq('sitio_id', sitioData.id).order('orden'),
            supabase.from('sitio_galeria').select('*').eq('sitio_id', sitioData.id).eq('es_home', true).eq('visible', true).order('orden')
          ]);

          const config = configRes.data;
          const textosMap: Record<string, Record<string, string>> = {};
          textosRes.data?.forEach((t: { pagina: string; textos: Record<string, string> }) => {
            textosMap[t.pagina] = t.textos;
          });
          const inicioTextos = textosMap['inicio'] || {};

          setData({
            sitioId: sitioData.id,
            config: {
              nombre: config?.nombre || 'Mi Restaurante',
              tagline: config?.tagline || 'Bienvenido a nuestra experiencia gastronómica'
            },
            textos: {
              btn_menu: inicioTextos.btn_menu || defaultTextosInicio.btn_menu,
              btn_reservas: inicioTextos.btn_reservas || defaultTextosInicio.btn_reservas,
              features_titulo: inicioTextos.features_titulo || defaultTextosInicio.features_titulo,
              features_subtitulo: inicioTextos.features_subtitulo || defaultTextosInicio.features_subtitulo,
              galeria_titulo: inicioTextos.galeria_titulo || defaultTextosInicio.galeria_titulo,
              galeria_subtitulo: inicioTextos.galeria_subtitulo || defaultTextosInicio.galeria_subtitulo,
              galeria_btn: inicioTextos.galeria_btn || defaultTextosInicio.galeria_btn
            },
            features: featuresRes.data?.map(f => ({
              id: f.id,
              titulo: f.titulo,
              descripcion: f.descripcion || '',
              icono: f.icono
            })) || [],
            homeGallery: galeriaRes.data?.map(g => ({
              id: g.id,
              url: g.url,
              titulo: g.titulo
            })) || []
          });
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Configurar sensor con delay para distinguir click de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Manejar mensajes del admin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data: msgData } = event.data || {};

      // Entrar/salir modo edición
      if (type === 'pagebuilder:enter-edit') {
        setIsEditMode(true);
      }
      if (type === 'pagebuilder:exit-edit') {
        setIsEditMode(false);
        setSelectedSectionId(null);
      }

      // Actualizar layout desde admin
      if (type === 'pagebuilder:update-layout') {
        if (msgData.sections) {
          setSections(msgData.sections);
        }
      }

      // Actualizar desde admin:restaurante (incluye config y textos)
      if (type === 'admin:restaurante') {
        setData(prev => prev ? ({
          ...prev,
          config: {
            nombre: msgData.nombre ?? prev.config.nombre,
            tagline: msgData.tagline ?? prev.config.tagline
          },
          textos: {
            btn_menu: msgData.inicio_btn_menu ?? prev.textos.btn_menu,
            btn_reservas: msgData.inicio_btn_reservas ?? prev.textos.btn_reservas,
            features_titulo: msgData.inicio_features_titulo ?? prev.textos.features_titulo,
            features_subtitulo: msgData.inicio_features_subtitulo ?? prev.textos.features_subtitulo,
            galeria_titulo: msgData.inicio_galeria_titulo ?? prev.textos.galeria_titulo,
            galeria_subtitulo: msgData.inicio_galeria_subtitulo ?? prev.textos.galeria_subtitulo,
            galeria_btn: msgData.inicio_galeria_btn ?? prev.textos.galeria_btn
          }
        }) : null);
      }

      // Actualizar features
      if (type === 'admin:features') {
        if (msgData.items) {
          setData(prev => prev ? ({
            ...prev,
            features: msgData.items.map((f: { id: string; titulo: string; descripcion?: string; icono: string }) => ({
              id: f.id,
              titulo: f.titulo,
              descripcion: f.descripcion || '',
              icono: f.icono
            }))
          }) : null);
        }
      }

      // Actualizar galería
      if (type === 'admin:galeria') {
        if (msgData.items) {
          const homeItems = msgData.items.filter((g: { es_home: boolean }) => g.es_home);
          setData(prev => prev ? ({
            ...prev,
            homeGallery: homeItems.map((g: { id: string; url: string; titulo?: string }) => ({
              id: g.id,
              url: g.url,
              titulo: g.titulo || null
            }))
          }) : null);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Notificar al admin cuando cambia el layout
  const notifyLayoutChange = useCallback((newSections: PageSection[]) => {
    window.parent.postMessage({
      type: 'preview:layout-changed',
      sections: newSections
    }, window.location.origin);
  }, []);

  // Notificar selección al admin
  const notifySelection = useCallback((sectionId: string | null) => {
    window.parent.postMessage({
      type: 'preview:section-selected',
      sectionId
    }, window.location.origin);
  }, []);

  // Manejar fin de drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));
        notifyLayoutChange(newItems);
        return newItems;
      });
    }
  };

  // Seleccionar sección
  const handleSelectSection = (id: string) => {
    setSelectedSectionId(id);
    notifySelection(id);
  };

  // Deseleccionar
  const handleDeselectSection = () => {
    setSelectedSectionId(null);
    notifySelection(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No se encontró el sitio</p>
      </div>
    );
  }

  const { config, textos, features, homeGallery } = data;

  // Ordenar secciones
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Renderizar sección por tipo
  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <section key={section.id} className="px-4 pt-12 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-8">
                <div className="neuro-flat rounded-[3rem] p-12 md:p-20">
                  <div className="neuro-pressed rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-[#d4af37]" />
                  </div>

                  <EditableWrapper elementId="inicio.hero.nombre" as="h1" className="text-5xl md:text-7xl font-bold text-[#2c2c2c] mb-6 tracking-tight transition-all">
                    {config.nombre}
                  </EditableWrapper>

                  <EditableWrapper elementId="inicio.hero.tagline" as="p" className="text-xl md:text-2xl text-[#666666] mb-8 max-w-3xl mx-auto leading-relaxed transition-all">
                    {config.tagline}
                  </EditableWrapper>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <EditableWrapper elementId="inicio.hero.btn_menu">
                      <Link href="/menu" prefetch={true}>
                        <button className="neuro-flat neuro-hover rounded-2xl px-8 py-4 text-[#2c2c2c] font-semibold w-full sm:w-auto transition-all cursor-pointer">
                          {textos.btn_menu}
                        </button>
                      </Link>
                    </EditableWrapper>
                    <EditableWrapper elementId="inicio.hero.btn_reservas">
                      <Link href="/reservas" prefetch={true}>
                        <button className="neuro-pressed rounded-2xl px-8 py-4 text-[#d4af37] font-semibold w-full sm:w-auto transition-all cursor-pointer">
                          {textos.btn_reservas}
                        </button>
                      </Link>
                    </EditableWrapper>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'features-grid':
        if (features.length === 0) return null;
        return (
          <section key={section.id} className="px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <EditableWrapper elementId="inicio.features.titulo" as="h2" className="text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-4 transition-all">
                  {textos.features_titulo}
                </EditableWrapper>
                <EditableWrapper elementId="inicio.features.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto transition-all">
                  {textos.features_subtitulo}
                </EditableWrapper>
              </div>

              <EditableWrapper elementId="inicio.features.items" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => {
                  const Icon = iconMap[feature.icono] || Star;
                  return (
                    <div
                      key={feature.id}
                      className="neuro-flat rounded-3xl p-8 text-center neuro-hover transition-all"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="neuro-pressed rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-[#d4af37]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#2c2c2c] mb-3 transition-all">
                        {feature.titulo}
                      </h3>
                      <p className="text-[#666666] text-sm leading-relaxed transition-all">
                        {feature.descripcion}
                      </p>
                    </div>
                  );
                })}
              </EditableWrapper>
            </div>
          </section>
        );

      case 'gallery-preview':
        if (homeGallery.length === 0) return null;
        return (
          <section key={section.id} className="px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="neuro-flat rounded-[3rem] p-8 md:p-16">
                <div className="text-center mb-12">
                  <EditableWrapper elementId="inicio.galeria.titulo" as="h2" className="text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-4 transition-all">
                    {textos.galeria_titulo}
                  </EditableWrapper>
                  <EditableWrapper elementId="inicio.galeria.subtitulo" as="p" className="text-[#666666] text-lg transition-all">
                    {textos.galeria_subtitulo}
                  </EditableWrapper>
                </div>

                <EditableWrapper elementId="inicio.galeria.items" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {homeGallery.slice(0, 3).map((image, i) => (
                    <div
                      key={image.id}
                      className="neuro-pressed rounded-2xl overflow-hidden h-64 neuro-hover relative transition-all"
                    >
                      <Image
                        src={image.url}
                        alt={image.titulo || `Ambiente ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </EditableWrapper>

                <div className="text-center mt-8">
                  <EditableWrapper elementId="inicio.galeria.btn">
                    <Link href="/galeria">
                      <button className="neuro-flat neuro-hover rounded-2xl px-8 py-4 text-[#2c2c2c] font-semibold transition-all cursor-pointer">
                        {textos.galeria_btn}
                      </button>
                    </Link>
                  </EditableWrapper>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Si no está en modo edición, renderizar normalmente
  if (!isEditMode) {
    return (
      <div className="min-h-screen page-transition">
        {sortedSections.filter(s => s.visible).map(renderSection)}
      </div>
    );
  }

  // Modo edición con drag and drop
  return (
    <div className="min-h-screen page-transition">
      {/* Indicador de modo edición */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#d4af37] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Modo Edicion - Arrastra las secciones para reordenar
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedSections.filter(s => s.visible).map((section) => (
            <EditableSection
              key={section.id}
              id={section.id}
              isEditMode={isEditMode}
              isSelected={selectedSectionId === section.id}
              onSelect={handleSelectSection}
              onDeselect={handleDeselectSection}
            >
              {renderSection(section)}
            </EditableSection>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
