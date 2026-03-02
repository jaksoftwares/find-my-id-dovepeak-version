'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  ShieldCheck,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface Submission {
  id: string;
  id_type: string;
  full_name: string;
  registration_number?: string;
  location_found?: string;
  image_url: string;
  contact_info: string;
  status: string;
  approved: boolean;
  created_at: string;
  finder_id?: string;
}

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  passport: 'Passport',
  driving_license: 'Driving License',
  atm_card: 'ATM Card',
  nhif: 'NHIF',
  other: 'Other',
};

export default function AdminFoundReportsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected submission states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [holdingLocation, setHoldingLocation] = useState('Central Office - Admin Block');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/api/found-id-reports');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch pending submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);

    try {
      const response = await authFetch(`/api/found-id-reports/${selectedSubmission.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          holding_location: holdingLocation,
          notes: 'Approved via admin dashboard',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmissions(submissions.map(s => 
          s.id === selectedSubmission.id ? { ...s, status: 'approved', approved: true } : s
        ));
        setSelectedSubmission(null);
        alert('Submission approved and listed successfully!');
      } else {
        alert(data.message || 'Approval failed');
      }
    } catch (err) {
      alert('An error occurred during approval');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Found ID Reports</h1>
          <p className="text-muted-foreground italic font-medium">Verify IDs reported by users (Public Submissions)</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or serial number..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-semibold">No Pending Submissions</h3>
                <p className="text-muted-foreground">Everything is verified and sorted!</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card 
                key={submission.id} 
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${selectedSubmission?.id === submission.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="h-20 w-32 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 border">
                    <img src={submission.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-zinc-900">{submission.full_name}</h3>
                      <Badge variant={submission.status === 'approved' ? 'success' : 'warning'}>
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-primary mb-1 capitalize">
                      {idTypeLabels[submission.id_type] || submission.id_type} {submission.registration_number && `• ${submission.registration_number}`}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {submission.location_found}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          {selectedSubmission ? (
            <Card className="sticky top-24 shadow-xl border-primary/20">
              <CardHeader className="bg-zinc-50 border-b">
                <div className="flex flex-col gap-2">
                   <CardTitle className="text-lg">Reviewing Submission</CardTitle>
                   <CardDescription className="text-xs">Verify details against the image provided</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="rounded-xl overflow-hidden border shadow-sm aspect-video bg-zinc-900 flex items-center justify-center">
                   <img 
                    src={selectedSubmission.image_url} 
                    alt="ID Proof" 
                    className="w-full h-full object-contain"
                   />
                </div>

                <div className="space-y-4">
                   <div className="p-4 bg-muted/30 rounded-lg space-y-2 border border-zinc-200">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Submitter Info</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-600" />
                        <span className="text-sm font-semibold">{selectedSubmission.contact_info}</span>
                      </div>
                   </div>

                   {selectedSubmission.status === 'pending' && (
                     <>
                        <div className="space-y-2">
                          <Label htmlFor="holding_location">Holding Location</Label>
                          <Input 
                            id="holding_location"
                            value={holdingLocation}
                            onChange={(e) => setHoldingLocation(e.target.value)}
                            placeholder="e.g. Finance Office, Desk 4"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1 italic">Where can the owner pick this ID from?</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                            onClick={handleApprove}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Approve & List
                          </Button>
                        </div>
                     </>
                   )}

                   {selectedSubmission.status === 'approved' && (
                     <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 flex items-center gap-2 font-bold">
                        <CheckCircle className="h-5 w-5" />
                        Verified and published!
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-2xl opacity-50 bg-zinc-50">
              <Eye className="h-10 w-10 mb-3 text-zinc-400" />
              <p className="text-sm font-medium">Select a submission from the list to review the details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
