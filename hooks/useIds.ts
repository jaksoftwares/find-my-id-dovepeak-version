
import { useState, useEffect } from 'react';

export interface FoundID {
  id: string;
  name: string; // Name on the ID
  id_type: string; // e.g., National ID, Student ID
  serial_number: string; // Masked for public view
  location_found: string;
  image_url?: string;
  date_found: string;
  status: 'FOUND' | 'CLAIMED' | 'RETURNED';
}

export function useIds() {
  const [ids, setIds] = useState<FoundID[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIds();
  }, []);

  const fetchIds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ids');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify IDs. Please check your connection.');
      }
      
      // Handle the wrapper { success: true, data: [...] }
      setIds(Array.isArray(data.data) ? data.data : []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const searchIds = async (query: string) => {
    try {
        setLoading(true);
        setError(null);
        // Ensure query parameter key matches API expectation (route says 'query')
        const response = await fetch(`/api/ids?query=${encodeURIComponent(query)}`);
        
        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.message || 'Search failed. Please try again.');
        }

        setIds(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed due to a network issue.');
    } finally {
        setLoading(false);
    }
  };

  return { ids, loading, error, refresh: fetchIds, search: searchIds };
}
