'use client';

import React, { useEffect } from 'react';
import { Store, UtensilsCrossed, Image, Sparkles, Loader2, GripVertical, Eye, EyeOff, Layers } from 'lucide-react';

// Hooks
import {
  useSitioData,
  useIframeCommunication,
  useAdminUI,
  useDialogs,
  usePendingFiles,
  usePendingDeletes,
  tabs,
  tabToPage,
  pageToTab
} from './hooks';

// Components
import {
  TopBar,
  DevicePreview,
  SaveModal,
  MessageToast,
  ConfirmDialog,
  InputDialog,
  RestauranteTab,
  MenuTab,
  GaleriaTab,
  FeaturesTab
} from './components';

// Iconos para los tabs
const tabIcons = {
  Store,
  UtensilsCrossed,
  Image,
  Sparkles
};

export default function AdminEditor() {
  // Hook de datos
  const {
    sitio,
    categorias,
    menuItems,
    galeria,
    features,
    formRestaurante,
    loading,
    setFormRestaurante,
    setGaleria,
    setMenuItems,
    saveRestaurante,
    addCategoria,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addGaleriaItem,
    toggleGaleriaHome,
    toggleGaleriaVisible,
    updateGaleriaItem,
    deleteGaleriaItem,
    addFeature,
    updateFeature,
    deleteFeature
  } = useSitioData();

  // Hook de UI
  const {
    activeTab,
    setActiveTab,
    device,
    setDevice,
    currentPage,
    setCurrentPage,
    saving,
    setSaving,
    message,
    showMessage,
    darkMode,
    toggleDarkMode,
    showSaveModal,
    setShowSaveModal,
    expandedPage,
    setExpandedPage,
    pageLayout,
    setPageLayout,
    selectedSection,
    setSelectedSection,
    toggleSectionVisibility,
    navigateToInput
  } = useAdminUI();

  // Hook de dialogs
  const {
    confirmState,
    confirmDelete,
    closeConfirm,
    inputState,
    promptText,
    promptUrl,
    closeInput
  } = useDialogs();

  // Hook de archivos pendientes (subida diferida)
  const {
    addPendingFile,
    removePendingFile,
    isPending,
    hasPendingFiles,
    pendingCount,
    uploadAllPending
  } = usePendingFiles();

  // Hook de eliminaciones pendientes (eliminación diferida)
  const {
    markForDeletion,
    unmarkForDeletion,
    isMarkedForDeletion,
    hasPendingDeletes,
    pendingDeleteCount,
    executeAllDeletes
  } = usePendingDeletes();

  // Hook de comunicacion con iframe
  const {
    iframeRef,
    editMode,
    setEditMode,
    pageBuilderMode,
    setPageBuilderMode,
    refreshIframe,
    navigateIframe,
    sendRestauranteData,
    sendMenuData,
    sendGaleriaData,
    sendFeaturesData,
    sendPageBuilderCommand
  } = useIframeCommunication({
    eventHandlers: {
      onElementClick: (_elementId, nav) => {
        navigateToInput(nav.tab, nav.page, nav.inputName);
      },
      onLayoutChanged: (sections) => {
        setPageLayout(sections);
      },
      onSectionSelected: (sectionId) => {
        setSelectedSection(sectionId);
      },
      onNavigate: (path) => {
        // Actualizar el tab según la página del iframe
        const newTab = pageToTab[path];
        if (newTab && newTab !== activeTab) {
          setActiveTab(newTab);
        }
        // También actualizar currentPage si es diferente
        if (path !== currentPage) {
          setCurrentPage(path);
        }
      }
    }
  });

  // Sincronizar datos con iframe cuando cambian (excluyendo items marcados para eliminación)
  useEffect(() => {
    sendRestauranteData(formRestaurante);
  }, [formRestaurante, sendRestauranteData]);

  useEffect(() => {
    // Filtrar items marcados para eliminación
    const filteredMenuItems = menuItems.filter(item => !isMarkedForDeletion(item.id));
    sendMenuData(categorias, filteredMenuItems);
  }, [categorias, menuItems, sendMenuData, isMarkedForDeletion]);

  useEffect(() => {
    // Filtrar items marcados para eliminación y ocultos
    const filteredGaleria = galeria.filter(item =>
      !isMarkedForDeletion(item.id) && item.visible !== false
    );
    sendGaleriaData(filteredGaleria);
  }, [galeria, sendGaleriaData, isMarkedForDeletion]);

  useEffect(() => {
    sendFeaturesData(features);
  }, [features, sendFeaturesData]);

  // Sincronizar activeTab → iframe (navegar usando SPA, sin recargar)
  useEffect(() => {
    const targetPage = tabToPage[activeTab];
    if (targetPage) {
      navigateIframe(targetPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Toggle Page Builder Mode
  const togglePageBuilderMode = () => {
    if (!pageBuilderMode && currentPage !== '/') {
      setCurrentPage('/');
      setTimeout(() => setPageBuilderMode(true), 500);
    } else {
      setPageBuilderMode(!pageBuilderMode);
    }
  };

  // Guardar y publicar
  const handlePublish = async () => {
    setShowSaveModal(false);
    setSaving(true);

    try {
      // Copias locales para actualizar con las nuevas URLs
      let updatedGaleria = [...galeria];
      let updatedMenuItems = [...menuItems];

      // 1. Primero ejecutar eliminaciones pendientes si hay
      if (hasPendingDeletes) {
        showMessage('info', `Eliminando ${pendingDeleteCount} elemento(s)...`);

        const { deletedGaleria, deletedMenu } = await executeAllDeletes();

        // Filtrar los items eliminados de las copias locales
        updatedGaleria = updatedGaleria.filter(g => !deletedGaleria.includes(g.id));
        updatedMenuItems = updatedMenuItems.filter(m => !deletedMenu.includes(m.id));

        // Actualizar el estado local para que la UI refleje las eliminaciones
        setGaleria(updatedGaleria);
        setMenuItems(updatedMenuItems);
      }

      // 2. Luego subir archivos pendientes si hay
      if (hasPendingFiles) {
        showMessage('info', `Subiendo ${pendingCount} imagen(es)...`);

        const uploadedUrls = await uploadAllPending((uploaded, total) => {
          console.log(`Subido ${uploaded}/${total}`);
        });

        // Actualizar las URLs en las copias locales Y en el estado
        for (const [id, newUrl] of uploadedUrls) {
          if (id.startsWith('galeria-')) {
            const galeriaId = id.replace('galeria-', '');
            // Actualizar copia local
            updatedGaleria = updatedGaleria.map(g =>
              g.id === galeriaId ? { ...g, url: newUrl } : g
            );
            // Actualizar estado para la UI
            updateGaleriaItem(galeriaId, 'url', newUrl);
          } else if (id.startsWith('menu-')) {
            const menuId = id.replace('menu-', '');
            // Actualizar copia local
            updatedMenuItems = updatedMenuItems.map(m =>
              m.id === menuId ? { ...m, imagen_url: newUrl } : m
            );
            // Actualizar estado para la UI
            updateMenuItem(menuId, 'imagen_url', newUrl);
          }
        }
      }

      // 3. Guardar con los datos actualizados (excluyendo eliminados)
      const success = await saveRestaurante({
        galeria: updatedGaleria,
        menuItems: updatedMenuItems
      });

      if (success) {
        showMessage('success', 'Publicado correctamente');
        setTimeout(refreshIframe, 500);
      } else {
        showMessage('error', 'Error al guardar');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      showMessage('error', 'Error al publicar');
    }

    setSaving(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className={`admin-panel h-screen flex flex-col overflow-hidden p-4 gap-4 ${darkMode ? 'dark' : ''}`}>
      {/* Alert if no site */}
      {!sitio && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Store className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>No hay sitio configurado.</strong> Ve a la seccion "Info", llena los datos y haz clic en "Publicar" para comenzar.
          </p>
        </div>
      )}

      {/* Top Bar */}
      <TopBar
        currentPage={currentPage}
        device={device}
        onDeviceChange={setDevice}
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
        pageBuilderMode={pageBuilderMode}
        onPageBuilderToggle={togglePageBuilderMode}
        onRefresh={refreshIframe}
        onPublish={() => setShowSaveModal(true)}
      />

      {/* Message Toast */}
      <MessageToast message={message} />

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Editor */}
        <div className="w-96 flex flex-col gap-4">
          {/* Page Builder Panel */}
          {pageBuilderMode && (
            <PageBuilderPanel
              pageLayout={pageLayout}
              selectedSection={selectedSection}
              onToggleVisibility={(sectionId) => {
                toggleSectionVisibility(sectionId);
                sendPageBuilderCommand('update-layout', { sections: pageLayout });
              }}
            />
          )}

          {/* Tabs - solo si no está en page builder mode */}
          {!pageBuilderMode && (
            <div className="neuro-card p-2 flex gap-1">
              {tabs.map(tab => {
                const Icon = tabIcons[tab.iconName as keyof typeof tabIcons];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`neuro-tab flex-1 flex items-center justify-center gap-2 ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Panel Content */}
          {!pageBuilderMode && (
            <div className="flex-1 neuro-card p-4 overflow-y-auto neuro-scroll">
              {activeTab === 'restaurante' && (
                <RestauranteTab
                  formRestaurante={formRestaurante}
                  setFormRestaurante={setFormRestaurante}
                  expandedPage={expandedPage}
                  setExpandedPage={setExpandedPage}
                />
              )}

              {activeTab === 'menu' && (
                <MenuTab
                  sitio={sitio}
                  categorias={categorias}
                  menuItems={menuItems}
                  onAddCategoria={addCategoria}
                  onAddMenuItem={addMenuItem}
                  onUpdateMenuItem={updateMenuItem}
                  onDeleteMenuItem={deleteMenuItem}
                  onRefresh={refreshIframe}
                  promptText={promptText}
                  addPendingFile={addPendingFile}
                  removePendingFile={removePendingFile}
                  isPending={isPending}
                  markForDeletion={markForDeletion}
                  unmarkForDeletion={unmarkForDeletion}
                  isMarkedForDeletion={isMarkedForDeletion}
                />
              )}

              {activeTab === 'galeria' && (
                <GaleriaTab
                  sitio={sitio}
                  galeria={galeria}
                  onAddItem={addGaleriaItem}
                  onToggleHome={toggleGaleriaHome}
                  onToggleVisible={toggleGaleriaVisible}
                  onUpdateItem={updateGaleriaItem}
                  onDeleteItem={deleteGaleriaItem}
                  onRefresh={refreshIframe}
                  addPendingFile={addPendingFile}
                  removePendingFile={removePendingFile}
                  isPending={isPending}
                  markForDeletion={markForDeletion}
                  unmarkForDeletion={unmarkForDeletion}
                  isMarkedForDeletion={isMarkedForDeletion}
                />
              )}

              {activeTab === 'features' && (
                <FeaturesTab
                  sitio={sitio}
                  features={features}
                  onAddFeature={addFeature}
                  onUpdateFeature={updateFeature}
                  onDeleteFeature={deleteFeature}
                  onRefresh={refreshIframe}
                  confirmDelete={confirmDelete}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <DevicePreview
          ref={iframeRef}
          device={device}
          currentPage={currentPage}
        />
      </div>

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handlePublish}
        saving={saving}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />

      {/* Input Dialog */}
      <InputDialog
        isOpen={inputState.isOpen}
        onClose={closeInput}
        onConfirm={inputState.onConfirm}
        title={inputState.title}
        message={inputState.message}
        placeholder={inputState.placeholder}
        defaultValue={inputState.defaultValue}
        confirmText={inputState.confirmText}
        cancelText={inputState.cancelText}
        inputType={inputState.inputType}
        required={inputState.required}
      />
    </div>
  );
}

// Componente del Page Builder Panel
interface PageBuilderPanelProps {
  pageLayout: { id: string; type: string; visible: boolean; order: number }[];
  selectedSection: string | null;
  onToggleVisibility: (sectionId: string) => void;
}

function PageBuilderPanel({ pageLayout, selectedSection, onToggleVisibility }: PageBuilderPanelProps) {
  return (
    <div className="neuro-card p-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-[#d4af37]" />
        <h3 className="font-semibold text-gray-700">Page Builder</h3>
        <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full ml-auto">Beta</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Haz clic en una seccion del preview y arrastrala para reordenar.
      </p>
      <div className="space-y-2">
        {pageLayout.sort((a, b) => a.order - b.order).map((section, index) => (
          <div
            key={section.id}
            className={`neuro-card-sm p-3 flex items-center gap-3 transition-all ${
              selectedSection === section.id ? 'ring-2 ring-[#d4af37]' : ''
            }`}
          >
            <div className="neuro-inset w-8 h-8 rounded-lg flex items-center justify-center text-gray-400">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 capitalize">{section.type.replace('-', ' ')}</p>
              <p className="text-xs text-gray-400">Orden: {index + 1}</p>
            </div>
            <button
              onClick={() => onToggleVisibility(section.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                section.visible ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'
              }`}
            >
              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Los cambios de layout se guardan al publicar
        </p>
      </div>
    </div>
  );
}
