# Lantaw Project Management System - Documentation (Part 2)

## Contents

2.4 User Guide . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1

2.4.1 Admin . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1

2.4.1.1 Creating Projects . . . . . . . . . . . . . . . . . . . . . . . . . . 2

2.4.1.2 Managing Projects . . . . . . . . . . . . . . . . . . . . . . . . . . 3

2.4.1.3 Managing Activities and Objectives . . . . . . . . . . . . . . . . . . 4

2.4.1.4 Managing Personnel . . . . . . . . . . . . . . . . . . . . . . . . . . 6

2.4.1.5 Managing Budget . . . . . . . . . . . . . . . . . . . . . . . . . . . 8

2.4.1.6 Change Request Approval Workflow . . . . . . . . . . . . . . . . . . . 9

2.4.1.7 Dashboard and Analytics . . . . . . . . . . . . . . . . . . . . . . 11

---

## 2.4 User Guide

This section describes the features available in the Lantaw system for each user role. All users must authenticate through the login page by entering their email address and password. The system automatically routes users to the appropriate interface based on their assigned role.

**User Roles:**
- **Admin**: Full system access with direct CRUD operations and change request approval capabilities
- **Executive**: Read-only access to all projects for monitoring and reporting
- **Project Staff**: Manage assigned projects and submit change requests for approval

Figure 3: Landing Page

Figure 4: Login Page

---

## 2.4.1 Admin

Administrators have full access to all system features and can perform direct operations without requiring approval. Admins can create and manage projects, directly modify objectives and activities, manage personnel, approve or reject change requests submitted by Project Staff, and access comprehensive analytics and reporting features.

Figure 5: Administrator Dashboard

### 2.4.1.1 Creating Projects

Creating a new project is an administrative function that allows setting up a new project with all necessary information and assigning Project Staff members.

**Access:** Available to Admin users only through the "Create Project" button in the sidebar footer.

**Project Creation Form Fields:**
- **Project Name**: Required text field for the project title
- **Project Leader**: Required text field for the project leader's name
- **Description**: Optional text area for project description
- **Start Date**: Required date field for project start date
- **End Date**: Required date field for project end date (must be after start date)
- **Total Grant Amount**: Optional decimal field for the project's total budget allocation
- **Project Staff Email**: Required field - email address of an existing user to assign as Project Staff member

**Methods:**
When the Admin clicks "Create Project", a modal form appears with all project fields. The form includes client-side validation to ensure:
- All required fields are filled
- End date is after start date
- Project Staff email corresponds to an existing user in the system

Upon submission, the frontend sends a POST request to `/api/projects/` with the project data. The backend validates the data, including:
- Date validation (start date ≤ end date)
- Grant amount validation (non-negative, within maximum limits)
- Project Staff user existence validation

If validation passes, the project is created immediately in the database, and the ProjectMembers relationship is established between the project and the assigned Project Staff user. The new project appears in the sidebar project list, and the Admin is automatically switched to view the newly created project.

**Post-Creation:**
- The project is set to "ACTIVE" status by default
- Budget line items (PS, MOOE, CO) are typically created automatically or can be added manually
- The project appears in the Admin's project list and is accessible to assigned Project Staff

Figure 6: Create Project Modal

### 2.4.1.2 Managing Projects

Admins can directly edit project information without requiring change requests, unlike Project Staff who must submit change requests for project modifications.

**Access:** Available through the "Edit Project" button in the dashboard header for any project.

**Editable Fields:**
- Project Name
- Project Leader
- Description
- Start Date
- End Date
- Total Grant Amount
- Project Status (ACTIVE, COMPLETED, ON_HOLD)

**Methods:**
When the Admin clicks "Edit Project", a modal form appears pre-populated with current project data. The Admin can modify any field. The form includes the same validation as project creation:
- Date validation (start date ≤ end date)
- Grant amount validation
- Required field validation

Upon saving, the frontend sends a PUT request to `/api/projects/{id}/` with the updated data. The backend validates and updates the project immediately. No approval workflow is required for Admin edits.

