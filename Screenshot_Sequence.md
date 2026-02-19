# Lantaw Screenshot Sequence Guide

This document provides a comprehensive list of all screenshots to be captured for each user type in the Lantaw Project Management System.

---

## Public (Landing Page/Home Page)

### Pages
1. **Landing Page**
   - Public landing page with navigation
   - Login/Register buttons
   - Project information/public projects link

2. **Login Page**
   - Email and password input fields
   - Login button
   - Link to register (if applicable)

3. **Public Projects Page** (if applicable)
   - List of public projects
   - Project details view

---

## Project Staff

### Main Pages

#### 1. Dashboard/Overview Page
   - Project information header (with "Edit Project" button visible)
   - Summary cards (Project Duration, Objectives Completed, Budget Utilized, Remaining Budget)
   - Budget Distribution Pie Chart
   - Expense Comparison Bar Chart
   - Objectives Overview Accordion

#### 2. Activities Page
   - Objectives and activities list
   - "Add Objective" button
   - "Add Activity" button (within objective accordion)
   - "Project Status" button
   - Activity cards with status, expenses, budget items
   - Filter options (Status, Budget Category)

#### 3. Personnel Page
   - Personnel list with accordions
   - "Add Personnel" button
   - "Add Role" button
   - "Add Department" button
   - Personnel cards showing role, department, employment status
   - Compensation details within personnel accordions
   - Filter options (Role, Department, Employment Status)

#### 4. Change Requests Page
   - List of all submitted change requests
   - Status badges (PENDING, APPROVED, REJECTED, CANCELED)
   - Filter options (Status, Change Type, Operation, Project)
   - Change request cards with details

#### 5. Analytics Page
   - Analytics dashboard (if separate from Overview)
   - Charts and visualizations

#### 6. History Log Page
   - History log entries
   - Filter options
   - Audit trail information

#### 7. Profile Page
   - User information (Name, Email, Role, Account Status)
   - Assigned projects list
   - "Edit Profile" button
   - "Change Password" button

### Modals

#### Activities Modals
1. **Create Objective Modal** (Change Request)
   - Title field
   - Description field
   - Change request description field
   - Submit button

2. **Create Activity Modal** (Direct Creation)
   - Title field
   - Status dropdown (PENDING, IN_PROGRESS, COMPLETED)
   - Projected Expense field
   - Actual Expense field
   - Budget Item dropdown (PS, MOOE, CO)
   - Submit button

3. **Edit Activity Modal**
   - Pre-populated fields (same as Create Activity)
   - Update button

4. **Add Expense Modal**
   - Expense amount input
   - Submit button

5. **Edit Objective Modal** (Change Request)
   - Pre-populated title and description
   - Change request description field
   - Submit button

#### Personnel Modals
6. **Add Role Modal** (Change Request)
   - Role name field
   - Change request description field
   - Submit button

7. **Add Department Modal** (Change Request)
   - Department name field
   - Change request description field
   - Submit button

8. **Add Personnel Modal** (Change Request)
   - First Name field
   - Last Name field
   - Role dropdown
   - Department dropdown
   - Employment Status dropdown (ACTIVE, INACTIVE, TERMINATED)
   - Change request description field
   - Submit button

9. **Edit Personnel Modal** (Change Request)
   - Pre-populated personnel fields
   - Change request description field
   - Submit button

10. **Add Compensation Modal** (Change Request)
    - Type dropdown (Salary, Honoraria)
    - Budget Item dropdown (PS, MOOE, CO)
    - Amount field
    - Date Effective field
    - Reason field
    - Change request description field
    - Submit button

11. **Edit Compensation Modal** (Change Request)
    - Pre-populated compensation fields
    - Change request description field
    - Submit button

#### Change Request Modals
12. **Change Request Detail View Modal**
    - Change request overview (Type, Operation, Status)
    - Description
    - Current State (for UPDATE/DELETE)
    - Proposed Changes
    - Field comparison highlighting
    - Status information (Approver, Date, Rejection Reason if applicable)
    - "Cancel Request" button (for PENDING requests)

13. **Cancel Change Request Modal**
    - Cancellation reason field
    - Confirm button

