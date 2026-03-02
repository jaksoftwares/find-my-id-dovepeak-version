'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  FileSearch,
  Clock,
  X,
  Calendar,
  CreditCard,
  MapPin,
  Upload
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

interface LostRequest {
  id: string;
  id_type: string;
  full_name: string;
  registration_number?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  date_lost?: string;
  last_seen_location?: string;
  status: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  driving_license: "Driver's License",
  passport: 'Passport',
  atm_card: 'ATM Card',
  nhif: 'NHIF',
  other: 'Other',
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  submitted: { label: 'Submitted', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'warning' },
  match_found: { label: 'Match Found', variant: 'success' },
  closed: { label: 'Closed', variant: 'outline' },
};

export default function RequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<LostRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    id_type: 'student_id',
    full_name: '',
    registration_number: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    date_lost: '',
    last_seen_location: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user && formData.full_name === '') {
      setFormData(prev => ({ 
        ...prev, 
        full_name: user.full_name || '',
        contact_email: user.email || '',
        contact_phone: user.phone_number || '',
      }));
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch('/api/requests');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await authFetch('/api/requests', {
        method: 'POST',
        body: formDataToSend, // authFetch handles headers if not JSON
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Lost ID report submitted successfully!');
        setFormData({
          id_type: 'student_id',
          full_name: user?.full_name || '',
          registration_number: '',
          description: '',
          contact_phone: user?.phone_number || '',
          contact_email: user?.email || '',
          date_lost: '',
          last_seen_location: '',
        });
        setSelectedFile(null);
        setShowForm(false);
        fetchRequests();
      } else {
        setError(data.message || 'Failed to submit request');
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
          <h1 className="text-2xl font-bold">Lost ID Reports</h1>
          <p className="text-muted-foreground">Submit and track your lost ID reports</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel Report
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Report Lost ID
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* New Request Form */}
      {showForm && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>Report a Lost ID</CardTitle>
            <CardDescription>
              We'll notify you as soon as a match for your {idTypeLabels[formData.id_type]} is found.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="id_type">Document Type</Label>
                  <select
                    id="id_type"
                    value={formData.id_type}
                    onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                    className="w-full h-10 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  >
                    {Object.entries(idTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name (as on ID)</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">ID / Serial / registration Number</Label>
                  <Input
                    id="registration_number"
                    type="text"
                    placeholder="Enter unique ID number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="Enter contact number"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_lost">Approximate Date Lost</Label>
                  <Input
                    id="date_lost"
                    type="date"
                    value={formData.date_lost}
                    onChange={(e) => setFormData({ ...formData, date_lost: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_seen_location">Location Where it was Lost</Label>
                  <Input
                    id="last_seen_location"
                    type="text"
                    placeholder="e.g. Near Mess, Library, Gate A"
                    value={formData.last_seen_location}
                    onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details / Marks</Label>
                <Textarea
                  id="description"
                  placeholder="Describe any unique features, stickers, or holders..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-2 border-t mt-4">
                <Label htmlFor="image" className="block text-sm font-semibold mb-2">Reference Image (Optional)</Label>
                <div className="flex items-center gap-4">
                   <div className="relative group flex-1">
                     <Input 
                       id="image" 
                       type="file" 
                       accept="image/*" 
                       onChange={handleFileChange}
                       className="cursor-pointer file:hidden bg-white border-zinc-200 h-10 flex items-center pt-2"
                     />
                     <div className="absolute right-3 top-2.5 pointer-events-none">
                       <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                   </div>
                   {selectedFile && (
                     <div className="bg-green-100 p-2 rounded-full">
                       <CheckCircle2 className="h-5 w-5 text-green-600" />
                     </div>
                   )}
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  * If you have an old photo or scan of the document, upload it to help us find it faster.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                 <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                   {isSubmitting ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Submitting...
                     </>
                   ) : (
                     <>
                       <FileSearch className="mr-2 h-4 w-4" />
                       Submit Report
                     </>
                   )}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>View status of your submitted reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any lost ID reports yet.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Report a Lost ID
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-xl gap-4 hover:border-primary/30 transition-colors bg-white shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 leading-none mb-1">{request.full_name}</h3>
                        <p className="text-sm font-medium text-primary">
                          {idTypeLabels[request.id_type] || request.id_type}
                          {request.registration_number && ` • ${request.registration_number}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-2">
                      {request.last_seen_location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{request.last_seen_location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0">
                    <Badge 
                      variant={(statusLabels[request.status]?.variant as any) || 'secondary'}
                      className="capitalize px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {statusLabels[request.status]?.label || request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
