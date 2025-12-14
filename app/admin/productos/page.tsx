'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SitioProductoCategoria, SitioProduct, SitioProductInsert } from '@/lib/database.types';
import { Plus, Pencil, Trash2, Loader2, X, GripVertical } from 'lucide-react';

export default function AdminMenu() {
  const [categorias, setCategorias] = useState<SitioProductoCategoria[]>([]);
  const [items, setItems] = useState<SitioProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitioId, setSitioId] = useState<string | null>(null);

  // Modales
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<SitioProductoCategoria | null>(null);
  const [editingItem, setEditingItem] = useState<SitioProduct | null>(null);

  // Formularios
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', orden: 0 });
  const [itemForm, setItemForm] = useState<SitioProductInsert>({
    sitio_id: '',
    categoria_id: null,
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen_url: '',
    stock: 0, sku: "",
    disponible: true,
    destacado: false,
    orden: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Obtener sitio
      const { data: sitio } = await supabase
        .from('sitios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single();

      if (sitio) {
        setSitioId(sitio.id);

        // Cargar categorias e items
        const [catRes, itemRes] = await Promise.all([
          supabase.from('sitio_producto_categorias').select('*').eq('sitio_id', sitio.id).order('orden'),
          supabase.from('sitio_productos').select('*').eq('sitio_id', sitio.id).order('orden')
        ]);

        if (catRes.data) setCategorias(catRes.data);
        if (itemRes.data) setItems(itemRes.data);
      }
    } catch (error) {
      console.error('Error cargando menu:', error);
    } finally {
      setLoading(false);
    }
  }

  // === CATEGORIAS ===
  const openCategoriaModal = (categoria?: SitioProductoCategoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setCategoriaForm({ nombre: categoria.nombre, orden: categoria.orden });
    } else {
      setEditingCategoria(null);
      setCategoriaForm({ nombre: '', orden: categorias.length });
    }
    setShowCategoriaModal(true);
  };

  const saveCategoria = async () => {
    if (!sitioId || !categoriaForm.nombre) return;

    try {
      if (editingCategoria) {
        await supabase
          .from('sitio_producto_categorias')
          .update({ nombre: categoriaForm.nombre, orden: categoriaForm.orden })
          .eq('id', editingCategoria.id);
      } else {
        await supabase.from('sitio_producto_categorias').insert({
          sitio_id: sitioId,
          nombre: categoriaForm.nombre,
          orden: categoriaForm.orden
        });
      }
      setShowCategoriaModal(false);
      loadData();
    } catch (error) {
      console.error('Error guardando categoria:', error);
    }
  };

  const deleteCategoria = async (id: string) => {
    if (!confirm('Eliminar esta categoria y todos sus items?')) return;

    try {
      // Eliminar items de la categoria primero
      await supabase.from('sitio_productos').delete().eq('categoria_id', id);
      await supabase.from('sitio_producto_categorias').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando categoria:', error);
    }
  };

  // === ITEMS ===
  const openItemModal = (categoriaId: string, item?: SitioProduct) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        sitio_id: item.sitio_id,
        categoria_id: item.categoria_id,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        precio: item.precio,
        imagen_url: item.imagen_url || '',
        stock: item.stock || 0, sku: item.sku || "",
        disponible: item.disponible,
        destacado: item.destacado,
        orden: item.orden
      });
    } else {
      setEditingItem(null);
      const catItems = items.filter(i => i.categoria_id === categoriaId);
      setItemForm({
        sitio_id: sitioId || '',
        categoria_id: categoriaId,
        nombre: '',
        descripcion: '',
        precio: 0,
        imagen_url: '',
        stock: 0, sku: "",
        disponible: true,
        destacado: false,
        orden: catItems.length
      });
    }
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!sitioId || !itemForm.nombre) return;

    try {
      if (editingItem) {
        await supabase
          .from('sitio_productos')
          .update(itemForm)
          .eq('id', editingItem.id);
      } else {
        await supabase.from('sitio_productos').insert(itemForm);
      }
      setShowItemModal(false);
      loadData();
    } catch (error) {
      console.error('Error guardando item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Eliminar este item?')) return;

    try {
      await supabase.from('sitio_productos').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando item:', error);
    }
  };

  const toggleDisponible = async (item: SitioProduct) => {
    try {
      await supabase
        .from('sitio_productos')
        .update({ disponible: !item.disponible })
        .eq('id', item.id);
      loadData();
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
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
          <h1 className="text-3xl font-bold text-gray-800">Menu</h1>
          <p className="text-gray-500 mt-2">Gestiona las categorias y platos de tu menu</p>
        </div>
        <button
          onClick={() => openCategoriaModal()}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva categoria
        </button>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">No hay categorias. Crea una para empezar a anadir platos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-800">{categoria.nombre}</h3>
                  <span className="text-sm text-gray-500">
                    ({items.filter(i => i.categoria_id === categoria.id).length} items)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openItemModal(categoria.id)}
                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Anadir plato
                  </button>
                  <button
                    onClick={() => openCategoriaModal(categoria)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategoria(categoria.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {items
                  .filter(item => item.categoria_id === categoria.id)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${!item.disponible ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {item.nombre}
                            </span>
                            {!item.disponible && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">No disponible</span>
                            )}
                          </div>
                          {item.descripcion && (
                            <p className="text-sm text-gray-500 mt-1">{item.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-amber-600">{item.precio.toFixed(2)} EUR</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleDisponible(item)}
                            className={`text-xs px-2 py-1 rounded ${
                              item.disponible
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {item.disponible ? 'Disponible' : 'Activar'}
                          </button>
                          <button
                            onClick={() => openItemModal(categoria.id, item)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategoria ? 'Editar categoria' : 'Nueva categoria'}
              </h3>
              <button onClick={() => setShowCategoriaModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={categoriaForm.nombre}
                  onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCategoriaModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCategoria}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Editar plato' : 'Nuevo plato'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={itemForm.nombre}
                  onChange={(e) => setItemForm({ ...itemForm, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  value={itemForm.descripcion || ''}
                  onChange={(e) => setItemForm({ ...itemForm, descripcion: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (EUR) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.precio}
                  onChange={(e) => setItemForm({ ...itemForm, precio: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
                <input
                  type="url"
                  value={itemForm.imagen_url || ''}
                  onChange={(e) => setItemForm({ ...itemForm, imagen_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={itemForm.disponible}
                  onChange={(e) => setItemForm({ ...itemForm, disponible: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="disponible" className="text-sm text-gray-700">Disponible</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowItemModal(false)}
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
