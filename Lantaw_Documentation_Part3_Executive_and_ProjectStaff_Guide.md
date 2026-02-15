# Lantaw Project Management System - Documentation (Part 3)

## Contents

2.4.2 Executive . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1

2.4.2.1 Viewing All Projects . . . . . . . . . . . . . . . . . . . . . . . . . . 1

2.4.2.2 Dashboard Overview . . . . . . . . . . . . . . . . . . . . . . . . . . . 2

2.4.2.3 Viewing Activities . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

2.4.2.4 Viewing Personnel . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4

2.4.3 Project Staff . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5

2.4.3.1 Project Selection and Dashboard . . . . . . . . . . . . . . . . . . . 5

2.4.3.2 Creating Objectives and Activities . . . . . . . . . . . . . . . . . . 6

2.4.3.3 Managing Activities . . . . . . . . . . . . . . . . . . . . . . . . . . 8

2.4.3.4 Managing Personnel . . . . . . . . . . . . . . . . . . . . . . . . . . 9

2.4.3.5 Managing Compensation . . . . . . . . . . . . . . . . . . . . . . . . 11

2.4.3.6 Change Request Management . . . . . . . . . . . . . . . . . . . . . . . 12

2.4.3.7 Profile Management . . . . . . . . . . . . . . . . . . . . . . . . . . 14

---

## 2.4.2 Executive

Executives have read-only access to all projects in the system, allowing them to monitor project progress, budget utilization, and team composition without the ability to make modifications. This role is designed for stakeholders who need visibility into project status for reporting and decision-making purposes.

**Key Characteristics:**
- Read-only access to all projects (not limited to assigned projects)
- No edit, create, or delete capabilities
- No access to change request management
- Financial values may be masked based on configuration
- Full visibility into project data for monitoring purposes

Figure 28: Executive Dashboard

### 2.4.2.1 Viewing All Projects

Executives can view and access all projects in the system, regardless of project assignments. This provides comprehensive visibility across the organization.

**Access:** Available through the project selector in the sidebar footer, which displays all projects in the system.

**Project Selection:**
- The sidebar footer shows a "Projects" section listing all available projects
- Executives can click on any project to switch context
- The project list is fetched from `/api/projects/` endpoint, which returns all projects for Executive users
- Projects are displayed with their names and can be filtered/searched if the list is long

**Project Information:**
When a project is selected, Executives can view:
- Project name, leader, and description
- Project status (ACTIVE, COMPLETED, ON_HOLD)
- Project timeline (start and end dates)
- Total grant amount (may be masked)
- All associated data (objectives, activities, personnel, budget)

**Methods:**
The frontend fetches projects from `/api/projects/` endpoint. The backend automatically filters based on user role:
- **Executives**: Receive all projects (read-only access)
- **Project Staff**: Receive only assigned projects
- **Admins**: Receive all projects (full access)

The project list updates automatically when new projects are created by Admins.

**Key Features:**
- View all projects in the system
- Switch between projects seamlessly
- Access comprehensive project information
- No restrictions on which projects can be viewed

Figure 29: Project Selection Sidebar

### 2.4.2.2 Dashboard Overview

The Executive dashboard provides a comprehensive read-only view of project metrics, budget information, and progress tracking.

**Access:** Available as the default landing page after login, accessible through "Overview" in the sidebar.

**Dashboard Components (Read-Only):**

**1. Project Information Header:**
- Project name, leader, and description
- **Note**: No "Edit Project" button is visible (Executives cannot edit projects)
- Displays current project context

**2. Summary Cards:**
- **Project Duration**: Calculated from start and end dates
- **Objectives Completed**: Count of completed objectives vs total objectives
- **Budget Utilized**: Total actual expenses (may show masked values if configured)
- **Remaining Budget**: Total grant amount minus budget utilized (may show masked values)

**3. Budget Distribution Chart:**
- Visual representation of budget allocation across PS, MOOE, and CO
- Shows percentage distribution
- Clickable sections for drill-down (read-only view)
- Financial values may be masked based on system configuration

**4. Expense Comparison Chart:**
- Compares projected vs actual expenses by category
- Read-only view of expense data
- Financial values may be masked

