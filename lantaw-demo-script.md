# Lantaw System - Demo Script Guide

## Overview
This guide provides step-by-step instructions for creating screen recordings demonstrating all features of the Lantaw system for each user type.

**User Types:**
- **Admin** - Full system access with all permissions
- **Executive** - Read-only access to view all projects and data
- **Project Staff** - Can manage assigned projects, submit change requests for approval

---

## Recording Order Recommendation

**Recommended Sequence:**
1. **Project Staff** (most common user, shows core workflow)
2. **Executive** (shows read-only monitoring capabilities)
3. **Admin** (shows full administrative features)

---

# DEMO 1: PROJECT STAFF USER

## Pre-Recording Setup
- [ ] Ensure you have a Project Staff account logged in
- [ ] Ensure at least one project is assigned to this user
- [ ] Have sample data ready (objectives, activities, personnel, budget items)

## Recording Flow

### 1. Login & Initial Overview (30 seconds)
**Actions:**
- Show login page
- Log in with Project Staff credentials
- Navigate to Overview/Dashboard page
- **Highlight:** Project selection in sidebar (only shows assigned projects)
- **Highlight:** Dashboard shows project summary cards:
  - Project Duration
  - Objectives Completed
  - Budget Utilized
  - Remaining Budget

**What to Say:**
> "As a Project Staff member, I can see all projects assigned to me. The dashboard provides a comprehensive overview of project status, budget utilization, and progress."

---

### 2. Dashboard Features (1-2 minutes)
**Actions:**
- Show project information header (name, leader, description)
- **Note:** Edit Project button should be visible (but will require change request)
- Scroll through dashboard cards
- Click on Budget Distribution pie chart
- Show drill-down into budget categories (PS, MOOE, CO)
- Show Expense Comparison bar chart
- Expand Objectives Overview accordion
- Show activities within objectives

**What to Say:**
> "The dashboard provides visual insights into budget distribution and expense comparisons. I can drill down into specific budget categories and view all objectives and their associated activities."

---

### 3. Activities Module (3-4 minutes)
**Navigate to:** Activities (sidebar menu)

**Actions:**
- Show Activities page with filters
- Demonstrate filtering by:
  - Status (All, Pending, In Progress, Completed)
  - Budget Category (All, PS, MOOE, CO)
- **Create New Objective:**
  - Click "Add Objective" button
  - Fill in title and description
  - **Important:** Show that this creates a CHANGE REQUEST (not direct creation)
  - Submit change request with description
  - Show confirmation
- **View Existing Objectives:**
  - Expand an objective accordion
  - Show activities within objective
  - Show activity details (status, expenses, budget item)
- **Add Activity to Objective:**
  - Click "Add Activity" within an objective
  - Fill in activity form:
    - Title
    - Status (Pending, In Progress, Completed)
    - Projected Expense
    - Actual Expense
    - Budget Item (PS, MOOE, CO)
  - **Note:** Activity creation also requires change request
  - Submit change request
- **Edit Activity:**
  - Click edit icon on an activity
  - Modify fields
  - Submit change request
- **Add Expense to Activity:**
  - Click "Add Expense" button
  - Enter expense amount
  - Submit change request
- **Delete Activity:**
  - Show delete option
  - **Note:** Requires change request
- **Project Status Update:**
  - Click "Project Status" button
  - Show status options (Active, On Hold, Completed)
  - **Note:** Requires change request

**What to Say:**
> "Project Staff can create and manage objectives and activities, but all changes require approval through the change request system. This ensures proper oversight and maintains data integrity."

---

### 4. Personnel Module (3-4 minutes)
**Navigate to:** Personnel (sidebar menu)

**Actions:**
- Show Personnel page with filters
- Demonstrate filtering by:
  - Role
  - Department
  - Employment Status (Active, Inactive, Terminated)
- **Create Role:**
  - Click "Add Role" button
  - Enter role name
  - **Note:** Requires change request
  - Submit change request
- **Create Department:**
  - Click "Add Department" button
  - Enter department name
  - **Note:** Requires change request
  - Submit change request
- **Add Personnel:**
  - Click "Add Personnel" button
  - Fill in form:
    - First Name
    - Last Name
    - Role (select or create new)
    - Department (select or create new)
    - Employment Status
  - **Note:** Requires change request
  - Submit change request
- **View Personnel Details:**
  - Expand personnel accordion
  - Show compensation information
  - Show assigned budget items
- **Add/Edit Compensation:**
  - Click "Add Compensation" or edit existing
  - Fill in:
    - Budget Item (PS, MOOE, CO)
    - Amount
    - Start Date
    - End Date
  - **Note:** Requires change request
- **Delete Personnel:**
  - Show delete option
  - **Note:** Requires change request

