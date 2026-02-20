'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { 
  FileSearch, 
  FilePlus, 
  HandHeart, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Reports',
      value: '0',
      description: 'Lost IDs reported',
      icon: FileSearch,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Pending Claims',
      value: '0',
      description: 'Awaiting response',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Found Items',
      value: '0',
      description: 'IDs found and submitted',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'My Claims',
      value: '0',
      description: 'Claims submitted',
      icon: HandHeart,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const quickActions = [
    {
      title: 'Report Lost ID',
      description: 'Submit a report for a lost identification card',
      href: '/dashboard/requests',
      icon: FilePlus,
    },
    {
      title: 'Browse Found IDs',
      description: 'Search for found identification cards',
      href: '/dashboard/ids',
      icon: FileSearch,
    },
    {
      title: 'View Claims',
      description: 'Check status of your claims',
      href: '/dashboard/claims',
      icon: HandHeart,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-primary-foreground/90">
          Track your lost ID reports and manage your claims all in one place.
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
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
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
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Your actions will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
