'use client';

import React from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Star,
  Calendar,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';

export type DashboardTab = 'overview' | 'leads' | 'messages' | 'reviews' | 'pedidotions' | 'automations' | 'settings';

interface TabConfig {
  id: DashboardTab;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle },
  { id: 'reviews', label: 'Resenas', icon: Star },
  { id: 'pedidotions', label: 'Pedidos', icon: Calendar },
  { id: 'automations', label: 'Automatizaciones', icon: Zap },
];

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onRefresh?: () => void;
  badges?: Partial<Record<DashboardTab, number>>;
}

export function DashboardHeader({
  activeTab,
  onTabChange,
  onRefresh,
  badges = {}
}: DashboardHeaderProps) {
  return (
    <div className="neuro-card px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Titulo y tabs */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-700">Dashboard</h1>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badgeCount = badges[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    isActive
                      ? 'neuro-inset text-[#d4af37]'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>

                  {/* Badge de notificaciones */}
                  {badgeCount && badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="neuro-btn p-2"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onTabChange('settings')}
            className={`neuro-btn p-2 ${activeTab === 'settings' ? 'neuro-inset' : ''}`}
            title="Configuracion"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
