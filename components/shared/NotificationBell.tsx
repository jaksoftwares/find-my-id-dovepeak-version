'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/apiClient';

interface NotificationBellProps {
  isAdmin?: boolean;
}

export function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Initial fetch then set up an interval
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
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
  };

  const dashboardPath = isAdmin ? '/admin/notifications' : '/dashboard/notifications';

  return (
    <Link href={dashboardPath}>
      <Button variant="ghost" size="icon" className="relative group transition-all">
        <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
