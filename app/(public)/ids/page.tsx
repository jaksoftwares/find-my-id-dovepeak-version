"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIds, FoundID } from "@/hooks/useIds";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Loader2, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Shield, 
  Info,
  ShieldCheck
} from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const ID_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "student_id", label: "Student ID" },
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "atm_card", label: "ATM Card" },
  { value: "nhif", label: "NHIF" },
  { value: "driving_license", label: "Driving License" },
  { value: "other", label: "Other" },
];
import { Suspense } from "react";

function BrowseIdsContent() {
  const searchParams = useSearchParams();
  const { ids, loading, error, search, meta, setPage } = useIds();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('id_type') || 'all');

  // Claim states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedIdForClaim, setSelectedIdForClaim] = useState<FoundID | null>(null);
  const [claimStep, setClaimStep] = useState(1);
  const [claimName, setClaimName] = useState('');
  const [claimIdNumber, setClaimIdNumber] = useState('');
  const [claimAdditionalDetails, setClaimAdditionalDetails] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (selectedCategory !== "all") params.set("id_type", selectedCategory);
    router.push(`/ids?${params.toString()}`);
    search(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category !== "all") params.set("id_type", category);
    router.push(`/ids?${params.toString()}`);
    search(query, category);
  };

  const handleClaimInitiate = (id: FoundID) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/ids`);
      return;
    }
    setSelectedIdForClaim(id);
    setShowClaimModal(true);
    setClaimError(null);
    setClaimSuccess(false);
    setClaimStep(1);
    setClaimName('');
    setClaimIdNumber('');
    setClaimAdditionalDetails('');
    setProofDescription('');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdForClaim) return;

    // Build template message
    const finalProofDescription = `Hello, my name is ${claimName}. My ID/Card number is ${claimIdNumber}. Additional details: ${claimAdditionalDetails || 'None'}. Kindly verify my details on the ID, thank you.`;

    if (claimStep < 4) {
      setClaimStep(claimStep + 1);
      return;
    }

    setIsSubmittingClaim(true);
    setClaimError(null);

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: selectedIdForClaim.id,
          proof_description: finalProofDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimSuccess(true);
      } else {
        setClaimError(data.message || "Failed to submit claim.");
      }
    } catch (err) {
      setClaimError("A network error occurred.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Privacy Masking Helpers
  const maskName = (name: string) => {
    if (!name) return "N/A";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].length > 3 
        ? parts[0].substring(0, 3) + "*".repeat(parts[0].length - 3)
        : parts[0] + "*";
    }
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.substring(0, 1)}***`;
  };

  const maskSerialNumber = (sn: string | null) => {
    if (!sn) return "N/A";
    if (sn.length <= 4) return sn;
    return sn.substring(0, 4) + "*".repeat(Math.min(4, sn.length - 4));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'claimed': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatIdType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-zinc-50 border-b border-zinc-100 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B3D91] tracking-tight mb-3">
            Found IDs
          </h1>
          <p className="text-zinc-600 max-w-lg mx-auto font-medium mb-8">
            Search our database to see if your identification card has been recovered.
          </p>

          <Card className="shadow-lg shadow-zinc-200/50 border-zinc-200 rounded-2xl overflow-hidden p-1.5 bg-white max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-5 w-5 text-zinc-400" />
                <Input
                  placeholder="Search name or ID type..."
                  className="pl-11 h-11 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-11 px-8 rounded-xl font-bold">
                Search
              </Button>
            </form>
          </Card>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {ID_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-primary/20 hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-zinc-500 font-medium">Searching...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto">
            <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
          </div>
        ) : ids.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No IDs found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-6">We couldn&apos;t find any records matching your search.</p>
            <Button 
              variant="outline"
              className="rounded-full px-8"
              onClick={() => { 
                setQuery(""); 
                handleCategoryChange("all");
              }}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="font-bold text-zinc-900">
                Recovered Items <span className="text-zinc-400 text-sm font-normal ml-2">({meta.total})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ids.map((id) => (
                <Card key={id.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-zinc-200 rounded-2xl bg-white flex flex-col h-full">
                  <div className="aspect-[1.85/1] bg-zinc-50 relative overflow-hidden">
                    <img 
                      src={
                        id.id_type === 'student_id' 
                          ? '/templates/jkuat-id-placeholder.png' 
                          : id.id_type === 'national_id' 
                            ? '/templates/nationalid-template.png' 
                          : id.id_type === 'passport' 
                            ? '/templates/passport-template.png' 
                          : id.id_type === 'atm_card' 
                            ? '/templates/atmcard-template.png' 
                          : id.id_type === 'nhif' 
                            ? '/templates/nhifcard-template.png' 
                          : id.id_type === 'driving_license' 
                            ? '/templates/drivinglicence-template.png' 
                          : '/templates/id-placeholder.png'
                      } 
                      alt="ID Preview" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 blur-[2px] group-hover:blur-0" 
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[#0B3D91] border-0 font-bold uppercase text-[10px]">
                        {formatIdType(id.id_type)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-lg font-extrabold text-[#0B3D91]">
                      {maskName(id.full_name)}
                    </CardTitle>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      ID Number: {maskSerialNumber(id.serial_number)}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-3 space-y-3 flex-grow">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-600 truncate">{id.location_found}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-600">
                        {id.date_found ? new Date(id.date_found).toLocaleDateString('en-GB') : 'N/A'}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 mt-auto">
                    <Button 
                      className="w-full h-10 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50" 
                      disabled={id.status !== 'verified'}
                      onClick={() => handleClaimInitiate(id)}
                    >
                      {id.status === 'verified' ? 'Claim ID' : 'Unavailable'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-zinc-100"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(meta.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => {
                    if (p === 1 || p === meta.totalPages || (p >= meta.page - 1 && p <= meta.page + 1)) {
                      return (
                        <Button
                          key={p}
                          variant={meta.page === p ? "default" : "ghost"}
                          className={`h-9 w-9 rounded-full font-bold transition-all text-sm ${
                            meta.page === p ? "bg-primary text-white" : "text-zinc-500"
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    }
                    if (p === 2 || p === meta.totalPages - 1) return <span key={p} className="text-zinc-300">...</span>;
                    return null;
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-zinc-100"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage(meta.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Info Box */}
        <div className="mt-16 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left max-w-4xl mx-auto">
           <div className="flex-1">
             <h4 className="font-extrabold text-[#0B3D91] mb-1">Privacy Notice</h4>
             <p className="text-zinc-500 text-sm font-medium">Identification details are partially hidden for your protection. Full verification happens when you claim your ID.</p>
           </div>
           <Button variant="outline" size="sm" className="rounded-full" asChild>
             <Link href="/about">How it works</Link>
           </Button>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedIdForClaim && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <div className="h-2 bg-[#0B3D91]" />
              <CardHeader className="pt-8 px-8 text-center">
                <CardTitle className="text-2xl font-extrabold text-[#0B3D91]">
                  Claim Your ID
                </CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  Please provide details to help us confirm you are the owner.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                {claimSuccess ? (
                  <div className="py-6 text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <h3 className="text-2xl font-extrabold text-zinc-900">Claim Submitted</h3>
                    <p className="text-zinc-600">Your claim has been submitted successfully. Our team will review it and get back to you.</p>
                    
                    <div className="flex flex-col gap-3 pt-4">
                      <Button 
                        asChild
                        className="w-full h-11 rounded-xl font-bold bg-[#0B3D91]" 
                      >
                        <Link href="/dashboard/claims">Track in Dashboard</Link>
                      </Button>
                      <Button 
                        variant="ghost"
                        className="w-full h-11 rounded-xl font-bold text-zinc-500" 
                        onClick={() => {
                          setShowClaimModal(false);
                          setSelectedIdForClaim(null);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleClaimSubmit} className="space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mb-4">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            claimStep === step ? "w-8 bg-[#0B3D91]" : "w-1.5 bg-zinc-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                       <div>
                         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Item You're Claiming</p>
                         <p className="font-extrabold text-[#0B3D91] text-sm">{maskName(selectedIdForClaim.full_name)}</p>
                       </div>
                       <Badge variant="outline" className="text-[10px] font-bold text-[#0B3D91] border-[#0B3D91]/20">
                         {formatIdType(selectedIdForClaim.id_type)}
                       </Badge>
                    </div>

                    {claimStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-[#0B3D91] uppercase tracking-widest">
                          Name as it appears on the ID
                        </label>
                        <Input
                          placeholder="Enter full name..."
                          value={claimName}
                          onChange={(e) => setClaimName(e.target.value)}
                          className="h-12 rounded-xl border-zinc-200 font-medium"
                          required
                        />
                      </motion.div>
                    )}

                    {claimStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-[#0B3D91] uppercase tracking-widest">
                          ID or Serial Number
                        </label>
                        <Input
                          placeholder="Enter identification number..."
                          value={claimIdNumber}
                          onChange={(e) => setClaimIdNumber(e.target.value)}
                          className="h-12 rounded-xl border-zinc-200 font-medium"
                          required
                        />
                      </motion.div>
                    )}

                    {claimStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-[#0B3D91] uppercase tracking-widest">
                          Any other identifying details
                        </label>
                        <Textarea
                          placeholder="e.g. any other detail that you feel is on the ID..."
                          value={claimAdditionalDetails}
                          onChange={(e) => setClaimAdditionalDetails(e.target.value)}
                          rows={4}
                          className="resize-none rounded-xl border-zinc-200 font-medium"
                        />
                        <p className="text-[10px] text-zinc-400 font-medium italic">
                          This information helps us confirm your ownership faster.
                        </p>
                      </motion.div>
                    )}

                    {claimStep === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-[#0B3D91] uppercase tracking-widest">
                          Preview your claim submission
                        </label>
                        <div className="p-4 bg-[#0B3D91]/5 border border-[#0B3D91]/10 rounded-2xl relative">
                          <p className="text-sm font-medium text-zinc-700 leading-relaxed italic">
                            &quot;Hello, my name is <span className="font-bold text-[#0B3D91]">{claimName}</span>. 
                            My ID/Card number is <span className="font-bold text-[#0B3D91]">{claimIdNumber}</span>. 
                            Additional details: <span className="font-bold text-[#0B3D91]">{claimAdditionalDetails || 'None'}</span>. 
                            Kindly verify my details on the ID, thank you.&quot;
                          </p>
                          <div className="absolute -top-2 -right-2 p-1.5 bg-[#0B3D91] text-white rounded-full">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-[10px] text-[#0B3D91] font-bold uppercase tracking-widest text-center mt-4">
                          Ready to submit?
                        </p>
                      </motion.div>
                    )}

                    {claimError && (
                      <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl">
                        {claimError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      {claimStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-11 rounded-xl font-bold border-zinc-200 text-zinc-500"
                          onClick={() => setClaimStep(claimStep - 1)}
                          disabled={isSubmittingClaim}
                        >
                          Back
                        </Button>
                      )}
                      {claimStep === 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1 h-11 rounded-xl font-bold text-zinc-500"
                          onClick={() => setShowClaimModal(false)}
                          disabled={isSubmittingClaim}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" className="flex-1 h-11 rounded-xl font-bold" disabled={isSubmittingClaim || (claimStep === 1 && !claimName) || (claimStep === 2 && !claimIdNumber)}>
                        {isSubmittingClaim ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : claimStep === 4 ? (
                          'Confirm & Submit'
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function BrowseIdsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BrowseIdsContent />
    </Suspense>
  );
}
