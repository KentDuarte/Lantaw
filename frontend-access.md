# Enable Executive Read-Only Access Across Frontend

## Problems

1. **Activities Access**: Backend allows Executives to view Activities (read-only), but frontend blocks them at sidebar menu, route protection, and page component levels.
2. **Overview Page**: Executives see "Edit Project" button but shouldn't be able to edit projects.
3. **Projects Sidebar Footer**: Projects section doesn't display for Executives because frontend only fetches from `user.projects` array, but Executives should see ALL projects (per backend permissions).

## Solution

Update frontend to properly support Executive read-only access and fix projects fetching logic.

## Files to Modify

### 1. Activities Access - Enable for Executives

#### 1.1 AppLayout.tsx (Lines 158-164)

Remove filter that hides Activities menu item for Executives.

#### 1.2 Activities.tsx (Line 12)

Add "Executive" to `allowedRoles` array: `["Admin", "Project Staff", "Executive"]`

#### 1.3 App.tsx (Line 48)

Add "Executive" to `allowedRoles` in `RoleRoute`: `["Admin", "Project Staff", "Executive"]`

#### 1.4 ActivitiesLayout.tsx & ActivitiesHeader.tsx

Hide edit buttons for Executives:

- Pass `user?.role` to `ActivitiesHeader`
- Set `showActions={false}` for Executives in `ObjectiveAccordion`
- Conditionally hide "Add Objective" and "Project Status" buttons for Executives

### 2. Overview Page - Hide Edit Button for Executives

#### 2.1 DashboardHeader.tsx (Lines 31-33)

Add optional `userRole` prop and hide "Edit Project" button when `userRole === "Executive"`

#### 2.2 DashboardLayout.tsx (Line 248-252)

Pass `user?.role` to `DashboardHeader` component

### 3. Projects Sidebar Footer - Fetch All Projects for Executives

#### 3.1 AppLayout.tsx (Lines 180-198)

Update `fetchProjects` function:

- **For Executives**: Fetch from `/api/projects/` endpoint (returns all projects per backend)
- **For Admin**: Fetch from `/api/projects/` endpoint (returns all projects)
- **For Project Staff**: Keep existing logic (fetch from `user.projects` array)

**Note**: Backend `/api/projects/` endpoint already filters projects by role:

- Executives: All projects (read-only)
- Admin: All projects (full access)
- Project Staff: Only assigned projects

## Implementation Notes

- Backend already enforces read-only access for Executives (only SAFE_METHODS)
- All changes are conditional logic based on user role
- No breaking changes expected