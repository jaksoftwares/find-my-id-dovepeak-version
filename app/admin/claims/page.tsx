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
  HandHeart,
  Eye,
  User,
  FileSearch,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  PackageCheck,
  ClipboardList
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface Claim {
  id: string;
  id_found: string;
  claimant: string;
  proof_description: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  ids_found?: {
    full_name: string;
    registration_number: string;
    id_type: string;
    image_url?: string;
  };
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  drivers_license: "Driver's License",
  passport: 'Passport',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'claimed': return 'secondary';
    case 'returned': return 'default';
    default: return 'outline';
  }
};

export default function AdminClaimsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
  });

  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [conversationThread, setConversationThread] = useState<any[]>([]);
  const [isFetchingThread, setIsFetchingThread] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchClaims();
      fetchStats();
    }
  }, [user, isAdmin, page, filterStatus, searchQuery]);

  const fetchConversation = async (claimId: string) => {
    setIsFetchingThread(true);
    try {
      const response = await authFetch(`/api/notifications/conversation/${claimId}`);
      const data = await response.json();
      if (data.success) {
        setConversationThread(data.data || []);
      } else {
        setConversationThread([]);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setConversationThread([]);
    } finally {
      setIsFetchingThread(false);
    }
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await authFetch('/api/admin/claims/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (searchQuery) {
        params.append('query', searchQuery);
      }

      const response = await authFetch(`/api/admin/claims?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setClaims(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch claims');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowViewModal(true);
  };

  const openProcessModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setFormData({
      status: claim.status,
      admin_notes: claim.admin_notes || '',
    });
    setShowProcessModal(true);
  };

  const openNotificationModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setNotificationMessage('');
    setShowNotificationModal(true);
    fetchConversation(claim.id);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !notificationMessage) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/claims/${selectedClaim.id}/notify`, {
        method: 'POST',
        body: JSON.stringify({ message: notificationMessage }),
      });

      const data = await response.json();

      if (data.success) {
        setNotificationMessage('');
        fetchConversation(selectedClaim.id);
        // Don't close modal, show the new message in thread
      } else {
        setError(data.message || 'Failed to send notification');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
// ... rest of the component (keeping handleProcessClaim etc.)
// Jumping to render part for the modal

  const handleProcessClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/claims/${selectedClaim.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowProcessModal(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        setError(data.message || 'Failed to process claim');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/claims/${claimId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchClaims();
      } else {
        setError(data.message || 'Failed to approve claim');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/claims/${claimId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchClaims();
      } else {
        setError(data.message || 'Failed to reject claim');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <p className="text-muted-foreground">Review and process ID claims</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`border-0 shadow-sm transition-all cursor-pointer hover:shadow-md ${filterStatus === 'all' ? 'ring-2 ring-primary bg-primary/10' : 'bg-primary/5'}`}
          onClick={() => setFilterStatus('all')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Total Claims</p>
                <p className="text-3xl font-bold mt-1 text-primary">{isLoadingStats ? '...' : stats.total}</p>
                <p className="text-[10px] text-primary/60 font-medium mt-1">View all records</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
 
        <Card 
          className={`border-0 shadow-sm transition-all cursor-pointer hover:shadow-md ${filterStatus === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-100/50' : 'bg-yellow-50/50'}`}
          onClick={() => setFilterStatus('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{isLoadingStats ? '...' : stats.pending}</p>
                <p className="text-[10px] text-yellow-600/60 font-medium mt-1">Needs attention</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
 
        <Card 
          className={`border-0 shadow-sm transition-all cursor-pointer hover:shadow-md ${filterStatus === 'approved' ? 'ring-2 ring-green-500 bg-green-100/50' : 'bg-green-50/50'}`}
          onClick={() => setFilterStatus('approved')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Approved</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{isLoadingStats ? '...' : stats.approved}</p>
                <p className="text-[10px] text-green-600/60 font-medium mt-1">Verified records</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
 
        <Card 
          className={`border-0 shadow-sm transition-all cursor-pointer hover:shadow-md ${filterStatus === 'completed' ? 'ring-2 ring-blue-500 bg-blue-100/50' : 'bg-blue-50/50'}`}
          onClick={() => setFilterStatus('completed')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Completed</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{isLoadingStats ? '...' : stats.completed}</p>
                <p className="text-[10px] text-blue-600/60 font-medium mt-1">Closed claims</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <PackageCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claimant name, email or ID details..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-md text-sm min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
          <CardDescription>Review and process claims for found IDs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12">
              <HandHeart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
              <p className="text-muted-foreground">
                No claims match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Claimant</th>
                    <th className="text-left py-3 px-4 font-medium">ID Info</th>
                    <th className="text-left py-3 px-4 font-medium">Proof</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{claim.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{claim.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{claim.ids_found?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {idTypeLabels[claim.ids_found?.id_type || ''] || claim.ids_found?.id_type}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm truncate max-w-[200px]">
                          {claim.proof_description}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[claim.status]}>
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(claim)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {claim.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveClaim(claim.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectClaim(claim.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openNotificationModal(claim)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Send Message"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {showViewModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Claim Details</CardTitle>
              <CardDescription>
                Full information about this claim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Claimant</label>
                  <p>{selectedClaim.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedClaim.profiles?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedClaim.profiles?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedClaim.status]}>
                    {selectedClaim.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">ID Information</label>
                <div className="p-3 bg-gray-50 rounded-lg mt-1">
                  <p><strong>Name:</strong> {selectedClaim.ids_found?.full_name}</p>
                  <p><strong>Type:</strong> {idTypeLabels[selectedClaim.ids_found?.id_type || ''] || selectedClaim.ids_found?.id_type}</p>
                  <p><strong>Reg #:</strong> {selectedClaim.ids_found?.registration_number}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Proof of Ownership</label>
                <p className="mt-1">{selectedClaim.proof_description}</p>
              </div>

              {selectedClaim.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <p className="mt-1">{selectedClaim.admin_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p>{new Date(selectedClaim.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p>{new Date(selectedClaim.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedClaim(null);
                }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Process Claim</CardTitle>
              <CardDescription>
                Update claim status and add notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProcessClaim} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Add notes about this claim..."
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowProcessModal(false);
                      setSelectedClaim(null);
                    }}
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
                      'Process Claim'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border-0">
            <CardHeader className="border-b bg-zinc-50/50 p-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Messages</CardTitle>
                      <CardDescription>
                        Conversation with {selectedClaim.profiles?.full_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        setShowNotificationModal(false);
                        setSelectedClaim(null);
                    }} 
                    className="rounded-full"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[350px] overflow-y-auto p-6 space-y-4 bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                    {isFetchingThread ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            Loading...
                        </div>
                    ) : conversationThread.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground italic">
                            No messages.
                        </div>
                    ) : (
                        conversationThread.map((msg) => (
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
                                    <p className="text-sm whitespace-pre-wrap font-medium">{msg.message}</p>
                                    <div className={`text-[10px] mt-2 font-bold opacity-70 flex items-center gap-1 ${msg.sender_id === user?.id ? 'text-white' : 'text-zinc-500'}`}>
                                        {msg.sender_id === user?.id ? 'Admin (Me)' : 'Claimant'} • {new Date(msg.created_at).toLocaleString()}
                                        {msg.is_read && msg.sender_id === user?.id && <CheckCircle className="h-3 w-3 inline" />}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            <div className="p-4 border-t bg-zinc-50/80">
                <form onSubmit={handleSendNotification} className="space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a message..."
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      rows={2}
                      className="flex-1 rounded-xl border-zinc-200 focus:ring-primary shadow-sm bg-white resize-none"
                      required
                    />
                    <Button 
                      type="submit" 
                      className="h-auto shrink-0 rounded-xl px-6 bg-primary shadow-lg shadow-primary/20" 
                      disabled={isSubmitting || !notificationMessage}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Send'
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    User will be notified.
                  </p>
                </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
