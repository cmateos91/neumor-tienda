'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultTextosReservas, TextosReservas } from '@/lib/database.types';

export default function Reservas() {
  const [sitioId, setSitioId] = useState<string | null>(null);
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
  const [pageTexts, setPageTexts] = useState<TextosReservas>(defaultTextosReservas);

  useEffect(() => {
    async function loadData() {
      // Obtener sitio activo
      const { data: sitio } = await supabase
        .from('sitios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single();

      if (!sitio) return;
      setSitioId(sitio.id);

      // Cargar textos de la página
      const { data: textosData } = await supabase
        .from('sitio_textos')
        .select('textos')
        .eq('sitio_id', sitio.id)
        .eq('pagina', 'reservas')
        .single();

      if (textosData?.textos) {
        setPageTexts({
          titulo: textosData.textos.titulo || defaultTextosReservas.titulo,
          subtitulo: textosData.textos.subtitulo || defaultTextosReservas.subtitulo,
          exito_titulo: textosData.textos.exito_titulo || defaultTextosReservas.exito_titulo,
          exito_mensaje: textosData.textos.exito_mensaje || defaultTextosReservas.exito_mensaje,
          btn_confirmar: textosData.textos.btn_confirmar || defaultTextosReservas.btn_confirmar,
          btn_enviando: textosData.textos.btn_enviando || defaultTextosReservas.btn_enviando
        });
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
          titulo: data.reservas_titulo ?? prev.titulo,
          subtitulo: data.reservas_subtitulo ?? prev.subtitulo,
          exito_titulo: data.reservas_exito_titulo ?? prev.exito_titulo,
          exito_mensaje: data.reservas_exito_mensaje ?? prev.exito_mensaje,
          btn_confirmar: data.reservas_btn_confirmar ?? prev.btn_confirmar,
          btn_enviando: data.reservas_btn_enviando ?? prev.btn_enviando
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (sitioId) {
        // Guardar en sitio_reservas (nuevo schema)
        const { error: insertError } = await supabase.from('sitio_reservas').insert({
          sitio_id: sitioId,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          fecha: formData.fecha,
          hora: formData.hora,
          personas: formData.personas,
          notas: formData.notas || null,
          estado: 'pendiente'
        });

        if (insertError) throw insertError;
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
          <h2 className="text-4xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.exito_titulo}
          </h2>
          <p className="text-[#666666] text-lg">
            {pageTexts.exito_mensaje}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </h1>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </p>
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
              {isSubmitting ? pageTexts.btn_enviando : pageTexts.btn_confirmar}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
