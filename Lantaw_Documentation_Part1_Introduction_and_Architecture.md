# Lantaw Project Management System - Documentation (Part 1)

Project Management System with Budget Tracking and Change Request Workflow

---

## Contents

1. Introduction 3
   - 1.1 Problem / Opportunity . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
   - 1.2 Solution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

2. Technical Documentation 4
   - 2.1 Architecture Design . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
   - 2.1.1 Frontend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
   - 2.1.2 Backend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
   - 2.2 Database . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
   - 2.3 Deployment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8

---

## 1 Introduction

### 1.1 Problem / Opportunity

Project management in organizations, particularly those handling multiple projects with budget constraints, faces several critical challenges. Project staff members need to track objectives, activities, personnel, and expenses across different budget categories (Personnel Services, Maintenance and Other Operating Expenses, and Capital Outlay). However, managing these complex relationships while maintaining proper oversight and approval workflows presents significant difficulties.

Traditional project management approaches often suffer from:
- Lack of centralized budget tracking across multiple budget categories
- Inefficient approval workflows that require manual coordination between project staff and administrators
- Difficulty in monitoring project progress, budget utilization, and expense tracking in real-time
- Absence of proper audit trails for changes made to project data
- Challenges in maintaining data integrity when multiple users need to modify project information
- Limited visibility for executives and stakeholders who need read-only access to monitor project status

Existing solutions typically involve spreadsheets, separate budget tracking systems, and email-based approval processes. These approaches are error-prone, time-consuming, and lack proper version control and audit capabilities. There is a clear opportunity to develop a comprehensive web-based system that addresses these challenges while providing role-based access control and automated approval workflows.

### 1.2 Solution

Lantaw is a web-based project management system designed to streamline project tracking, budget management, and change approval workflows. The system provides a centralized platform for managing projects with the following key features:

**Core Capabilities:**
- **Project Management**: Create and manage multiple projects with detailed information including project leaders, descriptions, timelines, and grant amounts
- **Objectives and Activities Tracking**: Organize project work into objectives and track individual activities with status monitoring (Pending, In Progress, Completed)
- **Budget Management**: Track expenses across three budget categories:
  - **PS (Personnel Services)**: Salaries, honoraria, and personnel-related expenses
  - **MOOE (Maintenance and Other Operating Expenses)**: Operational expenses
  - **CO (Capital Outlay)**: Capital investments and equipment purchases
- **Personnel Management**: Manage team members, roles, departments, and compensation details
- **Change Request Workflow**: Implement an approval-based system where Project Staff submit change requests that require Admin approval before being applied
- **Role-Based Access Control**: Three distinct user roles with appropriate permissions:
  - **Admin**: Full system access with direct CRUD operations and change request approval capabilities
  - **Executive**: Read-only access to all projects for monitoring and reporting
  - **Project Staff**: Manage assigned projects and submit change requests for approval
- **Dashboard and Analytics**: Visual representation of project metrics, budget distribution, and expense comparisons
- **History Logging**: Comprehensive audit trail of all system changes

The system is built as a modern web application with a React-based frontend and Django REST Framework backend, ensuring scalability, maintainability, and a responsive user experience. By automating approval workflows and providing real-time budget tracking, Lantaw significantly reduces administrative overhead while maintaining data integrity and proper oversight.

---

## 2 Technical Documentation

### 2.1 Architecture Design

Lantaw follows a modern three-tier architecture pattern, separating the presentation layer (frontend), business logic layer (backend API), and data persistence layer (database). This architecture provides clear separation of concerns, making the system maintainable, scalable, and testable.

**Architecture Overview:**
- **Frontend**: React-based single-page application (SPA) built with TypeScript and Vite
- **Backend**: Django REST Framework API providing RESTful endpoints
- **Database**: SQLite for development (easily configurable for PostgreSQL in production)
- **Authentication**: JWT (JSON Web Token) based authentication
- **API Communication**: RESTful API with JSON data exchange

The frontend communicates with the backend through HTTP requests to RESTful API endpoints. All API requests are authenticated using JWT tokens, which are obtained through the login endpoint and included in subsequent requests. The backend validates these tokens and enforces role-based permissions before processing requests.

