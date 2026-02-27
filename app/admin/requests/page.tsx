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
  FileSearch,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface LostRequest {
  id: string;
  id_type: string;
  full_name: string;
  registration_number?: string;
  description?: string;
  contact_phone?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone_number?: string;
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
  submitted: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<LostRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LostRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRequests();
    }
  }, [user, page, filterStatus, filterType]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await authFetch(`/api/admin/requests?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (request: LostRequest) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const openUpdateModal = (request: LostRequest) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      notes: '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: formData.status }),
      });

      const data = await response.json();

      if (data.success) {
        setShowUpdateModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        setError(data.message || 'Failed to update request');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'closed' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRequests();
      } else {
        setError(data.message || 'Failed to close request');
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
          <h1 className="text-2xl font-bold">Lost Requests Management</h1>
          <p className="text-muted-foreground">Manage lost ID reports from users</p>
        </div>
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
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="matched">Matched</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="national_id">National ID</option>
              <option value="student_id">Student ID</option>
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Lost Requests</CardTitle>
          <CardDescription>Review and manage lost ID reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
              <p className="text-muted-foreground">
                No lost ID requests match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">ID Details</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{request.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {idTypeLabels[request.id_type] || request.id_type}
                            {request.registration_number && ` • ${request.registration_number}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {request.contact_phone || request.profiles?.phone_number || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUpdateModal(request)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {request.status !== 'closed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCloseRequest(request.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
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
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Full information about this lost ID request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Reported By</label>
                  <p>{selectedRequest.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.profiles?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">ID Information</label>
                <div className="p-3 bg-gray-50 rounded-lg mt-1">
                  <p><strong>Name:</strong> {selectedRequest.full_name}</p>
                  <p><strong>Type:</strong> {idTypeLabels[selectedRequest.id_type] || selectedRequest.id_type}</p>
                  <p><strong>Reg #:</strong> {selectedRequest.registration_number || 'N/A'}</p>
                </div>
              </div>

              {selectedRequest.contact_phone && (
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <p>{selectedRequest.contact_phone}</p>
                </div>
              )}

              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p>{selectedRequest.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p>{new Date(selectedRequest.updated_at || selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Request</CardTitle>
              <CardDescription>
                Update the status of this lost ID request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="submitted">Submitted</option>
                    <option value="matched">Matched</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedRequest(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Request'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
