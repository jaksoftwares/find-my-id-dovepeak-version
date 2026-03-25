# Admin Role-Based Access Control (RBAC) Walkthrough

This guide explains the implementation of two administrative roles: **Admin** and **Super Admin**. These roles ensure sensitive operations are restricted to high-level administrators while regular administrators manage day-to-day operations.

## Role Definitions

| Privilege | Super Admin (`super_admin`) | Admin (`admin`) |
| :--- | :---: | :---: |
| Dashboard Access | ✅ Full | ✅ Full |
| Manage IDs Database | ✅ Full | ✅ Edit/Verify only |
| **Delete IDs** | ✅ Yes | ❌ Restricted |
| **User & Role Management** | ✅ Full | ❌ Restricted |
| **System Settings** | ✅ Full | ❌ Restricted |
| **Reports & Exports** | ✅ Full | ❌ Restricted |
| **System Analytics** | ✅ Full | ❌ Restricted |

---

## Technical Implementation Details

### 1. Database Schema Update
A new role `'super_admin'` has been added to the system. To apply this in production, run the provided SQL script:
- [rbac_migration.sql](file:///C:/Users/josep/.gemini/antigravity/brain/c34160a4-cd94-4374-91c5-49b944fcc07a/rbac_migration.sql)

### 2. Auth Context & Role Hierarchy
The [AuthContext](file:///c:/Users/josep/jkuatfindmyid/app/context/AuthContext.tsx#20-34) has been updated to support hierarchy: 
- `isSuperAdmin`: A specialized boolean for super admin checks.
- `isAdmin`: Now returns true for *both* regular admins and super admins.
- [hasRole('admin')](file:///c:/Users/josep/jkuatfindmyid/app/lib/authService.ts#398-418): Allows both roles for shared pages.

### 3. Component Restrictions
A new [RestrictionModal](file:///c:/Users/josep/jkuatfindmyid/components/admin/RestrictionModal.tsx#23-74) component has been created to show friendly access-denied messages to normal admins when they click on restricted actions.

### 4. Admin Sidebar & Page Protection
The sidebar items for **Users, Settings, Reports, and Analytics** are now conditionally rendered based on the user's role.
Additionally, each restricted page is wrapped in:
```tsx
<RoleProtectedRoute allowedRoles={['super_admin']}>
  {/* Restricted Content */}
</RoleProtectedRoute>
```

---

## Usage Instructions

### Promoting an Admin to Super Admin
To promote an existing admin to Super Admin status, you can execute the following SQL in the Supabase Dashboard:

```sql
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'admin@example.com';
```

### Adding New Restricted Ops
If you need to restrict more actions, import the [RestrictionModal](file:///c:/Users/josep/jkuatfindmyid/components/admin/RestrictionModal.tsx#23-74) and use it like this:

```tsx
const { isSuperAdmin } = useAuth();
const [showModal, setShowModal] = useState(false);

const sensitiveAction = () => {
   if (!isSuperAdmin) {
      setShowModal(true);
      return;
   }
   // Executing sensitive action...
}
```
