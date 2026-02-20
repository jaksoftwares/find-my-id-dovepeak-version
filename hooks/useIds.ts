
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export interface FoundID {
  id: string;
  name: string;
  id_type: string;
  serial_number: string | null;
  location_found: string;
  holding_location?: string;
  image_url?: string;
  date_found: string;
  status: string;
  visibility?: boolean;
  created_at?: string;
}

export function useIds() {
  const [ids, setIds] = useState<FoundID[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchIds = useCallback(async (query?: string, idType?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (idType && idType !== 'all') params.set('id_type', idType);
      
      const response = await fetch(`/api/ids?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch IDs. Please check your connection.');
      }
      
      setIds(Array.isArray(data.data) ? data.data : []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string, idType?: string) => {
    await fetchIds(query, idType);
  }, [fetchIds]);

  // Initial fetch and when URL params change
  useEffect(() => {
    const query = searchParams.get('query') || '';
    const idType = searchParams.get('id_type') || 'all';
    fetchIds(query, idType);
  }, [searchParams, fetchIds]);

  return { ids, loading, error, refresh: fetchIds, search };
}