**What to Say:**
> "The Personnel module allows me to manage team members, their roles, departments, and compensation. All personnel changes go through the approval workflow to ensure proper documentation."

---

### 5. Change Requests Module (2-3 minutes)
**Navigate to:** Change Requests (sidebar menu)

**Actions:**
- Show Change Requests list page
- Demonstrate filters:
  - Status (Pending, Approved, Rejected, Canceled)
  - Change Type (Activity, Objective, Personnel, Budget, Compensation, Project, Role, Department)
  - Operation (Create, Update, Delete)
- **View Change Request Details:**
  - Click on a pending change request
  - Show detailed view:
    - Change type and operation
    - Current state vs Proposed changes
    - Description
    - Submission date
  - Show "Cancel Request" option
- **Cancel Change Request:**
  - Click "Cancel Request"
  - Enter cancellation reason
  - Confirm cancellation
- **View Approved/Rejected Requests:**
  - Filter by Approved status
  - Show approved change requests
  - Filter by Rejected status
  - Show rejected requests with rejection reasons

**What to Say:**
> "The Change Requests module shows all my submitted requests. I can track their status, view details, and cancel requests if needed. This provides transparency in the approval process."

---

### 6. Profile Page (30 seconds)
**Navigate to:** Profile (sidebar menu)

**Actions:**
- Show user profile information:
  - Name
  - Email
  - Role
  - Account Status
  - Date Joined
  - Last Login
- Show assigned projects list

**What to Say:**
> "My profile shows my account information and the projects I'm assigned to."

---

### 7. Project Selection (30 seconds)
**Actions:**
- Click on Projects section in sidebar footer
- Show project list
- Switch between different assigned projects
- Show how dashboard and modules update based on selected project

**What to Say:**
> "I can switch between my assigned projects, and all modules update to show data for the selected project."

---

**Total Time Estimate:** 10-15 minutes

---

# DEMO 2: EXECUTIVE USER

## Pre-Recording Setup
- [ ] Ensure you have an Executive account logged in
- [ ] Ensure multiple projects exist in the system
- [ ] Have data across different projects ready

## Recording Flow

### 1. Login & Overview (1 minute)
**Actions:**
- Show login page
- Log in with Executive credentials
- Navigate to Overview/Dashboard
- **Highlight:** Executive sees ALL projects (not just assigned ones)
- Show project selection dropdown with multiple projects
- **Important:** Note that financial values may be hidden (if configured)

**What to Say:**
> "As an Executive, I have read-only access to view all projects across the organization. This allows me to monitor progress and performance without making changes."

---

### 2. Dashboard - Read-Only View (2 minutes)
**Actions:**
- Select different projects from sidebar
- Show dashboard for each project
- **Highlight:** No "Edit Project" button visible
- Show all summary cards:
  - Project Duration
  - Objectives Completed
  - Budget Utilized (may show masked values)
  - Remaining Budget (may show masked values)
- Interact with charts:
  - Budget Distribution pie chart
  - Expense Comparison bar chart
- Expand Objectives Overview
- Show activities (read-only)

**What to Say:**
> "The dashboard provides comprehensive insights into project status, budget utilization, and progress. As an Executive, I can view all this information but cannot make edits."

---

### 3. Activities Module - Read-Only (2 minutes)
**Navigate to:** Activities

**Actions:**
- Show Activities page
- **Highlight:** No "Add Objective" or "Add Activity" buttons visible
- Use filters to view activities:
  - Filter by Status
  - Filter by Budget Category
- Expand objectives to view activities
- Show activity details (read-only)
- **Note:** Cannot edit, delete, or create

**What to Say:**
> "I can view all objectives and activities across projects, filter them, and see detailed information. However, I cannot create, edit, or delete any activities."

---

### 4. Personnel Module - Read-Only (2 minutes)
**Navigate to:** Personnel

**Actions:**
- Show Personnel page
- **Highlight:** No "Add Personnel", "Add Role", or "Add Department" buttons
- Use filters:
  - Filter by Role
  - Filter by Department
  - Filter by Employment Status
- Expand personnel accordions
- View compensation information (read-only)
- View assigned budget items

**What to Say:**
> "I can view all personnel information, their roles, departments, and compensation details. This helps me understand team composition across projects."

---

### 5. Change Requests - Not Accessible (30 seconds)
**Actions:**
- **Highlight:** Change Requests menu item is NOT visible in sidebar
- Try to navigate to `/change-requests` (if possible)
- Show that access is restricted

**What to Say:**
> "Executives do not have access to the Change Requests module, as they have read-only access to the system."

---

### 6. Profile Page (30 seconds)
**Navigate to:** Profile

**Actions:**
- Show profile information
- **Note:** Shows all projects (not just assigned ones, since Executive sees all)