#### Project Modals
14. **Edit Project Modal** (Change Request)
    - Project Name field
    - Project Leader field
    - Description field
    - Start Date field
    - End Date field
    - Total Grant Amount field
    - Project Status dropdown
    - Change request description field
    - Submit button

#### Profile Modals
15. **Edit Profile Modal**
    - First Name field
    - Last Name field
    - Save button

16. **Change Password Modal**
    - Current Password field
    - New Password field
    - Confirm New Password field
    - Submit button

---

## Executive

### Main Pages

#### 1. Dashboard/Overview Page (Read-Only)
   - Project information header (NO "Edit Project" button)
   - Summary cards (Project Duration, Objectives Completed, Budget Utilized, Remaining Budget)
   - Budget Distribution Pie Chart (may show masked values)
   - Expense Comparison Bar Chart (may show masked values)
   - Objectives Overview Accordion (read-only)

#### 2. Activities Page (Read-Only)
   - Objectives and activities list
   - NO action buttons visible
   - Activity cards showing status, expenses (may be masked), budget items
   - Filter options (Status, Budget Category)
   - Read-only view

#### 3. Personnel Page (Read-Only)
   - Personnel list with accordions
   - NO action buttons visible
   - Personnel cards showing role, department, employment status
   - Compensation details (may show masked values)
   - Filter options (Role, Department, Employment Status)
   - Read-only view

#### 4. Analytics Page (Read-Only)
   - Analytics dashboard
   - Charts and visualizations (may show masked values)
   - Read-only view

#### 5. History Log Page (Read-Only)
   - History log entries
   - Filter options
   - Audit trail information
   - Read-only view

#### 6. Profile Page
   - User information (Name, Email, Role, Account Status)
   - All projects list (not just assigned)
   - "Edit Profile" button (if applicable)
   - "Change Password" button (if applicable)

### Project Selection
7. **Project Selection Sidebar**
   - All projects listed in sidebar footer
   - Project selection dropdown/list
   - Shows all projects in system (not limited to assignments)

---

## Admin

### Main Pages

#### 1. Dashboard/Overview Page
   - Project information header (with "Edit Project" button)
   - Summary cards (Project Duration, Objectives Completed, Budget Utilized, Remaining Budget)
   - Budget Distribution Pie Chart (clickable for drill-down)
   - Expense Comparison Bar Chart
   - Objectives Overview Accordion (with edit/delete options)

#### 2. Activities Page
   - Objectives and activities list
   - "Add Objective" button
   - "Add Activity" button (within objective accordion)
   - "Project Status" button
   - Activity cards with edit/delete options
   - Filter options (Status, Budget Category)

#### 3. Personnel Page
   - Personnel list with accordions
   - "Add Personnel" button
   - "Add Role" button
   - "Add Department" button
   - Personnel cards with edit/delete options
   - Compensation details with edit/delete options
   - Filter options (Role, Department, Employment Status)

#### 4. Change Requests Page (Approval View)
   - List of ALL change requests (across all projects)
   - Status badges
   - Filter options (Project, Status, Change Type, Operation, Submitted By)
   - Change request cards
   - Approve/Reject buttons visible

#### 5. Analytics Page
   - Analytics dashboard
   - Charts and visualizations
   - Budget category breakdowns

#### 6. History Log Page
   - History log entries
   - Filter options
   - Complete audit trail
   - Detailed change information

#### 7. Profile Page
   - User information (Name, Email, Role, Account Status)
   - All projects list
   - "Edit Profile" button
   - "Change Password" button

### Modals

#### Project Modals
1. **Create Project Modal**
   - Project Name field
   - Project Leader field
   - Description field
   - Start Date field
   - End Date field
   - Total Grant Amount field
   - Project Staff Email field
   - Create button

2. **Edit Project Modal** (Direct Edit)
   - Pre-populated project fields
   - Project Status dropdown
   - Save button (immediate update, no change request)

#### Activities Modals
3. **Create Objective Modal** (Direct Creation)
   - Title field
   - Description field
   - Create button (immediate creation)

4. **Create Activity Modal** (Direct Creation)
   - Title field
   - Status dropdown
   - Projected Expense field
   - Actual Expense field
   - Budget Item dropdown
   - Create button (immediate creation)

