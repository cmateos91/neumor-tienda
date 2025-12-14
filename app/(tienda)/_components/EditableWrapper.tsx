'use client';

import React, { useState, useEffect } from 'react';

interface EditableWrapperProps {
  children: React.ReactNode;
  elementId: string; // ID unico del elemento (ej: "inicio.hero.nombre")
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export default function EditableWrapper({
  children,
  elementId,
  className = '',
  as: Component = 'div',
  style
}: EditableWrapperProps) {
  // Determinar si estamos en iframe solo una vez
  const [inIframe] = useState(() => typeof window !== 'undefined' && window !== window.parent);
  const [editModeEnabled, setEditModeEnabled] = useState(false); // Navegacion por defecto
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!inIframe) return;

    // Escuchar mensajes del admin
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};

      // Escuchar cambios en el modo de edicion
      if (type === 'admin:editMode') {
        setEditModeEnabled(data.enabled);
        // Si se desactiva el modo edicion, deseleccionar
        if (!data.enabled) {
          setIsSelected(false);
          setIsHovered(false);
        }
      }

      if (type === 'admin:select') {
        setIsSelected(data.elementId === elementId);
      }

      if (type === 'admin:deselect') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [elementId, inIframe]);

  // El modo edicion esta activo si estamos en iframe Y el toggle esta activado
  const isEditMode = inIframe && editModeEnabled;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    // Detener completamente el evento para evitar navegacion
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    // Notificar al admin que se hizo clic en este elemento
    window.parent.postMessage({
      type: 'iframe:elementClick',
      data: { elementId }
    }, window.location.origin);
  };

  // Si no estamos en modo edicion, renderizar normal con el elemento y clases originales
  if (!isEditMode) {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={`editable-element ${className} ${isSelected ? 'editable-selected' : ''} ${isHovered ? 'editable-hover' : ''}`}
      style={style}
      onClickCapture={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable-id={elementId}
    >
      {children}

      {/* Tooltip con el nombre del elemento */}
      {isHovered && !isSelected && (
        <span className="editable-tooltip">
          Editar
        </span>
      )}

      {/* Indicador de seleccion */}
      {isSelected && (
        <span className="editable-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
      )}
    </Component>
  );
}
