'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditableSectionProps {
  id: string;
  children: ReactNode;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  className?: string;
}

export default function EditableSection({
  id,
  children,
  isEditMode,
  isSelected,
  onSelect,
  onDeselect,
  className = ''
}: EditableSectionProps) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isLifted, setIsLifted] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: !isEditMode || !isSelected
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  // Long press detection
  const handlePointerDown = () => {
    if (!isEditMode) return;

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsLifted(true);
      onSelect(id);

      // Vibración haptic si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms para activar long-press
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  const handlePointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  // Click para seleccionar en modo edición
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    e.stopPropagation();
    if (isSelected) {
      // Si ya está seleccionado, deseleccionar
      setIsLifted(false);
      onDeselect();
    } else {
      onSelect(id);
    }
  };

  // Deseleccionar al hacer click fuera
  useEffect(() => {
    if (!isEditMode || !isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setIsLifted(false);
        onDeselect();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditMode, isSelected, onDeselect]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Sincronizar isLifted con isSelected
  useEffect(() => {
    if (!isSelected && isLifted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLifted(false);
    }
  }, [isSelected, isLifted]);

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={{
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className={`
        ${className}
        relative
        transition-all duration-300 ease-out
        select-none
        ${isSelected ? 'ring-2 ring-[#d4af37] ring-offset-4 ring-offset-[#e0e0e0] scale-[1.01] shadow-xl z-50 cursor-grab' : ''}
        ${isDragging ? 'opacity-90 scale-105 shadow-3xl cursor-grabbing' : ''}
        ${isEditMode && !isSelected ? 'hover:ring-2 hover:ring-[#d4af37]/30 hover:ring-offset-2 cursor-pointer' : ''}
        ${isLongPressing ? 'scale-[0.98]' : ''}
      `}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      {...(isSelected ? { ...attributes, ...listeners } : {})}
    >
      {/* Indicador de sección editable */}
      {isEditMode && (
        <div className={`
          absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-medium
          transition-all duration-200
          ${isSelected
            ? 'bg-[#d4af37] text-white'
            : 'bg-[#e0e0e0] text-[#666] opacity-0 group-hover:opacity-100'
          }
        `}>
          {id}
        </div>
      )}

      {/* Handles de arrastre cuando está lifted */}
      {isLifted && (
        <>
          {/* Handle superior */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#d4af37] rounded-full opacity-80" />

          {/* Botón de opciones */}
          <button
            className="absolute -top-3 -right-3 w-8 h-8 bg-[#d4af37] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#c4a030] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Aquí irá el menú de opciones
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </>
      )}

      {/* Contenido */}
      <div className={isLifted ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}
