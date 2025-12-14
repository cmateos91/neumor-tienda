'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSitio } from '@/lib/store-data';
import { SitioFeature, SitioFeatureInsert } from '@/lib/database.types';
import { Plus, Pencil, Trash2, Loader2, X, GripVertical, Sparkles } from 'lucide-react';

// Iconos disponibles de Lucide
const ICON_OPTIONS = [
  'UtensilsCrossed', 'Wine', 'Clock', 'MapPin', 'Star', 'Heart',
  'Users', 'Leaf', 'Flame', 'ChefHat', 'Coffee', 'Beer',
  'Cake', 'Pizza', 'Salad', 'Fish', 'Award', 'Crown'
];

export default function AdminFeatures() {
  const [features, setFeatures] = useState<SitioFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitioId, setSitioId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SitioFeature | null>(null);
  const [form, setForm] = useState<SitioFeatureInsert>({
    sitio_id: '',
    titulo: '',
    descripcion: '',
    icono: 'Star',
    orden: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const sitio = await getSitio();

      if (sitio) {
        setSitioId(sitio.id);

        const { data } = await supabase
          .from('sitio_features')
          .select('*')
          .eq('sitio_id', sitio.id)
          .order('orden');

        if (data) setFeatures(data);
      }
    } catch (error) {
      console.error('Error cargando features:', error);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (feature?: SitioFeature) => {
    if (feature) {
      setEditing(feature);
      setForm({
        sitio_id: feature.sitio_id,
        titulo: feature.titulo,
        descripcion: feature.descripcion || '',
        icono: feature.icono,
        orden: feature.orden
      });
    } else {
      setEditing(null);
      setForm({
        sitio_id: sitioId || '',
        titulo: '',
        descripcion: '',
        icono: 'Star',
        orden: features.length
      });
    }
    setShowModal(true);
  };

  const saveFeature = async () => {
    if (!sitioId || !form.titulo) return;

    try {
      if (editing) {
        await supabase.from('sitio_features').update(form).eq('id', editing.id);
      } else {
        await supabase.from('sitio_features').insert({ ...form, sitio_id: sitioId });
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error guardando feature:', error);
    }
  };

  const deleteFeature = async (id: string) => {
    if (!confirm('Eliminar esta caracteristica?')) return;

    try {
      await supabase.from('sitio_features').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando feature:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!sitioId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800">Primero debes configurar tu sitio.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Caracteristicas</h1>
          <p className="text-gray-500 mt-2">Destaca lo que hace especial a tu negocio</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva caracteristica
        </button>
      </div>

      {features.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay caracteristicas. Anade algunas para destacar tu negocio.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-300" />
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-xs">{feature.icono}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{feature.titulo}</h3>
                  {feature.descripcion && (
                    <p className="text-sm text-gray-500">{feature.descripcion}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(feature)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFeature(feature.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editing ? 'Editar caracteristica' : 'Nueva caracteristica'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Ingredientes frescos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  value={form.descripcion || ''}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icono: icon })}
                      className={`p-2 rounded-lg text-xs ${
                        form.icono === icon
                          ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {icon.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFeature}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
