
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Loader2, Calendar, User, Search, Filter, Trash2, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived';
  created_at: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'responded' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchMessages();
    }
  }, [user, isAdmin]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: ContactMessage['status']) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-600';
      case 'read': return 'bg-zinc-100 text-zinc-600';
      case 'responded': return 'bg-green-100 text-green-600';
      case 'archived': return 'bg-zinc-100 text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">Manage and respond to community inquiries</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={fetchMessages} variant="outline" size="sm">
             Refresh
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed text-zinc-500">
                <Mail className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') updateMessageStatus(msg.id, 'read');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMessage?.id === msg.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-zinc-100 bg-white hover:border-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{msg.subject}</h3>
                  <p className="text-xs text-zinc-600 truncate">{msg.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <Card className="border-0 shadow-sm h-full flex flex-col">
              <CardHeader className="border-b border-zinc-50 pb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl mb-1">{selectedMessage.subject}</CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {selectedMessage.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedMessage.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy @ h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-zinc-400 hover:text-red-500"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 py-8">
                <div className="whitespace-pre-wrap text-zinc-700 leading-relaxed font-medium">
                  {selectedMessage.message}
                </div>
              </CardContent>
              <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'responded')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Responded
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                  >
                    <Eye className="h-4 w-4" />
                    Archive
                  </Button>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} className="flex-1">
                    <Button className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      Reply via Email
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <MessageSquare className="h-16 w-16 text-zinc-200 mb-4" />
              <h3 className="text-zinc-500 font-bold text-lg">Select a message to view details</h3>
              <p className="text-zinc-400 text-sm max-w-xs">Click on any message from the list on the left to read the full content and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