**Key Architectural Patterns:**
- **Model-View-Controller (MVC)**: Django follows MVC pattern with Models (data layer), Views (business logic), and Templates (presentation - though not used in this API-only backend)
- **Component-Based Architecture**: Frontend uses React components for modular, reusable UI elements
- **RESTful API Design**: Backend follows REST principles with resource-based URLs and standard HTTP methods
- **Nested Routing**: API supports nested resources (e.g., `/api/projects/{id}/objectives/{id}/activities/`) for hierarchical data relationships

Figure 1: Lantaw System Architecture

```
┌─────────────────┐
│   React SPA     │  (Frontend - TypeScript, Vite)
│   (Browser)     │
└────────┬────────┘
         │ HTTP/REST
         │ JWT Auth
         ▼
┌─────────────────┐
│ Django REST API │  (Backend - Python, DRF)
│   (Server)      │
└────────┬────────┘
         │ ORM
         ▼
┌─────────────────┐
│   Database      │  (SQLite/PostgreSQL)
│   (Models)      │
└─────────────────┘
```

### 2.1.1 Frontend

The frontend of Lantaw is built using modern web technologies to provide a responsive, interactive user experience.

**Core Technologies:**
- **React 19.1.1**: JavaScript library for building user interfaces with component-based architecture
- **TypeScript 5.9.3**: Typed superset of JavaScript providing type safety and better developer experience
- **Vite 7.1.7**: Fast build tool and development server for modern web applications
- **React Router DOM 6.30.1**: Client-side routing for single-page application navigation

**UI Framework and Styling:**
- **Tailwind CSS 4.1.16**: Utility-first CSS framework for rapid UI development
- **Radix UI 1.4.3**: Unstyled, accessible component primitives
- **Lucide React 0.548.0**: Icon library for consistent iconography
- **Bootstrap 5.3.8**: Additional CSS framework components for enhanced styling

**State Management and Data Fetching:**
- **React Query (TanStack Query) 5.90.5**: Powerful data synchronization library for server state management, caching, and background updates
- **Zustand 5.0.8**: Lightweight state management library for client-side state
- **Axios 1.12.2**: HTTP client for making API requests

**Data Visualization:**
- **Recharts 3.5.1**: Composable charting library built on React components for budget distribution pie charts and expense comparison bar charts

**Form Handling and Validation:**
- **Zod 4.1.12**: TypeScript-first schema validation library for form validation and type safety

**Key Frontend Features:**
- **Responsive Design**: Mobile-first approach ensuring usability across different screen sizes
- **Real-time Updates**: React Query provides automatic refetching and cache invalidation
- **Type Safety**: TypeScript ensures type checking across components and API interactions
- **Component Reusability**: Modular component structure allows for code reuse and maintainability
- **Accessibility**: Radix UI components provide built-in accessibility features

**Frontend Structure:**
```
src/
├── api/              # API client configuration and constants
├── components/       # Reusable UI components (buttons, cards, modals)
├── context/          # React context providers (Auth, Project)
├── features/         # Feature-based modules
│   ├── activities/   # Objectives and Activities management
│   ├── dashboard/    # Dashboard and analytics
│   ├── personnel/    # Personnel management
│   ├── change-requests/  # Change request workflow
│   └── ...
├── hooks/            # Custom React hooks
├── pages/            # Page-level components
├── routes/           # Route configuration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### 2.1.2 Backend

The backend of Lantaw is built using Django and Django REST Framework, providing a robust, scalable API server.

**Core Technologies:**
- **Django 5.1.5**: High-level Python web framework following the Model-View-Template (MVT) pattern
- **Django REST Framework 3.15.2**: Powerful toolkit for building Web APIs
- **Python 3.x**: Programming language for backend development

**Authentication and Security:**
- **Django REST Framework Simple JWT 5.3.1**: JWT-based authentication system
  - Access token lifetime: 30 minutes
  - Refresh token lifetime: 1 day
- **CORS Headers 4.5.0**: Cross-Origin Resource Sharing support for frontend-backend communication
- **Django Password Validation**: Built-in password strength validation

**API Documentation:**
- **DRF Spectacular 0.27.2**: OpenAPI 3.0 schema generation and Swagger UI integration
  - Accessible at `/api/docs/` for interactive API documentation
  - Redoc documentation available at `/api/redoc/`

**Database and ORM:**
- **Django ORM**: Object-Relational Mapping for database interactions
- **SQLite**: Default database for development (easily configurable for PostgreSQL)
- **Django Migrations**: Version control for database schema changes

**Additional Features:**
- **Django Filters 24.3**: Advanced filtering capabilities for API endpoints
- **Django Extensions 3.2.3**: Collection of custom extensions for Django
- **Django Seed 0.3.1**: Database seeding utilities for development

**Backend Application Structure:**
```
lantaw/
├── users/            # User authentication and management
├── projects/         # Project management
├── activities/       # Objectives and Activities
├── personnel/        # Personnel, Roles, Departments
├── budget/           # Budget line items and Compensation
├── change_requests/ # Change request workflow
├── history_log/      # Audit trail and history logging
├── core/             # Core utilities and shared code
└── lantaw/           # Project settings and configuration
    ├── settings.py   # Django settings
    └── urls.py       # URL routing
