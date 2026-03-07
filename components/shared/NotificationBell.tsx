'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/apiClient';
import { useNotifications } from '@/app/context/NotificationContext'; // Assuming this is the correct path for useNotifications

interface NotificationBellProps {
  isAdmin?: boolean;
}

export function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

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
