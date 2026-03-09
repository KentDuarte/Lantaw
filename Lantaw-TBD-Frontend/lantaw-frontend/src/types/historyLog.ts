export interface HistoryLog {
  id: number;
  timestamp: string;
  user: number;
  user_name?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERT';
  change_type: 'ACTIVITY' | 'OBJECTIVE' | 'PERSONNEL' | 'BUDGET' | 'COMPENSATION' | 'PROJECT' | 'ROLE' | 'DEPARTMENT';
  description: string;
  project: number;
  project_name?: string;
  entity_id?: number | null;
  old_state?: Record<string, any> | null;
  new_state?: Record<string, any> | null;
  related_change_request?: number | null;
}

export interface HistoryLogFilters {
  project?: number;
  change_type?: HistoryLog["change_type"];
  action?: HistoryLog["action"];
  user?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

