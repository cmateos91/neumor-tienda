'use client';

import { useState, useCallback } from 'react';
import { PageSection, defaultHomeLayout } from '@/lib/page-builder.types';

// Tipos
export type Tab = 'restaurante' | 'menu' | 'galeria' | 'features';
export type Device = 'desktop' | 'tablet' | 'mobile';

export interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

// Constantes
export const pages = [
  { label: 'Inicio', value: '/' },
  { label: 'Menu', value: '/menu' },
  { label: 'Galeria', value: '/galeria' },
  { label: 'Reservas', value: '/reservas' },
  { label: 'Contacto', value: '/contacto' }
];

export const tabs: { id: Tab; label: string; iconName: string }[] = [
  { id: 'restaurante', label: 'Info', iconName: 'Store' },
  { id: 'menu', label: 'Menu', iconName: 'UtensilsCrossed' },
  { id: 'galeria', label: 'Galeria', iconName: 'Image' },
  { id: 'features', label: 'Features', iconName: 'Sparkles' }
];

export const deviceWidths: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px'
};

// Mapeo de tabs a páginas del iframe
export const tabToPage: Record<Tab, string> = {
  restaurante: '/',
  menu: '/menu',
  galeria: '/galeria',
  features: '/'
};

// Mapeo de páginas a tabs (inverso)
export const pageToTab: Record<string, Tab> = {
  '/': 'restaurante',
  '/menu': 'menu',
  '/galeria': 'galeria',
  '/reservas': 'restaurante',
  '/contacto': 'restaurante'
};

// Interface para el estado del hook
export interface AdminUIState {
  activeTab: Tab;
  device: Device;
  currentPage: string;
  saving: boolean;
  message: Message | null;
  darkMode: boolean;
  showSaveModal: boolean;
  expandedPage: string | null;
  expandedSections: Record<string, boolean>;
  pageLayout: PageSection[];
  selectedSection: string | null;
}

// Interface para las acciones del hook
export interface AdminUIActions {
  setActiveTab: (tab: Tab) => void;
  setDevice: (device: Device) => void;
  setCurrentPage: (page: string) => void;
  setSaving: (saving: boolean) => void;
  showMessage: (type: Message['type'], text: string, duration?: number) => void;
  clearMessage: () => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
  setShowSaveModal: (show: boolean) => void;
  setExpandedPage: (page: string | null) => void;
  toggleExpandedSection: (section: string) => void;
  setPageLayout: React.Dispatch<React.SetStateAction<PageSection[]>>;
  setSelectedSection: (sectionId: string | null) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  navigateToInput: (tab: Tab, page?: string, inputName?: string) => void;
}

export type UseAdminUIReturn = AdminUIState & AdminUIActions;

export function useAdminUI(): UseAdminUIReturn {
  // Estado de navegacion
  const [activeTab, setActiveTab] = useState<Tab>('restaurante');
  const [device, setDevice] = useState<Device>('desktop');
  const [currentPage, setCurrentPage] = useState('/');

  // Estado de UI
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Estado de expansion
  const [expandedPage, setExpandedPage] = useState<string | null>('inicio');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Estado de Page Builder
  const [pageLayout, setPageLayout] = useState<PageSection[]>(defaultHomeLayout.sections);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Mostrar mensaje temporal
  const showMessage = useCallback((type: Message['type'], text: string, duration = 3000) => {
    setMessage({ type, text });
    if (duration > 0) {
      setTimeout(() => setMessage(null), duration);
    }
  }, []);

  // Limpiar mensaje
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Toggle seccion expandida
  const toggleExpandedSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Toggle visibilidad de seccion en page builder
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setPageLayout(prev => prev.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
  }, []);

  // Navegar a un input especifico
  const navigateToInput = useCallback((tab: Tab, page?: string, inputName?: string) => {
    setActiveTab(tab);

    if (page) {
      setExpandedPage(page);
    }

    if (inputName) {
      // Hacer scroll al input despues de un pequeno delay para que el DOM se actualice
      setTimeout(() => {
        const input = document.querySelector(`[data-field="${inputName}"]`);
        if (input) {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (input as HTMLInputElement).focus();
          input.classList.add('input-highlight');
          setTimeout(() => input.classList.remove('input-highlight'), 2000);
        }
      }, 300);
    }
  }, []);

  return {
    // Estado
    activeTab,
    device,
    currentPage,
    saving,
    message,
    darkMode,
    showSaveModal,
    expandedPage,
    expandedSections,
    pageLayout,
    selectedSection,
    // Acciones
    setActiveTab,
    setDevice,
    setCurrentPage,
    setSaving,
    showMessage,
    clearMessage,
    setDarkMode,
    toggleDarkMode,
    setShowSaveModal,
    setExpandedPage,
    toggleExpandedSection,
    setPageLayout,
    setSelectedSection,
    toggleSectionVisibility,
    navigateToInput
  };
}
