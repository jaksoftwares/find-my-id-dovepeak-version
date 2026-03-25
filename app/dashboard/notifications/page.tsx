'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useNotifications } from '@/app/context/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertCircle, 
  Bell,
  Check,
  Calendar,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  MoreVertical,
  ChevronRight,
  SquareCheck,
  Square,
  MessageSquare
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  is_broadcast: boolean;
  created_at: string;
  link?: string;
  allow_reply?: boolean;
  conversation_id?: string;
  sender?: {
      full_name: string;
      avatar_url?: string;
  };
}

const notificationIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  claim: CheckCircle2,
  request: Info,
  system: Bell,
  reply: MessageSquare,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  claim: 'bg-purple-100 text-purple-600',
  request: 'bg-orange-100 text-orange-600',
  system: 'bg-gray-100 text-gray-600',
  reply: 'bg-indigo-100 text-indigo-600',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversation/Reply state
  const [selectedConversation, setSelectedConversation] = useState<Notification | null>(null);
  const [conversationThread, setConversationThread] = useState<Notification[]>([]);
  const [isFetchingThread, setIsFetchingThread] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch('/api/notifications');
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

  const fetchConversation = async (notification: Notification) => {
    if (!notification.conversation_id) {
       // Single message, no thread yet
       setConversationThread([notification]);
       return;
    }

    setIsFetchingThread(true);
    try {
        const response = await authFetch(`/api/notifications/conversation/${notification.conversation_id}`);
        const data = await response.json();
        if (data.success) {
            setConversationThread(data.data || []);
        } else {
            setConversationThread([notification]);
        }
    } catch (err) {
        setConversationThread([notification]);
    } finally {
        setIsFetchingThread(false);
    }
  };

  const openReplyModal = (notification: Notification) => {
    setSelectedConversation(notification);
    setReplyMessage('');
    setShowReplyModal(true);
    fetchConversation(notification);
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyMessage.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await authFetch(`/api/notifications/${selectedConversation.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: replyMessage }),
      });
      const data = await response.json();

      if (data.success) {
          toast.success("Reply sent successfully");
          setReplyMessage('');
          // Refresh thread
          fetchConversation(selectedConversation);
          // Also mark original as read
          if (!selectedConversation.is_read) {
            markAsRead(selectedConversation.id);
          }
      } else {
          toast.error(data.message || "Failed to send reply");
      }
    } catch (err) {
        toast.error("An error occurred");
    } finally {
        setIsProcessing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await authFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        refreshUnreadCount();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setIsProcessing(true);
    try {
      const response = await authFetch(`/api/notifications/read-all`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        refreshUnreadCount();
        toast.success("Read");
      }
    } catch (err) {
      toast.error("Failed");
    } finally {
        setIsProcessing(false);
    }
  };

  const performBulkAction = async (action: 'delete' | 'clear-all') => {
    if (action === 'delete' && selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await authFetch('/api/notifications/bulk-action', {
        method: 'POST',
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds)
        })
      });
      const data = await response.json();

      if (data.success) {
        if (action === 'delete') {
            setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
            setSelectedIds(new Set());
            toast.success("Deleted");
        } else {
            setNotifications([]);
            setSelectedIds(new Set());
            toast.success("Cleared");
        }
        refreshUnreadCount();
      } else {
          toast.error(data.message || "Failed");
      }
    } catch (err) {
      toast.error("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type] || notificationIcons.info;
    return <Icon className="h-5 w-5" />;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Messages
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={isProcessing}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => performBulkAction('clear-all')} disabled={isProcessing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
            </div>
            <Button variant="destructive" size="sm" onClick={() => performBulkAction('delete')} disabled={isProcessing}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
            </Button>
        </div>
      )}

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

      {/* Notifications List */}
      <div className="space-y-6 w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-zinc-100 italic text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary/20 mb-4" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
              <div className="bg-zinc-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-zinc-300" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Quiet for now</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                We'll notify you here when there's an update on your ID reports or claims.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden divide-y divide-zinc-100 shadow-sm">
                <div className="px-4 py-3 bg-zinc-50/50 flex items-center gap-3">
                    <button 
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-zinc-200 rounded transition-colors"
                    >
                        {selectedIds.size === notifications.length ? (
                            <SquareCheck className="h-5 w-5 text-primary" />
                        ) : (
                            <Square className="h-5 w-5 text-zinc-400" />
                        )}
                    </button>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select all</span>
                </div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    group flex items-start gap-4 p-5 transition-all
                    ${notification.is_read ? 'bg-white' : 'bg-primary/[0.02]'}
                    hover:bg-zinc-50/80
                  `}
                >
                  <button 
                    onClick={() => toggleSelect(notification.id)}
                    className={`mt-1.5 p-1 rounded transition-colors ${selectedIds.has(notification.id) ? 'text-primary' : 'text-zinc-300 opacity-0 group-hover:opacity-100'}`}
                  >
                    {selectedIds.has(notification.id) ? <SquareCheck className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>

                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        if (notification.allow_reply) {
                           openReplyModal(notification);
                        } else if (notification.link) {
                          router.push(notification.link);
                        }
                    }}
                  >
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 ${typeColors[notification.type] || typeColors.info}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-sm ${!notification.is_read ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-zinc-800' : 'text-zinc-500'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {notification.allow_reply && (
                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    <MessageSquare className="h-3 w-3" /> Reply
                                </span>
                             )}
                             {notification.link && !notification.allow_reply && (
                                <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                                    View Details <ChevronRight className="h-3 w-3" />
                                </span>
                             )}
                          </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                     {notification.allow_reply && (
                        <Button 
                           variant="ghost" 
                           size="sm"
                           className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                           onClick={(e) => {
                               e.stopPropagation();
                               openReplyModal(notification);
                           }}
                        >
                           Reply
                        </Button>
                     )}
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIds(new Set([notification.id]));
                            performBulkAction('delete');
                        }}
                     >
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Reply/Conversation Modal */}
      {showReplyModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border-0">
                <CardHeader className="border-b bg-zinc-50/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{selectedConversation.title}</CardTitle>
                                <CardDescription>Message thread</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowReplyModal(false)} className="rounded-full">
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-white">
                        {isFetchingThread ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-pulse">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                Loading...
                            </div>
                        ) : (
                            conversationThread.map((msg, idx) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`
                                        max-w-[85%] rounded-2xl p-4 shadow-sm
                                        ${msg.sender_id === user?.id 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-zinc-100 text-zinc-800 rounded-tl-none'}
                                    `}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <div className={`text-[10px] mt-2 font-medium opacity-60 ${msg.sender_id === user?.id ? 'text-white' : 'text-zinc-500'}`}>
                                            {msg.sender?.full_name || (msg.sender_id === user?.id ? 'Me' : 'Admin')} • {new Date(msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
                <div className="p-4 border-t bg-zinc-50/80">
                    <div className="flex gap-2">
                        <textarea
                            placeholder="Write a reply..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="flex-1 min-h-[44px] max-h-[120px] rounded-xl border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply();
                                }
                            }}
                        />
                        <Button 
                            className="h-[44px] px-6 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                            onClick={handleSendReply}
                            disabled={isProcessing || !replyMessage.trim()}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        Enter to send
                    </p>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
}

