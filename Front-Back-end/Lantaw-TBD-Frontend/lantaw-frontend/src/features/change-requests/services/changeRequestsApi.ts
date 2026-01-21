// This service layer abstracts all API calls related to change requests.

import api from "../../../api/client";
import type { ChangeRequest, ChangeRequestCreateData, ChangeRequestFilters } from "../../../types/changeRequest";

// Response wrapper type (paginated)
interface ApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export const changeRequestsApi = {
  // Fetch all change requests for a project (with optional filters)
  getAll: async (projectId: number, filters?: ChangeRequestFilters): Promise<ChangeRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.change_type) params.append('change_type', filters.change_type);
    if (filters?.operation) params.append('operation', filters.operation);
    
    const queryString = params.toString();
    const url = `/api/projects/${projectId}/change-requests/${queryString ? `?${queryString}` : ''}`;
    
    const res = await api.get<ApiResponse<ChangeRequest>>(url);
    return res.data?.results || [];
  },

  // Fetch all change requests across all projects (Admin only)
  getAllForAdmin: async (filters?: ChangeRequestFilters): Promise<ChangeRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.change_type) params.append('change_type', filters.change_type);
    if (filters?.operation) params.append('operation', filters.operation);
    if (filters?.project) params.append('project', filters.project.toString());
    
    const queryString = params.toString();
    const url = `/api/change-requests/${queryString ? `?${queryString}` : ''}`;
    
    const res = await api.get<ApiResponse<ChangeRequest>>(url);
    return res.data?.results || [];
  },

  // Fetch single change request
  getById: async (projectId: number, requestId: number): Promise<ChangeRequest> => {
    const res = await api.get<ChangeRequest>(
      `/api/projects/${projectId}/change-requests/${requestId}/`
    );
    return res.data;
  },

  // Submit new change request
  create: async (projectId: number, data: ChangeRequestCreateData): Promise<ChangeRequest> => {
    const res = await api.post<ChangeRequest>(
      `/api/projects/${projectId}/change-requests/`,
      data
    );
    return res.data;
  },

  // Approve change request
  approve: async (projectId: number, requestId: number): Promise<ChangeRequest> => {
    const res = await api.post<ChangeRequest>(
      `/api/projects/${projectId}/change-requests/${requestId}/approve/`
    );
    return res.data;
  },

  // Reject change request
  reject: async (projectId: number, requestId: number, reason: string): Promise<ChangeRequest> => {
    const res = await api.post<ChangeRequest>(
      `/api/projects/${projectId}/change-requests/${requestId}/reject/`,
      { rejection_reason: reason }
    );
    return res.data;
  },
};

