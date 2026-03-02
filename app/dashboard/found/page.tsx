'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Loader2, 
  FileSearch,
  Clock,
  X,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { SubmitFoundForm } from '@/components/forms/SubmitFoundForm';

interface Submission {
  id: string;
  id_type: string;
  full_name: string;
  registration_number?: string;
  location_found?: string;
  image_url: string;
  status: string;
  approved: boolean;
  created_at: string;
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

const statusColors: Record<string, any> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export default function DashboardFoundPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/found-id-reports');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load your submissions');
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submit Found ID</h1>
          <p className="text-muted-foreground">Report IDs you've found to help their owners</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel Submission
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Submit Found ID
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <div className="max-w-2xl mx-auto">
          <SubmitFoundForm />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>History of IDs you've reported</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't reported any found IDs yet.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Report a Found ID
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-xl gap-4 hover:border-primary/30 transition-colors bg-white shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-28 rounded-lg overflow-hidden border bg-zinc-100 flex-shrink-0">
                      <img 
                        src={submission.image_url} 
                        alt={submission.full_name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900">{submission.full_name}</h3>
                      </div>
                      <p className="text-sm font-medium text-primary">
                        {idTypeLabels[submission.id_type] || submission.id_type}
                        {submission.registration_number && ` • ${submission.registration_number}`}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {submission.location_found && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {submission.location_found}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={statusColors[submission.status] || 'secondary'} className="capitalize">
                      {submission.status}
                    </Badge>
                    {submission.approved && (
                      <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified & Listed
                      </div>
                    )}
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