**Project Status Management:**
Admins can change project status directly:
- **ACTIVE**: Project is currently in progress
- **COMPLETED**: Project has finished
- **ON_HOLD**: Project is temporarily paused

Status changes are applied immediately and reflected across all project views.

**Project Members Management:**
Admins can add or remove Project Staff members from projects through the project members endpoint. This allows reassigning projects to different staff members as needed.

Figure 7: Edit Project Modal

### 2.4.1.3 Managing Activities and Objectives

Admins have full CRUD capabilities for objectives and activities, allowing direct creation, modification, and deletion without requiring change requests.

**Creating Objectives:**

**Access:** Available through the "Add Objective" button in the Activities module.

**Objective Creation:**
- **Title**: Required text field for the objective title
- **Description**: Optional text area for objective description

**Methods:**
When creating an objective, the Admin fills in the form and submits. The frontend sends a POST request to `/api/projects/{project_id}/objectives/`. The backend creates the objective immediately and associates it with the current project. The objective appears in the Activities page under the project.

**Creating Activities:**

**Access:** Available through the "Add Activity" button within an objective accordion.

**Activity Creation Fields:**
- **Title**: Required text field for activity title
- **Status**: Dropdown selection (PENDING, IN_PROGRESS, COMPLETED) - defaults to PENDING
- **Projected Expense**: Optional decimal field for estimated cost
- **Actual Expense**: Optional decimal field for actual cost incurred
- **Budget Item**: Dropdown selection (PS, MOOE, CO) - links activity to a budget category

**Methods:**
When creating an activity, the Admin selects the objective it belongs to and fills in the activity details. The frontend sends a POST request to `/api/projects/{project_id}/objectives/{objective_id}/activities/`. The backend validates the data and creates the activity immediately. The activity appears under its parent objective.

**Editing Objectives and Activities:**

Admins can edit objectives and activities directly by clicking the edit icon on any objective or activity card. The edit modal appears with pre-populated data. Changes are saved immediately via PUT requests to the respective endpoints.

**Deleting Objectives and Activities:**

Admins can delete objectives and activities directly. When deleting an objective, all associated activities are also deleted (cascade delete). The system sends DELETE requests to the respective endpoints, and the items are removed immediately.

**Adding Expenses to Activities:**

Admins can add or update expenses for activities directly:
- **Add Expense**: Opens a modal to add an expense amount to an activity
- The expense is added to the activity's actual_expense field
- Updates are applied immediately via PUT request

**Project Status Updates:**

Admins can update project status directly from the Activities page using the "Project Status" button. This allows quick status changes without navigating to the project edit modal.

**Key Differences from Project Staff:**
- All operations are immediate (no change request workflow)
- No approval required for any changes
- Direct database modifications
- Changes are logged in HistoryLog for audit purposes

Figure 8: Activities Page with Objectives and Activities

Figure 9: Create Objective Modal

Figure 10: Create Activity Modal

Figure 11: Edit Activity Modal

### 2.4.1.4 Managing Personnel

Admins can fully manage personnel, including creating roles, departments, and personnel records, as well as managing compensation details.

**Creating Roles:**

**Access:** Available through the "Add Role" button in the Personnel module.

**Role Creation:**
- **Role Name**: Required text field for the role name
- Roles are project-specific (each project can have its own set of roles)
- Role names must be unique within a project

**Methods:**
The Admin enters the role name and submits. The frontend sends a POST request to `/api/projects/{project_id}/roles/`. The role is created immediately and appears in the role dropdown when creating or editing personnel.

**Creating Departments:**

**Access:** Available through the "Add Department" button in the Personnel module.

**Department Creation:**
- **Department Name**: Required text field for the department name
- Departments are project-specific (each project can have its own set of departments)
- Department names must be unique within a project

**Methods:**
Similar to role creation, the Admin enters the department name and submits. The frontend sends a POST request to `/api/projects/{project_id}/departments/`. The department is created immediately.

**Adding Personnel:**

**Access:** Available through the "Add Personnel" button in the Personnel module.

