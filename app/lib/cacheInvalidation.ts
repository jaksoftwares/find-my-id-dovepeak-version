'use client';

/**
 * Cache Invalidation Utility
 * 
 * Provides centralized cache invalidation after mutations.
 * Ensures data consistency by invalidating related cached endpoints
 * when data changes.
 * 
 * Usage: Call after any POST/PUT/DELETE operation
 */

import { mutate } from 'swr';

// Invalidate specific endpoints
export const invalidateEndpoints = {
  // User dashboard
  dashboard: () => mutate('/api/dashboard'),
  
  // Admin dashboard  
  adminDashboard: () => mutate('/api/admin/dashboard'),
  
  // Notifications
  notifications: () => mutate('/api/notifications'),
  
  // Claims
  userClaims: () => mutate('/api/claims'),
  adminClaims: () => mutate('/api/admin/claims'),
  adminClaimsStats: () => mutate('/api/admin/claims/stats'),
  
  // Requests
  userRequests: () => mutate('/api/requests'),
  adminRequests: () => mutate('/api/admin/requests'),
  
  // IDs
  ids: () => mutate('/api/ids'),
  adminIds: () => mutate('/api/admin/ids'),
  adminIdsStats: () => mutate('/api/admin/ids/stats'),
  
  // Users
  adminUsers: () => mutate('/api/admin/users'),
  adminUsersStats: () => mutate('/api/admin/users/stats'),
  adminAdmins: () => mutate('/api/admin/users/admins'),
  
  // Analytics
  adminAnalytics: () => mutate('/api/admin/analytics'),
  
  // Settings
  adminSettings: () => mutate('/api/admin/settings'),
  
  // Found ID Reports
  foundIdReports: () => mutate('/api/found-id-reports'),
  
  // Forum
  forumPosts: () => mutate('/api/forum'),
  forumStats: () => mutate('/api/forum/stats'),
};

/**
 * Invalidate all user-related caches
 * Call after login/logout
 */
export function invalidateUserCaches() {
  invalidateEndpoints.dashboard();
  invalidateEndpoints.notifications();
  invalidateEndpoints.userClaims();
  invalidateEndpoints.userRequests();
}

/**
 * Invalidate all admin-related caches
 * Call after admin actions
 */
export function invalidateAdminCaches() {
  invalidateEndpoints.adminDashboard();
  invalidateEndpoints.adminClaims();
  invalidateEndpoints.adminClaimsStats();
  invalidateEndpoints.adminRequests();
  invalidateEndpoints.adminIds();
  invalidateEndpoints.adminIdsStats();
  invalidateEndpoints.adminUsers();
  invalidateEndpoints.adminUsersStats();
  invalidateEndpoints.adminAdmins();
  invalidateEndpoints.adminAnalytics();
  invalidateEndpoints.adminSettings();
}

/**
 * Invalidate caches after creating a request
 */
export function onCreateRequest() {
  invalidateEndpoints.dashboard();
  invalidateEndpoints.userRequests();
  invalidateEndpoints.adminRequests();
  invalidateEndpoints.adminAnalytics();
}

/**
 * Invalidate caches after creating/updating a claim
 */
export function onClaimAction() {
  invalidateEndpoints.dashboard();
  invalidateEndpoints.userClaims();
  invalidateEndpoints.adminClaims();
  invalidateEndpoints.adminClaimsStats();
  invalidateEndpoints.adminDashboard();
}

/**
 * Invalidate caches after ID-related action
 */
export function onIdAction() {
  invalidateEndpoints.adminIds();
  invalidateEndpoints.adminIdsStats();
  invalidateEndpoints.adminDashboard();
  invalidateEndpoints.adminAnalytics();
}

/**
 * Invalidate caches after notification action
 */
export function onNotificationAction() {
  invalidateEndpoints.notifications();
}

/**
 * Invalidate caches after user action (admin)
 */
export function onUserAction() {
  invalidateEndpoints.adminUsers();
  invalidateEndpoints.adminUsersStats();
  invalidateEndpoints.adminAdmins();
  invalidateEndpoints.adminAnalytics();
  invalidateEndpoints.adminDashboard();
}

/**
 * Invalidate caches after settings change
 */
export function onSettingsChange() {
  invalidateEndpoints.adminSettings();
}

/**
 * Invalidate caches after found report action
 */
export function onFoundReportAction() {
  invalidateEndpoints.foundIdReports();
  invalidateEndpoints.adminDashboard();
}