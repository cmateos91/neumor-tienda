'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSitio } from '@/lib/store-data';
import { Sitio, SitioConfigUpdate } from '@/lib/database.types';
import { Save, Loader2 } from 'lucide-react';

export default function AdminTienda() {
  const [sitio, setSitio] = useState<Sitio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<SitioConfigUpdate>({
    nombre: '',
    tagline: '',
    descripcion: '',
    telefono: '',
    telefono_secundario: '',
    email: '',
    email_secundario: '',
    direccion_calle: '',
    direccion_ciudad: '',
    direccion_cp: '',
    direccion_pais: '',
    horario_semana: '',
    horario_finde: '',
    instagram: '',
    facebook: '',
    twitter: '',
    mapa_embed_url: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar sitio según SLUG
        const sitioData = await getSitio();

        if (sitioData) {
          setSitio(sitioData);

          // Cargar config
          const { data: configData } = await supabase
            .from('sitio_config')
            .select('*')
            .eq('sitio_id', sitioData.id)
            .single();

          if (configData) {
            setForm({
              nombre: configData.nombre || '',
              tagline: configData.tagline || '',
              descripcion: configData.descripcion || '',
              telefono: configData.telefono || '',
              telefono_secundario: configData.telefono_secundario || '',
              email: configData.email || '',
              email_secundario: configData.email_secundario || '',
              direccion_calle: configData.direccion_calle || '',
              direccion_ciudad: configData.direccion_ciudad || '',
              direccion_cp: configData.direccion_cp || '',
              direccion_pais: configData.direccion_pais || '',
              horario_semana: configData.horario_semana || '',
              horario_finde: configData.horario_finde || '',
              instagram: configData.instagram || '',
              facebook: configData.facebook || '',
              twitter: configData.twitter || '',
              mapa_embed_url: configData.mapa_embed_url || ''
            });
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitio) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('sitio_config')
        .update(form)
        .eq('sitio_id', sitio.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Informacion guardada correctamente' });
    } catch (error) {
      console.error('Error guardando:', error);
      setMessage({ type: 'error', text: 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!sitio) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800">Primero debes configurar tu sitio.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Informacion del Tienda</h1>
        <p className="text-gray-500 mt-2">Configura los datos generales de tu tienda</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informacion Basica */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informacion Basica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del tienda *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={form.tagline || ''}
                onChange={handleChange}
                placeholder="Ej: Cocina tradicional desde 1990"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea
                name="descripcion"
                value={form.descripcion || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono principal</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono secundario</label>
              <input
                type="tel"
                name="telefono_secundario"
                value={form.telefono_secundario || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email general</label>
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email para pedidos</label>
              <input
                type="email"
                name="email_secundario"
                value={form.email_secundario || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Direccion */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Direccion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Calle y numero</label>
              <input
                type="text"
                name="direccion_calle"
                value={form.direccion_calle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="direccion_ciudad"
                value={form.direccion_ciudad || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codigo Postal</label>
              <input
                type="text"
                name="direccion_cp"
                value={form.direccion_cp || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
              <input
                type="text"
                name="direccion_pais"
                value={form.direccion_pais || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del mapa (embed)</label>
              <input
                type="url"
                name="mapa_embed_url"
                value={form.mapa_embed_url || ''}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Horarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lunes a Viernes</label>
              <input
                type="text"
                name="horario_semana"
                value={form.horario_semana || ''}
                onChange={handleChange}
                placeholder="Ej: 12:00 - 23:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin de semana</label>
              <input
                type="text"
                name="horario_finde"
                value={form.horario_finde || ''}
                onChange={handleChange}
                placeholder="Ej: 12:00 - 00:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                name="instagram"
                value={form.instagram || ''}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                name="facebook"
                value={form.facebook || ''}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="url"
                name="twitter"
                value={form.twitter || ''}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Boton guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
