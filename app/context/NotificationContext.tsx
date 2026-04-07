'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/apiClient';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  triggerNotificationRefresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider - Optimized notification polling
 * 
 * Previous strategy: 30-second polling = 120 requests/hour per tab
 * New strategy: Event-driven + 5-minute fallback when active
 * Expected reduction: ~95% fewer idle requests
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  
  // Track if tab is visible to control fallback polling
  const isTabVisible = useRef(true);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    // Skip if no user or tab not visible (reduce unnecessary requests)
    if (!user || !isTabVisible.current) return;
    
    try {
      const response = await authFetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        const count = (data.data || []).filter((n: any) => !n.is_read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  // Manual trigger for external components to call after actions
  const triggerNotificationRefresh = useCallback(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Register global event listener for notification refresh triggers
  useEffect(() => {
    const handleRefreshEvent = () => {
      refreshUnreadCount();
    };
    
    window.addEventListener('notification-refresh', handleRefreshEvent);
    return () => {
      window.removeEventListener('notification-refresh', handleRefreshEvent);
    };
  }, [refreshUnreadCount]);

  // Tab visibility handler - refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      if (!document.hidden) {
        // Tab is now visible - refresh immediately
        refreshUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUnreadCount]);

  // Optimized polling strategy: Only poll every 5 minutes when tab is active
  // Previous: 30 seconds (120/hour) -> New: 300 seconds (12/hour) = 90% reduction
  useEffect(() => {
    if (user) {
      // Initial fetch on mount
      refreshUnreadCount();
      
      // 5-minute fallback polling - only when tab is active
      fallbackIntervalRef.current = setInterval(() => {
        if (isTabVisible.current) {
          refreshUnreadCount();
        }
      }, 300000); // 5 minutes instead of 30 seconds
      
      return () => {
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
        }
      };
    } else {
      setUnreadCount(0);
    }
  }, [user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, triggerNotificationRefresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
