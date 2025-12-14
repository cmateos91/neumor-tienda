'use client';

import React from 'react';
import {
  Mail,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { FormTienda } from '../../hooks/useSitioData';

interface ContactoTabProps {
  formTienda: FormTienda;
  setFormTienda: React.Dispatch<React.SetStateAction<FormTienda>>;
  expandedPage: string | null;
  setExpandedPage: (page: string | null) => void;
}

export function ContactoTab({
  formTienda,
  setFormTienda,
  expandedPage,
  setExpandedPage
}: ContactoTabProps) {
  const updateField = (field: keyof FormTienda, value: string) => {
    setFormTienda(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* ===== CONTACTO ===== */}
      <PageSection
        id="contacto"
        label="Contacto"
        icon={Mail}
        expanded={expandedPage === 'contacto'}
        onToggle={() => setExpandedPage(expandedPage === 'contacto' ? null : 'contacto')}
      >
        {/* TEXTOS DE PÁGINA */}
        <SectionBlock title="Textos de página">
          <InputField
            label="Título de la página"
            field="contacto_titulo"
            value={formTienda.contacto_titulo}
            onChange={updateField}
            placeholder="Ej: Contacto"
          />
          <TextAreaField
            label="Subtítulo"
            field="contacto_subtitulo"
            value={formTienda.contacto_subtitulo}
            onChange={updateField}
            placeholder="Descripción breve para la página de contacto"
            rows={2}
          />
        </SectionBlock>

        {/* SECCIÓN DE INFORMACIÓN */}
        <SectionBlock title="Información adicional">
          <InputField
            label="Título de información"
            field="contacto_info_titulo"
            value={formTienda.contacto_info_titulo}
            onChange={updateField}
            placeholder="Ej: Cómo Llegar"
          />
          <TextAreaField
            label="Descripción de información"
            field="contacto_info_descripcion"
            value={formTienda.contacto_info_descripcion}
            onChange={updateField}
            placeholder="Información adicional sobre ubicación, horarios, etc."
            rows={3}
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
