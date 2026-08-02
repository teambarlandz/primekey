'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  AppNotification,
} from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

function formatTime(dateString: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

interface NotificationsPanelProps {
  recipientType: 'landlord' | 'agent';
  recipientId?: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ recipientType, recipientId }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNotifications(recipientType, recipientId);
      setNotifications(response.data);
      setUnread(response.unread_count);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [recipientType, recipientId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id, true);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const unreadCount = unread || notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-base font-bold font-heading" style={{ color: BRAND_COLOR }}>
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: BRAND_COLOR }}>
              {unreadCount}
            </span>
          )}
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-full hover:bg-purple-50 transition-colors"
          style={{ color: BRAND_COLOR }}
          aria-label="Refresh notifications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

      {notifications.length === 0 ? (
        <p className="text-sm text-[#4a607a] font-body">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.slice(0, 10).map((notification) => (
            <li key={notification.id}>
              <button
                onClick={() => handleMarkRead(notification.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  notification.is_read ? 'bg-white border-purple-100' : 'bg-[#f3f0ff]/70 border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                    {notification.title}
                    {!notification.is_read && <span className="ml-2 w-2 h-2 inline-block rounded-full bg-[#04164a]" />}
                  </p>
                  <span className="text-xs text-[#4a607a] whitespace-nowrap">{formatTime(notification.created_at)}</span>
                </div>
                <p className="text-sm text-[#4a607a] font-body mt-1">{notification.message}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
