'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SitioGaleria, SitioGaleriaInsert } from '@/lib/database.types';
import { Plus, Pencil, Trash2, Loader2, X, Star, StarOff, Image as ImageIcon } from 'lucide-react';

export default function AdminGaleria() {
  const [items, setItems] = useState<SitioGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitioId, setSitioId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SitioGaleria | null>(null);
  const [form, setForm] = useState<SitioGaleriaInsert>({
    sitio_id: '',
    url: '',
    titulo: '',
    descripcion: '',
    es_home: false,
    visible: true,
    orden: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: sitio } = await supabase
        .from('sitios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single();

      if (sitio) {
        setSitioId(sitio.id);

        const { data } = await supabase
          .from('sitio_galeria')
          .select('*')
          .eq('sitio_id', sitio.id)
          .order('orden');

        if (data) setItems(data);
      }
    } catch (error) {
      console.error('Error cargando galeria:', error);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (item?: SitioGaleria) => {
    if (item) {
      setEditing(item);
      setForm({
        sitio_id: item.sitio_id,
        url: item.url,
        titulo: item.titulo || '',
        descripcion: item.descripcion || '',
        es_home: item.es_home,
        visible: item.visible,
        orden: item.orden
      });
    } else {
      setEditing(null);
      setForm({
        sitio_id: sitioId || '',
        url: '',
        titulo: '',
        descripcion: '',
        es_home: false,
        visible: true,
        orden: items.length
      });
    }
    setShowModal(true);
  };

  const saveItem = async () => {
    if (!sitioId || !form.url) return;

    try {
      if (editing) {
        await supabase.from('sitio_galeria').update(form).eq('id', editing.id);
      } else {
        await supabase.from('sitio_galeria').insert({ ...form, sitio_id: sitioId });
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error guardando imagen:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Eliminar esta imagen?')) return;

    try {
      await supabase.from('sitio_galeria').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  };

  const toggleHome = async (item: SitioGaleria) => {
    try {
      await supabase.from('sitio_galeria').update({ es_home: !item.es_home }).eq('id', item.id);
      loadData();
    } catch (error) {
      console.error('Error actualizando:', error);
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
          <h1 className="text-3xl font-bold text-gray-800">Galeria</h1>
          <p className="text-gray-500 mt-2">Gestiona las imagenes de tu galeria</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva imagen
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay imagenes en la galeria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={item.url}
                  alt={item.titulo || 'Imagen'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => toggleHome(item)}
                    className={`p-2 rounded-lg ${item.es_home ? 'bg-amber-500 text-white' : 'bg-white text-gray-800'}`}
                    title={item.es_home ? 'Quitar de home' : 'Mostrar en home'}
                  >
                    {item.es_home ? <Star className="w-5 h-5" /> : <StarOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 bg-white text-gray-800 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {item.es_home && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded">
                    <Star className="w-4 h-4" />
                  </div>
                )}
              </div>
              {item.titulo && (
                <div className="p-3">
                  <p className="text-sm text-gray-800 truncate">{item.titulo}</p>
                </div>
              )}
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
                {editing ? 'Editar imagen' : 'Nueva imagen'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen *</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {form.url && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={form.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo (opcional)</label>
                <input
                  type="text"
                  value={form.titulo || ''}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="es_home"
                  checked={form.es_home}
                  onChange={(e) => setForm({ ...form, es_home: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="es_home" className="text-sm text-gray-700">Mostrar en la pagina de inicio</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveItem}
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
