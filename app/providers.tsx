'use client';

import { AuthProvider } from '@/app/context/AuthContext';
import { NotificationProvider } from '@/app/context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