**What to Say:**
> "My profile shows my account information. As an Executive, I can view all projects in the system."

---

**Total Time Estimate:** 8-10 minutes

---

# DEMO 3: ADMIN USER

## Pre-Recording Setup
- [ ] Ensure you have an Admin account logged in
- [ ] Have multiple projects ready
- [ ] Have pending change requests from Project Staff ready for approval

## Recording Flow

### 1. Login & Overview (1 minute)
**Actions:**
- Show login page
- Log in with Admin credentials
- Navigate to Overview/Dashboard
- **Highlight:** Admin sees ALL projects
- Show "Create Project" button in sidebar footer

**What to Say:**
> "As an Admin, I have full access to all system features and can manage all projects across the organization."

---

### 2. Create New Project (2 minutes)
**Actions:**
- Click "Create Project" button in sidebar footer
- Fill in project creation form:
  - Project Name
  - Project Leader (required)
  - Description
  - Start Date
  - End Date
  - Total Grant Amount
  - Project Staff Email (must exist in system)
- Submit project creation
- Show new project appears in sidebar
- Select the new project
- Show empty dashboard (new project)

**What to Say:**
> "Admins can create new projects and assign Project Staff members. The system validates that the staff member exists before creating the project."

---

### 3. Edit Project (1 minute)
**Actions:**
- Select a project
- Click "Edit Project" button in dashboard header
- Modify project fields:
  - Change project name
  - Update dates
  - Modify grant amount
- Save changes directly (no change request needed)
- Show updated information

**What to Say:**
> "Unlike Project Staff, Admins can directly edit project information without requiring approval."

---

### 4. Dashboard Features (2 minutes)
**Actions:**
- Show all dashboard features
- Interact with charts
- Show project metrics
- Demonstrate project status management

**What to Say:**
> "The dashboard provides comprehensive project insights and metrics."

---

### 5. Activities Module - Full Access (3-4 minutes)
**Navigate to:** Activities

**Actions:**
- Show Activities page
- **Create Objective:**
  - Click "Add Objective"
  - Fill in form
  - **Important:** Admin creates directly (no change request)
  - Show objective appears immediately
- **Create Activity:**
  - Add activity to objective
  - Fill in all fields
  - Create directly (no change request)
- **Edit Objective:**
  - Edit an objective
  - Save directly
- **Edit Activity:**
  - Edit activity details
  - Save directly
- **Delete Objective/Activity:**
  - Show delete functionality
  - Delete directly
- **Add Expenses:**
  - Add expenses to activities
  - Update directly
- **Update Project Status:**
  - Change project status
  - Update directly

**What to Say:**
> "Admins have full CRUD capabilities for objectives and activities. Changes are applied immediately without requiring approval."

---

### 6. Personnel Module - Full Access (3-4 minutes)
**Navigate to:** Personnel

**Actions:**
- **Create Role:**
  - Add new role
  - Create directly
- **Create Department:**
  - Add new department
  - Create directly
- **Add Personnel:**
  - Add new personnel member
  - Assign role and department
  - Create directly
- **Edit Personnel:**
  - Modify personnel information
  - Update directly
- **Manage Compensation:**
  - Add/edit compensation
  - Link to budget items
  - Save directly
- **Delete Personnel:**
  - Show delete functionality
  - Delete directly

**What to Say:**
> "Admins can fully manage personnel, roles, departments, and compensation without requiring approval."

---

### 7. Change Requests - Approval Workflow (4-5 minutes)
**Navigate to:** Change Requests

**Actions:**
- Show Change Requests page
- **View All Change Requests:**
  - Show list of all change requests across all projects
  - Use filters:
    - Filter by Project
    - Filter by Status
    - Filter by Change Type
    - Filter by Operation
- **Review Pending Change Request:**
  - Click on a pending request
  - Show detailed view:
    - Submitted by (Project Staff member)
    - Change type and operation
    - Current state vs Proposed changes
    - Description
    - Submission date
- **Approve Change Request:**
  - Click "Approve" button
  - Review proposed changes
  - Add approval notes (optional)
  - Confirm approval
  - Show success message
  - Show request status changes to "Approved"
  - **Verify:** Check that the change was applied in the relevant module
- **Reject Change Request:**
  - Click on another pending request
  - Click "Reject" button
  - Enter rejection reason (required)
  - Confirm rejection
  - Show request status changes to "Rejected"
- **View Approved/Rejected Requests:**
  - Filter by Approved
  - Show approved requests with approver information
  - Filter by Rejected
  - Show rejected requests with rejection reasons
- **Cancel Change Request:**
  - Show that Admin can cancel requests (if applicable)
  - Or note that only submitter can cancel

