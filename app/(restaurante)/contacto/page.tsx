'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultTextosContacto } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';

interface PageTexts {
  titulo: string;
  subtitulo: string;
  info_titulo: string;
  info_descripcion: string;
}

interface ContactData {
  direccion_calle: string;
  direccion_ciudad: string;
  direccion_cp: string;
  direccion_pais: string;
  telefono: string;
  telefono_secundario: string;
  email: string;
  email_secundario: string;
  horario_semana: string;
  horario_finde: string;
  mapa_embed_url: string;
}

export default function Contacto() {
  const [loading, setLoading] = useState(true);
  const [pageTexts, setPageTexts] = useState<PageTexts>(defaultTextosContacto);
  const [contactData, setContactData] = useState<ContactData>({
    direccion_calle: '',
    direccion_ciudad: '',
    direccion_cp: '',
    direccion_pais: 'Espana',
    telefono: '',
    telefono_secundario: '',
    email: '',
    email_secundario: '',
    horario_semana: 'Lunes - Viernes: 12:00 - 23:00',
    horario_finde: 'Sabado - Domingo: 11:00 - 00:00',
    mapa_embed_url: ''
  });

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

        // Cargar textos y config en paralelo
        const [textosRes, configRes] = await Promise.all([
          supabase
            .from('sitio_textos')
            .select('textos')
            .eq('sitio_id', sitio.id)
            .eq('pagina', 'contacto')
            .single(),
          supabase
            .from('sitio_config')
            .select('*')
            .eq('sitio_id', sitio.id)
            .single()
        ]);

        if (textosRes.data?.textos) {
          setPageTexts({
            titulo: textosRes.data.textos.titulo || defaultTextosContacto.titulo,
            subtitulo: textosRes.data.textos.subtitulo || defaultTextosContacto.subtitulo,
            info_titulo: textosRes.data.textos.info_titulo || defaultTextosContacto.info_titulo,
            info_descripcion: textosRes.data.textos.info_descripcion || defaultTextosContacto.info_descripcion
          });
        }

        if (configRes.data) {
          setContactData({
            direccion_calle: configRes.data.direccion_calle || '',
            direccion_ciudad: configRes.data.direccion_ciudad || '',
            direccion_cp: configRes.data.direccion_cp || '',
            direccion_pais: configRes.data.direccion_pais || 'Espana',
            telefono: configRes.data.telefono || '',
            telefono_secundario: configRes.data.telefono_secundario || '',
            email: configRes.data.email || '',
            email_secundario: configRes.data.email_secundario || '',
            horario_semana: configRes.data.horario_semana || 'Lunes - Viernes: 12:00 - 23:00',
            horario_finde: configRes.data.horario_finde || 'Sabado - Domingo: 11:00 - 00:00',
            mapa_embed_url: configRes.data.mapa_embed_url || ''
          });
        }
      } catch (error) {
        console.error('Error cargando contacto:', error);
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
        // Actualizar textos
        setPageTexts(prev => ({
          titulo: data.contacto_titulo ?? prev.titulo,
          subtitulo: data.contacto_subtitulo ?? prev.subtitulo,
          info_titulo: data.contacto_info_titulo ?? prev.info_titulo,
          info_descripcion: data.contacto_info_descripcion ?? prev.info_descripcion
        }));

        // Actualizar datos de contacto
        setContactData(prev => ({
          direccion_calle: data.direccion_calle ?? prev.direccion_calle,
          direccion_ciudad: data.direccion_ciudad ?? prev.direccion_ciudad,
          direccion_cp: data.direccion_cp ?? prev.direccion_cp,
          direccion_pais: data.direccion_pais ?? prev.direccion_pais,
          telefono: data.telefono ?? prev.telefono,
          telefono_secundario: data.telefono_secundario ?? prev.telefono_secundario,
          email: data.email ?? prev.email,
          email_secundario: data.email_reservas ?? prev.email_secundario,
          horario_semana: data.horario_semana ?? prev.horario_semana,
          horario_finde: data.horario_finde ?? prev.horario_finde,
          mapa_embed_url: data.mapa_embed_url ?? prev.mapa_embed_url
        }));
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

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Direccion',
      details: [
        contactData.direccion_calle,
        `${contactData.direccion_ciudad}${contactData.direccion_cp ? `, ${contactData.direccion_cp}` : ''}`,
        contactData.direccion_pais
      ].filter(Boolean)
    },
    {
      icon: Phone,
      title: 'Telefono',
      details: [contactData.telefono, contactData.telefono_secundario].filter(Boolean)
    },
    {
      icon: Mail,
      title: 'Email',
      details: [contactData.email, contactData.email_secundario].filter(Boolean)
    },
    {
      icon: Clock,
      title: 'Horarios',
      details: [contactData.horario_semana, contactData.horario_finde].filter(Boolean)
    }
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="neuro-flat rounded-3xl p-8 neuro-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="neuro-pressed rounded-2xl p-4">
                    <info.icon className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2c2c2c] mb-3">
                      {info.title}
                    </h3>
                    {info.details.length > 0 ? (
                      info.details.map((detail, idx) => (
                        <p key={idx} className="text-[#666666] mb-1">
                          {detail}
                        </p>
                      ))
                    ) : (
                      <p className="text-[#999999] italic">No disponible</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="neuro-flat rounded-3xl p-6 h-full min-h-[600px]">
            <div className="neuro-pressed rounded-2xl overflow-hidden h-full">
              {contactData.mapa_embed_url ? (
                <iframe
                  src={contactData.mapa_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#e0e0e0]">
                  <p className="text-[#999999]">Mapa no configurado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 neuro-flat rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.info_titulo}
          </h2>
          <p className="text-[#666666] max-w-3xl mx-auto leading-relaxed">
            {pageTexts.info_descripcion}
          </p>
        </div>
      </div>
    </div>
  );
}
