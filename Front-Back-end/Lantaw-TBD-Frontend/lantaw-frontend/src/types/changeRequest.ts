export interface ChangeRequest {
  id: number;
  project: number;
  project_name?: string;  // For admin list view
  submitted_by: number;
  submitted_by_name?: string;
  change_type: 'ACTIVITY' | 'OBJECTIVE' | 'PERSONNEL' | 'BUDGET' | 'COMPENSATION' | 'PROJECT' | 'ROLE' | 'DEPARTMENT';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description: string;
  entity_id?: number | null;  // ID of entity being changed (null for CREATE)
  current_state?: Record<string, any> | null;  // Current state for UPDATE/DELETE
  proposed_changes: Record<string, any>;
  approved_by?: number | null;
  approved_by_name?: string;
  date_submitted: string;
  date_processed?: string | null;
  rejection_reason?: string;
}

export interface ChangeRequestCreateData {
  project: number;
  change_type: ChangeRequest['change_type'];
  operation: ChangeRequest['operation'];
  description: string;
  entity_id?: number | null;
  current_state?: Record<string, any> | null;
  proposed_changes: Record<string, any>;
}

export interface ChangeRequestFilters {
  status?: ChangeRequest['status'];
  change_type?: ChangeRequest['change_type'];
  operation?: ChangeRequest['operation'];
  project?: number;
}

