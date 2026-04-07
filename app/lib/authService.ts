'use client';

/**
 * @deprecated Use app/lib/sessionResolver.ts instead
 * 
 * This module is kept for backward compatibility.
 * All functionality is now centralized in sessionResolver.ts
 * 
 * Migration:
 * - Replace imports from '@/app/lib/authService' with '@/app/lib/sessionResolver'
 * - Server-side auth use '@/lib/auth' (which now uses React cache)
 */

export * from './sessionResolver';