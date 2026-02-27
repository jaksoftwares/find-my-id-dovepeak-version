"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIds, FoundID } from "@/hooks/useIds";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MapPin, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [proofDescription, setProofDescription] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query, selectedCategory);
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
    setProofDescription('');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdForClaim || !proofDescription) return;

    if (proofDescription.length < 10) {
      setClaimError("Please provide a more detailed proof description (at least 10 characters).");
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
          proof_description: proofDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimSuccess(true);
        // Refresh the list to reflect any status changes (though matching the API's 'verified' requirement)
      } else {
        setClaimError(data.message || "Failed to submit claim. Please try again.");
      }
    } catch (err) {
      setClaimError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    search(query, category);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'claimed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatIdType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Found IDs</h1>
          <p className="text-muted-foreground mt-1">
            Search for your lost ID among the items found by the community.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or serial number..."
              className="pl-10 h-11"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {ID_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      ) : ids.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
          <p className="text-lg text-muted-foreground">No IDs found matching your search.</p>
          <Button 
            variant="link" 
            onClick={() => { 
              setQuery(""); 
              setSelectedCategory("all");
              search("", "all"); 
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ids.map((id) => (
              <Card key={id.id} className="overflow-hidden hover:shadow-lg transition-shadow border-zinc-200">
                <div className="aspect-video bg-zinc-100 relative flex items-center justify-center text-zinc-400">
                  <img 
                    src={id.image_url || '/images/id-placeholder.png'} 
                    alt={`ID of ${id.full_name}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/id-placeholder.png';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusBadgeVariant(id.status)}>
                      {formatIdType(id.status)}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-foreground capitalize">
                    {id.full_name}
                  </CardTitle>
                  <CardDescription className="uppercase tracking-wider text-xs font-semibold text-primary">
                    {formatIdType(id.id_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2 pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 flex items-center justify-center font-bold text-primary">#</div>
                    <span className="font-mono bg-zinc-100 px-1 rounded">
                      {id.serial_number || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Found at {id.location_found}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{id.date_found ? new Date(id.date_found).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-zinc-50/50">
                  <Button 
                    className="w-full" 
                    disabled={id.status !== 'verified'}
                    onClick={() => handleClaimInitiate(id)}
                  >
                    {id.status === 'verified' ? 'Claim This ID' : 'Not Available'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {meta.page} of {meta.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Claim Modal */}
      {showClaimModal && selectedIdForClaim && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-zinc-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                Claim This ID
              </CardTitle>
              <CardDescription>
                Provide details to prove you are the rightful owner of this ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {claimSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold">Claim Submitted!</h3>
                  <p className="text-zinc-600 font-medium">
                    Your request has been sent for verification. You will be notified once an admin reviews it.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setShowClaimModal(false);
                      setSelectedIdForClaim(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Item Details</p>
                    <p className="font-bold text-lg">{selectedIdForClaim.full_name}</p>
                    <p className="text-sm text-zinc-600 uppercase font-mono">{selectedIdForClaim.id_type.replace('_', ' ')}</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="proof" className="text-sm font-bold text-zinc-700">Proof of Ownership</label>
                    <Textarea
                      id="proof"
                      placeholder="e.g., Mention your middle name, specific unique details on the ID, or where you lost it..."
                      value={proofDescription}
                      onChange={(e) => setProofDescription(e.target.value)}
                      rows={6}
                      className="resize-none"
                      disabled={isSubmittingClaim}
                      required
                    />
                    <p className="text-xs text-zinc-500">
                      The admin will compare this information with the actual physical ID.
                    </p>
                  </div>

                  {claimError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium">
                      <AlertCircle className="h-4 w-4" />
                      {claimError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowClaimModal(false)}
                      disabled={isSubmittingClaim}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmittingClaim}>
                      {isSubmittingClaim ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Claim'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
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
