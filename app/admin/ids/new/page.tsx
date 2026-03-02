'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, ChevronLeft, CheckCircle } from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';

const idTypeLabels: Record<string, string> = {
  national_id: 'National ID',
  student_id: 'Student ID',
  drivers_license: "Driver's License",
  passport: 'Passport',
  atm_card: 'ATM Card',
  nhif: 'NHIF',
  other: 'Other',
};

export default function AddNewIDPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    id_type: 'student_id',
    full_name: '',
    registration_number: '',
    location_found: '',
    holding_location: 'Central Admin Office',
    description: '',
    status: 'verified',
    visibility: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload an image of the ID');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      data.append('image', selectedFile);

      const response = await authFetch('/api/admin/ids', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/ids');
      } else {
        setError(result.message || 'Failed to create ID record');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to ID Management
      </Button>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Add New Identification Card</CardTitle>
          <CardDescription>
            Create a new verified ID entry in the official system database.
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
                  className="w-full h-10 px-3 py-2 border rounded-md"
                  required
                >
                  {Object.entries(idTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name (on ID)</Label>
                <Input
                  id="full_name"
                  placeholder="Enter owner's full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">ID / Reg Number</Label>
                <Input
                  id="registration_number"
                  placeholder="ID or Registration number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_found">Found At</Label>
                <Input
                  id="location_found"
                  placeholder="e.g. Science Complex"
                  value={formData.location_found}
                  onChange={(e) => setFormData({ ...formData, location_found: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holding_location">Holding Location</Label>
                <Input
                  id="holding_location"
                  placeholder="Where is the ID being kept?"
                  value={formData.holding_location}
                  onChange={(e) => setFormData({ ...formData, holding_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">System Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 py-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Internal Description / Notes</Label>
              <Textarea
                id="description"
                placeholder="Any additional information..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="bg-zinc-50 p-6 rounded-2xl border border-dashed border-zinc-200">
               <Label htmlFor="image" className="block mb-4 font-bold text-zinc-900 flex items-center gap-2">
                 <Upload className="h-4 w-4 text-primary" />
                 Upload Official Image Proof (Required)
               </Label>
               <div className="flex items-center gap-4">
                  <div className="relative group flex-1">
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="cursor-pointer file:hidden bg-white border-zinc-200 h-11 flex items-center pt-2"
                      required
                    />
                    <div className="absolute right-3 top-3 pointer-events-none">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="bg-green-100 p-2 rounded-full shadow-sm">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2 pb-4">
              <input 
                type="checkbox" 
                id="visibility" 
                checked={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.checked })}
                className="rounded border-zinc-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="visibility" className="text-sm cursor-pointer">Make this ID visible to public browsing</Label>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

            <Button type="submit" className="w-full h-12 font-bold text-lg rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating ID Record...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Publish Verified ID
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
