'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  FileSearch,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface FoundId {
  id: string;
  id_type: string;
  full_name: string;
  registration_number: string;
  sighting_location?: string;
  holding_location?: string;
  description?: string;
  image_url?: string;
  status: string;
  visibility: boolean;
  created_at: string;
  updated_at?: string;
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
  verified: 'bg-green-100 text-green-700',
  claimed: 'bg-blue-100 text-blue-700',
  returned: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-700',
};

export default function AdminIDsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [ids, setIds] = useState<FoundId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<FoundId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    status: '',
    holding_location: '',
    description: '',
    visibility: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchIDs();
    }
  }, [user, page, filterStatus, filterType]);

  const fetchIDs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterType !== 'all') {
        params.append('id_type', filterType);
      }

      const response = await authFetch(`/api/admin/ids?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setIds(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch IDs');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIDs();
  };

  const openViewModal = (id: FoundId) => {
    setSelectedId(id);
    setShowViewModal(true);
  };

  const openEditModal = (id: FoundId) => {
    setSelectedId(id);
    setFormData({
      status: id.status,
      holding_location: id.holding_location || '',
      description: id.description || '',
      visibility: id.visibility,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (id: FoundId) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleUpdateID = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/ids/${selectedId.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setSelectedId(null);
        fetchIDs();
      } else {
        setError(data.message || 'Failed to update ID');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyID = async (id: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/ids/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'verified' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchIDs();
      } else {
        setError(data.message || 'Failed to verify ID');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteID = async () => {
    if (!selectedId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch(`/api/admin/ids/${selectedId.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setShowDeleteModal(false);
        setSelectedId(null);
        fetchIDs();
      } else {
        setError(data.message || 'Failed to delete ID');
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
          <h1 className="text-2xl font-bold">IDs Management</h1>
          <p className="text-muted-foreground">Manage found identification cards</p>
        </div>
        <Button onClick={() => router.push('/admin/ids/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New ID
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
                <option value="archived">Archived</option>
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
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* IDs Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Found IDs</CardTitle>
          <CardDescription>Manage and verify found identification cards</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ids.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No IDs Found</h3>
              <p className="text-muted-foreground">
                No found IDs match your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ids.map((id) => (
                  <Card key={id.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-gray-100">
                      <img
                      src={id.image_url || '/images/id-placeholder.png'}
                      alt={id.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/id-placeholder.png';
                      }}
                    />
                      <Badge
                        className={`absolute top-2 right-2 ${statusColors[id.status]}`}
                      >
                        {id.status}
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{id.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {idTypeLabels[id.id_type] || id.id_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{id.registration_number}</span>
                        </div>
                        {id.holding_location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{id.holding_location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(id.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewModal(id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {id.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyID(id.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {showViewModal && selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>ID Details</CardTitle>
              <CardDescription>
                Full information about this found ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedId.image_url || '/images/id-placeholder.png'}
                  alt={selectedId.full_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/id-placeholder.png';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p>{selectedId.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID Type</label>
                  <p>{idTypeLabels[selectedId.id_type] || selectedId.id_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Registration Number</label>
                  <p className="font-mono">{selectedId.registration_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedId.status]}>
                    {selectedId.status}
                  </Badge>
                </div>
                {selectedId.sighting_location && (
                  <div>
                    <label className="text-sm font-medium">Sighting Location</label>
                    <p>{selectedId.sighting_location}</p>
                  </div>
                )}
                {selectedId.holding_location && (
                  <div>
                    <label className="text-sm font-medium">Holding Location</label>
                    <p>{selectedId.holding_location}</p>
                  </div>
                )}
                {selectedId.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <p>{selectedId.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <p>{new Date(selectedId.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <p>{selectedId.visibility ? 'Visible' : 'Hidden'}</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedId(null);
                }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit ID</CardTitle>
              <CardDescription>Update ID information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateID} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="claimed">Claimed</option>
                    <option value="returned">Returned</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Holding Location</label>
                  <Input
                    type="text"
                    placeholder="Enter holding location"
                    value={formData.holding_location}
                    onChange={(e) => setFormData({ ...formData, holding_location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="visibility"
                    checked={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="visibility" className="text-sm font-medium">
                    Visible to public
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedId(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete ID</CardTitle>
              <CardDescription>
                Are you sure you want to delete this ID? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p><strong>Name:</strong> {selectedId.full_name}</p>
                <p><strong>Type:</strong> {idTypeLabels[selectedId.id_type] || selectedId.id_type}</p>
                <p><strong>Reg #:</strong> {selectedId.registration_number}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedId(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteID}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete ID'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
