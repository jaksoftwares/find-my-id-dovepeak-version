'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  XCircle
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

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
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchNotifications();
    }
  }, [user, page, filterType]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await authFetch(`/api/admin/notifications?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_user_id: '',
    });
    setSelectedUsers([]);
    setIsBroadcast(true);
    setShowCreateModal(true);
    loadUsers(''); // Initial load
  };

  const loadUsers = async (query: string) => {
    setIsSearchingUsers(true);
    try {
      const url = query 
        ? `/api/admin/users?search=${encodeURIComponent(query)}&limit=10`
        : `/api/admin/users?limit=10`;
      
      const response = await authFetch(url);
      const data = await response.json();
      if (data.success) {
        setUsersList(data.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const toggleUserSelection = (selectedUser: any) => {
    if (selectedUsers.some(u => u.id === selectedUser.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== selectedUser.id));
    } else {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
    setUserSearch('');
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const openViewModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Prepare target IDs from selectedUsers list if not broadcast
    const target_ids = isBroadcast ? '' : selectedUsers.map(u => u.id).join(', ');

    try {
      const response = await authFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          target_user_id: target_ids
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        fetchNotifications();
      } else {
        setError(data.message || 'Failed to create notification');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteNotification = async (notificationId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchNotifications();
      } else {
        setError(data.message || 'Failed to delete notification');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type] || typeIcons.info;
    return <Icon className="h-5 w-5" />;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground">Send and manage platform notifications</p>
        </div>
        <Button onClick={openCreateModal}>
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Error Message */}
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="claim">Claim</option>
              <option value="request">Request</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>View and manage all notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                No notifications have been sent yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeColors[notification.type] || typeColors.info}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge variant="outline">{notification.type}</Badge>
                          {notification.is_broadcast ? (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Broadcast</Badge>
                          ) : notification.is_read && (
                            <Badge variant="secondary">Read</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {notification.is_broadcast ? (
                            <span className="font-medium text-purple-600">To: All Users (Broadcast)</span>
                          ) : notification.profiles ? (
                            <span className="font-medium text-blue-600">To: {notification.profiles.full_name || 'Member'}</span>
                          ) : (
                            <span className="italic text-gray-400">To: Member</span>
                          )}
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewModal(notification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>Alert users via system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="claim">Claim Update</option>
                      <option value="request">Request Update</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Mode</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        type="button"
                        className={`flex-1 py-1 text-xs rounded-md transition-all ${isBroadcast ? 'bg-white shadow-sm font-bold' : ''}`}
                        onClick={() => {
                          setIsBroadcast(true);
                          setFormData({...formData, target_user_id: ''});
                        }}
                      >
                        Broadcast
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-1 text-xs rounded-md transition-all ${!isBroadcast ? 'bg-white shadow-sm font-bold' : ''}`}
                        onClick={() => setIsBroadcast(false)}
                      >
                        Specific Users
                      </button>
                    </div>
                  </div>
                </div>

                {!isBroadcast && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Select Recipients</label>
                      <span className="text-xs text-muted-foreground">{selectedUsers.length} selected</span>
                    </div>
                    
                    {/* Selected Chips */}
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                        {selectedUsers.map(u => (
                          <Badge key={u.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-blue-200 bg-blue-50 text-blue-700">
                            {u.full_name || 'User'}
                            <button 
                              type="button" 
                              onClick={() => removeUser(u.id)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Search or select from list..."
                          value={userSearch}
                          onFocus={() => setShowUserDropdown(true)}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            loadUsers(e.target.value);
                          }}
                        />
                        {isSearchingUsers && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                      </div>
                      
                      {showUserDropdown && usersList.length > 0 && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowUserDropdown(false)} 
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-xl max-h-56 overflow-y-auto ring-1 ring-black ring-opacity-5">
                            <div className="p-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b sticky top-0">
                              Users List (Scroll or Search)
                            </div>
                            {usersList.map((u) => {
                              const isSelected = selectedUsers.some(su => su.id === u.id);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex justify-between items-center transition-colors border-b last:border-0 ${isSelected ? 'bg-blue-50' : ''}`}
                                  onClick={() => toggleUserSelection(u)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{u.full_name || 'Unnamed Member'}</span>
                                    <span className="text-xs text-gray-400">{u.role}</span>
                                  </div>
                                  {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Identity Document Found"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Content</label>
                  <Textarea
                    placeholder="Enter the full notification message details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Notification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={typeColors[selectedNotification.type]}>
                  {selectedNotification.type}
                </Badge>
                {selectedNotification.is_read && (
                  <Badge variant="secondary">Read</Badge>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <p>{selectedNotification.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <p>{selectedNotification.message}</p>
              </div>
              {selectedNotification.profiles && (
                <div>
                  <label className="text-sm font-medium">Recipient</label>
                  <p>{selectedNotification.profiles.full_name || 'Member'}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Created At</label>
                <p>{new Date(selectedNotification.created_at).toLocaleString()}</p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedNotification(null);
                }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