**Personnel Creation Fields:**
- **First Name**: Required text field
- **Last Name**: Required text field
- **Role**: Dropdown selection from available roles (can create new role if needed)
- **Department**: Dropdown selection from available departments (can create new department if needed)
- **Employment Status**: Dropdown selection (ACTIVE, INACTIVE, TERMINATED) - defaults to ACTIVE

**Methods:**
The Admin fills in personnel information and submits. The frontend sends a POST request to `/api/projects/{project_id}/personnel/`. The backend:
1. Creates the Personnel record
2. Associates the personnel with the project through ProjectPersonnel relationship
3. Links the personnel to the selected role and department

The personnel record appears in the Personnel page and can be expanded to view compensation details.

**Editing Personnel:**

Admins can edit personnel information directly by clicking the edit icon on a personnel card. All fields can be modified, including role, department, and employment status. Changes are saved immediately via PUT request.

**Managing Compensation:**

**Access:** Available through "Add Compensation" or edit compensation buttons within a personnel accordion.

**Compensation Types:**
- **Salary**: Regular salary compensation
- **Honoraria**: Honorarium payments

**Compensation Fields:**
- **Type**: Required dropdown (Salary or Honoraria)
- **Budget Item**: Required dropdown selection (PS, MOOE, CO)
- **Amount**: Optional decimal field for compensation amount
- **Date Effective**: Required date field for when compensation takes effect
- **Reason**: Optional text area for compensation reason/description

**Important Constraints:**
- Each personnel member can have only one Salary and one Honoraria compensation record
- If a compensation of the same type already exists, updating it will modify the existing record rather than creating a duplicate

**Methods:**
When adding compensation, the Admin selects the type, budget item, amount, effective date, and optionally a reason. The frontend sends a POST request to `/api/projects/{project_id}/compensations/`. The backend validates:
- Budget item exists for the project
- Personnel exists
- Uniqueness constraint (type + personnel)

Compensation records are linked to budget items, allowing budget tracking by category.

**Deleting Personnel:**

Admins can delete personnel records directly. When deleting personnel:
- Associated compensation records are also deleted (cascade delete)
- ProjectPersonnel relationships are removed
- The personnel record is permanently deleted

**Key Features:**
- All operations are immediate (no change request workflow)
- Direct database modifications
- Full CRUD capabilities for roles, departments, personnel, and compensation
- Changes are logged in HistoryLog

Figure 12: Personnel Page

Figure 13: Create Role Modal

Figure 14: Create Department Modal

Figure 15: Add Personnel Modal

Figure 16: Add Compensation Modal

Figure 17: Edit Personnel Modal

### 2.4.1.5 Managing Budget

Budget management in Lantaw involves managing budget line items (PS, MOOE, CO) and tracking expenses through activities and compensation.

**Budget Line Items:**

Budget line items represent the three main budget categories:
- **PS (Personnel Services)**: For personnel-related expenses
- **MOOE (Maintenance and Other Operating Expenses)**: For operational expenses
- **CO (Capital Outlay)**: For capital investments

**Creating Budget Line Items:**

Budget line items are typically created automatically when a project is created, or can be created manually if needed. Each project should have exactly one of each type (PS, MOOE, CO).

**Methods:**
Budget line items are created via POST request to `/api/projects/{project_id}/budget-line-items/`. The system enforces uniqueness: only one budget line item of each type can exist per project.

**Budget Tracking:**

Budget utilization is calculated automatically based on:
- **Activities**: Actual expenses from activities linked to budget items
- **Compensation**: Compensation amounts linked to budget items (typically PS)

The dashboard displays:
- **Budget Utilized**: Sum of all actual expenses across all budget categories
- **Remaining Budget**: Total grant amount minus budget utilized
- **Budget Distribution**: Pie chart showing percentage distribution across PS, MOOE, CO
- **Expense Comparison**: Bar chart comparing projected vs actual expenses by category

**Budget Categories Breakdown:**