```

**API Architecture:**
- **RESTful Design**: Resource-based URLs following REST conventions
- **Nested Routing**: Support for nested resources (e.g., projects → objectives → activities)
- **ViewSets**: Django REST Framework ViewSets for CRUD operations
- **Serializers**: Data validation and serialization/deserialization
- **Permissions**: Role-based permission classes for access control
- **Pagination**: Page-based pagination (10 items per page by default)

**Key Backend Features:**
- **Role-Based Permissions**: Custom permission classes enforcing Admin, Executive, and Project Staff access levels
- **Change Request System**: Automated workflow for applying approved changes to project data
- **History Logging**: Automatic tracking of all system changes through Django signals
- **Data Validation**: Comprehensive validation at both serializer and model levels
- **Transaction Management**: Database transactions ensure data consistency

### 2.2 Database

Lantaw uses a relational database to store all project data, user information, and system logs. The database schema is designed to maintain referential integrity and support complex relationships between projects, objectives, activities, personnel, and budget items.

**Database System:**
- **Development**: SQLite (file-based database, suitable for development and testing)
- **Production Ready**: PostgreSQL (recommended for production deployments)
- **ORM**: Django ORM handles all database interactions, providing abstraction from the underlying database system

**Core Database Models:**

**User Model:**
- Custom user model using email as the unique identifier (instead of username)
- Fields: email, password, first_name, last_name, role, account_status, date_joined, last_login
- Roles: ADMIN, EXECUTIVE, PROJECT_STAFF
- Account Status: ACTIVE, DEACTIVATED, SUSPENDED

**Project Model:**
- Core project information
- Fields: name, project_leader, description, grant_amount, project_status, date_start, date_end
- Project Status: ACTIVE, COMPLETED, ON_HOLD
- Relationships: One-to-many with Objectives, BudgetLineItems, ProjectMembers

**Objective Model:**
- Project objectives that group related activities
- Fields: project (ForeignKey), title, description
- Relationships: One-to-many with Activities

**Activity Model:**
- Individual activities under objectives
- Fields: objective (ForeignKey), title, activity_status, activity_budget_item (ForeignKey), projected_expense, actual_expense, date_created, date_modified
- Activity Status: PENDING, IN_PROGRESS, COMPLETED
- Relationships: Many-to-one with Objective and BudgetLineItem

**Personnel Model:**
- Team member information
- Fields: first_name, last_name, role (ForeignKey), department (ForeignKey), employment_status
- Employment Status: ACTIVE, INACTIVE, TERMINATED
- Relationships: Many-to-one with Role and Department, Many-to-many with Projects

**Role Model:**
- Personnel roles within projects
- Fields: name, project (ForeignKey)
- Unique constraint: (name, project)

**Department Model:**
- Organizational departments
- Fields: name, project (ForeignKey)
- Unique constraint: (name, project)

**BudgetLineItem Model:**
- Budget categories for projects
- Fields: project (ForeignKey), name, date_created, date_modified
- Budget Categories: MOOE, PS, CO
- Unique constraint: (project, name)

**Compensation Model:**
- Personnel compensation details
- Fields: type, budget_item (ForeignKey), personnel (ForeignKey), reason, amount, date_effective, date_modified
- Compensation Types: SALARY, HONORARIA
- Unique constraint: (type, personnel)

**ChangeRequest Model:**
- Change requests submitted by Project Staff
- Fields: project (ForeignKey), submitted_by (ForeignKey), change_type, operation, status, description, entity_id, current_state (JSON), proposed_changes (JSON), approved_by (ForeignKey), date_submitted, date_processed, rejection_reason, cancel_reason
- Change Types: ACTIVITY, OBJECTIVE, PERSONNEL, BUDGET, COMPENSATION, PROJECT, ROLE, DEPARTMENT
- Operations: CREATE, UPDATE, DELETE
- Status: PENDING, APPROVED, REJECTED, CANCELED

**HistoryLog Model:**
- Audit trail of all system changes
- Fields: timestamp, user (ForeignKey), action, change_type, description, project (ForeignKey), entity_id, old_state (JSON), new_state (JSON), related_change_request (ForeignKey)
- Actions: CREATE, UPDATE, DELETE, REVERT

**Key Relationships:**
- Projects have many Objectives
- Objectives have many Activities
- Projects have many BudgetLineItems (PS, MOOE, CO)
- Activities belong to one BudgetLineItem
- Personnel belong to one Role and one Department
- Personnel can be associated with multiple Projects
- Compensation links Personnel to BudgetLineItems
- ChangeRequests reference Projects and Users
- HistoryLog tracks all changes with references to Users and Projects

Figure 2: Lantaw Entity Relationship Diagram

```
User ──┬── ProjectMembers ──► Project ──┬── Objective ──► Activity
       │                                  ├── BudgetLineItem ──► Compensation
       │                                  ├── ProjectPersonnel ──► Personnel
       │                                  └── ChangeRequest
       │
       └── ChangeRequest (submitted_by, approved_by)
            │
            └── HistoryLog
