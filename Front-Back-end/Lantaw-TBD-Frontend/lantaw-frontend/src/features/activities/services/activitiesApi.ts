// This service layer abstracts all API calls related to activities.

import api from "../../../api/client";
import type { Activity } from "../../../types/activity";
import type { Objective } from "../../../types/objective";
import type { BudgetLineItem } from "../../../types/budgetItem";

// Response wrapper type (paginated)
interface ApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// Objectives API 
export const objectivesApi = {
  // Fetch all objectives of a project
  getAll: async (projectId: number): Promise<Objective[]> => {
    const res = await api.get<ApiResponse<Objective>>(
      `/api/projects/${projectId}/objectives/`
    );
    return res.data?.results || [];
  },

  // Create a new objective
  create: async (
    projectId: number,
    data: { title: string; description: string }
  ): Promise<Objective> => {
    const res = await api.post<Objective>(
      `/api/projects/${projectId}/objectives/`,
      data
    );
    return res.data;
  },

  // Update an existing objective
  update: async (
    projectId: number,
    objectiveId: number,
    data: { title: string; description: string }
  ): Promise<Objective> => {
    const res = await api.patch<Objective>(
      `/api/projects/${projectId}/objectives/${objectiveId}/`,
      data
    );
    return res.data;
  },

  // Delete an objective
  delete: async (projectId: number, objectiveId: number): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/objectives/${objectiveId}/`);
  },
};

// Activities API
export const activitiesApi = {
  // Fetch all activities of an objective
  getByObjective: async (
    projectId: number,
    objectiveId: number
  ): Promise<Activity[]> => {
    const res = await api.get<ApiResponse<Activity>>(
      `/api/projects/${projectId}/objectives/${objectiveId}/activities/`
    );
    return res.data?.results || [];
  },

  // Create an activity
  create: async (
    projectId: number,
    objectiveId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ): Promise<Activity> => {
    const res = await api.post<Activity>(
      `/api/projects/${projectId}/objectives/${objectiveId}/activities/`,
      data
    );
    return res.data;
  },

  // Update an activity
  update: async (
    projectId: number,
    objectiveId: number,
    activityId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ): Promise<Activity> => {
    const res = await api.patch<Activity>(
      `/api/projects/${projectId}/objectives/${objectiveId}/activities/${activityId}/`,
      data
    );
    return res.data;
  },

  // Delete an activity
  delete: async (
    projectId: number,
    objectiveId: number,
    activityId: number
  ): Promise<void> => {
    await api.delete(
      `/api/projects/${projectId}/objectives/${objectiveId}/activities/${activityId}/`
    );
  },
};

// Budget Line Items API
export const budgetItemsApi = {
  // Fetch all budget line items of a project
  getAll: async (projectId: number): Promise<BudgetLineItem[]> => {
    const res = await api.get<ApiResponse<BudgetLineItem>>(
      `/api/projects/${projectId}/budget-line-items/`
    );
    return res.data?.results || [];
  },
};

import type { Project } from "../../../context/ProjectContext";

// Projects API (for status updates)
export const projectsApi = {
  // Update project status
  updateStatus: async (
    projectId: number,
    status: string
  ): Promise<Project> => {
    const res = await api.patch<Project>(`/api/projects/${projectId}/`, {
      project_status: status,
    });
    return res.data;
  },
};

