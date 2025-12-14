'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, Variable } from 'lucide-react';
import type {
  AutomatedMessage,
  AutomatedMessageInput,
  MessageTrigger,
  MessageChannel,
  MessageVariable
} from '@/lib/integrations.types';

interface AutomatedMessageEditorProps {
  message: AutomatedMessage | null;
  onSave: (data: AutomatedMessageInput) => Promise<void>;
  onClose: () => void;
  getVariables: (trigger: MessageTrigger) => MessageVariable[];
}

const triggers: { value: MessageTrigger; label: string; description: string }[] = [
  { value: 'lead_created', label: 'Nuevo Lead', description: 'Cuando llega un nuevo contacto' },
  { value: 'message_received', label: 'Mensaje Recibido', description: 'Cuando el cliente envia un mensaje' },
  { value: 'pedidotion_created', label: 'Nueva Pedido', description: 'Cuando se crea una pedido' },
  { value: 'pedidotion_confirmed', label: 'Pedido Confirmada', description: 'Cuando se confirma una pedido' },
  { value: 'follow_up', label: 'Seguimiento', description: 'Mensaje programado' }
];

const channels: { value: MessageChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram_dm', label: 'Instagram DM' },
  { value: 'facebook_messenger', label: 'Facebook Messenger' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'telegram', label: 'Telegram' }
];

const daysOfWeek = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' }
];

export function AutomatedMessageEditor({
  message,
  onSave,
  onClose,
  getVariables
}: AutomatedMessageEditorProps) {
  const [formData, setFormData] = useState<AutomatedMessageInput>({
    name: '',
    description: '',
    trigger: 'lead_created',
    channel: 'whatsapp',
    message_template: '',
    enabled: true,
    delay_seconds: 0,
    schedule_start: undefined,
    schedule_end: undefined,
    schedule_days: [1, 2, 3, 4, 5, 6, 0]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (message) {
      setFormData({
        name: message.name,
        description: message.description || '',
        trigger: message.trigger,
        channel: message.channel,
        message_template: message.message_template,
        enabled: message.enabled,
        delay_seconds: message.delay_seconds,
        schedule_start: message.schedule_start,
        schedule_end: message.schedule_end,
        schedule_days: message.schedule_days || [1, 2, 3, 4, 5, 6, 0]
      });
      setShowSchedule(!!(message.schedule_start && message.schedule_end));
    }
  }, [message]);

  const variables = getVariables(formData.trigger);

  const insertVariable = (variableKey: string) => {
    const textarea = document.getElementById('message-template') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.message_template;
      const newText = text.substring(0, start) + variableKey + text.substring(end);

      setFormData(prev => ({ ...prev, message_template: newText }));

      // Restaurar cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableKey.length, start + variableKey.length);
      }, 0);
    }
  };

  const renderPreview = () => {
    let preview = formData.message_template;
    for (const v of variables) {
      const regex = new RegExp(v.variable_key.replace(/[{}]/g, '\\$&'), 'g');
      preview = preview.replace(regex, v.example_value);
    }
    return preview;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.message_template.trim()) {
      alert('Nombre y mensaje son requeridos');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        schedule_start: showSchedule ? formData.schedule_start : undefined,
        schedule_end: showSchedule ? formData.schedule_end : undefined,
        schedule_days: showSchedule ? formData.schedule_days : undefined
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    const current = formData.schedule_days || [];
    const newDays = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setFormData(prev => ({ ...prev, schedule_days: newDays }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {message ? 'Editar Mensaje' : 'Nuevo Mensaje Automatizado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del mensaje
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Bienvenida Instagram"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          {/* Trigger y Canal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuando disparar
              </label>
              <select
                value={formData.trigger}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  trigger: e.target.value as MessageTrigger
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {triggers.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {triggers.find(t => t.value === formData.trigger)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal de envio
              </label>
              <select
                value={formData.channel}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  channel: e.target.value as MessageChannel
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {channels.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variables disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Variable className="w-4 h-4" />
              Variables disponibles
              <span className="text-gray-400 font-normal">(click para insertar)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <button
                  key={v.variable_key}
                  type="button"
                  onClick={() => insertVariable(v.variable_key)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-sm hover:bg-amber-100 transition-colors"
                  title={v.description}
                >
                  {v.variable_key}
                </button>
              ))}
            </div>
          </div>

          {/* Plantilla del mensaje */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Mensaje
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Ocultar preview' : 'Ver preview'}
              </button>
            </div>
            <textarea
              id="message-template"
              value={formData.message_template}
              onChange={e => setFormData(prev => ({
                ...prev,
                message_template: e.target.value
              }))}
              rows={5}
              placeholder="Hola {{name}}, gracias por contactarnos..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
              required
            />

            {/* Preview */}
            {showPreview && formData.message_template && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                <p className="text-sm whitespace-pre-wrap">{renderPreview()}</p>
              </div>
            )}
          </div>

          {/* Retraso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retraso antes de enviar (segundos)
            </label>
            <input
              type="number"
              min="0"
              value={formData.delay_seconds}
              onChange={e => setFormData(prev => ({
                ...prev,
                delay_seconds: parseInt(e.target.value) || 0
              }))}
              className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = enviar inmediatamente
            </p>
          </div>

          {/* Horario */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSchedule}
                onChange={e => setShowSchedule(e.target.checked)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Limitar horario de envio
              </span>
            </label>

            {showSchedule && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Desde</label>
                    <input
                      type="time"
                      value={formData.schedule_start || '09:00'}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        schedule_start: e.target.value
                      }))}
                      className="px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                    <input
                      type="time"
                      value={formData.schedule_end || '21:00'}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        schedule_end: e.target.value
                      }))}
                      className="px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">Dias activos</label>
                  <div className="flex gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          formData.schedule_days?.includes(day.value)
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Descripcion opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripcion (opcional)
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nota interna sobre este mensaje..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (message ? 'Guardar Cambios' : 'Crear Mensaje')}
          </button>
        </div>
      </div>
    </div>
  );
}
