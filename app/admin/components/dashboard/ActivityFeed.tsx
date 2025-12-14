'use client';

import React from 'react';
import { User, Mail, Star, MessageCircle, Clock, Calendar } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'lead' | 'email' | 'review' | 'message' | 'pedidotion';
  title: string;
  description: string;
  timestamp: Date;
  read?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
}

const iconMap = {
  lead: User,
  email: Mail,
  review: Star,
  message: MessageCircle,
  pedidotion: Calendar
};

const colorMap = {
  lead: 'text-blue-500 bg-blue-100',
  email: 'text-green-500 bg-green-100',
  review: 'text-amber-500 bg-amber-100',
  message: 'text-purple-500 bg-purple-100',
  pedidotion: 'text-cyan-500 bg-cyan-100'
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  return (
    <div className="neuro-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-100">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-700">Actividad Reciente</h3>
        </div>
        <button className="text-sm text-[#d4af37] hover:underline">
          Ver todo
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto neuro-scroll">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.type];
            const colorClass = colorMap[activity.type];

            return (
              <button
                key={activity.id}
                onClick={() => onActivityClick?.(activity)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-gray-50/50 ${
                  !activity.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      !activity.read ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {activity.title}
                    </p>
                    {!activity.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
