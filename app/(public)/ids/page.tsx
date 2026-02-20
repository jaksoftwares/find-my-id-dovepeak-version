
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIds, FoundID } from "@/hooks/useIds";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MapPin, Calendar } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";

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

export default function BrowseIdsPage() {
  const searchParams = useSearchParams();
  const { ids, loading, error, search } = useIds();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('id_type') || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query, selectedCategory);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ids.map((id) => (
            <Card key={id.id} className="overflow-hidden hover:shadow-lg transition-shadow border-zinc-200">
              <div className="aspect-video bg-zinc-100 relative flex items-center justify-center text-zinc-400">
                {id.image_url ? (
                  <img 
                    src={id.image_url} 
                    alt={`ID of ${id.name}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm">No Image</span>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={getStatusBadgeVariant(id.status)}>
                    {formatIdType(id.status)}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground capitalize">
                  {id.name}
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
                <Button className="w-full" disabled={id.status !== 'verified'}>
                  {id.status === 'verified' ? 'Claim This ID' : 'Not Available'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
