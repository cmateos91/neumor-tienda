import React from 'react';
import Image from 'next/image';

interface MenuCardProps {
  item: {
    nombre: string;
    precio: number;
    descripcion?: string;
    imagen_url?: string;
    disponible?: boolean;
    categoria: string;
  };
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <div className="neuro-flat rounded-3xl p-6 neuro-hover">
      {item.imagen_url && (
        <div className="neuro-pressed rounded-2xl overflow-hidden mb-4 h-48 relative">
          <Image
            src={item.imagen_url}
            alt={item.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-[#2c2c2c] flex-1">{item.nombre}</h3>
          <div className="neuro-pressed rounded-xl px-4 py-2">
            <span className="text-[#d4af37] font-bold text-lg">{item.precio}€</span>
          </div>
        </div>
        
        {item.descripcion && (
          <p className="text-[#666666] text-sm leading-relaxed">
            {item.descripcion}
          </p>
        )}
        
        {!item.disponible && (
          <div className="neuro-pressed rounded-xl px-3 py-1 inline-block">
            <span className="text-xs text-[#999999]">No disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}