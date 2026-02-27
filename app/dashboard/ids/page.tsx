'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Loader2, 
  MapPin, 
  Calendar,
  User,
  FileSearch,
  AlertCircle,
  HandHeart
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
  created_at: string;
}

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  drivers_license: "Driver's License",
  passport: 'Passport',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  verified: 'bg-green-500',
  claimed: 'bg-blue-500',
  returned: 'bg-purple-500',
  archived: 'bg-gray-500',
};

export default function IDsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [ids, setIds] = useState<FoundId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedId, setSelectedId] = useState<FoundId | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchIds();
    }
  }, [user, filterType]);

  const fetchIds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('id_type', filterType);
      }
      params.append('status', 'verified');
      params.append('limit', '50');

      const response = await authFetch(`/api/ids?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setIds(data.data || []);
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
    // Filter locally for now
    if (!searchQuery.trim()) {
      fetchIds();
      return;
    }
    const filtered = ids.filter(
      (id) =>
        id.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setIds(filtered);
  };

  const handleClaim = async () => {
    if (!selectedId) return;
    
    setIsSubmittingClaim(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const response = await authFetch('/api/claims', {
        method: 'POST',
        body: JSON.stringify({
          item_id: selectedId.id,
          proof_description: claimDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimSuccess('Claim submitted successfully! We will review your request.');
        setTimeout(() => {
          setShowClaimModal(false);
          setSelectedId(null);
          setClaimDescription('');
          setClaimSuccess(null);
        }, 2000);
      } else {
        setClaimError(data.message || 'Failed to submit claim');
      }
    } catch (err: any) {
      setClaimError(err.message || 'An error occurred');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const openClaimModal = (id: FoundId) => {
    setSelectedId(id);
    setShowClaimModal(true);
    setClaimDescription('');
    setClaimSuccess(null);
    setClaimError(null);
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
          <h1 className="text-2xl font-bold">Found IDs</h1>
          <p className="text-muted-foreground">Browse and claim found identification cards</p>
        </div>
      </div>

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
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* IDs Grid */}
      {!isLoading && !error && (
        <>
          {ids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No IDs Found</h3>
                <p className="text-muted-foreground">
                  No verified found IDs match your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ids.map((id) => (
                <Card key={id.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    {id.image_url ? (
                      <img
                        src={id.image_url}
                        alt={id.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
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
                      {id.created_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Found {new Date(id.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full mt-4"
                        onClick={() => openClaimModal(id)}
                      >
                        <HandHeart className="h-4 w-4 mr-2" />
                        Claim This ID
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Claim Modal */}
      {showClaimModal && selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Claim ID</CardTitle>
              <CardDescription>
                Claim the ID found for {selectedId.full_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {claimSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                  {claimSuccess}
                </div>
              )}
              {claimError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {claimError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Details</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p><strong>Name:</strong> {selectedId.full_name}</p>
                  <p><strong>Type:</strong> {idTypeLabels[selectedId.id_type] || selectedId.id_type}</p>
                  <p><strong>Reg #:</strong> {selectedId.registration_number}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Proof of Ownership
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Describe how you can prove this ID belongs to you (e.g., your name is John Doe, you lost it on campus, etc.)"
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  disabled={isSubmittingClaim}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedId(null);
                  }}
                  disabled={isSubmittingClaim}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleClaim}
                  disabled={isSubmittingClaim || claimDescription.length < 10}
                >
                  {isSubmittingClaim ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim'
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