**5. Objectives Overview:**
- Expandable accordion showing all objectives and activities
- Read-only view of:
  - Objective titles and descriptions
  - Activity status and details
  - Expense information (may be masked)
- No edit or delete options visible

**Methods:**
The dashboard uses the same data fetching mechanisms as Admin/Project Staff dashboards, but:
- All edit buttons and action items are hidden
- Financial values may be masked in the UI based on configuration
- Data is fetched from the same API endpoints with read-only permissions enforced by the backend

**Key Features:**
- Comprehensive project overview
- Budget and expense visualization (read-only)
- Progress tracking and monitoring
- Cross-project navigation
- No modification capabilities

**Financial Value Masking:**
If configured, the system can mask financial values for Executive users, showing "---" or similar placeholders instead of actual amounts. This allows Executives to see budget distribution percentages and trends without exposing specific financial details.

Figure 30: Executive Dashboard (Read-Only)

Figure 31: Budget Chart with Masked Values

### 2.4.2.3 Viewing Activities

Executives can view all objectives and activities across projects in read-only mode, providing visibility into project progress and work breakdown.

**Access:** Available through the "Activities" menu item in the sidebar.

**Activities Page Features:**
- **No Action Buttons**: "Add Objective", "Add Activity", and "Project Status" buttons are not visible
- **Filtering**: Can filter activities by:
  - Status (All, Pending, In Progress, Completed)
  - Budget Category (All, PS, MOOE, CO)
- **Objectives Display**: All objectives are shown in expandable accordions
- **Activities Display**: Activities within objectives show:
  - Title and status
  - Projected and actual expenses (may be masked)
  - Budget item category
  - Creation and modification dates
- **Read-Only View**: No edit, delete, or create capabilities

**Methods:**
The Activities page fetches data from `/api/projects/{id}/objectives/` endpoint, which includes nested activities. The backend enforces read-only access for Executive users:
- Only SAFE_METHODS (GET, HEAD, OPTIONS) are allowed
- All write operations (POST, PUT, DELETE) are blocked

The frontend conditionally hides all action buttons and edit controls based on user role, ensuring Executives cannot attempt to modify data.

**Key Features:**
- View all objectives and activities
- Filter by status and budget category
- See activity details and expenses
- Monitor project progress
- No modification capabilities

Figure 32: Executive Activities Page (Read-Only)

### 2.4.2.4 Viewing Personnel

Executives can view all personnel information, roles, departments, and compensation details in read-only mode.

**Access:** Available through the "Personnel" menu item in the sidebar.

**Personnel Page Features:**
- **No Action Buttons**: "Add Personnel", "Add Role", and "Add Department" buttons are not visible
- **Filtering**: Can filter personnel by:
  - Role
  - Department
  - Employment Status (Active, Inactive, Terminated)
- **Personnel Display**: All personnel are shown in expandable accordions displaying:
  - Name, role, and department
  - Employment status
  - Compensation details (may show masked values)
  - Assigned budget items
- **Read-Only View**: No edit, delete, or create capabilities

**Methods:**
The Personnel page fetches data from:
- `/api/projects/{id}/personnel/` - Personnel list
- `/api/projects/{id}/roles/` - Available roles
- `/api/projects/{id}/departments/` - Available departments
- `/api/projects/{id}/compensations/` - Compensation details

The backend enforces read-only access, allowing only GET requests. The frontend hides all action buttons and edit controls for Executive users.

**Compensation Viewing:**
Executives can expand personnel accordions to view:
- Compensation type (Salary, Honoraria)
- Budget item association
- Amount (may be masked)
- Effective date
- Reason/description

**Key Features:**
- View all personnel and organizational structure
- See roles and departments
- View compensation details
- Filter by various criteria
- Monitor team composition
- No modification capabilities

**Change Requests Access:**
Executives do not have access to the Change Requests module. The menu item is not visible in the sidebar, and direct URL access is blocked by backend permissions.

Figure 33: Executive Personnel Page (Read-Only)

---

## 2.4.3 Project Staff

Project Staff members can manage projects assigned to them, but most modifications require approval through the change request workflow. This ensures proper oversight while allowing Project Staff to actively manage their projects.

