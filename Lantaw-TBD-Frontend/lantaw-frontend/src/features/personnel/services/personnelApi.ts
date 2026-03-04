// This service layer abstracts all API calls related to personnel.

import api from "../../../api/client";
import type { Personnel } from "../../../types/personnel";
import type { CompensationCreateData, Compensation } from "../../../types/compensation";
import type { Role } from "../../../types/role"
import type { Department } from "../../../types/department"

// Response wrapper type (paginated)
interface ApiResponse<T> {
    results: T[];
    count?: number;
    next?: string | null;
    previous?: string | null;
}

// Personnel API
export const personnelApi ={
    // Fetch all personnel of a project
    getAll: async (projectId: number): Promise<Personnel[]> => {
        const res = await api.get<ApiResponse<Personnel>>(
            `/api/projects/${projectId}/personnel/`
        );
        return res.data?.results || [];
    },

    // Add a new personnel
    create: async (
        projectId: number,
        data: { 
            first_name: string; 
            last_name: string; 
            role: number | null; 
            department: number | null; 
            employment_status: Personnel["employment_status"]; 
        }
    ): Promise<Personnel> => {
        const res = await api.post<Personnel>(
            `/api/projects/${projectId}/personnel/`,
            data
        );
        return res.data;
    },

    // Update an existing personnel
    update: async (
        projectId: number,
        personnelId: number,
        data: { 
            first_name: string; 
            last_name: string; 
            role: number | null; 
            department: number | null; 
            employment_status: Personnel["employment_status"]; 
        }
    ): Promise<Personnel> => {
        const res = await api.patch<Personnel>(
            `/api/projects/${projectId}/personnel/${personnelId}/`,
            data
        );
        return res.data;
    },

    // Delete a personnel
    delete: async (
        projectId: number, 
        personnelId: number,
    ): Promise<void> => {
        await api.delete(`/api/projects/${projectId}/personnel/${personnelId}/`);
    },
};

// Compensation API
export const compensationApi = {
    // Fetches all compensations for a specific project
    getAll: async (
        projectId: number,
    ): Promise<Compensation[]> => {
        const res = await api.get<ApiResponse<Compensation>>(
            `/api/projects/${projectId}/compensations/`
        );
        return res.data?.results || [];
    },

    // Create a new compensation entry
    create: async (
        projectId: number,
        data: CompensationCreateData 
    ): Promise<Compensation> => {
        const res = await api.post<Compensation>(
            `/api/projects/${projectId}/compensations/`,
            data 
        );
        return res.data;
    },

    // Update an existing compensation entry
    update: async (
        projectId: number,
        compensationId: number,
        data: Partial<CompensationCreateData> 
    ): Promise<Compensation> => {
        const res = await api.patch<Compensation>(
            `/api/projects/${projectId}/compensations/${compensationId}/`,
            data 
        );
        return res.data;
    },

    // Delete a compensation entry
    delete: async (
        projectId: number,
        compensationId: number,
    ): Promise<void> => {
        await api.delete(
            `/api/projects/${projectId}/compensations/${compensationId}/`
        );
    },
};

// Role API
export const roleApi = {
    // Fetches all roles in a project
    getAll: async (
        projectId: number,
    ): Promise<Role[]> => {
        const res = await api.get<ApiResponse<Role>>(
            `/api/projects/${projectId}/roles/`,
        );
        return res.data?.results || [];
    },

    // Create a new role
    create: async (
        projectId: number,
        data: {name: string}
    ): Promise<Role> => {
        const res = await api.post<Role>(
            `/api/projects/${projectId}/roles/`,
            data
        );
        return res.data;
    },
};

// Department API
export const departmentApi = {
    // Fetches all departments within a project
    getAll: async (
        projectId: number,
    ): Promise<Department[]> => {
        const res = await api.get<ApiResponse<Department>>(
            `/api/projects/${projectId}/departments/`,
        );
        return res.data?.results || [];
    },

    // Create a new department
    create: async (
        projectId: number,
        data: {name: string}
    ): Promise<Department> => {
        const res = await api.post<Department>(
            `/api/projects/${projectId}/departments/`,
            data
        );
        return res.data;
    },
};