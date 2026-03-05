"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createRequestSchema } from "@/lib/validations/requests";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, User, CreditCard, Hash, Phone, Calendar, MapPin, Mail, Upload } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";
import { motion, AnimatePresence } from "framer-motion";

type FormData = z.infer<typeof createRequestSchema>;

export function ReportLostForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createRequestSchema),
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
    
    // Using FormData for Cloudinary support
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value as string);
    });
    
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to submit report. Please try again.");
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-10 bg-white rounded-2xl border border-green-100 shadow-xl shadow-green-500/5"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-3">Report Submitted!</h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Your report has been received. We'll check it against any found IDs and email you as soon as there's a match.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => setIsSuccess(false)} className="rounded-full px-8">
            Report Another Item
          </Button>
          <Button variant="outline" asChild className="rounded-full px-8">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-zinc-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-zinc-900">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-zinc-700">Name on ID</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input id="full_name" placeholder="As it appears on the ID" className="pl-10" {...register("full_name")} />
            </div>
            {errors.full_name && <p className="text-red-500 text-xs font-medium">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone" className="text-zinc-700">Primary Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input id="contact_phone" placeholder="07XX XXX XXX" className="pl-10" {...register("contact_phone")} />
            </div>
            {errors.contact_phone && <p className="text-red-500 text-xs font-medium">{errors.contact_phone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email" className="text-zinc-700">Email Address (for notifications)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input id="contact_email" type="email" placeholder="yourname@domain.com" className="pl-10" {...register("contact_email")} />
          </div>
          {errors.contact_email && <p className="text-red-500 text-xs font-medium">{errors.contact_email.message}</p>}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="font-bold text-zinc-900">Document Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="id_type" className="text-zinc-700">Document Type</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-zinc-400 z-10" />
              <select 
                id="id_type" 
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                {...register("id_type")}
              >
                <option value="student_id">Student ID</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="atm_card">ATM Card</option>
                <option value="nhif">NHIF</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.id_type && <p className="text-red-500 text-xs font-medium">{errors.id_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_number" className="text-zinc-700">ID / Serial / Reg Number</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input id="registration_number" placeholder="Very important for matching" className="pl-10 font-mono" {...register("registration_number")} />
            </div>
            {errors.registration_number && <p className="text-red-500 text-xs font-medium">{errors.registration_number.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date_lost" className="text-zinc-700">Approximate Date Lost</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input id="date_lost" type="date" className="pl-10" {...register("date_lost")} />
            </div>
            {errors.date_lost && <p className="text-red-500 text-xs font-medium">{errors.date_lost.message}</p>}
          </div>
          
          <div className="space-y-2">
             <Label htmlFor="last_seen_location" className="text-zinc-700">Location Lost (Optional)</Label>
             <div className="relative">
               <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
               <Input id="last_seen_location" placeholder="e.g. Near Gate A" className="pl-10" {...register("last_seen_location")} />
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-zinc-700">Additional Description</Label>
          <Textarea 
            id="description" 
            placeholder="Mention any unique features, stickers, or holders that help identify your ID..." 
            className="min-h-[100px] resize-none"
            {...register("description")} 
          />
          {errors.description && <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>}
        </div>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-dashed border-zinc-200">
           <Label htmlFor="image" className="block mb-4 font-bold text-zinc-900 flex items-center gap-2">
             <Upload className="h-4 w-4 text-primary" />
             Upload Sample/Reference Image (Optional)
           </Label>
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
             Providing an image will help administrators match your request faster.
           </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ErrorDisplay message={error} variant="inline" className="mb-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Request...
          </>
        ) : (
          "Submit Lost ID Report"
        )}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        By submitting, you agree that your identification details will be matched against found items on this platform.
      </p>
    </form>
  );
}
