'use client';

import React from 'react';
import {
  Home,
  ChevronDown, ChevronRight,
  Plus, Trash2,
  ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart,
  Users, Leaf, Flame, Coffee, Sparkles,
  LayoutPanelTop, PanelBottomClose,
  type LucideIcon
} from 'lucide-react';
import { FormTienda } from '../../hooks/useSitioData';
import { SitioFeature } from '@/lib/database.types';

// Iconos disponibles para features
const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'ChefHat', icon: ChefHat },
  { name: 'Award', icon: Award },
  { name: 'Clock', icon: Clock },
  { name: 'MapPin', icon: MapPin },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Wine', icon: Wine },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Users', icon: Users },
  { name: 'Leaf', icon: Leaf },
  { name: 'Flame', icon: Flame },
  { name: 'Coffee', icon: Coffee },
  { name: 'Sparkles', icon: Sparkles }
];

const getIconByName = (name: string): LucideIcon => {
  return availableIcons.find(i => i.name === name)?.icon || Star;
};

interface InicioTabProps {
  sitio: { id: string } | null;
  features: SitioFeature[];
  formTienda: FormTienda;
  setFormTienda: React.Dispatch<React.SetStateAction<FormTienda>>;
  expandedPage: string | null;
  setExpandedPage: (page: string | null) => void;
  onAddFeature: () => Promise<boolean>;
  onUpdateFeature: (id: string, field: string, value: string) => void;
  onDeleteFeature: (id: string) => Promise<boolean>;
  confirmDelete: (itemName: string) => Promise<boolean>;
}

