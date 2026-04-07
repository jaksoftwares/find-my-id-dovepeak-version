'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
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
  User,
  CheckSquare,
  Square,
  Trash,
  Archive,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  PackageCheck,
  HandHeart
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';
import { RestrictionModal } from '@/components/admin/RestrictionModal';
import { getIDPlaceholder } from '@/lib/utils';

interface FoundId {
  id: string;
  id_type: string;
  full_name: string;
  registration_number: string;
  serial_number?: string;
  faculty?: string;
  year_of_study?: string;
  location_found?: string;
  holding_location?: string;
  description?: string;
  image_url?: string;
  status: string;
  visibility: boolean;
  date_found?: string;
  created_at: string;
  updated_at?: string;
}

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  driving_license: 'Driving License',
  passport: 'Passport',
  atm_card: 'ATM Card',
  nhif: 'NHIF',
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
  const { user, isLoading: authLoading, isAdmin, isSuperAdmin } = useAuth();
  const [ids, setIds] = useState<FoundId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    claimed: 0,
    returned: 0,
    archived: 0
  });

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [selectedId, setSelectedId] = useState<FoundId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    status: '',
    full_name: '',
    id_type: '',
    registration_number: '',
    serial_number: '',
    faculty: '',
    year_of_study: '',
    location_found: '',
    holding_location: '',
    description: '',
    date_found: '',
    visibility: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchIDs();
      fetchStats();
    }
  }, [user, isAdmin, page, filterStatus, filterType]);

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/admin/ids/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

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
      if (searchQuery) {
        params.append('search', searchQuery);
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

  const toggleSelectAll = () => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids.map(id => id.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string, updateData?: any) => {
    if (selectedIds.length === 0) return;
    
    // Check permissions for bulk delete
    if (action === 'delete' && user?.role !== 'super_admin') {
      setShowRestrictionModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const response = await authFetch('/api/admin/ids/bulk', {
        method,
        body: JSON.stringify({
          ids: selectedIds,
          updateData: updateData || (action === 'verify' ? { status: 'verified' } : action === 'archive' ? { status: 'archived' } : {})
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedIds([]);
        fetchIDs();
        fetchStats();
      } else {
        setError(data.message || 'Bulk action failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk operation');
    } finally {
      setIsSubmitting(false);
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
      full_name: id.full_name || '',
      id_type: id.id_type || '',
      registration_number: id.registration_number || '',
      serial_number: id.serial_number || '',
      faculty: id.faculty || '',
      year_of_study: id.year_of_study || '',
      location_found: id.location_found || '',
      holding_location: id.holding_location || '',
      description: id.description || '',
      date_found: id.date_found || '',
      visibility: id.visibility,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (id: FoundId) => {
    if (user?.role !== 'super_admin') {
      setShowRestrictionModal(true);
      return;
    }
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
        fetchStats();
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
        fetchStats();
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
        fetchStats();
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
      <RestrictionModal 
        isOpen={showRestrictionModal} 
        onClose={() => setShowRestrictionModal(false)} 
        action="deleting IDs"
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">IDs Management</h1>
          <p className="text-muted-foreground">Manage found identification cards</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchIDs(); fetchStats(); }}>
                {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => router.push('/admin/ids/new')}>
            Add New ID
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-zinc-900', bg: 'bg-primary/10', key: 'all' },
          { label: 'Pending', value: stats.pending, color: 'text-zinc-900', bg: 'bg-yellow-50', key: 'pending' },
          { label: 'Verified', value: stats.verified, color: 'text-zinc-900', bg: 'bg-green-50', key: 'verified' },
          { label: 'Claimed', value: stats.claimed, color: 'text-zinc-900', bg: 'bg-blue-50', key: 'claimed' },
          { label: 'Returned', value: stats.returned, color: 'text-zinc-900', bg: 'bg-purple-50', key: 'returned' },
          { label: 'Archived', value: stats.archived, color: 'text-zinc-900', bg: 'bg-gray-100', key: 'archived' },
        ].map((s) => (
          <Card 
            key={s.label} 
            className={`border-0 shadow-sm cursor-pointer hover:shadow-md transition-all ${filterStatus === s.key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => { setFilterStatus(s.key); setPage(1); }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search name, reg number or serial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-all rounded-xl"
                />
                </div>
            </form>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                    value={filterType}
                    onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                    }}
                    className="pl-9 pr-8 h-11 border-zinc-200 rounded-xl bg-zinc-50 text-sm focus:bg-white transition-all appearance-none outline-none min-w-[150px]"
                >
                    <option value="all">All Document Types</option>
                    {Object.entries(idTypeLabels).map(([val, lab]) => (
                        <option key={val} value={val}>{lab}</option>
                    ))}
                </select>
              </div>
              
              <Button onClick={() => toggleSelectAll()} variant="outline" className="h-11 rounded-xl px-4 gap-2">
                {selectedIds.length === ids.length && ids.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Select All</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {selectedIds.length}
                </div>
                <div>
                   <p className="text-sm font-bold leading-tight">Items selected</p>
                   <p className="text-[10px] text-gray-400">Perform bulk actions</p>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 rounded-lg hover:bg-white/10 text-white"
                  onClick={() => handleBulkAction('verify')}
                  disabled={isSubmitting}
                >
                   <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                   Verify
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 rounded-lg hover:bg-white/10 text-white"
                  onClick={() => handleBulkAction('archive')}
                  disabled={isSubmitting}
                >
                   <Archive className="h-4 w-4 mr-2 text-yellow-400" />
                   Archive
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 rounded-lg hover:bg-red-500/20 text-red-400"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isSubmitting}
                >
                   <Trash className="h-4 w-4 mr-2" />
                   Delete
                </Button>
                <div className="w-px h-6 bg-gray-800 mx-2" />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 rounded-lg hover:bg-white/10 text-gray-400"
                  onClick={() => setSelectedIds([])}
                >
                   Cancel
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* IDs Grid */}
      <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-zinc-50/50 border-b">
          <div className="flex items-center justify-between">
            <div>
                 <CardTitle className="text-xl">Inventory</CardTitle>
                 <CardDescription>Manage and track all recovered identification cards</CardDescription>
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-zinc-500 font-medium">Loading items...</p>
            </div>
          ) : ids.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50/30 rounded-2xl border border-dashed border-zinc-200">
              <FileSearch className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-xl font-bold mb-2">No items found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No found IDs match your current search or filter criteria. Try adjusting your filters.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full"
                onClick={() => {setFilterStatus('all'); setFilterType('all'); setSearchQuery('');}}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ids.map((id) => (
                  <Card key={id.id} className={`group overflow-hidden rounded-2xl transition-all duration-300 border-zinc-200 hover:shadow-xl relative ${selectedIds.includes(id.id) ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white'}`}>
                    {/* Selection Overlay */}
                    <div 
                      className={`absolute top-3 left-3 z-10 h-6 w-6 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedIds.includes(id.id) ? 'bg-primary border-primary shadow-lg' : 'bg-white/80 border-white/20 opacity-0 group-hover:opacity-100'}`}
                      onClick={(e) => { e.stopPropagation(); toggleSelectId(id.id); }}
                    >
                      {selectedIds.includes(id.id) && <CheckSquare className="h-4 w-4 text-white" />}
                    </div>

                    <div className="aspect-[1.85/1] relative bg-zinc-100 overflow-hidden">
                      <img
                        src={id.image_url || getIDPlaceholder(id.id_type)}
                        alt={id.full_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getIDPlaceholder(id.id_type);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`shadow-sm font-bold uppercase text-[10px] ${statusColors[id.status]}`}>
                            {id.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-[#0B3D91] truncate leading-tight">{id.full_name}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                {idTypeLabels[id.id_type] || id.id_type}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pb-2">
                           <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Registration #</p>
                                <p className="text-xs font-mono font-bold truncate">{id.registration_number}</p>
                           </div>
                           <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Date Found</p>
                                <p className="text-xs font-bold">{new Date(id.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>

                        {id.holding_location && (
                           <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                <MapPin className="h-3 w-3 text-primary" />
                                <span className="text-[11px] font-semibold text-zinc-600 truncate">{id.holding_location}</span>
                           </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 rounded-lg h-9 font-bold text-xs"
                            onClick={() => openViewModal(id)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg"
                            onClick={() => openEditModal(id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {id.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-lg text-green-600 border-green-100 hover:bg-green-50"
                              onClick={() => handleVerifyID(id.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => openDeleteModal(id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12 py-6 border-t border-zinc-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-10 px-6 font-bold"
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                     <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                        {page}
                     </div>
                     <span className="text-zinc-300 font-bold mx-1">of</span>
                     <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-sm">
                        {totalPages}
                     </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-10 px-6 font-bold"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
                <CardHeader className="bg-zinc-50/50 border-b p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-extrabold text-[#0B3D91]">ID Details</CardTitle>
                        <CardDescription className="font-medium">System Record Review</CardDescription>
                    </div>
                    <Button variant="ghost" className="rounded-full" onClick={() => { setShowViewModal(false); setSelectedId(null); }}>
                        <XCircle className="h-6 w-6" />
                    </Button>
                </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                <div className="aspect-[1.85/1] relative bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200">
                    <img
                    src={selectedId.image_url || getIDPlaceholder(selectedId.id_type)}
                    alt={selectedId.full_name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = getIDPlaceholder(selectedId.id_type);
                    }}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name (on ID)</label>
                        <p className="text-lg font-extrabold text-[#0B3D91] leading-tight">{selectedId.full_name}</p>
                    </div>
                    <div className="space-y-1 text-right md:text-left">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Document Type</label>
                        <p className="text-lg font-extrabold text-zinc-700">{idTypeLabels[selectedId.id_type] || selectedId.id_type}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reg / ID Number</label>
                        <p className="text-lg font-mono font-bold text-zinc-700">{selectedId.registration_number}</p>
                    </div>
                    <div className="space-y-1 text-right md:text-left">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current Status</label>
                        <div>
                            <Badge className={`mt-1 h-7 px-4 shadow-sm font-bold uppercase text-[10px] ${statusColors[selectedId.status]}`}>
                                {selectedId.status}
                            </Badge>
                        </div>
                    </div>
                    
                    {selectedId.location_found && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Location Found</label>
                        <p className="font-bold text-zinc-700">{selectedId.location_found}</p>
                    </div>
                    )}
                    {selectedId.holding_location && (
                    <div className="space-y-1 text-right md:text-left">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current Storage</label>
                        <p className="font-bold text-zinc-700">{selectedId.holding_location}</p>
                    </div>
                    )}
                    {selectedId.description && (
                    <div className="col-span-full space-y-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Internal Notes</label>
                        <p className="text-zinc-600 leading-relaxed font-medium">{selectedId.description}</p>
                    </div>
                    )}
                    
                    <div className="col-span-full pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                        <span>Recorded on: {new Date(selectedId.created_at).toLocaleString()}</span>
                        <span>Visibility: {selectedId.visibility ? 'Publicly Listed' : 'Internal Only'}</span>
                    </div>
                </div>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Edit and Delete modals remain similar but with updated styling if desired */}
      {/* ... keeping the rest of the file for modals ... */}

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID Type</label>
                    <select
                      value={formData.id_type}
                      onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      {Object.entries(idTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Number</label>
                    <Input
                      type="text"
                      placeholder="Enter reg number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serial Number</label>
                    <Input
                      type="text"
                      placeholder="Serial number"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    />
                  </div>
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
                    <label className="text-sm font-medium">Faculty</label>
                    <Input
                      type="text"
                      placeholder="Faculty (optional)"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year of Study</label>
                    <select
                      value={formData.year_of_study}
                      onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">N/A</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5</option>
                      <option value="6">Year 6</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location Found</label>
                    <Input
                      type="text"
                      placeholder="Where it was found"
                      value={formData.location_found}
                      onChange={(e) => setFormData({ ...formData, location_found: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Found</label>
                    <Input
                      type="date"
                      value={formData.date_found}
                      onChange={(e) => setFormData({ ...formData, date_found: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Holding Location</label>
                  <Input
                    type="text"
                    placeholder="Where it is now"
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
