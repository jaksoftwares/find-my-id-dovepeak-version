'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useNotifications } from '@/app/context/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  Bell,
  Send,
  Eye,
  Trash2,
  Calendar,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Inbox,
  History,
  Check,
  ChevronRight,
  SquareCheck,
  Square
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  is_broadcast: boolean;
  created_at: string;
  link?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  claim: 'bg-purple-100 text-purple-700',
  request: 'bg-orange-100 text-orange-700',
  system: 'bg-gray-100 text-gray-700',
};

const typeIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  claim: CheckCircle2,
  request: Bell,
  system: Bell,
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  
  // State for My Inbox
  const [inboxNotifications, setInboxNotifications] = useState<Notification[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState(true);
  const [selectedInboxIds, setSelectedInboxIds] = useState<Set<string>>(new Set());
  
  // State for Sent Notifications (Management)
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [isSentLoading, setIsSentLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User selection states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target_user_id: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchInbox = useCallback(async () => {
    setIsInboxLoading(true);
    try {
      const response = await authFetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setInboxNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
    } finally {
      setIsInboxLoading(false);
    }
  }, []);

  const fetchSent = useCallback(async () => {
    setIsSentLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterType !== 'all') params.append('type', filterType);

      const response = await authFetch(`/api/admin/notifications?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setSentNotifications(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching sent:', err);
    } finally {
      setIsSentLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchInbox();
      fetchSent();
    }
  }, [user, isAdmin, fetchInbox, fetchSent]);

  const markInboxAsRead = async (id: string) => {
    try {
      const response = await authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      const data = await response.json();
      if (data.success) {
        setInboxNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        refreshUnreadCount();
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllInboxRead = async () => {
      setIsProcessing(true);
      try {
          const response = await authFetch('/api/notifications/read-all', { method: 'POST' });
          const data = await response.json();
          if (data.success) {
              setInboxNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
              refreshUnreadCount();
              toast.success("All notifications marked as read");
          }
      } catch (err) {
          toast.error("Failed to mark all as read");
      } finally {
          setIsProcessing(false);
      }
  };

  const deleteInboxSelected = async () => {
      if (selectedInboxIds.size === 0) return;
      setIsProcessing(true);
      try {
          const response = await authFetch('/api/notifications/bulk-action', {
              method: 'POST',
              body: JSON.stringify({ action: 'delete', ids: Array.from(selectedInboxIds) })
          });
          const data = await response.json();
          if (data.success) {
              setInboxNotifications(prev => prev.filter(n => !selectedInboxIds.has(n.id)));
              setSelectedInboxIds(new Set());
              refreshUnreadCount();
              toast.success("Notifications deleted");
          }
      } catch (err) {
          toast.error("An error occurred");
      } finally {
          setIsProcessing(false);
      }
  };

  const clearAllInbox = async () => {
      setIsProcessing(true);
      try {
          const response = await authFetch('/api/notifications/bulk-action', {
              method: 'POST',
              body: JSON.stringify({ action: 'clear-all' })
          });
          const data = await response.json();
          if (data.success) {
              setInboxNotifications([]);
              setSelectedInboxIds(new Set());
              refreshUnreadCount();
              toast.success("Inbox cleared");
          }
      } catch (err) {
          toast.error("An error occurred");
      } finally {
          setIsProcessing(false);
      }
  };

  // Management functions
  const openCreateModal = () => {
    setFormData({ title: '', message: '', type: 'info', target_user_id: '' });
    setSelectedUsers([]);
    setIsBroadcast(true);
    setShowCreateModal(true);
    loadUsers('');
  };

  const loadUsers = async (query: string) => {
    setIsSearchingUsers(true);
    try {
      const url = query 
        ? `/api/admin/users?search=${encodeURIComponent(query)}&limit=10`
        : `/api/admin/users?limit=10`;
      const response = await authFetch(url);
      const data = await response.json();
      if (data.success) setUsersList(data.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const target_ids = isBroadcast ? '' : selectedUsers.map(u => u.id).join(', ');
    try {
      const response = await authFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ ...formData, target_user_id: target_ids }),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchSent();
        toast.success("Notification sent");
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSent = async () => {
    if (!selectedNotification) return;
    setIsSubmitting(true);
    try {
      const response = await authFetch(`/api/admin/notifications/${selectedNotification.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setShowDeleteModal(false);
        fetchSent();
        toast.success("Notification deleted");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnreadInboxCount = () => inboxNotifications.filter(n => !n.is_read).length;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
        </div>
        <Button onClick={openCreateModal}>
          <Send className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="bg-zinc-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="inbox" className="rounded-lg gap-2 px-6">
            <Inbox className="h-4 w-4" />
            Inbox
            {getUnreadInboxCount() > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                    {getUnreadInboxCount()}
                </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2 px-6">
            <History className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 outline-none">
            {/* Inbox Header Actions */}
            <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                    {selectedInboxIds.size > 0 && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={deleteInboxSelected}
                            disabled={isProcessing}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete ({selectedInboxIds.size})
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {getUnreadInboxCount() > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllInboxRead} disabled={isProcessing}>
                            Mark All Read
                        </Button>
                    )}
                    {inboxNotifications.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={clearAllInbox} disabled={isProcessing}>
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {isInboxLoading ? (
                <Card><CardContent className="py-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></CardContent></Card>
            ) : inboxNotifications.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center">
                        <Inbox className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">No notifications yet</h3>
                        <p className="text-muted-foreground">System updates and user activities will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden divide-y divide-zinc-100 shadow-sm">
                    <div className="px-5 py-3 bg-zinc-50/50 flex items-center gap-4">
                        <button 
                            onClick={() => {
                                if (selectedInboxIds.size === inboxNotifications.length) setSelectedInboxIds(new Set());
                                else setSelectedInboxIds(new Set(inboxNotifications.map(n => n.id)));
                            }}
                            className="p-1 hover:bg-zinc-200 rounded transition-colors"
                        >
                            {selectedInboxIds.size === inboxNotifications.length ? <SquareCheck className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-zinc-400" />}
                        </button>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select All</span>
                    </div>
                    {inboxNotifications.map((notification) => (
                        <div key={notification.id} className={`group flex items-start gap-4 p-5 transition-all ${notification.is_read ? 'bg-white' : 'bg-primary/[0.02]'} hover:bg-zinc-50/50`}>
                            <button 
                                onClick={() => {
                                    const next = new Set(selectedInboxIds);
                                    if (next.has(notification.id)) next.delete(notification.id);
                                    else next.add(notification.id);
                                    setSelectedInboxIds(next);
                                }}
                                className={`mt-1 p-1 rounded ${selectedInboxIds.has(notification.id) ? 'text-primary' : 'text-zinc-300 opacity-0 group-hover:opacity-100'}`}
                            >
                                {selectedInboxIds.has(notification.id) ? <SquareCheck className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                            </button>
                            <div className="flex-1 cursor-pointer" onClick={() => {
                                if (!notification.is_read) markInboxAsRead(notification.id);
                                if (notification.link) router.push(notification.link);
                            }}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl ${typeColors[notification.type] || typeColors.info}`}>
                                        {typeIcons[notification.type] ? React.createElement(typeIcons[notification.type], { className: "h-5 w-5" }) : <Bell className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold text-sm ${!notification.is_read ? 'text-zinc-900' : 'text-zinc-500'}`}>{notification.title}</h3>
                                                {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="text-[10px] font-medium text-zinc-400">{new Date(notification.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className={`text-sm ${!notification.is_read ? 'text-zinc-800' : 'text-zinc-500'}`}>{notification.message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 outline-none">
            {/* Filters */}
            <Card className="border-none shadow-sm bg-zinc-50">
                <CardContent className="py-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-200">
                            <span className="text-xs font-bold text-zinc-500">Filter:</span>
                            <select 
                                value={filterType} 
                                onChange={(e) => { setFilterType(e.target.value); setPage(1); }} 
                                className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer pr-8"
                            >
                                <option value="all">All</option>
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="claim">Claim</option>
                                <option value="request">Request</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-xs font-medium text-zinc-500">
                            Showing {sentNotifications.length} entries on page {page}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isSentLoading ? (
                <Card><CardContent className="py-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></CardContent></Card>
            ) : sentNotifications.length === 0 ? (
                <Card><CardContent className="py-20 text-center text-muted-foreground italic">No sent notifications match your filters.</CardContent></Card>
            ) : (
                <div className="space-y-3">
                  {sentNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2.5 rounded-xl ${typeColors[notification.type] || typeColors.info}`}>
                            {typeIcons[notification.type] ? React.createElement(typeIcons[notification.type], { className: "h-5 w-5" }) : <Bell className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-zinc-900">{notification.title}</h3>
                              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{notification.type}</Badge>
                              {notification.is_broadcast ? <Badge className="bg-purple-100 text-purple-700 border-none text-[10px]">Broadcast</Badge> : notification.is_read && <Badge variant="secondary" className="text-[10px]">Seen</Badge>}
                            </div>
                            <p className="text-sm text-zinc-600 line-clamp-2">{notification.message}</p>
                            <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-zinc-400">
                              <span className="flex items-center gap-1"><User className="h-3 w-3" /> To: {notification.is_broadcast ? 'Everyone' : (notification.profiles?.full_name || 'Member')}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(notification.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400" onClick={() => { setSelectedNotification(notification); setShowViewModal(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500" onClick={() => { setSelectedNotification(notification); setShowDeleteModal(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {totalPages > 1 && (
                      <div className="flex justify-center gap-2 pt-4">
                          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                          <div className="h-9 w-9 flex items-center justify-center font-bold text-sm bg-zinc-100 rounded-lg">{page}</div>
                          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                      </div>
                  )}
                </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Modals remain largely same but with updated styling */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-zinc-200">
            <CardHeader className="bg-zinc-50/50 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Create Alert</CardTitle>
                        <CardDescription>Send a notification to users across the platform</CardDescription>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600"><XCircle className="h-6 w-6" /></button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Alert Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="info">Information</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Critical Error</option>
                      <option value="claim">Claim Update</option>
                      <option value="request">Request Status</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Target Audience</label>
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg h-9">
                      <button type="button" className={`flex-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all ${isBroadcast ? 'bg-white shadow text-primary' : 'text-zinc-400'}`} onClick={() => setIsBroadcast(true)}>Broadcast</button>
                      <button type="button" className={`flex-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all ${!isBroadcast ? 'bg-white shadow text-primary' : 'text-zinc-400'}`} onClick={() => setIsBroadcast(false)}>Direct</button>
                    </div>
                  </div>
                </div>

                {!isBroadcast && (
                  <div className="space-y-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Recipients ({selectedUsers.length})</label>
                    </div>
                    
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto mb-2">
                        {selectedUsers.map(u => (
                          <Badge key={u.id} variant="secondary" className="pl-2 pr-1 py-0.5 gap-1 bg-white border-zinc-200">
                            {u.full_name || 'Member'}
                            <XCircle className="h-3 w-3 cursor-pointer text-zinc-400 hover:text-red-500" onClick={() => setSelectedUsers(selectedUsers.filter(x => x.id !== u.id))} />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onFocus={() => { setShowUserDropdown(true); loadUsers(''); }}
                        onChange={(e) => { setUserSearch(e.target.value); loadUsers(e.target.value); }}
                        className="bg-white"
                      />
                      {showUserDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {isSearchingUsers ? <div className="p-4 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-zinc-300" /></div> : usersList.length === 0 ? <div className="p-4 text-center text-xs text-zinc-400 italic">No users found</div> : usersList.map(u => (
                            <button key={u.id} type="button" className="w-full text-left px-4 py-3 hover:bg-zinc-50 text-sm border-b last:border-0 flex justify-between items-center" onClick={() => {
                                if (!selectedUsers.find(x => x.id === u.id)) setSelectedUsers([...selectedUsers, u]);
                                setShowUserDropdown(false);
                                setUserSearch('');
                            }}>
                                <div><p className="font-bold text-zinc-900">{u.full_name || 'Member'}</p><p className="text-[10px] text-zinc-400">{u.email}</p></div>
                                <ChevronRight className="h-4 w-4 text-zinc-300" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Alert Title</label>
                  <Input placeholder="Message heading..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-zinc-50" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Message Content</label>
                  <Textarea placeholder="Full details of the alert..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} required className="bg-zinc-50 resize-none" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" className="flex-1 font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> ...</> : <><Send className="h-4 w-4 mr-2" /> Send</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simplified View Modal */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="border-b bg-zinc-50/50">
              <div className="flex items-center justify-between">
                <CardTitle>Message Details</CardTitle>
                <Badge variant="outline" className="uppercase tracking-widest text-[10px]">{selectedNotification.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Subject</h4>
                <p className="font-bold text-zinc-900 text-lg">{selectedNotification.title}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Body</h4>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Recipient</h4>
                  <p className="text-xs font-bold text-zinc-900">{selectedNotification.is_broadcast ? 'All Platform Users' : (selectedNotification.profiles?.full_name || 'Member')}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Timestamp</h4>
                  <p className="text-xs font-bold text-zinc-900">{new Date(selectedNotification.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button className="w-full mt-2 font-bold" onClick={() => setShowViewModal(false)}>Acknowledge</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-sm border-red-100 shadow-2xl">
            <CardHeader className="bg-red-50/50 border-b">
              <CardTitle className="text-red-700 flex items-center gap-2"><Trash2 className="h-5 w-5" /> Retract Notification</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-500 mb-6">Are you sure you want to permanently delete this notification? Users will no longer be able to see it in their inbox.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>Retain</Button>
                <Button variant="destructive" className="flex-1 font-bold shadow-lg shadow-red-200" onClick={handleDeleteSent} disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Delete Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
