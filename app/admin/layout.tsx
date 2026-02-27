'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileSearch, 
  Settings, 
  LogOut,
  Menu,
  X,
  Loader2,
  BarChart3,
  Bell,
  HandHeart,
  FileText,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { RoleProtectedRoute } from '@/app/components/auth';
import { NotificationBell } from '@/components/shared/NotificationBell';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'IDs Management', href: '/admin/ids', icon: FileSearch },
  { name: 'Claims', href: '/admin/claims', icon: HandHeart },
  { name: 'Lost Requests', href: '/admin/requests', icon: FileText },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Community Forum', href: '/admin/forum', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    // Only run after auth has finished loading
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }
    
    // Check if user is admin - if not, redirect to dashboard
    if (user.role !== 'admin') {
      router.push('/dashboard');
    }
    // If user.role === 'admin', stay on this page
  }, [isLoading, isAuthenticated, user, router, pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
    router.refresh();
  };

  // If still loading auth, show spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated or not admin, don't render anything (redirect will happen)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">J</span>
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"></div>
                </div>
                <span className="font-bold">JKUATfindmyid</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Admin Badge */}
            <div className="px-4 py-3 bg-primary/20 border-b border-gray-800">
              <span className="text-xs font-medium text-primary-foreground uppercase tracking-wider">
                Admin Panel
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/dashboard" className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-full px-4 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  {adminNavigation.find(n => n.href === pathname)?.name || 'Admin'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell isAdmin={true} />
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{user?.full_name}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-primary font-medium">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
