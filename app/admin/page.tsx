'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileSearch, HandHeart, BarChart3, TrendingUp, TrendingDown, Loader2, Calendar } from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface AnalyticsData {
  totalIds: number;
  verifiedIds: number;
  recoveredIds: number;
  lostRequests: number;
  recoveryRate: number;
  thisMonthFound: number;
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics
      const analyticsRes = await authFetch('/api/admin/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Fetch recent users
      const usersRes = await authFetch('/api/admin/users?limit=5');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setRecentUsers(usersData.data || []);
      }

      // Fetch recent activity from multiple sources
      const activityPromises = [
        authFetch('/api/admin/ids?limit=3'),
        authFetch('/api/admin/claims?limit=3'),
        authFetch('/api/admin/requests?limit=3'),
      ];

      const [idsRes, claimsRes, requestsRes] = await Promise.all(activityPromises);
      
      const idsData = await idsRes.json();
      const claimsData = await claimsRes.json();
      const requestsData = await requestsRes.json();

      const activities: RecentActivity[] = [];
      
      if (idsData.success) {
        (idsData.data || []).forEach((item: any) => {
          activities.push({
            id: item.id,
            type: 'id_found',
            description: `New ID found: ${item.full_name}`,
            created_at: item.created_at,
          });
        });
      }

      if (claimsData.success) {
        (claimsData.data || []).forEach((item: any) => {
          activities.push({
            id: item.id,
            type: 'claim',
            description: `Claim ${item.status}: ${item.ids_found?.full_name || 'Unknown'}`,
            created_at: item.created_at,
          });
        });
      }

      if (requestsData.success) {
        (requestsData.data || []).forEach((item: any) => {
          activities.push({
            id: item.id,
            type: 'request',
            description: `Lost request: ${item.full_name}`,
            created_at: item.created_at,
          });
        });
      }

      // Sort by created_at and take top 5
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      value: recentUsers.length > 0 ? '...' : '0',
      change: '+0%',
      changeType: 'increase',
      description: 'Registered users',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Lost Requests',
      value: analytics?.lostRequests?.toString() || '0',
      change: '+0%',
      changeType: 'increase',
      description: 'Lost IDs reported',
      icon: FileSearch,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'IDs Found',
      value: analytics?.totalIds?.toString() || '0',
      change: '+0%',
      changeType: 'increase',
      description: 'Found and submitted',
      icon: HandHeart,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Recovery Rate',
      value: `${analytics?.recoveryRate || 0}%`,
      change: '+0%',
      changeType: 'increase',
      description: 'IDs returned to owners',
      icon: BarChart3,
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-300">
          Welcome back, {user?.full_name || 'Admin'}. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
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
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent registrations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
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
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
