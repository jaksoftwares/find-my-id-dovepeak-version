'use client';

import useSWR, { mutate } from 'swr';

/**
 * Centralized Client-Side Caching Layer using SWR
 * 
 * This module provides deduplication and caching for all client-side API calls.
 * Features:
 * - Request deduplication (same URL requested multiple times returns cached data)
 * - Stale-while-revalidate behavior
 * - Automatic background refetch
 * - Loading/error state management
 * - Cache invalidation support
 */

// Fetcher function for SWR
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    throw error;
  }
  
  return res.json();
};

/**
 * useApiGet - Centralized hook for GET requests with SWR caching
 * 
 * @param key - API endpoint
 * @param options - SWR configuration options
 * 
 * TTL Guidelines:
 * - High-change data (notifications, active claims): 30s
 * - Moderate-change data (dashboard): 60s
 * - Stable reference data (roles, ID types): 300s
 */
export function useApiGet<T = any>(
  key: string,
  options?: {
    ttl?: number;           // Cache TTL in seconds (controls dedupingInterval)
    refreshInterval?: number; // Auto-refresh interval in ms
    revalidateOnFocus?: boolean;
    fallbackData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const {
    ttl = 60,                    // Default 60s for dashboard data
    refreshInterval = 0,         // No auto-refresh by default
    revalidateOnFocus = false,  // Don't refetch on focus (reduces requests)
    fallbackData,
    onSuccess,
    onError
  } = options || {};

  return useSWR<T>(
    key,
    fetcher,
    {
      // dedupingInterval: controls how long duplicate requests are suppressed
      dedupingInterval: (ttl * 1000) / 2,
      
      // Refresh interval for real-time data
      refreshInterval: refreshInterval,
      
      // Don't refetch on window focus
      revalidateOnFocus: revalidateOnFocus,
      
      // Fallback data
      ...(fallbackData ? { fallbackData: fallbackData as any } : {}),
      
      // Success callback
      ...(onSuccess ? { onSuccess: onSuccess as any } : {}),
      
      // Error callback  
      ...(onError ? { onError: onError as any } : {})
    }
  );
}

/**
 * invalidateCache - Manually invalidate a cached endpoint
 * 
 * Usage: After mutations, call this to force refetch
 * Example: invalidateCache('/api/dashboard')
 */
export function invalidateCache(key: string) {
  mutate(key);
}

/**
 * invalidateCachePattern - Invalidate multiple endpoints matching a pattern
 * 
 * Usage: invalidateCachePattern('/api/admin/')
 * Will invalidate all cached endpoints starting with '/api/admin/'
 */
export function invalidateCachePattern(pattern: string) {
  // SWR global cache access - invalidate all keys matching pattern
  const cache = (window as any).__swrCache;
  if (cache) {
    cache.keys?.().forEach((k: string) => {
      if (k.includes(pattern)) {
        mutate(k);
      }
    });
  }
}

/**
 * invalidateMultiple - Invalidate multiple specific endpoints at once
 * 
 * Usage: invalidateMultiple(['/api/dashboard', '/api/requests', '/api/claims'])
 */
export function invalidateMultiple(keys: string[]) {
  keys.forEach(key => invalidateCache(key));
}

// Pre-defined cache configurations for common endpoints
export const CACHE_CONFIG = {
  // High-change data - 30s TTL
  notifications: { ttl: 30, refreshInterval: 30000 },
  claims: { ttl: 30, refreshInterval: 0 },
  
  // Moderate-change data - 60s TTL  
  dashboard: { ttl: 60, refreshInterval: 0 },
  adminDashboard: { ttl: 60, refreshInterval: 0 },
  
  // Low-change data - 5min TTL
  profile: { ttl: 300, refreshInterval: 0 },
  users: { ttl: 300, refreshInterval: 0 },
  ids: { ttl: 300, refreshInterval: 0 },
  
  // Very stable data - 10min TTL
  settings: { ttl: 600, refreshInterval: 0 },
  analytics: { ttl: 600, refreshInterval: 0 },
  forum: { ttl: 300, refreshInterval: 0 },
} as const;

/**
 * getCacheConfig - Get pre-defined cache config for an endpoint
 */
export function getCacheConfig(endpoint: string) {
  // Match endpoint to predefined config
  if (endpoint.includes('notifications')) return CACHE_CONFIG.notifications;
  if (endpoint.includes('claims') && !endpoint.includes('admin')) return CACHE_CONFIG.claims;
  if (endpoint === '/api/dashboard') return CACHE_CONFIG.dashboard;
  if (endpoint === '/api/admin/dashboard') return CACHE_CONFIG.adminDashboard;
  if (endpoint.includes('/api/admin/users')) return CACHE_CONFIG.users;
  if (endpoint.includes('/api/ids') || endpoint.includes('/api/admin/ids')) return CACHE_CONFIG.ids;
  if (endpoint.includes('/api/admin/settings')) return CACHE_CONFIG.settings;
  if (endpoint.includes('/api/admin/analytics')) return CACHE_CONFIG.analytics;
  if (endpoint.includes('/api/forum')) return CACHE_CONFIG.forum;
  
  // Default fallback
  return { ttl: 60, refreshInterval: 0 };
}