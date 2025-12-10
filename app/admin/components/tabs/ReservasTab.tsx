'use client';

import React from 'react';
import {
  Calendar,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { FormRestaurante } from '../../hooks/useSitioData';

interface ReservasTabProps {
  formRestaurante: FormRestaurante;
  setFormRestaurante: React.Dispatch<React.SetStateAction<FormRestaurante>>;
  expandedPage: string | null;
  setExpandedPage: (page: string | null) => void;
}

export function ReservasTab({
  formRestaurante,
  setFormRestaurante,
  expandedPage,
  setExpandedPage
}: ReservasTabProps) {
  const updateField = (field: keyof FormRestaurante, value: string) => {
    setFormRestaurante(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* ===== RESERVAS ===== */}
      <PageSection
        id="reservas"
        label="Reservas"
        icon={Calendar}
        expanded={expandedPage === 'reservas'}
        onToggle={() => setExpandedPage(expandedPage === 'reservas' ? null : 'reservas')}
      >
        {/* TEXTOS DE PÁGINA */}
        <SectionBlock title="Textos de página">
          <InputField
            label="Título de la página"
            field="reservas_titulo"
            value={formRestaurante.reservas_titulo}
            onChange={updateField}
            placeholder="Ej: Reserva tu Mesa"
          />
          <TextAreaField
            label="Subtítulo"
            field="reservas_subtitulo"
            value={formRestaurante.reservas_subtitulo}
            onChange={updateField}
            placeholder="Descripción breve para la página de reservas"
            rows={2}
          />
        </SectionBlock>

        {/* FORMULARIO DE RESERVAS */}
        <SectionBlock title="Formulario de reservas">
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Texto del botón"
              field="reservas_btn_confirmar"
              value={formRestaurante.reservas_btn_confirmar}
              onChange={updateField}
              placeholder="Ej: Confirmar Reserva"
            />
            <InputField
              label="Texto enviando"
              field="reservas_btn_enviando"
              value={formRestaurante.reservas_btn_enviando}
              onChange={updateField}
              placeholder="Ej: Enviando..."
            />
          </div>
        </SectionBlock>

        {/* MENSAJE DE ÉXITO */}
        <SectionBlock title="Mensaje de éxito">
          <InputField
            label="Título de éxito"
            field="reservas_exito_titulo"
            value={formRestaurante.reservas_exito_titulo}
            onChange={updateField}
            placeholder="Ej: ¡Reserva Confirmada!"
          />
          <TextAreaField
            label="Mensaje de éxito"
            field="reservas_exito_mensaje"
            value={formRestaurante.reservas_exito_mensaje}
            onChange={updateField}
            placeholder="Mensaje que se muestra después de confirmar la reserva"
            rows={3}
          />
        </SectionBlock>
      </PageSection>
    </div>
  );
}

// === Componentes auxiliares ===

interface PageSectionProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PageSection({ id, label, icon: Icon, expanded, onToggle, children }: PageSectionProps) {
  return (
    <div className="neuro-card-sm overflow-hidden">
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
  field: keyof FormRestaurante;
  value: string;
  onChange: (field: keyof FormRestaurante, value: string) => void;
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
  field: keyof FormRestaurante;
  value: string;
  onChange: (field: keyof FormRestaurante, value: string) => void;
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
