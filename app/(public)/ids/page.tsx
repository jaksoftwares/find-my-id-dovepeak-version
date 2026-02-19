
"use client";

import { useState } from "react";
import { useIds, FoundID } from "@/hooks/useIds";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MapPin, Calendar, CheckCircle } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";
import Image from "next/image"; // For cloud images if available

export default function BrowseIdsPage() {
  const { ids, loading, error, search } = useIds();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

        <div>
          <h1 className="text-3xl font-bold text-foreground ">Browse Found IDs</h1>
          <p className="text-muted-foreground mt-1">
            Search for your lost ID among the items found by the community.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or serial (e.g., SCT221...)"
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit">
             Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      ) : ids.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50  rounded-lg border border-dashed border-zinc-200 ">
          <p className="text-lg text-muted-foreground">No IDs found matching your search.</p>
          <Button variant="link" onClick={() => { setQuery(""); search(""); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ids.map((id) => (
            <Card key={id.id} className="overflow-hidden hover:shadow-lg transition-shadow border-zinc-200 ">
              <div className="aspect-video bg-zinc-100  relative flex items-center justify-center text-zinc-400">
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
                    <Badge variant={id.status === 'FOUND' ? 'success' : 'secondary'}>
                      {id.status}
                    </Badge>
                 </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground  capitalize">
                  {id.name}
                </CardTitle>
                <CardDescription className="uppercase tracking-wider text-xs font-semibold text-primary">
                  {id.id_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2 pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <div className="w-4 h-4 flex items-center justify-center font-bold text-primary">#</div>
                   <span className="font-mono bg-zinc-100  px-1 rounded">
                     {id.serial_number}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <MapPin className="w-4 h-4 text-primary" />
                   <span>Found at {id.location_found}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Calendar className="w-4 h-4 text-primary" />
                   <span>{new Date(id.date_found).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-zinc-50/50">
                 <Button className="w-full" disabled={id.status !== 'FOUND'}>
                   {id.status === 'FOUND' ? 'Claim This ID' : 'Already Claimed'}
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
