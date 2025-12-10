'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import EditableWrapper from '../_components/EditableWrapper';

export default function Reservas() {
  const { sitioId, textos } = useRestaurant();
  const pageTexts = textos.reservas;

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: 2,
    notas: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (sitioId) {
        // Guardar en sitio_reservas
        const { data: reserva, error: insertError } = await supabase.from('sitio_reservas').insert({
          sitio_id: sitioId,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          fecha: formData.fecha,
          hora: formData.hora,
          personas: formData.personas,
          notas: formData.notas || null,
          estado: 'pendiente'
        }).select('id').single();

        if (insertError) throw insertError;

        // Enviar alerta al restaurante (no bloqueante)
        if (reserva?.id) {
          fetch('/api/reservas/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reservaId: reserva.id, tipo: 'nueva' })
          }).catch(console.error);
        }
      }

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fecha: '',
          hora: '',
          personas: 2,
          notas: ''
        });
      }, 3000);
    } catch (err) {
      console.error('Error guardando reserva:', err);
      setError('Error al procesar la reserva. Por favor, intentalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen px-4 py-20 flex items-center justify-center">
        <div className="neuro-flat rounded-[3rem] p-12 text-center max-w-2xl">
          <div className="neuro-pressed rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
          </div>
          <EditableWrapper elementId="reservas.exito_titulo" as="h2" className="text-4xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.exito_titulo}
          </EditableWrapper>
          <EditableWrapper elementId="reservas.exito_mensaje" as="p" className="text-[#666666] text-lg">
            {pageTexts.exito_mensaje}
          </EditableWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableWrapper elementId="reservas.titulo" as="h1" className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </EditableWrapper>
          <EditableWrapper elementId="reservas.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </EditableWrapper>
        </div>

        {/* Form */}
        <div className="neuro-flat rounded-[3rem] p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4af37]" />
                  Nombre Completo
                </label>
                <div className="neuro-pressed rounded-2xl p-4">
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  Email
                </label>
                <div className="neuro-pressed rounded-2xl p-4">
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d4af37]" />
                Telefono
              </label>
              <div className="neuro-pressed rounded-2xl p-4">
                <input
                  required
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                  placeholder="+34 912 345 678"
                />
              </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  Fecha
                </label>
                <div className="neuro-pressed rounded-2xl p-4">
                  <input
                    required
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  Hora
                </label>
                <div className="neuro-pressed rounded-2xl p-4">
                  <input
                    required
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleChange('hora', e.target.value)}
                    className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4af37]" />
                  Personas
                </label>
                <div className="neuro-pressed rounded-2xl p-4">
                  <input
                    required
                    type="number"
                    min="1"
                    max="20"
                    value={formData.personas}
                    onChange={(e) => handleChange('personas', parseInt(e.target.value))}
                    className="bg-transparent border-0 w-full outline-none text-[#2c2c2c]"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2c2c2c] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                Notas Especiales (Opcional)
              </label>
              <div className="neuro-pressed rounded-2xl p-4">
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                  className="bg-transparent border-0 w-full outline-none text-[#2c2c2c] min-h-[100px] resize-none"
                  placeholder="Alergias, preferencias de mesa, ocasiones especiales..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full neuro-flat neuro-hover rounded-2xl py-6 text-lg font-semibold text-[#2c2c2c] bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <EditableWrapper elementId="reservas.btn_enviando" as="span">
                  {pageTexts.btn_enviando}
                </EditableWrapper>
              ) : (
                <EditableWrapper elementId="reservas.btn" as="span">
                  {pageTexts.btn_confirmar}
                </EditableWrapper>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
