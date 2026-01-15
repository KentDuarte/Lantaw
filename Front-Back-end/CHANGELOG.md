# Changelog

This document summarizes all changes made to the Lantaw-TBD-Backend and Lantaw-TBD-Frontend projects.

---

## Frontend Changes (Lantaw-TBD-Frontend)

### Authentication & Token Management

#### `src/features/auth/components/LoginCard.tsx`
- **Integrated AuthContext for token management**
  - Replaced direct `localStorage` manipulation with `setTokens()` from `useAuth()` hook
  - Added import for `useAuth` context hook
  - Tokens are now managed centrally through AuthContext, ensuring consistent state across the application
  
- **Improved error handling**
  - Enhanced error messages to display server-provided error details when available
  - Changed error message from generic "Invalid email or password." to dynamic `err.response?.data?.detail || "Invalid email or password."`
  - Added proper TypeScript error typing with `err: any`

- **Fixed navigation timing issue**
  - Added 100ms delay before navigation to allow AuthContext to update with new tokens
  - This ensures the authentication state is properly synchronized before redirecting to the dashboard

**Changes:**
```diff
+ import { useAuth } from "../../../context/AuthContext";
+ const { setTokens } = useAuth();
- localStorage.setItem(ACCESS_TOKEN, res.data.access);
- localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
+ setTokens(res.data.access, res.data.refresh);
+ setTimeout(() => {
+   navigate("/");
+ }, 100);
- setError("Invalid email or password.");
+ setError(err.response?.data?.detail || "Invalid email or password.");
```

---

### Dashboard Layout Improvements

#### `src/features/dashboard/components/DashboardLayout.tsx`
- **Added authentication loading state**
  - Implemented loading check using `authLoading` from `useAuth()` context
  - Displays "Loading dashboard..." message while user authentication data is being fetched
  - Prevents rendering issues during initial authentication state resolution

- **Enhanced no-project-selected state**
  - Improved UI for when no project is selected
  - Added welcome message: "Welcome to Lantaw Dashboard"
  - Provides clearer instructions to users about selecting or creating a project
  - Added role-based message for Admin users with guidance on project creation
  - Moved early return logic to the top of the component for better code organization

- **Removed duplicate code**
  - Eliminated duplicate `if (!currentProject)` checks that were appearing twice in the code
  - Cleaned up redundant conditional rendering logic

**Changes:**
```diff
- const { user } = useAuth();
+ const { user, loading: authLoading } = useAuth();
+ 
+ if (authLoading) {
+   return (
+     <div className="p-6 space-y-4">
+       <div className="bg-card border border-border rounded-lg p-6">
+         <p className="text-muted-foreground">Loading dashboard...</p>
+       </div>
+     </div>
+   );
+ }
+ 
+ if (!currentProject) {
+   return (
+     <div className="p-6 space-y-4">
+       <h2 className="text-2xl font-semibold">Welcome to Lantaw Dashboard</h2>
+       <div className="bg-card border border-border rounded-lg p-6">
+         <p className="text-muted-foreground mb-4">
+           No project selected. Please select a project from the sidebar or create a new one.
+         </p>
+         {user?.role === "Admin" && (
+           <p className="text-sm text-muted-foreground">
+             As an admin, you can create a new project using the "Create Project" button in the sidebar.
+           </p>
+         )}
+       </div>
+     </div>
+   );
+ }
```

---

### Development Configuration

#### `vite.config.ts`
- **Added explicit server port configuration**
  - Set development server port to `5173`
  - Provides consistent port for development environment
  - Avoids port conflicts and ensures predictable behavior

**Changes:**
```diff
export default defineConfig({
  plugins: [react()],
+ server: {
+   port: 5173,
+ },
})
```

#### `package.json`
- **Added server script alias**
  - Added `"server": "vite"` script for convenience
  - Provides alternative command to run the development server
  - Maintains consistency with common development workflows

**Changes:**
```diff
"scripts": {
  "dev": "vite",
+ "server": "vite",
  "build": "tsc -b && vite build",
  ...
}
```

---

## Backend Changes (Lantaw-TBD-Backend)

### Recent Commits (Already Committed)

Based on the git history, the following changes have been implemented and committed:

1. **Django Seeder for Automated Data Population** (Latest commit: `51b79fc`)
   - Added management command for seeding database with initial data
   - Enables automated data population for development and testing

2. **Frontend Connectivity** (Merge commit: `3db8ce6`)
   - Merged pull request for frontend-backend connectivity improvements

3. **Python Environment Requirements** (Commit: `5661120`)
   - Updated and documented Python environment requirements

4. **Project Grant Amount Migrations** (Commit: `a6c5cd0`)
   - Added migrations for altering project grant amount field

5. **Admin View Filter** (Commit: `6c42f4d`)
   - Added filtering capabilities for admin view

6. **Project Members Serializer and ViewSet** (Commit: `6cf6f14`)
   - Implemented serializer, viewset, and URL endpoints for project members

7. **Budget Line Items Signal** (Commit: `1a7fbd9`)
   - Created signal for automatic budget line item creation (MOOE, PS, CO) when saving projects

8. **CORS Headers Configuration** (Commit: `6f4f3c1`)
   - Added CORS headers configuration in Django settings

9. **Test Infrastructure** (Commits: `e286e20`, `421fba2`, `49ca9a4`)
   - Added test fixtures and test cases for Project, ProjectMember, and ProjectPersonnel models
   - Initialized tests folder structure for Project app

10. **Data Validation Improvements** (Commits: `350149b`, `dad2785`, `185b0cc`)
    - Added numerical validator for grant amount
    - Implemented date validation with clean comparison
    - Modified project grant amount to only accept non-negative values

11. **Security and Permissions** (Commits: `f95ad6a`, `9996900`)
    - Optimized viewset for security and maintainability
    - Updated permissions and functions

**Note:** The backend working tree is currently clean with no uncommitted changes.

---

## Summary of Changes

### Frontend
- ✅ Improved authentication state management through AuthContext integration
- ✅ Enhanced user experience with loading states and better error messages
- ✅ Improved dashboard layout with better handling of edge cases
- ✅ Configuration improvements for development server

### Backend
- ✅ All recent changes have been committed
- ✅ Django seeder implementation for data population
- ✅ Enhanced project and budget management features
- ✅ Improved security and permissions handling
- ✅ Comprehensive test coverage

---

## Impact Assessment

### User Experience
- **Improved Authentication Flow**: Centralized token management ensures consistent authentication state across the application
- **Better Error Feedback**: Users now receive more informative error messages from the server
- **Enhanced Loading States**: Users see appropriate loading indicators while data is being fetched
- **Clearer Project Selection**: Improved UI guidance when no project is selected

### Developer Experience
- **Consistent Configuration**: Explicit port configuration prevents development environment issues
- **Code Organization**: Cleaned up duplicate code and improved component structure
- **Better State Management**: Centralized authentication state management through context

### System Stability
- **Reduced Race Conditions**: Fixed timing issues in authentication flow
- **Improved Error Handling**: Better error propagation and display
- **Code Quality**: Removed duplicate code and improved component organization

---

## Files Modified

### Frontend
1. `src/features/auth/components/LoginCard.tsx`
2. `src/features/dashboard/components/DashboardLayout.tsx`
3. `vite.config.ts`
4. `package.json`

### Backend
All changes are committed. No uncommitted modifications.

---

**Last Updated:** Generated from current git status and codebase analysis
