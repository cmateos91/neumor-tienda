// Contratos compartidos para tabs, páginas y mensajería iframe/admin

export type AdminTab = 'inicio' | 'productos' | 'galeria' | 'pedidos' | 'contacto';

export const adminTabs: { id: AdminTab; label: string; iconName: string }[] = [
  { id: 'inicio', label: 'Inicio', iconName: 'Home' },
  { id: 'productos', label: 'Menu', iconName: 'UtensilsCrossed' },
  { id: 'galeria', label: 'Galeria', iconName: 'Image' },
  { id: 'pedidos', label: 'Pedidos', iconName: 'CalendarClock' },
  { id: 'contacto', label: 'Contacto', iconName: 'MapPin' }
];

export const pagePaths: Record<AdminTab, string> = {
  inicio: '/',
  productos: '/productos',
  galeria: '/galeria',
  pedidos: '/pedidos',
  contacto: '/contacto'
};

export const pathToTab: Record<string, AdminTab> = {
  '/': 'inicio',
  '/productos': 'productos',
  '/galeria': 'galeria',
  '/pedidos': 'pedidos',
  '/contacto': 'contacto'
};

// Mensajes entre admin e iframe
export type AdminToIframeMessage =
  | { type: 'admin:editMode'; data: { enabled: boolean } }
  | { type: 'admin:select'; data: { elementId: string } }
  | { type: 'admin:deselect'; data: Record<string, never> }
  | { type: 'admin:navigate'; data: { path: string } }
  | { type: 'admin:tienda'; data: Record<string, unknown> }
  | { type: 'admin:productos'; data: Record<string, unknown> }
  | { type: 'admin:galeria'; data: Record<string, unknown> }
  | { type: 'admin:features'; data: Record<string, unknown> };

export type IframeToAdminMessage =
  | { type: 'iframe:elementClick'; data: { elementId: string } }
  | { type: 'iframe:navigate'; data: { path: string } }
  | { type: 'preview:layout-changed'; data: { sections: unknown[] } }
  | { type: 'preview:section-selected'; data: { sectionId: string | null } };
