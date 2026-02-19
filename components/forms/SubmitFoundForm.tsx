
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
  nameOnId: z.string().min(2, "Name on ID is required"),
  idType: z.enum(["NATIONAL_ID", "STUDENT_ID", "KCSE_CERTIFICATE", "DRIVING_LICENSE", "OTHER"]),
  serialNumber: z.string().min(1, "Serial/Registration number is required"),
  locationFound: z.string().min(3, "Location is required"),
  dateFound: z.string(),
  finderName: z.string().min(2, "Your name is required"),
  finderContact: z.string().min(10, "Your contact is required"),
  // image: z.instanceof(FileList).optional(), // Handle manually
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
    formData.append("nameOnId", data.nameOnId);
    formData.append("idType", data.idType);
    formData.append("serialNumber", data.serialNumber);
    formData.append("locationFound", data.locationFound);
    formData.append("dateFound", data.dateFound);
    formData.append("finderName", data.finderName);
    formData.append("finderContact", data.finderContact);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData, // Fetch automatically sets Content-Type to multipart/form-data
      });

      if (!response.ok) {
        throw new Error("Failed to submit ID. Please try again.");
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
      <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-green-700 mb-2">Thank You!</h3>
        <p className="text-green-600 mb-6">
          The found ID has been submitted successfully. We will verify it and list it shortly.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Submit Another ID
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
      <div className="space-y-2">
        <Label htmlFor="nameOnId">Name on ID</Label>
        <Input id="nameOnId" placeholder="Name as it appears on the ID" {...register("nameOnId")} />
        {errors.nameOnId && <p className="text-red-500 text-sm">{errors.nameOnId.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="idType">ID Type</Label>
          <select 
             id="idType" 
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
             {...register("idType")}
          >
            <option value="">Select ID Type</option>
            <option value="NATIONAL_ID">National ID</option>
            <option value="STUDENT_ID">Student ID</option>
            <option value="KCSE_CERTIFICATE">KCSE Certificate</option>
            <option value="DRIVING_LICENSE">Driving License</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.idType && <p className="text-red-500 text-sm">{errors.idType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial / Registration Number</Label>
          <Input id="serialNumber" placeholder="Unique number on the ID" {...register("serialNumber")} />
          {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <Label htmlFor="locationFound">Location Found</Label>
           <Input id="locationFound" placeholder="e.g. Near Library, Gate A" {...register("locationFound")} />
           {errors.locationFound && <p className="text-red-500 text-sm">{errors.locationFound.message}</p>}
        </div>
        <div className="space-y-2">
           <Label htmlFor="dateFound">Date Found</Label>
           <Input id="dateFound" type="date" {...register("dateFound")} />
           {errors.dateFound && <p className="text-red-500 text-sm">{errors.dateFound.message}</p>}
        </div>
      </div>

      <div className="bg-zinc-50 p-4 rounded-lg border border-dashed border-zinc-300">
         <Label htmlFor="image" className="block mb-2">Upload Image of ID (Optional but recommended)</Label>
         <div className="flex items-center gap-4">
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {selectedFile && <CheckCircle className="h-5 w-5 text-green-500" />}
         </div>
         <p className="text-xs text-zinc-500 mt-2">
           We will blur sensitive details before publishing.
         </p>
      </div>

      <div className="border-t pt-6">
         <h4 className="font-semibold mb-4">Your Details (Private)</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label htmlFor="finderName">Your Name</Label>
               <Input id="finderName" placeholder="Your Full Name" {...register("finderName")} />
               {errors.finderName && <p className="text-red-500 text-sm">{errors.finderName.message}</p>}
            </div>
            <div className="space-y-2">
               <Label htmlFor="finderContact">Your Contact</Label>
               <Input id="finderContact" placeholder="Phone Number" {...register("finderContact")} />
               {errors.finderContact && <p className="text-red-500 text-sm">{errors.finderContact.message}</p>}
            </div>
         </div>
      </div>

      {error && <ErrorDisplay message={error} variant="inline" className="mb-6" />}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
             <Upload className="mr-2 h-4 w-4" /> Submit Found ID
          </>
        )}
      </Button>
    </form>
  );
}