5. **Edit Activity Modal** (Direct Edit)
   - Pre-populated fields
   - Update button (immediate update)

6. **Add Expense Modal**
   - Expense amount input
   - Submit button

7. **Edit Objective Modal** (Direct Edit)
   - Pre-populated title and description
   - Update button (immediate update)

8. **Delete Confirmation Modals**
   - Delete Objective confirmation
   - Delete Activity confirmation

#### Personnel Modals
9. **Create Role Modal** (Direct Creation)
   - Role name field
   - Create button (immediate creation)

10. **Create Department Modal** (Direct Creation)
    - Department name field
    - Create button (immediate creation)

11. **Add Personnel Modal** (Direct Creation)
    - First Name field
    - Last Name field
    - Role dropdown
    - Department dropdown
    - Employment Status dropdown
    - Create button (immediate creation)

12. **Edit Personnel Modal** (Direct Edit)
    - Pre-populated personnel fields
    - Update button (immediate update)

13. **Add Compensation Modal** (Direct Creation)
    - Type dropdown (Salary, Honoraria)
    - Budget Item dropdown
    - Amount field
    - Date Effective field
    - Reason field
    - Create button (immediate creation)

14. **Edit Compensation Modal** (Direct Edit)
    - Pre-populated compensation fields
    - Update button (immediate update)

15. **Delete Confirmation Modals**
    - Delete Personnel confirmation
    - Delete Role confirmation
    - Delete Department confirmation
    - Delete Compensation confirmation

#### Change Request Modals
16. **Change Request Detail View Modal** (Admin Approval View)
    - Change request overview
    - Description
    - Current State vs Proposed Changes comparison
    - Field highlighting
    - "Approve" button
    - "Reject" button

17. **Approve Change Request Modal**
    - Confirmation message
    - Preview of changes to be applied
    - Approve button

18. **Reject Change Request Modal**
    - Rejection reason field (required)
    - Reject button

#### Budget Modals
19. **Budget Category Breakdown Modal**
    - PS Breakdown (personnel compensation details)
    - MOOE Breakdown (activities linked to MOOE)
    - CO Breakdown (activities linked to CO)

#### Profile Modals
20. **Edit Profile Modal**
    - First Name field
    - Last Name field
    - Save button

21. **Change Password Modal**
    - Current Password field
    - New Password field
    - Confirm New Password field
    - Submit button

---

## Screenshot Sequence Summary

### Total Screenshots by User Type:
- **Public**: 2-3 pages
- **Project Staff**: 7 pages + 16 modals = 23 screenshots
- **Executive**: 6 pages = 6 screenshots
- **Admin**: 7 pages + 21 modals = 28 screenshots

### Recommended Screenshot Order:

1. **Start with Public Pages**
   - Landing Page
   - Login Page
   - Public Projects (if applicable)

2. **Project Staff Flow**
   - Login → Dashboard → Activities → Personnel → Change Requests → Analytics → History Log → Profile
   - Capture modals as they appear in the workflow

3. **Executive Flow**
   - Login → Dashboard → Activities → Personnel → Analytics → History Log → Profile
   - Focus on read-only aspects and masked values

4. **Admin Flow**
   - Login → Dashboard → Activities → Personnel → Change Requests (with approval) → Analytics → History Log → Profile
   - Capture all modals showing direct creation/editing capabilities

### Notes for Screenshots:
- Ensure all screenshots show the full page/modal
- Capture different states (empty, populated, filtered)
- Show both desktop and mobile views if applicable
- Include error states and validation messages
- Capture loading states if relevant
- Show before/after states for change requests
- Include tooltips and help text where visible

---

## Additional Considerations

### States to Capture:
- Empty states (no data)
- Populated states (with sample data)
- Loading states
- Error states
- Success messages
- Validation errors
- Filtered views
- Search results

### Interactions to Document:
- Hover states
- Active/selected states
- Expanded/collapsed accordions
- Open/closed modals
- Dropdown menus
- Tooltips

### Special Views:
- Budget drill-down views
- Change request comparison views
- History log detail views
- Project selection dropdown
- Sidebar navigation states

