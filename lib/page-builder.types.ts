// Page Builder Types - Sistema de layout dinámico

// Tipos de secciones disponibles
export type SectionType =
  | 'hero'
  | 'features-grid'
  | 'gallery-preview'
  | 'cta'
  | 'text-block'
  | 'spacer';

// Tipos de componentes dentro de secciones
export type ComponentType =
  | 'feature-card'
  | 'gallery-image'
  | 'button'
  | 'heading'
  | 'paragraph'
  | 'icon';

// Estilos base que pueden tener los componentes
export interface ComponentStyle {
  padding?: string;
  margin?: string;
  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
  gap?: string;
  columns?: number; // Para grids
}

// Componente base
export interface PageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  style?: ComponentStyle;
  order: number;
}

// Sección de página
export interface PageSection {
  id: string;
  type: SectionType;
  visible: boolean;
  order: number;
  props: Record<string, unknown>;
  style?: ComponentStyle;
  children?: PageComponent[];
}

// Layout completo de una página
export interface PageLayout {
  pageId: string;
  pageName: string;
  sections: PageSection[];
  globalStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  lastModified: string;
}

// Estado de edición
export interface EditorState {
  isEditMode: boolean;
  selectedSectionId: string | null;
  selectedComponentId: string | null;
  isDragging: boolean;
  draggedItemId: string | null;
}

// Layout por defecto para la página de inicio
export const defaultHomeLayout: PageLayout = {
  pageId: 'inicio',
  pageName: 'Inicio',
  sections: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      order: 0,
      props: {
        showIcon: true,
        iconName: 'ChefHat'
      },
      style: {
        padding: '3rem',
        borderRadius: '3rem'
      }
    },
    {
      id: 'features',
      type: 'features-grid',
      visible: true,
      order: 1,
      props: {
        title: 'features_titulo',
        subtitle: 'features_subtitulo'
      },
      style: {
        columns: 4,
        gap: '1.5rem'
      },
      children: []
    },
    {
      id: 'gallery-preview',
      type: 'gallery-preview',
      visible: true,
      order: 2,
      props: {
        title: 'galeria_titulo',
        subtitle: 'galeria_subtitulo',
        maxItems: 3
      },
      style: {
        padding: '2rem',
        borderRadius: '3rem'
      }
    }
  ],
  lastModified: new Date().toISOString()
};

// Mensaje de comunicación entre admin y preview
export interface PageBuilderMessage {
  type: 'pagebuilder:select' | 'pagebuilder:deselect' | 'pagebuilder:update-layout' | 'pagebuilder:enter-edit' | 'pagebuilder:exit-edit';
  sectionId?: string;
  componentId?: string;
  layout?: PageLayout;
}
