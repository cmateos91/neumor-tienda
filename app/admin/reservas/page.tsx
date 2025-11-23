'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SitioReserva, EstadoReserva } from '@/lib/database.types';
import { Loader2, Calendar, Clock, Users, Phone, Mail, FileText, Check, X, Trash2 } from 'lucide-react';

export default function AdminReservas() {
  const [reservas, setReservas] = useState<SitioReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | 'todas'>('todas');
  const [sitioId, setSitioId] = useState<string | null>(null);

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
          .from('sitio_reservas')
          .select('*')
          .eq('sitio_id', sitio.id)
          .order('fecha', { ascending: false })
          .order('hora', { ascending: false });

        if (data) setReservas(data);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateEstado = async (id: string, estado: EstadoReserva) => {
    try {
      await supabase.from('sitio_reservas').update({ estado }).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const deleteReserva = async (id: string) => {
    if (!confirm('Eliminar esta reserva?')) return;

    try {
      await supabase.from('sitio_reservas').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando reserva:', error);
    }
  };

  const filteredReservas = filtroEstado === 'todas'
    ? reservas
    : reservas.filter(r => r.estado === filtroEstado);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'confirmada': return 'bg-green-100 text-green-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      case 'completada': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reservas</h1>
        <p className="text-gray-500 mt-2">Gestiona las reservas de tu negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{reservas.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700">
            {reservas.filter(r => r.estado === 'pendiente').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600">Confirmadas</p>
          <p className="text-2xl font-bold text-green-700">
            {reservas.filter(r => r.estado === 'confirmada').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-600">Canceladas</p>
          <p className="text-2xl font-bold text-red-700">
            {reservas.filter(r => r.estado === 'cancelada').length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(['todas', 'pendiente', 'confirmada', 'cancelada', 'completada'] as const).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === estado
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      {filteredReservas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay reservas{filtroEstado !== 'todas' ? ` ${filtroEstado}s` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservas.map((reserva) => (
            <div key={reserva.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{reserva.nombre}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatFecha(reserva.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{reserva.hora}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{reserva.personas} personas</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{reserva.email}</span>
                    </div>
                  </div>

                  {reserva.telefono && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                      <Phone className="w-4 h-4" />
                      <span>{reserva.telefono}</span>
                    </div>
                  )}

                  {reserva.notas && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm mt-2">
                      <FileText className="w-4 h-4 mt-0.5" />
                      <span>{reserva.notas}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {reserva.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => updateEstado(reserva.id, 'confirmada')}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateEstado(reserva.id, 'cancelada')}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                  {reserva.estado === 'cancelada' && (
                    <button
                      onClick={() => updateEstado(reserva.id, 'pendiente')}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Reactivar
                    </button>
                  )}
                  <button
                    onClick={() => deleteReserva(reserva.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