**Key Characteristics:**
- Access limited to assigned projects only
- Can directly create, update, and delete activities (no change request needed)
- Must submit change requests for objectives, personnel, budget, and project modifications
- Can view and manage their own change requests
- Can cancel their own pending change requests
- Full access to dashboard and analytics for assigned projects

Figure 34: Project Staff Dashboard

### 2.4.3.1 Project Selection and Dashboard

Project Staff can view and manage only the projects assigned to them by Admins.

**Access:** Available through the project selector in the sidebar footer, which shows only assigned projects.

**Project Selection:**
- The sidebar footer shows a "Projects" section listing only projects where the user is a member
- Project Staff can click on any assigned project to switch context
- The project list is fetched from the user's `projects` array, which contains project IDs
- Projects are displayed with their names

**Dashboard Overview:**

The Project Staff dashboard provides the same comprehensive view as Admin dashboard, but with some limitations:

**1. Project Information Header:**
- Project name, leader, and description
- "Edit Project" button is visible but requires change request (see section 2.4.3.6)

**2. Summary Cards:**
- **Project Duration**: Calculated from start and end dates
- **Objectives Completed**: Count of completed objectives vs total objectives
- **Budget Utilized**: Total actual expenses across all budget categories
- **Remaining Budget**: Total grant amount minus budget utilized

**3. Budget Distribution Chart:**
- Visual representation of budget allocation
- Clickable sections for drill-down
- Same functionality as Admin view

**4. Expense Comparison Chart:**
- Compares projected vs actual expenses
- Full visibility into budget performance

**5. Objectives Overview:**
- Expandable accordion showing all objectives and activities
- Can view and interact with activities (direct editing allowed)
- Objectives require change requests for creation/modification

**Methods:**
The dashboard fetches data from the same API endpoints as Admin, but:
- Project list is filtered to show only assigned projects
- Backend enforces project membership validation
- Some operations trigger change request workflows instead of direct modifications

**Key Features:**
- View assigned projects only
- Comprehensive project overview
- Full budget and expense visibility
- Progress tracking
- Switch between assigned projects

Figure 35: Project Staff Project Selection

Figure 36: Project Staff Dashboard

### 2.4.3.2 Creating Objectives and Activities

Project Staff can create objectives and activities, but the workflow differs: activities can be created directly, while objectives require change requests.

**Creating Objectives (Requires Change Request):**

**Access:** Available through the "Add Objective" button in the Activities module.

**Objective Creation:**
- **Title**: Required text field for the objective title
- **Description**: Optional text area for objective description

**Methods:**
When Project Staff creates an objective:
1. The form is filled in with objective details
2. Instead of directly creating the objective, a change request is submitted
3. The frontend sends a POST request to `/api/projects/{project_id}/change-requests/` with:
   - `change_type`: "OBJECTIVE"
   - `operation`: "CREATE"
   - `proposed_changes`: { title, description }
   - `description`: User-provided explanation for the change request
4. The change request is created with status "PENDING"
5. The objective does not appear in the Activities page until the change request is approved by an Admin
6. The Project Staff member can track the change request status in the Change Requests module

**Creating Activities (Direct Creation):**

**Access:** Available through the "Add Activity" button within an objective accordion.

**Activity Creation Fields:**
- **Title**: Required text field for activity title
- **Status**: Dropdown selection (PENDING, IN_PROGRESS, COMPLETED) - defaults to PENDING
- **Projected Expense**: Optional decimal field for estimated cost
- **Actual Expense**: Optional decimal field for actual cost incurred
- **Budget Item**: Dropdown selection (PS, MOOE, CO) - links activity to a budget category

**Methods:**
When Project Staff creates an activity:
1. The form is filled in with activity details
2. The frontend sends a POST request directly to `/api/projects/{project_id}/objectives/{objective_id}/activities/`
3. The backend validates the data and creates the activity immediately
4. The activity appears in the Activities page under its parent objective
5. **No change request is required** - activities can be created, updated, and deleted directly by Project Staff

**Why Activities Don't Require Change Requests:**
Activities are considered operational-level changes that Project Staff should be able to manage directly. This allows for agile project management where activities can be added, modified, and tracked in real-time without waiting for approval.

**Editing Objectives (Requires Change Request):**

