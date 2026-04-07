'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileSearch, HandHeart, BarChart3, Loader2, Calendar } from 'lucide-react';
import { useApiGet, CACHE_CONFIG } from '@/app/lib/useApiCache';

interface AnalyticsData {
  totalIds: number;
  thisMonthIds: number;
  lastMonthIds: number;
  totalLost: number;
  thisMonthLost: number;
  lastMonthLost: number;
  totalUsers: number;
  thisMonthUsers: number;
  lastMonthUsers: number;
  recoveryRate: number;
  lastMonthRecoveryRate: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

interface AdminDashboardData {
  analytics: AnalyticsData;
  users: RecentUser[];
  recentActivity: RecentActivity[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // SWR hook for admin dashboard with caching
  // TTL: 60s (moderate change analytics data)
  const { data, isLoading: isLoadingData, error } = useApiGet<{ success: boolean; data: AdminDashboardData }>(
    '/api/admin/dashboard',
    {
      ttl: CACHE_CONFIG.adminDashboard.ttl,
      revalidateOnFocus: false,
    }
  );

  // Update state when data changes
  useEffect(() => {
    if (data?.success && data.data) {
      setAnalytics(data.data.analytics);
      setRecentUsers(data.data.users || []);
      setRecentActivity(data.data.recentActivity || []);
    }
  }, [data]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    // Update loading state based on SWR loading
    setIsLoading(isLoadingData);
  }, [isLoadingData]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers?.toString() || '0',
      change: analytics ? (
        analytics.lastMonthUsers > 0 
          ? `${analytics.thisMonthUsers >= analytics.lastMonthUsers ? '+' : ''}${(((analytics.thisMonthUsers - analytics.lastMonthUsers) / analytics.lastMonthUsers) * 100).toFixed(0)}%`
          : analytics.thisMonthUsers > 0 ? '+100%' : '+0%'
      ) : '+0%',
      changeType: analytics && analytics.thisMonthUsers >= analytics.lastMonthUsers ? 'increase' : 'decrease',
      description: 'Registered users',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Lost Requests',
      value: analytics?.totalLost?.toString() || '0',
      change: analytics ? (
        analytics.lastMonthLost > 0 
          ? `${analytics.thisMonthLost >= analytics.lastMonthLost ? '+' : ''}${(((analytics.thisMonthLost - analytics.lastMonthLost) / analytics.lastMonthLost) * 100).toFixed(0)}%`
          : analytics.thisMonthLost > 0 ? '+100%' : '+0%'
      ) : '+0%',
      changeType: analytics && analytics.thisMonthLost >= analytics.lastMonthLost ? 'increase' : 'decrease',
      description: 'Lost IDs reported',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'IDs Found',
      value: analytics?.totalIds?.toString() || '0',
      change: analytics ? (
        analytics.lastMonthIds > 0 
          ? `${analytics.thisMonthIds >= analytics.lastMonthIds ? '+' : ''}${(((analytics.thisMonthIds - analytics.lastMonthIds) / analytics.lastMonthIds) * 100).toFixed(0)}%`
          : analytics.thisMonthIds > 0 ? '+100%' : '+0%'
      ) : '+0%',
      changeType: analytics && analytics.thisMonthIds >= analytics.lastMonthIds ? 'increase' : 'decrease',
      description: 'Found and submitted',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Recovery Rate',
      value: `${analytics?.recoveryRate || 0}%`,
      change: `${(analytics?.recoveryRate || 0) >= (analytics?.lastMonthRecoveryRate || 0) ? '+' : ''}${((analytics?.recoveryRate || 0) - (analytics?.lastMonthRecoveryRate || 0)).toFixed(0)}%`,
      changeType: (analytics?.recoveryRate || 0) >= (analytics?.lastMonthRecoveryRate || 0) ? 'increase' : 'decrease',
      description: 'IDs returned to owners',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.full_name || 'Admin'}
        </h1>
        <p className="text-gray-300 text-sm">
          Here's what's happening on your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>New users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent registrations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activity.type.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
