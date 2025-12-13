'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditableComponentProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
}

/**
 * Wrapper para componentes individuales con drag & drop
 */
export default function EditableComponent({ id, children, isEditMode }: EditableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      {...attributes}
      {...listeners}
    >
      {/* Indicador de drag */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-[#d4af37]/10 rounded flex items-center justify-center cursor-grab active:cursor-grabbing">
          <svg className="w-3 h-3 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </div>

      {children}
    </div>
  );
}