When Project Staff edits an objective:
1. The edit form is pre-populated with current objective data
2. Changes are made to the form
3. Instead of saving directly, a change request is submitted with:
   - `change_type`: "OBJECTIVE"
   - `operation`: "UPDATE"
   - `entity_id`: Objective ID
   - `current_state`: Current objective data (for comparison)
   - `proposed_changes`: Modified objective data
4. The change request is created with status "PENDING"
5. Changes are not applied until Admin approval

**Editing Activities (Direct Update):**

Project Staff can edit activities directly:
1. Click the edit icon on an activity card
2. Modify the activity details
3. Save changes - the frontend sends a PUT request directly to the activity endpoint
4. Changes are applied immediately
5. No change request required

**Deleting Objectives (Requires Change Request):**

Deleting objectives requires a change request with:
- `change_type`: "OBJECTIVE"
- `operation`: "DELETE"
- `entity_id`: Objective ID
- `current_state`: Current objective data

**Deleting Activities (Direct Delete):**

Project Staff can delete activities directly:
1. Click the delete icon on an activity card
2. Confirm deletion
3. The frontend sends a DELETE request directly to the activity endpoint
4. The activity is removed immediately
5. No change request required

**Key Differences:**
- **Objectives**: Require change requests for CREATE, UPDATE, DELETE
- **Activities**: Can be created, updated, and deleted directly
- **Workflow**: Objectives go through approval, activities are immediate

Figure 37: Create Objective (Change Request)

Figure 38: Create Activity (Direct)

Figure 39: Edit Activity (Direct)

### 2.4.3.3 Managing Activities

Project Staff have full direct control over activities, allowing real-time management of project work items.

**Activity Management Capabilities:**

**1. Creating Activities:**
- Can create activities directly under any objective
- No approval required
- Immediate appearance in the system

**2. Editing Activities:**
- Can modify all activity fields:
  - Title
  - Status (PENDING, IN_PROGRESS, COMPLETED)
  - Projected Expense
  - Actual Expense
  - Budget Item (PS, MOOE, CO)
- Changes are applied immediately
- No approval required

**3. Updating Activity Status:**
- Can change activity status to track progress
- Status changes are immediate
- Useful for real-time project tracking

**4. Adding Expenses to Activities:**
- Can add or update actual expenses directly
- "Add Expense" button opens a modal for expense entry
- Expenses are added to the activity's `actual_expense` field
- Updates are immediate and reflected in budget calculations

**5. Deleting Activities:**
- Can delete activities directly
- Deletion is immediate and permanent
- Associated expenses are removed

**6. Project Status Updates (Requires Change Request):**
- Can request project status changes (ACTIVE, COMPLETED, ON_HOLD)
- Requires change request submission
- Status: `change_type`: "PROJECT", `operation`: "UPDATE"

**Methods:**

**Direct Activity Operations:**
All activity operations use standard REST API endpoints:
- **Create**: `POST /api/projects/{project_id}/objectives/{objective_id}/activities/`
- **Update**: `PUT /api/projects/{project_id}/objectives/{objective_id}/activities/{activity_id}/`
- **Delete**: `DELETE /api/projects/{project_id}/objectives/{objective_id}/activities/{activity_id}/`

The backend validates:
- Project membership (user must be assigned to the project)
- Objective existence and project association
- Budget item validity
- Data format and constraints

**Expense Management:**
When adding expenses:
1. Click "Add Expense" on an activity card
2. Enter the expense amount
3. Submit - the frontend sends a PUT request updating the `actual_expense` field
4. Budget calculations automatically update
5. Dashboard charts reflect the new expense data

**Key Features:**
- Full CRUD capabilities for activities
- Real-time updates and immediate feedback
- Direct expense tracking
- Status management for progress tracking
- No approval delays for activity operations

**Best Practices:**
- Update activity status regularly to reflect current progress
- Add actual expenses as they are incurred for accurate budget tracking
- Link activities to appropriate budget items (PS, MOOE, CO) for proper categorization
- Use projected expenses for planning and actual expenses for tracking

Figure 40: Activity Management Interface

Figure 41: Add Expense Modal

### 2.4.3.4 Managing Personnel

Project Staff can manage personnel, but all operations require change requests for approval. This ensures proper oversight of team composition and compensation.

