'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { 
  FileSearch, 
  FilePlus, 
  HandHeart, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authFetch } from '@/app/lib/apiClient';
import { useApiGet, CACHE_CONFIG } from '@/app/lib/useApiCache';

interface DashboardStats {
  activeReports: number;
  pendingClaims: number;
  foundItems: number;
  myClaims: number;
}

interface DashboardData {
  requests: any[];
  claims: any[];
  ids: any[];
  stats: DashboardStats;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeReports: 0,
    pendingClaims: 0,
    foundItems: 0,
    myClaims: 0,
  });

  // SWR hook for dashboard data with caching
  // TTL: 60s (moderate change data)
  const { data, isLoading: isLoadingStats, error } = useApiGet<{ success: boolean; data: DashboardData }>(
    '/api/dashboard',
    {
      ttl: CACHE_CONFIG.dashboard.ttl,
      revalidateOnFocus: false,
    }
  );

  // Update stats when data changes
  useEffect(() => {
    if (data?.success && data.data?.stats) {
      setStats(data.data.stats);
    }
  }, [data]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const statCards = [
    {
      title: 'Active Reports',
      value: stats.activeReports,
      description: 'Lost IDs reported',
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims,
      description: 'Awaiting response',
    },
    {
      title: 'Found Items',
      value: stats.foundItems,
      description: 'IDs found and submitted',
    },
    {
      title: 'My Claims',
      value: stats.myClaims,
      description: 'Claims submitted',
    },
  ];

  const quickActions = [
    {
      title: 'Report Lost ID',
      description: 'Submit a report for a lost identification card',
      href: '/dashboard/requests',
    },
    {
      title: 'Browse Found IDs',
      description: 'Search for found identification cards',
      href: '/dashboard/ids',
    },
    {
      title: 'View Claims',
      description: 'Check status of your claims',
      href: '/dashboard/claims',
    },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 italic text-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-primary-foreground/90">
          Track your lost ID reports and manage your claims all in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats && !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loading...</p>
                  <div className="h-8 w-16 bg-gray-200 animate-pulse mt-1 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Here's what you can do on findmyid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Lost Your ID?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Report your lost ID immediately so we can help you find it.
              </p>
              <Link href="/dashboard/requests">
                <button className="text-primary text-sm font-medium hover:underline">
                  Report Lost ID
                </button>
              </Link>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Found an ID?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Browse our database of found IDs to see if someone's looking for it.
              </p>
              <Link href="/dashboard/ids">
                <button className="text-primary text-sm font-medium hover:underline">
                  Browse Found IDs
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
