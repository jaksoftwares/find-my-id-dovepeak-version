
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { foundIdSchema } from "@/lib/validations/public"; // Need to update validation to handle File or string
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Upload } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";

// Manually defining schema here to handle File input nuances in browser
const foundIdSchema = z.object({
  full_name: z.string().min(2, "Name on ID is required"),
  id_type: z.enum(["national_id", "student_id", "atm_card", "nhif", "driving_license", "passport", "other"]),
  registration_number: z.string().min(1, "ID / Serial / Registration number is required"),
  location_found: z.string().min(3, "Location is required"),
  date_found: z.string().optional(),
  contact_info: z.string().min(10, "Your contact information is required"),
});

type FormData = z.infer<typeof foundIdSchema>;

export function SubmitFoundForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(foundIdSchema),
    defaultValues: {
      id_type: 'student_id',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("id_type", data.id_type);
    formData.append("registration_number", data.registration_number);
    formData.append("location_found", data.location_found);
    formData.append("contact_info", data.contact_info);
    
    if (!selectedFile) {
      setError("Please upload an image of the ID card.");
      setIsSubmitting(false);
      return;
    }

    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/found-id-reports", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit ID. Please try again.");
      }

      setIsSuccess(true);
      reset();
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-green-100 shadow-xl shadow-green-500/5">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-3">Thank You!</h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          The details have been submitted. We'll verify the card and post it on the platform so the owner can find it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => setIsSuccess(false)} className="rounded-full px-8">
            Submit Another ID
          </Button>
          <Button variant="outline" asChild className="rounded-full px-8">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-zinc-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-zinc-900">Found Card Details</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-zinc-700 font-semibold">Name on ID</Label>
          <Input id="full_name" placeholder="Full name as written on the ID" className="h-11" {...register("full_name")} />
          {errors.full_name && <p className="text-red-500 text-xs font-medium">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="id_type" className="text-zinc-700 font-semibold">ID Type</Label>
            <select 
              id="id_type" 
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              {...register("id_type")}
            >
              <option value="national_id">National ID</option>
              <option value="student_id">Student ID</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
              <option value="atm_card">ATM Card</option>
              <option value="nhif">NHIF</option>
              <option value="other">Other</option>
            </select>
            {errors.id_type && <p className="text-red-500 text-xs font-medium">{errors.id_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_number" className="text-zinc-700 font-semibold">ID / Serial / Reg Number</Label>
            <Input id="registration_number" placeholder="Very important for matching" className="h-11 font-mono" {...register("registration_number")} />
            {errors.registration_number && <p className="text-red-500 text-xs font-medium">{errors.registration_number.message}</p>}
          </div>
        </div>

        <div className="space-y-2 pt-2">
           <Label htmlFor="location_found" className="text-zinc-700 font-semibold">Location Found</Label>
           <Input id="location_found" placeholder="e.g. Near Mess, Jomo Kenyatta Library, Gate A" className="h-11" {...register("location_found")} />
           {errors.location_found && <p className="text-red-500 text-xs font-medium">{errors.location_found.message}</p>}
        </div>
      </div>

      <div className="bg-zinc-50 p-6 rounded-2xl border border-dashed border-zinc-200">
         <Label htmlFor="image" className="block mb-4 font-bold text-zinc-900">Upload Image of ID <span className="text-red-500">* (Required)</span></Label>
         <div className="flex items-center gap-4">
            <div className="relative group flex-1">
              <Input 
                id="image" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="cursor-pointer file:hidden bg-white border-zinc-200 h-11 flex items-center pt-2"
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
            {selectedFile && (
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
         </div>
         <p className="text-xs text-muted-foreground mt-3 italic">
           * We will verify the ID before listing. Sensitive digits may be obscured for privacy.
         </p>
      </div>

      <div className="border-t border-zinc-100 pt-6">
         <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
           <div className="w-1.5 h-6 bg-secondary rounded-full" />
           Your Contact Information (Private)
         </h3>
         <div className="space-y-2">
            <Label htmlFor="contact_info" className="text-zinc-700 font-semibold">Phone Number or Email</Label>
            <Input id="contact_info" placeholder="How can the admin reach you if needed?" className="h-11" {...register("contact_info")} />
            {errors.contact_info && <p className="text-red-500 text-xs font-medium">{errors.contact_info.message}</p>}
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              This will only be visible to administrators for verification purposes.
            </p>
         </div>
      </div>

      {error && <ErrorDisplay message={error} variant="inline" className="mb-0" />}

      <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting ID...
          </>
        ) : (
          <>
             <Upload className="mr-2 h-5 w-5" /> Submit Found ID
          </>
        )}
      </Button>
    </form>
  );
}