**Creating Roles (Requires Change Request):**

**Access:** Available through the "Add Role" button in the Personnel module.

**Role Creation:**
- **Role Name**: Required text field for the role name

**Methods:**
When Project Staff creates a role:
1. Enter the role name
2. Submit - instead of creating directly, a change request is submitted
3. Change request details:
   - `change_type`: "ROLE"
   - `operation`: "CREATE"
   - `proposed_changes`: { name }
4. Change request status: PENDING
5. Role does not appear until Admin approval

**Creating Departments (Requires Change Request):**

Similar to roles, department creation requires a change request:
- `change_type`: "DEPARTMENT"
- `operation`: "CREATE"
- `proposed_changes`: { name }

**Adding Personnel (Requires Change Request):**

**Access:** Available through the "Add Personnel" button in the Personnel module.

**Personnel Creation Fields:**
- **First Name**: Required text field
- **Last Name**: Required text field
- **Role**: Dropdown selection (can select existing roles or create new via change request)
- **Department**: Dropdown selection (can select existing departments or create new via change request)
- **Employment Status**: Dropdown selection (ACTIVE, INACTIVE, TERMINATED)

**Methods:**
When Project Staff adds personnel:
1. Fill in personnel information
2. Submit - a change request is created with:
   - `change_type`: "PERSONNEL"
   - `operation`: "CREATE"
   - `proposed_changes`: { first_name, last_name, role, department, employment_status }
3. Change request status: PENDING
4. Personnel does not appear until Admin approval

**Editing Personnel (Requires Change Request):**

When editing personnel:
1. Click edit icon on personnel card
2. Modify fields
3. Submit - change request is created with:
   - `change_type`: "PERSONNEL"
   - `operation`: "UPDATE"
   - `entity_id`: Personnel ID
   - `current_state`: Current personnel data
   - `proposed_changes`: Modified personnel data
4. Changes are not applied until Admin approval

**Deleting Personnel (Requires Change Request):**

Deleting personnel requires a change request with:
- `change_type`: "PERSONNEL"
- `operation`: "DELETE"
- `entity_id`: Personnel ID
- `current_state`: Current personnel data

**Viewing Personnel:**

Project Staff can view all personnel in their assigned projects:
- Expand personnel accordions to see details
- View compensation information (read-only)
- See role and department assignments
- Filter by role, department, or employment status

**Methods:**

All personnel operations go through the change request workflow:
- The frontend creates change requests instead of direct API calls
- Change requests are submitted to `/api/projects/{project_id}/change-requests/`
- Backend validates project membership before accepting change requests
- Personnel data is only modified after Admin approval

**Key Features:**
- All personnel operations require change requests
- Can view personnel and compensation details
- Can request role and department creation
- Full visibility into team composition
- Changes require Admin approval

**Important Notes:**
- Personnel changes are not immediate - they require Admin approval
- Project Staff should provide clear descriptions in change requests
- Multiple change requests can be submitted for different personnel
- Pending change requests can be viewed and canceled if needed

Figure 42: Add Personnel (Change Request)

Figure 43: Personnel List with Change Request Status

### 2.4.3.5 Managing Compensation

Project Staff can manage compensation for personnel, but all operations require change requests for approval.

**Adding Compensation (Requires Change Request):**

**Access:** Available through "Add Compensation" button within a personnel accordion.

**Compensation Fields:**
- **Type**: Required dropdown (Salary or Honoraria)
- **Budget Item**: Required dropdown selection (PS, MOOE, CO)
- **Amount**: Optional decimal field for compensation amount
- **Date Effective**: Required date field
- **Reason**: Optional text area for compensation reason/description

**Methods:**
When Project Staff adds compensation:
1. Fill in compensation details
2. Submit - a change request is created with:
   - `change_type`: "COMPENSATION"
   - `operation`: "CREATE"
   - `proposed_changes`: { type, budget_item, personnel, amount, date_effective, reason }
3. Change request status: PENDING
4. Compensation does not appear until Admin approval

**Important Constraints:**
- Each personnel member can have only one Salary and one Honoraria compensation
- If compensation of the same type exists, the change request will update the existing record when approved
- Budget item must exist for the project
- Personnel must exist and be associated with the project