```

### 2.3 Deployment

**Current Status: To Be Determined (TBD)**

The Lantaw system is currently configured for development environments. Production deployment configuration and infrastructure details are to be determined based on organizational requirements and hosting preferences.

**Development Setup:**
- **Backend**: Django development server (run via `python manage.py runserver`)
- **Frontend**: Vite development server (run via `npm run dev`)
- **Database**: SQLite (file-based, no additional setup required)
- **Environment Variables**: Configuration via `.env` file for sensitive settings

**Production Deployment Considerations:**

**Backend Deployment Options:**
- **Platform as a Service (PaaS)**: Heroku, Railway, Render, or similar platforms
- **Container Deployment**: Docker containers on AWS ECS, Google Cloud Run, or Azure Container Instances
- **Virtual Private Server (VPS)**: DigitalOcean, Linode, or AWS EC2 with Gunicorn as WSGI server
- **Serverless**: AWS Lambda or Google Cloud Functions (requires architectural adjustments)

**Frontend Deployment Options:**
- **Static Hosting**: Vercel, Netlify, AWS S3 + CloudFront, or GitHub Pages
- **CDN Distribution**: CloudFlare or AWS CloudFront for global content delivery

**Database Options:**
- **PostgreSQL**: Recommended for production (AWS RDS, Google Cloud SQL, or managed PostgreSQL services)
- **Database Migrations**: Django migrations should be run as part of deployment process
- **Backup Strategy**: Regular automated backups should be configured

**Security Considerations:**
- **Environment Variables**: All sensitive configuration (SECRET_KEY, database credentials) should be stored as environment variables
- **HTTPS**: SSL/TLS certificates should be configured for all production endpoints
- **CORS Configuration**: Restrict CORS origins to specific frontend domains in production
- **DEBUG Mode**: Must be set to `False` in production
- **ALLOWED_HOSTS**: Should be configured with specific domain names
- **JWT Secret Keys**: Should use strong, randomly generated secrets

**Scaling Considerations:**
- **Database Connection Pooling**: Configure appropriate connection pool sizes
- **Caching**: Consider Redis for session storage and frequently accessed data
- **Load Balancing**: Multiple backend instances behind a load balancer for high availability
- **Static Files**: Use CDN or object storage (AWS S3, Google Cloud Storage) for static file serving

**Monitoring and Logging:**
- **Application Monitoring**: Consider services like Sentry for error tracking
- **Logging**: Configure structured logging for production environments
- **Performance Monitoring**: APM tools for tracking response times and database queries

**Deployment Checklist:**
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set environment variables for all sensitive configuration
- [ ] Configure CORS for specific frontend domain
- [ ] Set DEBUG=False and configure ALLOWED_HOSTS
- [ ] Set up SSL/TLS certificates
- [ ] Configure static file serving
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Run database migrations
- [ ] Create superuser account
- [ ] Test all API endpoints
- [ ] Verify frontend-backend communication
- [ ] Test authentication and authorization flows

---

*End of Part 1 - Continue to Part 2 for User Guides*

