
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { lostIdSchema } from "@/lib/validations/public"; // Assuming this exists or I'll create it inline
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";

type FormData = z.infer<typeof lostIdSchema>;

// Inline schema if not imported successfully, otherwise use imported one.
// I will rewrite this to use the imported one, assuming I created it correctly.

export function ReportLostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(lostIdSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report. Please try again.");
      }

      setIsSuccess(true);
      reset();
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
        <h3 className="text-2xl font-bold text-green-700 mb-2">Report Submitted!</h3>
        <p className="text-green-600 mb-6">
          Your lost ID report has been received. We will notify you if a matching ID is found.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Report Another ID
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
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
          <Input id="serialNumber" placeholder="e.g. 12345678 or SCT221-0000/2022" {...register("serialNumber")} />
          {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <Label htmlFor="phoneNumber">Phone Number</Label>
           <Input id="phoneNumber" placeholder="0700000000" {...register("phoneNumber")} />
           {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
        </div>
        <div className="space-y-2">
           <Label htmlFor="dateLost">Date Lost</Label>
           <Input id="dateLost" type="date" {...register("dateLost")} />
           {errors.dateLost && <p className="text-red-500 text-sm">{errors.dateLost.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description / Where was it lost?</Label>
        <Textarea id="description" placeholder="e.g. Lost around the Student Center..." {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      {error && <ErrorDisplay message={error} variant="inline" className="mb-6" />}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>
    </form>
  );
}
