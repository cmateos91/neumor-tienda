'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useRestaurant } from '@/lib/restaurant-context';
import EditableWrapper from '../_components/EditableWrapper';

export default function Contacto() {
  const { config, textos } = useRestaurant();
  const pageTexts = textos.contacto;

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Direccion',
      details: [
        config?.direccion_calle,
        `${config?.direccion_ciudad || ''}${config?.direccion_cp ? `, ${config.direccion_cp}` : ''}`,
        config?.direccion_pais
      ].filter(Boolean)
    },
    {
      icon: Phone,
      title: 'Telefono',
      details: [config?.telefono, config?.telefono_secundario].filter(Boolean)
    },
    {
      icon: Mail,
      title: 'Email',
      details: [config?.email, config?.email_secundario].filter(Boolean)
    },
    {
      icon: Clock,
      title: 'Horarios',
      details: [config?.horario_semana, config?.horario_finde].filter(Boolean)
    }
  ];

  return (
    <div className="min-h-screen px-4 py-12 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableWrapper elementId="contacto.titulo" as="h1" className="text-5xl md:text-6xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.titulo}
          </EditableWrapper>
          <EditableWrapper elementId="contacto.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto">
            {pageTexts.subtitulo}
          </EditableWrapper>
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
              {config?.mapa_embed_url ? (
                <iframe
                  src={config.mapa_embed_url}
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
          <EditableWrapper elementId="contacto.info.titulo" as="h2" className="text-3xl font-bold text-[#2c2c2c] mb-4">
            {pageTexts.info_titulo}
          </EditableWrapper>
          <EditableWrapper elementId="contacto.info.descripcion" as="p" className="text-[#666666] max-w-3xl mx-auto leading-relaxed">
            {pageTexts.info_descripcion}
          </EditableWrapper>
        </div>
      </div>
    </div>
  );
}