When viewing the budget distribution chart, Admins can click on a category (PS, MOOE, or CO) to drill down and see:
- **PS Breakdown**: Individual personnel compensation details
- **MOOE Breakdown**: Activities linked to MOOE budget item
- **CO Breakdown**: Activities linked to CO budget item

**Methods:**
Budget calculations are performed in the frontend using utility functions that:
1. Aggregate actual expenses from activities grouped by budget item
2. Aggregate compensation amounts linked to PS budget item
3. Calculate totals and percentages
4. Generate chart data for visualization

The backend provides the raw data through API endpoints, and the frontend performs the calculations and visualizations.

**Key Features:**
- Automatic budget calculation based on activities and compensation
- Real-time budget tracking as expenses are added
- Visual representation through charts and graphs
- Budget category drill-down capabilities

Figure 18: Budget Distribution Chart

Figure 19: Budget Category Breakdown

### 2.4.1.6 Change Request Approval Workflow

The change request approval workflow is a core administrative function that allows Admins to review, approve, or reject change requests submitted by Project Staff.

**Access:** Available through the "Change Requests" menu item in the sidebar (Admin-only access).

**Viewing Change Requests:**

Admins can view all change requests across all projects, or filter by:
- **Project**: Filter by specific project
- **Status**: PENDING, APPROVED, REJECTED, CANCELED
- **Change Type**: ACTIVITY, OBJECTIVE, PERSONNEL, BUDGET, COMPENSATION, PROJECT, ROLE, DEPARTMENT
- **Operation**: CREATE, UPDATE, DELETE
- **Submitted By**: Filter by Project Staff member

**Change Request Details:**

Each change request displays:
- **Submitted By**: Project Staff member who submitted the request
- **Change Type**: Type of entity being changed
- **Operation**: Create, Update, or Delete
- **Status**: Current status of the request
- **Description**: Explanation provided by submitter
- **Date Submitted**: When the request was created
- **Current State**: (For UPDATE/DELETE) Current values of the entity
- **Proposed Changes**: (For CREATE/UPDATE) New values to be applied

**Reviewing Change Requests:**

When an Admin clicks on a pending change request, they can:
1. View the detailed comparison between current state and proposed changes
2. See which specific fields are being changed (highlighted)
3. Review the description and context provided by the submitter
4. Access related information (project, entity details)

**Approving Change Requests:**

**Methods:**
When an Admin clicks "Approve" on a pending change request:
1. The frontend sends a POST request to `/api/projects/{project_id}/change-requests/{id}/approve/`
2. The backend validates:
   - Change request status is PENDING
   - Admin has permission to approve
   - No concurrent modifications (using database locking)
3. The backend applies the changes using the `apply_change_request` utility function:
   - For CREATE: Creates the new entity with proposed changes
   - For UPDATE: Updates the existing entity with proposed changes
   - For DELETE: Deletes the entity
4. The change request status is updated to APPROVED
5. The approver (Admin) is recorded
6. The processing timestamp is set
7. A HistoryLog entry is created to track the change
8. The frontend refreshes to show the updated status and applied changes

**Rejecting Change Requests:**

**Methods:**
When an Admin clicks "Reject" on a pending change request:
1. A modal appears requesting a rejection reason (required)
2. The frontend sends a POST request to `/api/projects/{project_id}/change-requests/{id}/reject/` with the rejection reason
3. The backend validates:
   - Change request status is PENDING
   - Admin has permission to reject
   - Rejection reason is provided
4. The change request status is updated to REJECTED
5. The rejection reason is stored
6. The approver (Admin) is recorded
7. The processing timestamp is set
8. No changes are applied to the project data
9. The frontend refreshes to show the rejected status

**Important Notes:**
- Admins cannot cancel change requests (only the submitter can cancel their own pending requests)
- Once approved or rejected, change requests cannot be modified
- Approved changes are immediately applied to the project data
- All approvals and rejections are logged in HistoryLog for audit purposes
- Field-level conflict detection prevents approving conflicting change requests for the same entity

**Bulk Operations:**

