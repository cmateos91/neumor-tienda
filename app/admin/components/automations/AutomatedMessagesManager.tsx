'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Send,
  Instagram,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useAutomatedMessages } from '../../hooks/useAutomatedMessages';
import { AutomatedMessageEditor } from './AutomatedMessageEditor';
import type { AutomatedMessage, AutomatedMessageInput, MessageTrigger, MessageChannel } from '@/lib/integrations.types';

interface AutomatedMessagesManagerProps {
  sitioId: string | null;
}

const triggerLabels: Record<MessageTrigger, { label: string; description: string }> = {
  lead_created: { label: 'Nuevo Lead', description: 'Cuando llega un nuevo contacto' },
  message_received: { label: 'Mensaje Recibido', description: 'Cuando el cliente envia un mensaje' },
  reservation_created: { label: 'Nueva Reserva', description: 'Cuando se crea una reserva' },
  reservation_confirmed: { label: 'Reserva Confirmada', description: 'Cuando se confirma una reserva' },
  follow_up: { label: 'Seguimiento', description: 'Mensaje programado de seguimiento' }
};

const channelIcons: Record<MessageChannel, React.ReactNode> = {
  whatsapp: <Phone className="w-4 h-4 text-green-600" />,
  instagram_dm: <Instagram className="w-4 h-4 text-pink-600" />,
  facebook_messenger: <MessageSquare className="w-4 h-4 text-blue-600" />,
  email: <Mail className="w-4 h-4 text-gray-600" />,
  sms: <Phone className="w-4 h-4 text-purple-600" />,
  telegram: <Send className="w-4 h-4 text-sky-600" />
};

const channelLabels: Record<MessageChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram_dm: 'Instagram DM',
  facebook_messenger: 'Facebook Messenger',
  email: 'Email',
  sms: 'SMS',
  telegram: 'Telegram'
};

export function AutomatedMessagesManager({ sitioId }: AutomatedMessagesManagerProps) {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const restauranteId = process.env.NEXT_PUBLIC_RESTAURANTE_ID;

  const {
    messages,
    loading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
    toggleEnabled,
    getVariablesForTrigger
  } = useAutomatedMessages({ sitioId });

  const [showEditor, setShowEditor] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AutomatedMessage | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingMessage(null);
    setShowEditor(true);
  };

  const handleEdit = (message: AutomatedMessage) => {
    setEditingMessage(message);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este mensaje automatizado?')) return;

    setDeletingId(id);
    await deleteMessage(id);
    setDeletingId(null);
  };

  const handleSave = async (data: AutomatedMessageInput) => {
    if (editingMessage) {
      await updateMessage(editingMessage.id, data);
    } else {
      await createMessage(data);
    }
    setShowEditor(false);
    setEditingMessage(null);
  };

  const handleConnectMeta = async () => {
    try {
      const res = await fetch(`/api/meta/connect?clienteId=${restauranteId}`);
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error: No se recibió URL de conexión. Revisa la consola.");
        console.error("Respuesta:", data);
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="neuro-card p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Cargando mensajes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neuro-card p-6 bg-red-50 border border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Mensajes Automatizados</h2>
          <p className="text-sm text-gray-500">
            Configura respuestas automaticas para tus redes sociales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectMeta}
            disabled={connected === "meta_ok"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              connected === "meta_ok"
                ? 'bg-green-500 text-white cursor-not-allowed opacity-75'
                : 'bg-[#1877F2] text-white hover:bg-[#166fe5]'
            }`}
            title={connected === "meta_ok" ? "Ya conectado con Meta" : "Conectar con Meta"}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {connected === "meta_ok" ? 'Conectado' : 'Conectar Meta'}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Mensaje
          </button>
        </div>
      </div>

      {/* Lista de mensajes */}
      {messages.length === 0 ? (
        <div className="neuro-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No hay mensajes configurados
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer mensaje automatizado para responder a tus clientes
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            <Plus className="w-4 h-4" />
            Crear Mensaje
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`neuro-card p-5 transition-all ${
                !message.enabled ? 'opacity-60' : ''
              }`}
            >
              {/* Cabecera */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-800">{message.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      message.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {message.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {/* Trigger */}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {triggerLabels[message.trigger]?.label || message.trigger}
                    </span>

                    {/* Canal */}
                    <span className="flex items-center gap-1">
                      {channelIcons[message.channel]}
                      {channelLabels[message.channel]}
                    </span>

                    {/* Estadisticas */}
                    {message.times_sent > 0 && (
                      <span className="flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" />
                        {message.times_sent} enviados
                      </span>
                    )}

                    {/* Delay */}
                    {message.delay_seconds > 0 && (
                      <span className="text-amber-600">
                        Retraso: {message.delay_seconds}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(message.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={message.enabled ? 'Desactivar' : 'Activar'}
                  >
                    {message.enabled ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(message)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>

                  <button
                    onClick={() => handleDelete(message.id)}
                    disabled={deletingId === message.id}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className={`w-4 h-4 ${
                      deletingId === message.id ? 'text-gray-300' : 'text-red-500'
                    }`} />
                  </button>

                  <button
                    onClick={() => setExpandedMessage(
                      expandedMessage === message.id ? null : message.id
                    )}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {expandedMessage === message.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contenido expandido */}
              {expandedMessage === message.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Plantilla del mensaje:</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
                    {message.message_template}
                  </div>

                  {message.description && (
                    <p className="mt-3 text-sm text-gray-500">
                      {message.description}
                    </p>
                  )}

                  {message.schedule_start && message.schedule_end && (
                    <p className="mt-2 text-sm text-amber-600">
                      Horario: {message.schedule_start} - {message.schedule_end}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de editor */}
      {showEditor && (
        <AutomatedMessageEditor
          message={editingMessage}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingMessage(null);
          }}
          getVariables={getVariablesForTrigger}
        />
      )}
    </div>
  );
}
