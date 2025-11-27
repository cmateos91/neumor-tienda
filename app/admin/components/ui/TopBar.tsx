'use client';

import React from 'react';
import {
  Monitor, Tablet, Smartphone, RefreshCw, ExternalLink,
  MousePointer2, Pencil, Sun, Moon, Upload, Layers
} from 'lucide-react';
import { Device } from '../../hooks/useAdminUI';

interface TopBarProps {
  currentPage: string;
  device: Device;
  onDeviceChange: (device: Device) => void;
  editMode: boolean;
  onEditModeToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  pageBuilderMode: boolean;
  onPageBuilderToggle: () => void;
  onRefresh: () => void;
  onPublish: () => void;
}

export function TopBar({
  currentPage,
  device,
  onDeviceChange,
  editMode,
  onEditModeToggle,
  darkMode,
  onDarkModeToggle,
  pageBuilderMode,
  onPageBuilderToggle,
  onRefresh,
  onPublish
}: TopBarProps) {
  const devices: { id: Device; icon: typeof Monitor }[] = [
    { id: 'desktop', icon: Monitor },
    { id: 'tablet', icon: Tablet },
    { id: 'mobile', icon: Smartphone }
  ];

  return (
    <div className="neuro-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-700">Editor Visual</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Page Builder Mode Button */}
        <button
          onClick={onPageBuilderToggle}
          className={`neuro-btn px-3 py-2 flex items-center gap-2 text-sm transition-all ${
            pageBuilderMode ? 'neuro-btn-primary' : ''
          }`}
          title="Page Builder: Arrastra y reordena secciones"
        >
          <Layers className={`w-4 h-4 ${pageBuilderMode ? 'text-white' : ''}`} />
          <span className={`hidden md:inline ${pageBuilderMode ? 'text-white' : ''}`}>
            {pageBuilderMode ? 'Builder ON' : 'Page Builder'}
          </span>
        </button>

        <Divider />

        {/* Edit Mode Toggle Switch */}
        <div className="flex items-center gap-2">
          <MousePointer2 className={`w-4 h-4 transition-colors ${!editMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
          <button
            onClick={onEditModeToggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              editMode ? 'bg-[#d4af37]' : 'neuro-inset'
            }`}
            title={editMode ? 'Modo Edicion: clic en elementos para editarlos' : 'Modo Navegacion: navega por la web normalmente'}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                editMode
                  ? 'right-1 bg-white shadow-md'
                  : 'left-1 bg-gray-400'
              }`}
            />
          </button>
          <Pencil className={`w-4 h-4 transition-colors ${editMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
        </div>

        <Divider />

        {/* Theme Toggle Switch */}
        <div className="flex items-center gap-2">
          <Sun className={`w-4 h-4 transition-colors ${!darkMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
          <button
            onClick={onDarkModeToggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-[#d4af37]' : 'neuro-inset'
            }`}
            title={darkMode ? 'Tema oscuro' : 'Tema claro'}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'right-1 bg-white shadow-md'
                  : 'left-1 bg-gray-400'
              }`}
            />
          </button>
          <Moon className={`w-4 h-4 transition-colors ${darkMode ? 'text-[#d4af37]' : 'text-gray-400'}`} />
        </div>

        <Divider />

        {/* Device selector */}
        <div className="neuro-card-sm flex p-1 gap-1">
          {devices.map(d => (
            <button
              key={d.id}
              onClick={() => onDeviceChange(d.id)}
              className={`p-2 rounded-lg transition-all ${
                device === d.id ? 'neuro-tab active' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <d.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <button onClick={onRefresh} className="neuro-btn p-2" title="Refrescar">
          <RefreshCw className="w-4 h-4" />
        </button>

        <a
          href={currentPage}
          target="_blank"
          rel="noopener noreferrer"
          className="neuro-btn p-2"
          title="Abrir en nueva ventana"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <Divider />

        {/* Boton Publicar */}
        <button
          onClick={onPublish}
          className="neuro-btn neuro-btn-primary px-4 py-2 flex items-center gap-2"
          title="Publicar cambios"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Publicar</span>
        </button>
      </div>
    </div>
  );
}

// Componente auxiliar para separadores
function Divider() {
  return <div className="h-6 w-px bg-gray-300" />;
}

export default TopBar;