**Editing Compensation (Requires Change Request):**

When editing existing compensation:
1. Click edit icon on compensation card
2. Modify compensation details
3. Submit - change request is created with:
   - `change_type`: "COMPENSATION"
   - `operation`: "UPDATE"
   - `entity_id`: Compensation ID
   - `current_state`: Current compensation data
   - `proposed_changes`: Modified compensation data
4. Changes are not applied until Admin approval

**Deleting Compensation (Requires Change Request):**

Deleting compensation requires a change request with:
- `change_type`: "COMPENSATION"
- `operation`: "DELETE"
- `entity_id`: Compensation ID
- `current_state`: Current compensation data

**Viewing Compensation:**

Project Staff can view compensation details:
- See all compensation records for personnel
- View compensation type, amount, and effective dates
- See budget item associations
- Read compensation reasons/descriptions

**Methods:**

All compensation operations go through the change request workflow:
- Change requests are submitted to `/api/projects/{project_id}/change-requests/`
- Backend validates:
  - Project membership
  - Personnel existence and project association
  - Budget item existence
  - Uniqueness constraints (type + personnel)
- Compensation is only created/updated/deleted after Admin approval

**Key Features:**
- All compensation operations require change requests
- Can view compensation details
- Can request compensation changes
- Changes require Admin approval
- Compensation linked to budget items for tracking

**Budget Impact:**
- Compensation amounts are included in budget calculations
- PS (Personnel Services) budget includes salary and honoraria compensation
- Budget charts and summaries reflect compensation after approval

Figure 44: Add Compensation (Change Request)

Figure 45: Compensation Details View

### 2.4.3.6 Change Request Management

Project Staff can submit, view, and manage their own change requests. This module is central to the Project Staff workflow.

**Access:** Available through the "Change Requests" menu item in the sidebar.

**Viewing Change Requests:**

Project Staff can view all change requests they have submitted, with filtering options:
- **Status**: PENDING, APPROVED, REJECTED, CANCELED
- **Change Type**: ACTIVITY, OBJECTIVE, PERSONNEL, BUDGET, COMPENSATION, PROJECT, ROLE, DEPARTMENT
- **Operation**: CREATE, UPDATE, DELETE
- **Project**: Filter by project (shows only assigned projects)

**Change Request List:**
- Displays all submitted change requests
- Shows status badges (color-coded)
- Displays change type, operation, and submission date
- Shows project name and description
- Clickable cards for detailed view

**Submitting Change Requests:**

Change requests are automatically created when Project Staff attempts to:
- Create objectives, roles, departments, personnel, compensation
- Update objectives, personnel, compensation, project information
- Delete objectives, personnel, compensation

**Change Request Form:**
When submitting a change request, Project Staff must provide:
- **Description**: Required text area explaining the reason for the change request
- **Proposed Changes**: Automatically populated based on the form data
- **Current State**: (For UPDATE/DELETE) Automatically captured current entity state

**Methods:**

**Change Request Creation:**
1. Project Staff fills in a form (e.g., Add Objective, Add Personnel)
2. Instead of direct creation, the frontend:
   - Captures current state (for UPDATE/DELETE operations)
   - Prepares proposed changes
   - Opens change request submission modal
3. Project Staff adds description and submits
4. Frontend sends POST request to `/api/projects/{project_id}/change-requests/`
5. Backend validates:
   - Project membership
   - Data format and constraints
   - No conflicting pending change requests
6. Change request is created with status PENDING
7. Project Staff can view the change request in the list

**Viewing Change Request Details:**

When clicking on a change request:
- **Overview**: Change type, operation, status, submission date
- **Description**: Explanation provided by submitter
- **Current State**: (For UPDATE/DELETE) Current values before changes
- **Proposed Changes**: New values to be applied
- **Field Comparison**: Highlighted differences between current and proposed
- **Status Information**: 
  - PENDING: Awaiting Admin review
  - APPROVED: Changes have been applied (shows approver and date)
  - REJECTED: Request was rejected (shows rejection reason)
  - CANCELED: Request was canceled by submitter (shows cancel reason)

**Canceling Change Requests:**