While the system primarily handles individual change request reviews, Admins can:
- Filter and sort change requests to prioritize reviews
- View multiple change requests in a list for quick overview
- Access detailed views for thorough review before approval/rejection

**Change Request Types Handled:**

- **OBJECTIVE**: Creating, updating, or deleting objectives
- **PERSONNEL**: Creating, updating, or deleting personnel records
- **ROLE**: Creating, updating, or deleting roles
- **DEPARTMENT**: Creating, updating, or deleting departments
- **COMPENSATION**: Creating, updating, or deleting compensation records
- **BUDGET**: Creating or deleting budget line items
- **PROJECT**: Updating project information (Project Staff cannot create/delete projects)

**Note:** Activities do not require change requests - Project Staff can directly create, update, and delete activities.

Figure 20: Change Requests List Page

Figure 21: Change Request Detail View

Figure 22: Approve Change Request Modal

Figure 23: Reject Change Request Modal

### 2.4.1.7 Dashboard and Analytics

The dashboard provides Admins with comprehensive project overview, budget analytics, and progress tracking capabilities.

**Access:** Available as the default landing page after login, accessible through "Overview" in the sidebar.

**Dashboard Components:**

**1. Project Information Header:**
- Project name, leader, and description
- "Edit Project" button for quick project editing
- Displays current project context

**2. Summary Cards:**
- **Project Duration**: Calculated from start and end dates, displayed in days/months
- **Objectives Completed**: Count of completed objectives vs total objectives
- **Budget Utilized**: Total actual expenses across all budget categories
- **Remaining Budget**: Total grant amount minus budget utilized

**3. Budget Distribution Chart (Pie Chart):**
- Visual representation of budget allocation across PS, MOOE, and CO
- Shows percentage and amount for each category
- Clickable sections allow drill-down into category details
- Clicking a category switches to detailed breakdown view:
  - **PS**: Shows individual personnel compensation
  - **MOOE**: Shows activities linked to MOOE
  - **CO**: Shows activities linked to CO

**4. Expense Comparison Chart (Bar Chart):**
- Compares projected expenses vs actual expenses
- Grouped by budget category (PS, MOOE, CO)
- Shows both projected and actual amounts side-by-side
- Helps identify budget variances and planning accuracy

**5. Objectives Overview:**
- Expandable accordion showing all project objectives
- Each objective displays:
  - Title and description
  - Completion status
  - Associated activities with their status and expenses
- Activities show:
  - Title and status
  - Projected and actual expenses
  - Budget item category
  - Quick edit/delete options (for Admins)

**Methods:**

**Data Fetching:**
The dashboard fetches data from multiple API endpoints:
- Project details: `/api/projects/{id}/`
- Objectives and activities: `/api/projects/{id}/objectives/` (includes nested activities)
- Budget line items: `/api/projects/{id}/budget-line-items/`
- Personnel and compensation: `/api/projects/{id}/personnel/` and `/api/projects/{id}/compensations/`

**Calculations:**
Frontend utility functions perform calculations:
- **Project Duration**: Calculates days between start and end dates
- **Objectives Completed**: Counts objectives with all activities completed
- **Budget Metrics**: Aggregates expenses from activities and compensation
- **Chart Data**: Transforms data into formats suitable for Recharts components

**Real-time Updates:**
- React Query manages data fetching and caching
- Automatic refetching when project data changes
- Optimistic updates for better user experience

**Cross-Project Navigation:**
Admins can switch between projects using the project selector in the sidebar footer. The dashboard automatically updates to show data for the selected project.

**Key Features:**
- Comprehensive project overview at a glance
- Visual budget analysis and tracking
- Progress monitoring through objectives and activities
- Expense tracking and variance analysis
- Quick access to edit project information
- Real-time data updates

Figure 24: Admin Dashboard Overview

Figure 25: Budget Distribution Pie Chart

Figure 26: Expense Comparison Bar Chart

Figure 27: Objectives Overview Accordion

---

*End of Part 2 - Continue to Part 3 for Executive and Project Staff User Guides*