**What to Say:**
> "The Change Requests module is central to Admin workflow. I review all requests submitted by Project Staff, compare current and proposed states, and approve or reject them. Approved changes are automatically applied to the system."

---

### 8. Budget Management (2 minutes)
**Note:** Budget items are typically created through other modules, but show:
- View budget line items (PS, MOOE, CO)
- View compensation linked to budget items
- Show budget utilization across projects

**What to Say:**
> "I can view and manage budget information across all projects, ensuring proper financial oversight."

---

### 9. Profile & User Management (1 minute)
**Navigate to:** Profile

**Actions:**
- Show admin profile
- **Note:** Mention that Admins can manage users (if there's a user management interface)
- Show all projects visible

**What to Say:**
> "As an Admin, I have access to all projects and can manage system users and configurations."

---

### 10. Cross-Project Management (1 minute)
**Actions:**
- Switch between different projects
- Show how Admin can manage multiple projects
- Show consistency of features across projects

**What to Say:**
> "I can seamlessly switch between projects and manage them all from a single interface."

---

**Total Time Estimate:** 20-25 minutes

---

## GENERAL RECORDING TIPS

### Before Recording:
1. **Prepare Test Data:**
   - Create sample projects with various statuses
   - Add objectives and activities
   - Add personnel with different roles
   - Create some pending change requests

2. **Browser Setup:**
   - Use clean browser window
   - Set appropriate zoom level (100%)
   - Use high resolution (1920x1080 recommended)
   - Clear browser cache

3. **Screen Recording Software:**
   - Use OBS Studio, Camtasia, or similar
   - Record at 1080p minimum
   - Include system audio if narrating
   - Use clear, professional narration

### During Recording:
1. **Pacing:**
   - Move at a comfortable pace
   - Pause briefly after major actions
   - Allow UI animations to complete

2. **Highlighting:**
   - Use cursor movements to highlight important elements
   - Briefly hover over buttons before clicking
   - Show tooltips when helpful

3. **Error Handling:**
   - If errors occur, show them briefly
   - Then demonstrate correct usage
   - Don't spend too much time on errors

4. **Transitions:**
   - Smoothly transition between modules
   - Mention what you're navigating to
   - Show loading states when appropriate

### Post-Recording:
1. **Editing:**
   - Trim unnecessary pauses
   - Add text overlays for key points
   - Add intro/outro slides
   - Include chapter markers for easy navigation

2. **Export:**
   - Export in high quality (1080p minimum)
   - Use appropriate format (MP4 recommended)
   - Consider creating separate videos per user type

---

## FEATURE CHECKLIST

Use this checklist to ensure all features are demonstrated:

### Project Staff:
- [x] Login and project selection
- [x] Dashboard overview
- [x] Create Objective (via change request)
- [x] Create Activity (via change request)
- [x] Edit Activity (via change request)
- [x] Add Expense (via change request)
- [x] Add Personnel (via change request)
- [x] Add Role/Department (via change request)
- [x] Add Compensation (via change request)
- [x] View Change Requests
- [x] Cancel Change Request
- [x] Filter and search features
- [x] Profile page

### Executive:
- [x] Login and view all projects
- [x] Dashboard (read-only)
- [x] View Activities (read-only)
- [x] View Personnel (read-only)
- [x] No Change Requests access
- [x] Profile page

### Admin:
- [x] Login and view all projects
- [x] Create Project
- [x] Edit Project (direct)
- [x] Dashboard features
- [x] Create Objective (direct)
- [x] Create Activity (direct)
- [x] Edit/Delete Activities (direct)
- [x] Add Personnel (direct)
- [x] Add Role/Department (direct)
- [x] Manage Compensation (direct)
- [x] Approve Change Requests
- [x] Reject Change Requests
- [x] View all Change Requests
- [x] Filter Change Requests
- [x] Profile page

---

## SCRIPT NOTES

### Key Points to Emphasize:
1. **Change Request Workflow:** This is a key differentiator - Project Staff must request changes, Admins approve them
2. **Role-Based Access:** Different user types see different features and have different permissions
3. **Project Context:** All modules are project-specific - select a project first
4. **Data Integrity:** Change requests ensure proper oversight and documentation
5. **Comprehensive Views:** Executives can monitor all projects without making changes

### Common Scenarios to Demonstrate:
1. **Project Staff workflow:** Create objective → Add activities → Submit change request → Wait for approval
2. **Admin workflow:** Review change request → Compare changes → Approve → Verify changes applied
3. **Executive monitoring:** View multiple projects → Compare metrics → Review progress

---

## END OF SCRIPT

Good luck with your recordings! Remember to:
- Practice the flow before recording
- Keep narration clear and professional
- Highlight key features and differences between user types
- Show real-world usage scenarios