# Notification Polling Refactor Report

## Issue Summary

Excessive notification polling causing high request volume in idle state.

## Root Cause

**File:** `app/context/NotificationContext.tsx`

Previous implementation used 30-second polling interval:
```typescript
setInterval(refreshUnreadCount, 30000); // 30 seconds
```

This generated:
- 120 requests/hour per open tab
- Repeated auth checks via authFetch
- Repeated database queries to notifications table
- With multiple tabs open, request volume multiplied exponentially

## Files Changed

1. `app/context/NotificationContext.tsx` - Complete refactor of polling strategy

## Before vs After Architecture

### Before (30-second polling)
- Fixed 30-second interval
- No visibility awareness
- No event-driven updates
- 120 requests/hour per tab

### After (Hybrid Event-Driven)
- Tab visibility detection - only poll when tab is active
- 5-minute fallback interval (300000ms) instead of 30 seconds
- Global event listener for manual refresh triggers
- Manual trigger function exposed for components to call after actions
- Cleanup on unmount prevents memory leaks

## Performance Impact

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Requests/hour (active tab) | 120 | 12 | 90% |
| Requests when tab hidden | 120 | 0 | 100% |
| Initial load | 1 | 1 | 0% |
| On route change | 0 | 0 | - |

**Expected hourly reduction:** ~90-95% for single active tab
**Expected reduction with multiple tabs:** Up to 95%+

## Functional Verification Checklist

- [x] Unread count updates on initial page load
- [x] Unread count updates when tab becomes visible (visibility API)
- [x] Manual refresh available via `triggerNotificationRefresh()` function
- [x] Global event listener enables cross-component refresh triggers
- [x] Fallback polling at 5-minute interval when tab is active
- [x] No polling when tab is hidden (document.hidden)
- [x] Proper cleanup of intervals on unmount
- [x] Auth context dependency properly managed
- [x] No duplicate timers - single interval instance
- [x] Error handling preserved

## Risk Notes

- **Low Risk**: Change is purely optimization-focused
- **No breaking changes**: All public API methods preserved
- **Backward compatible**: Existing components using `refreshUnreadCount` still work
- **New capability**: Added `triggerNotificationRefresh` for event-driven updates

## Rollback Considerations

To rollback, revert to the previous implementation:
```typescript
useEffect(() => {
  if (user) {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  } else {
    setUnreadCount(0);
  }
}, [user, refreshUnreadCount]);
```

## Future Recommendations

1. **WebSocket Integration**: Consider implementing real-time WebSocket connection for instant notifications instead of polling
2. **Server-Sent Events (SSE)**: Alternative to WebSocket for simpler notification push
3. **Optimistic Updates**: After user actions (create request, submit claim), immediately update local count before API confirmation
4. **Cache Invalidation**: Add proper cache headers to API responses to enable client-side caching
5. **Batch Notification Reads**: When user clicks to view notifications, batch-mark as read in single API call

## Additional Notes

The refactor adds a global event system (`notification-refresh`) that allows any component to trigger a notification refresh after relevant actions:
- Request creation
- Claim submission
- Claim approval/rejection
- ID verification
- Admin actions

Components can use:
```typescript
// Option 1: Direct call via context
const { triggerNotificationRefresh } = useNotifications();
await createRequest();
triggerNotificationRefresh();

// Option 2: Dispatch global event
window.dispatchEvent(new CustomEvent('notification-refresh'));
```