export function InicioTab({
  sitio,
  features,
  formTienda,
  setFormTienda,
  expandedPage,
  setExpandedPage,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  confirmDelete
}: InicioTabProps) {
  const updateField = (field: keyof FormTienda, value: string) => {
    setFormTienda(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteFeature = async (feature: SitioFeature) => {
    const confirmed = await confirmDelete(feature.titulo);
    if (confirmed) {
      await onDeleteFeature(feature.id);
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* ===== CABECERA ===== */}
      <PageSection
        id="cabecera"
        label="Cabecera"
        icon={LayoutPanelTop}
        expanded={expandedPage === 'cabecera'}
        onToggle={() => setExpandedPage(expandedPage === 'cabecera' ? null : 'cabecera')}
      >
        <SectionBlock title="Texto de cabecera">
          <InputField
            label="Nombre del tienda (logo)"
            field="nombre"
            value={formTienda.nombre}
            onChange={updateField}
            placeholder="Nombre que aparece en la barra superior"
          />
        </SectionBlock>

        <SectionBlock title="Secciones de navegación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField
              label="Inicio"
              field="nav_inicio"
              value={formTienda.nav_inicio}
              onChange={updateField}
            />
            <InputField
              label="Menu"
              field="nav_menu"
              value={formTienda.nav_menu}
              onChange={updateField}
            />
            <InputField
              label="Galeria"
              field="nav_galeria"
              value={formTienda.nav_galeria}
              onChange={updateField}
            />
            <InputField
              label="Pedidor"
              field="nav_pedidos"
              value={formTienda.nav_pedidos}
              onChange={updateField}
            />
            <InputField
              label="Contacto"
              field="nav_contacto"
              value={formTienda.nav_contacto}
              onChange={updateField}
            />
          </div>
        </SectionBlock>
      </PageSection>

      {/* ===== INICIO ===== */}
      <PageSection
        id="inicio"
        label="Inicio"
        icon={Home}
        expanded={expandedPage === 'inicio'}
        onToggle={() => setExpandedPage(expandedPage === 'inicio' ? null : 'inicio')}
      >
        {/* HERO - Lo primero que se ve */}
        <SectionBlock title="Hero - Lo primero que se ve">
          <InputField
            label="Nombre del tienda"
            field="nombre"
            value={formTienda.nombre}
            onChange={updateField}
            placeholder="Nombre del tienda"
          />
          <InputField
            label="Frase destacada"
            field="tagline"
            value={formTienda.tagline}
            onChange={updateField}
            placeholder="Ej: Cocina tradicional desde 1990"
          />
          <TextAreaField
            label="Descripcion (opcional)"
            field="descripcion"
            value={formTienda.descripcion}
            onChange={updateField}
            placeholder="Descripcion breve del tienda"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Boton 1"
              field="inicio_btn_menu"
              value={formTienda.inicio_btn_menu}
              onChange={updateField}
            />
            <InputField
              label="Boton 2"
              field="inicio_btn_pedidos"
              value={formTienda.inicio_btn_pedidos}
              onChange={updateField}
            />
          </div>
        </SectionBlock>

        {/* SECCION GALERIA DESTACADA */}
        <SectionBlock title="Seccion Galeria Destacada">
          <InputField
            label="Titulo de la seccion"
            field="inicio_galeria_titulo"
            value={formTienda.inicio_galeria_titulo}
            onChange={updateField}
          />
          <InputField
            label="Subtitulo"
            field="inicio_galeria_subtitulo"
            value={formTienda.inicio_galeria_subtitulo}
            onChange={updateField}
          />
          <InputField
            label="Texto del boton"
            field="inicio_galeria_btn"
            value={formTienda.inicio_galeria_btn}
            onChange={updateField}
          />
          <p className="text-xs text-gray-400 italic">Las imagenes se editan en el tab &quot;Galeria&quot; (marcadas como &quot;Home&quot;)</p>
        </SectionBlock>

        {/* SECCION FEATURES */}
        <SectionBlock title="Seccion Features">
          <InputField
            label="Titulo de la seccion"
            field="inicio_features_titulo"
            value={formTienda.inicio_features_titulo}
            onChange={updateField}
          />
          <InputField
            label="Subtitulo"
            field="inicio_features_subtitulo"
            value={formTienda.inicio_features_subtitulo}
            onChange={updateField}
          />

          {/* Lista de características */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600">Características destacadas</p>
              {!sitio && (
                <p className="text-xs text-amber-600">Primero crea el tienda</p>
              )}
            </div>

            <button
              onClick={onAddFeature}
              disabled={!sitio}
              className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-4 h-4" />
              Nueva caracteristica
            </button>

            {features.map(feat => {
              const IconComponent = getIconByName(feat.icono);
              return (
                <div key={feat.id} className="neuro-card-sm p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="neuro-pressed rounded-lg p-2 flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <input
                      type="text"
                      value={feat.titulo}
                      onChange={(e) => onUpdateFeature(feat.id, 'titulo', e.target.value)}
                      className="neuro-input text-sm flex-1"
                      placeholder="Titulo"
                    />
                    <button
                      onClick={() => handleDeleteFeature(feat)}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={feat.descripcion || ''}
                    onChange={(e) => onUpdateFeature(feat.id, 'descripcion', e.target.value)}
                    className="neuro-input text-sm resize-none"
                    rows={2}
                    placeholder="Descripcion"
                  />
                  {/* Selector de icono */}
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Icono</label>
                    <div className="flex flex-wrap gap-1">
                      {availableIcons.map(({ name, icon: Icon }) => (
                        <button
                          key={name}
                          onClick={() => onUpdateFeature(feat.id, 'icono', name)}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            feat.icono === name
                              ? 'neuro-pressed text-[#d4af37]'
                              : 'neuro-flat text-gray-500 hover:text-gray-700'
                          }`}
                          title={name}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {features.length === 0 && sitio && (
              <div className="neuro-card-sm p-6 text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 text-sm mb-1">No hay caracteristicas</p>
                <p className="text-gray-400 text-xs">Haz clic en &quot;Nueva caracteristica&quot; para comenzar</p>
              </div>
            )}
          </div>
        </SectionBlock>
      </PageSection>

      {/* ===== PIE DE PAGINA ===== */}
      <PageSection
        id="footer"
        label="Pie de pagina"
        icon={PanelBottomClose}
        expanded={expandedPage === 'footer'}
        onToggle={() => setExpandedPage(expandedPage === 'footer' ? null : 'footer')}
      >
        <SectionBlock title="Contenido del pie">
          <TextAreaField
            label="Descripcion corta"
            field="descripcion"
            value={formTienda.descripcion}
            onChange={updateField}
            placeholder="Texto bajo el nombre en el pie"
            rows={2}
          />
          <InputField
            label="Horario semana"
            field="horario_semana"
            value={formTienda.horario_semana}
            onChange={updateField}
            placeholder="Ej: Lun-Vie 12:00 - 23:00"
          />
          <InputField
            label="Horario fin de semana"
            field="horario_finde"
            value={formTienda.horario_finde}
            onChange={updateField}
            placeholder="Ej: Sab-Dom 12:00 - 01:00"
          />
          <InputField
            label="Telefono principal"
            field="telefono"
            value={formTienda.telefono}
            onChange={updateField}
            placeholder="+34 ..."
            type="tel"
          />
          <InputField
            label="Email principal"
            field="email"
            value={formTienda.email}
            onChange={updateField}
            placeholder="contacto@tienda.com"
            type="email"
          />
        </SectionBlock>
      </PageSection>
    </div>
  );
}

// === Componentes auxiliares ===

interface PageSectionProps {
  id?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PageSection({ id, label, icon: Icon, expanded, onToggle, children }: PageSectionProps) {
  return (
    <div id={id} className="neuro-card-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${expanded ? 'neuro-pressed' : 'neuro-flat'}`}>
          <Icon className={`w-4 h-4 ${expanded ? 'text-[#d4af37]' : 'text-gray-500'}`} />
        </div>
        <span className="font-medium text-gray-700 flex-1">{label}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

interface SectionBlockProps {
  title: string;
  children: React.ReactNode;
}

function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  field: keyof FormTienda;
  value: string;
  onChange: (field: keyof FormTienda, value: string) => void;
  placeholder?: string;
  type?: string;
}

function InputField({ label, field, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        data-field={field}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="neuro-input text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  field: keyof FormTienda;
  value: string;
  onChange: (field: keyof FormTienda, value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextAreaField({ label, field, value, onChange, placeholder, rows = 2 }: TextAreaFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <textarea
        data-field={field}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="neuro-input text-sm resize-none"
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
}
