'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { RoleProtectedRoute } from '@/app/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Settings,
  Globe,
  Mail,
  Shield,
  Bell,
  Lock
} from 'lucide-react';
import { RestrictionModal } from '@/components/admin/RestrictionModal';
import { authFetch } from '@/app/lib/apiClient';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  address: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sender_name: string;
  admin_email_submissions: string;
  admin_email_claims: string;
  admin_email_messages: string;
  admin_email_found_ids: string;
  admin_email_lost_ids: string;
}

interface AdminUser {
  id: string;
  full_name: string;
  role: string;
  email: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin, isSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Find My ID',
    site_description: 'Platform for finding lost identification cards at JKUAT',
    contact_email: 'support@findmyid.ac.ke',
    support_phone: '+254 700 000 000',
    address: 'JKUAT Main Campus, Juja',
    notifications_enabled: true,
    email_notifications: true,
    sender_name: 'JKUAT Customer Service Center',
    admin_email_submissions: '',
    admin_email_claims: '',
    admin_email_messages: '',
    admin_email_found_ids: '',
    admin_email_lost_ids: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchSettings();
      fetchAdmins();
    }
  }, [user, isAdmin]);

  const fetchAdmins = async () => {
    try {
      const response = await authFetch('/api/admin/users/admins');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings({
          site_name: data.data.site_name || 'JKUAT Find My ID',
          site_description: data.data.site_description || '',
          contact_email: data.data.contact_email || '',
          support_phone: data.data.support_phone || '',
          address: data.data.address || '',
          notifications_enabled: data.data.notifications_enabled ?? true,
          email_notifications: data.data.email_notifications ?? true,
          sender_name: data.data.sender_name || 'JKUAT Customer Service Center',
          admin_email_submissions: data.data.admin_email_submissions || '',
          admin_email_claims: data.data.admin_email_claims || '',
          admin_email_messages: data.data.admin_email_messages || '',
          admin_email_found_ids: data.data.admin_email_found_ids || '',
          admin_email_lost_ids: data.data.admin_email_lost_ids || '',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [showRestriction, setShowRestriction] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      setShowRestriction(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 rounded-xl">
             <Settings className="h-6 w-6 text-zinc-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">General platform configuration and email routing</p>
          </div>
        </div>
        {!isSuperAdmin && (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl flex items-center gap-2 text-sm font-medium">
             <Lock className="h-4 w-4" />
             View Only (Super Admin Needed)
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSave}>
        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support_phone">Support Phone</Label>
                <Input
                  id="support_phone"
                  type="tel"
                  value={settings.support_phone}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Branding & Sender Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Email Branding & Sender Settings
            </CardTitle>
            <CardDescription>
              Configure how platform emails appear to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sender_name">Email Sender Display Name</Label>
              <Input
                id="sender_name"
                placeholder="e.g. JKUAT Customer Service Center"
                value={settings.sender_name}
                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground italic">This name will appear as the sender in the recipient's inbox.</p>
            </div>
          </CardContent>
        </Card>

        {/* Administrative Email Routing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Administrative Email Routing
            </CardTitle>
            <CardDescription>
              Set which admin email address receives specific system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Submissions Routing */}
                <div className="space-y-2">
                   <Label htmlFor="admin_email_submissions">ID Submissions Routing</Label>
                   <select
                     id="admin_email_submissions"
                     className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     value={settings.admin_email_submissions}
                     onChange={(e) => setSettings({ ...settings, admin_email_submissions: e.target.value })}
                   >
                     <option value="">Default (Contact Email)</option>
                     {admins.map(admin => (
                       <option key={`sub-${admin.id}`} value={admin.email}>
                         {admin.full_name} ({admin.email})
                       </option>
                     ))}
                   </select>
                </div>

                {/* ID Claims Routing */}
                <div className="space-y-2">
                   <Label htmlFor="admin_email_claims">ID Claims Routing</Label>
                   <select
                     id="admin_email_claims"
                     className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     value={settings.admin_email_claims}
                     onChange={(e) => setSettings({ ...settings, admin_email_claims: e.target.value })}
                   >
                     <option value="">Default (Contact Email)</option>
                     {admins.map(admin => (
                       <option key={`claim-${admin.id}`} value={admin.email}>
                         {admin.full_name} ({admin.email})
                       </option>
                     ))}
                   </select>
                </div>

                {/* Contact Messages Routing */}
                <div className="space-y-2">
                   <Label htmlFor="admin_email_messages">Contact Messages Routing</Label>
                   <select
                     id="admin_email_messages"
                     className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     value={settings.admin_email_messages}
                     onChange={(e) => setSettings({ ...settings, admin_email_messages: e.target.value })}
                   >
                     <option value="">Default (Contact Email)</option>
                     {admins.map(admin => (
                       <option key={`msg-${admin.id}`} value={admin.email}>
                         {admin.full_name} ({admin.email})
                       </option>
                     ))}
                   </select>
                </div>

                {/* Found ID Notifications */}
                <div className="space-y-2">
                   <Label htmlFor="admin_email_found_ids">Found ID Notifications</Label>
                   <select
                     id="admin_email_found_ids"
                     className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     value={settings.admin_email_found_ids}
                     onChange={(e) => setSettings({ ...settings, admin_email_found_ids: e.target.value })}
                   >
                     <option value="">Default (Contact Email)</option>
                     {admins.map(admin => (
                       <option key={`found-${admin.id}`} value={admin.email}>
                         {admin.full_name} ({admin.email})
                       </option>
                     ))}
                   </select>
                </div>

                {/* Lost ID Report Routing */}
                <div className="space-y-2">
                   <Label htmlFor="admin_email_lost_ids">Lost ID Report Routing</Label>
                   <select
                     id="admin_email_lost_ids"
                     className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     value={settings.admin_email_lost_ids}
                     onChange={(e) => setSettings({ ...settings, admin_email_lost_ids: e.target.value })}
                   >
                     <option value="">Default (Contact Email)</option>
                     {admins.map(admin => (
                       <option key={`lost-${admin.id}`} value={admin.email}>
                         {admin.full_name} ({admin.email})
                       </option>
                     ))}
                   </select>
                </div>
             </div>
             <p className="text-xs text-muted-foreground p-3 bg-zinc-50 border rounded-lg">
                <strong>Tip:</strong> Delegate responsibilities by assigning different administrative staff to handle specific notification categories.
             </p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Generic Notification Override
            </CardTitle>
            <CardDescription>
              Configure how global system notifications are handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Enable Global Notifications</p>
                <p className="text-sm text-muted-foreground">Master switch for all platform alerts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="h-5 w-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Global Email Delivery</p>
                <p className="text-sm text-muted-foreground">Send system reports via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="h-5 w-5 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
      <RestrictionModal 
         isOpen={showRestriction}
         onClose={() => setShowRestriction(false)}
      />
    </div>
  );
}
