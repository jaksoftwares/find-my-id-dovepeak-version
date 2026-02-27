'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertCircle, 
  HandHeart,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileSearch
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

const statusConfig: Record<string, { label: string; variant: string; icon: any; color: string }> = {
  pending: { 
    label: 'Pending Review', 
    variant: 'warning', 
    icon: Clock,
    color: 'text-yellow-600',
  },
  approved: { 
    label: 'Approved', 
    variant: 'success', 
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  rejected: { 
    label: 'Rejected', 
    variant: 'destructive', 
    icon: XCircle,
    color: 'text-red-600',
  },
  completed: { 
    label: 'Completed', 
    variant: 'default', 
    icon: CheckCircle2,
    color: 'text-green-600',
  },
};

export default function ClaimsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const fetchClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch('/api/claims');
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

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status];
    if (config) {
      return <config.icon className={`h-5 w-5 ${config.color}`} />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
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
          <h1 className="text-2xl font-bold">My Claims</h1>
          <p className="text-muted-foreground">Track your submitted claims for found IDs</p>
        </div>
        <Button onClick={() => router.push('/dashboard/ids')}>
          <FileSearch className="h-4 w-4 mr-2" />
          Browse Found IDs
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

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle>Claim History</CardTitle>
          <CardDescription>View status of all your submitted claims</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12">
              <HandHeart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Claims Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any claims for found IDs yet.
              </p>
              <Button onClick={() => router.push('/dashboard/ids')}>
                <FileSearch className="h-4 w-4 mr-2" />
                Browse Found IDs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedClaim(claim)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <img
                          src={claim.ids_found?.image_url || '/images/id-placeholder.png'}
                          alt={claim.ids_found?.full_name || 'ID'}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/id-placeholder.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {claim.ids_found?.full_name || 'Unknown'}
                          </h3>
                          <Badge variant={statusConfig[claim.status]?.variant as any || 'secondary'}>
                            {statusConfig[claim.status]?.label || claim.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {idTypeLabels[claim.ids_found?.id_type || ''] || claim.ids_found?.id_type}
                          {claim.ids_found?.registration_number && ` • ${claim.ids_found.registration_number}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Claim Details</CardTitle>
              <CardDescription>
                Status: {statusConfig[selectedClaim.status]?.label || selectedClaim.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Information</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p><strong>Name:</strong> {selectedClaim.ids_found?.full_name || 'Unknown'}</p>
                  <p><strong>Type:</strong> {idTypeLabels[selectedClaim.ids_found?.id_type || ''] || selectedClaim.ids_found?.id_type}</p>
                  <p><strong>Reg #:</strong> {selectedClaim.ids_found?.registration_number || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Proof</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{selectedClaim.proof_description}</p>
                </div>
              </div>

              {selectedClaim.admin_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p>{selectedClaim.admin_notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {new Date(selectedClaim.created_at).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last Updated: {new Date(selectedClaim.updated_at).toLocaleString()}</span>
              </div>

              <Button
                className="w-full"
                onClick={() => setSelectedClaim(null)}
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
