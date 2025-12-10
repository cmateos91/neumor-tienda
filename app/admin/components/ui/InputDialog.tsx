'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';

export interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: 'text' | 'url' | 'email' | 'number';
  required?: boolean;
  loading?: boolean;
}

export function InputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  inputType = 'text',
  required = true,
  loading = false
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(defaultValue);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  const validate = (): boolean => {
    if (required && !value.trim()) {
      setError('Este campo es requerido');
      return false;
    }
    if (inputType === 'url' && value.trim()) {
      try {
        new URL(value);
      } catch {
        setError('Ingresa una URL valida');
        return false;
      }
    }
    if (inputType === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Ingresa un email valido');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleConfirm = () => {
    if (validate()) {
      onConfirm(value.trim());
      if (!loading) {
        onClose();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
    >
      {/* Message */}
      {message && (
        <p className="text-gray-500 text-sm mb-4">{message}</p>
      )}

      {/* Input */}
      <div className="mb-4">
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className={`neuro-input w-full ${error ? 'ring-2 ring-red-400' : ''}`}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1.5">{error}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 neuro-btn py-2.5 text-gray-600 font-medium disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 neuro-btn neuro-btn-primary py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}

export default InputDialog;