Project Staff can cancel their own pending change requests:
1. Click on a PENDING change request
2. Click "Cancel Request" button
3. Enter cancellation reason (required)
4. Submit - frontend sends POST request to `/api/projects/{project_id}/change-requests/{id}/cancel/`
5. Backend validates:
   - User is the submitter
   - Status is PENDING
   - User has permission to cancel
6. Change request status is updated to CANCELED
7. Cancel reason is stored
8. Change request is removed from pending list

**Tracking Change Request Status:**

Project Staff can monitor their change requests:
- **Pending**: Awaiting Admin review (can be canceled)
- **Approved**: Changes have been applied - can verify in respective modules
- **Rejected**: Request was denied - can review rejection reason and resubmit if needed
- **Canceled**: Request was canceled by submitter

**Methods:**

**Change Request Endpoints:**
- **List**: `GET /api/projects/{project_id}/change-requests/` (filtered by submitter)
- **Detail**: `GET /api/projects/{project_id}/change-requests/{id}/`
- **Create**: `POST /api/projects/{project_id}/change-requests/`
- **Cancel**: `POST /api/projects/{project_id}/change-requests/{id}/cancel/`

**Backend Validation:**
- Project membership is validated
- Field-level conflict detection prevents duplicate pending requests
- Status transitions are validated (can only cancel PENDING requests)
- Only submitter can cancel their own requests

**Key Features:**
- Submit change requests for various operations
- View all submitted change requests
- Track request status and outcomes
- Cancel pending requests
- View detailed change comparisons
- See approval/rejection reasons

**Best Practices:**
- Provide clear, detailed descriptions in change requests
- Review current state before submitting updates
- Monitor pending requests regularly
- Cancel requests if changes are no longer needed
- Review rejection reasons to understand why requests were denied

Figure 46: Change Requests List

Figure 47: Change Request Detail View

Figure 48: Cancel Change Request Modal

### 2.4.3.7 Profile Management

Project Staff can view and manage their profile information, including account details and assigned projects.

**Access:** Available through the "Profile" menu item in the sidebar.

**Profile Information:**

**Viewable Information:**
- **Name**: First name and last name
- **Email**: Email address (used for login)
- **Role**: User role (Project Staff)
- **Account Status**: ACTIVE, DEACTIVATED, SUSPENDED
- **Date Joined**: Account creation date
- **Last Login**: Most recent login timestamp

**Editable Information:**
Project Staff can edit:
- First name
- Last name
- Password (through separate change password functionality)

**Non-Editable Information:**
- Email (contact Admin for email changes)
- Role (only Admins can change roles)
- Account Status (only Admins can change account status)
- Date Joined

**Assigned Projects:**

The profile page displays:
- List of all projects assigned to the user
- Project names and basic information
- Quick links to switch to specific projects
- Project count and status summary

**Methods:**

**Profile Viewing:**
- Frontend fetches user data from `/api/users/{id}/` endpoint
- User ID is obtained from JWT token after authentication
- Profile data is displayed in read-only and editable sections

**Profile Editing:**
1. Click "Edit Profile" button
2. Modify editable fields (first name, last name)
3. Save changes - frontend sends PUT request to `/api/users/{id}/`
4. Backend validates:
   - User can only edit their own profile
   - Protected fields cannot be modified
5. Changes are saved immediately
6. Profile page refreshes with updated information

**Password Change:**
1. Click "Change Password" button
2. Enter current password
3. Enter new password (must meet strength requirements)
4. Confirm new password
5. Submit - frontend sends POST request to password change endpoint
6. Backend validates:
   - Current password is correct
   - New password meets requirements
   - Passwords match
7. Password is updated
8. User may need to re-authenticate

**Key Features:**
- View account information
- Edit personal details
- Change password
- View assigned projects
- Access project links
- Monitor account status

**Security Notes:**
- Passwords are never displayed (write-only field)
- Password changes require current password verification
- Email changes require Admin intervention
- Role changes require Admin intervention
- Account status changes require Admin intervention

Figure 49: Profile Page

Figure 50: Edit Profile Modal

Figure 51: Change Password Modal

---

*End of Part 3 - Documentation Complete*

**Complete Documentation:**
- Part 1: Introduction and Technical Architecture
- Part 2: Admin User Guide
- Part 3: Executive and Project Staff User Guides

