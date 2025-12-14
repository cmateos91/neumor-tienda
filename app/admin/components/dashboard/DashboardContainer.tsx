'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, MessageCircle, Star, Calendar, Settings, RefreshCw } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardHeader, DashboardTab } from './DashboardHeader';
import { StatsCards } from './StatsCards';
import { OnboardingChecklist } from './OnboardingChecklist';
import { ActivityFeed } from './ActivityFeed';
import { LeadsTable } from './LeadsTable';
import { AutomatedMessagesManager } from '../automations';
import type { StatData } from './StatsCards';
import type { ActivityItem } from './ActivityFeed';
import type { Lead as UILead } from './LeadsTable';

interface DashboardContainerProps {
  sitioId?: string;
}

/**
 * Contenedor del Dashboard que conecta con Supabase
 * Transforma los datos de la API al formato esperado por los componentes UI
 */
export function DashboardContainer({ sitioId }: DashboardContainerProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const {
    loading,
    error,
    stats,
    leads,
    activities,
    unreadCount,
    checklistItems,
    refreshAll,
    changeStatus,
    markAsRead
  } = useDashboardData({
    sitioId,
    autoRefresh: true,
    refreshInterval: 60000 // Refrescar cada minuto
  });

  // Badges para los tabs
  const badges: Partial<Record<DashboardTab, number>> = {
    leads: leads.filter(l => l.status === 'new').length,
    messages: unreadCount,
  };

  // Transformar stats de la API al formato de UI
  const uiStats: StatData[] = stats ? [
    {
      id: '1',
      label: 'Leads Totales',
      value: stats.leads.total,
      change: stats.period.comparison_percent.leads,
      icon: 'leads'
    },
    {
      id: '2',
      label: 'Emails Enviados',
      value: stats.messages.sent,
      change: stats.period.comparison_percent.messages,
      icon: 'emails'
    },
    {
      id: '3',
      label: 'Resenas Recibidas',
      value: stats.reviews.total,
      change: stats.period.comparison_percent.reviews,
      icon: 'reviews'
    },
    {
      id: '4',
      label: 'Mensajes Recibidos',
      value: stats.messages.received,
      change: 0,
      icon: 'messages'
    }
  ] : [];

  // Transformar leads de la API al formato de UI
  const uiLeads: UILead[] = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone,
    source: lead.source as UILead['source'],
    status: lead.status as UILead['status'],
    createdAt: new Date(lead.created_at),
    notes: lead.notes
  }));

  // Transformar activities de la API al formato de UI
  const uiActivities: ActivityItem[] = activities.map(activity => ({
    id: activity.id,
    type: mapActivityType(activity.type),
    title: activity.title,
    description: activity.description || '',
    timestamp: new Date(activity.created_at),
    read: activity.read
  }));

  // Manejar click en actividad
  const handleActivityClick = async (activity: ActivityItem) => {
    if (!activity.read) {
      await markAsRead([activity.id]);
    }
    // TODO: Navegar al detalle o abrir modal
  };

  // Manejar click en lead
  const handleLeadClick = (lead: UILead) => {
    // TODO: Abrir modal de detalle del lead
    console.log('Lead clicked:', lead);
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto mb-3" />
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="neuro-card p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">Error al cargar datos</h3>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={refreshAll}
            className="neuro-btn px-4 py-2 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizar contenido segun tab activo
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Stats Cards */}
            <StatsCards stats={uiStats} />

            {/* Main Grid: Leads + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leads Table - Takes 2 columns */}
              <div className="lg:col-span-2">
                <LeadsTable
                  leads={uiLeads}
                  onLeadClick={handleLeadClick}
                  onStatusChange={(leadId, status) => changeStatus(leadId, status)}
                />
              </div>

              {/* Sidebar - Takes 1 column */}
              <div className="space-y-6">
                <OnboardingChecklist
                  items={checklistItems}
                  onItemClick={(item) => {
                    console.log('Checklist item clicked:', item);
                  }}
                />
                <ActivityFeed
                  activities={uiActivities}
                  onActivityClick={handleActivityClick}
                />
              </div>
            </div>
          </>
        );

      case 'leads':
        return (
          <LeadsTable
            leads={uiLeads}
            onLeadClick={handleLeadClick}
            onStatusChange={(leadId, status) => changeStatus(leadId, status)}
          />
        );

      case 'messages':
        return (
          <div className="neuro-card p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Mensajes</h3>
            <p className="text-gray-500">Proximamente: Bandeja unificada de mensajes de Instagram, WhatsApp, Facebook...</p>
          </div>
        );

      case 'reviews':
        return (
          <div className="neuro-card p-8 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Resenas</h3>
            <p className="text-gray-500">Proximamente: Gestion de resenas de Google, TripAdvisor, Yelp...</p>
          </div>
        );

      case 'pedidotions':
        return (
          <div className="neuro-card p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos</h3>
            <p className="text-gray-500">Proximamente: Sistema de pedidos integrado...</p>
          </div>
        );

      case 'automations':
        return (
          <AutomatedMessagesManager sitioId={sitioId || null} />
        );

      case 'settings':
        return (
          <div className="neuro-card p-8 text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Configuracion</h3>
            <p className="text-gray-500">Proximamente: Configuracion de integraciones, automatizaciones y notificaciones...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto neuro-scroll p-1">
      <div className="max-w-7xl mx-auto animate-fadeIn">
        {/* Header con tabs */}
        <DashboardHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={refreshAll}
          badges={badges}
        />

        {/* Contenido dinamico */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

/**
 * Mapear tipos de actividad de la API a tipos de UI
 */
function mapActivityType(apiType: string): ActivityItem['type'] {
  const typeMap: Record<string, ActivityItem['type']> = {
    'lead_created': 'lead',
    'lead_updated': 'lead',
    'lead_contacted': 'lead',
    'lead_converted': 'lead',
    'lead_lost': 'lead',
    'message_received': 'message',
    'message_sent': 'message',
    'email_sent': 'email',
    'email_opened': 'email',
    'review_received': 'review',
    'review_responded': 'review',
    'pedidotion_created': 'pedidotion',
    'pedidotion_confirmed': 'pedidotion',
    'pedidotion_cancelled': 'pedidotion',
    'social_mention': 'message',
    'social_comment': 'message',
    'webhook_received': 'message',
    'automation_triggered': 'message',
    'system': 'message'
  };

  return typeMap[apiType] || 'message';
}

export default DashboardContainer;
