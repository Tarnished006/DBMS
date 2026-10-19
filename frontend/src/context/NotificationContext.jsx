import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '@/services/notification/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const knownNotificationIds = useRef(new Set());
  const initialLoadDone = useRef(false);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) {
        // Detect newly arrived notifications to show a sleek non-intrusive toast
        if (initialLoadDone.current) {
          const fresh = data.filter((n) => !knownNotificationIds.current.has(n.id) && !n.isRead);
          if (fresh.length > 0) {
            const latest = fresh[0];
            toast.info(`🔔 ${latest.title}: ${latest.message}`);
          }
        }
        data.forEach((n) => knownNotificationIds.current.add(n.id));
        setNotifications(data);
        initialLoadDone.current = true;
      }
    } catch {
      // Non-fatal
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      initialLoadDone.current = false;
      knownNotificationIds.current.clear();
      fetchNotifications();
      // Background poll every 30 seconds for multi-party synchronization
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      initialLoadDone.current = false;
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
