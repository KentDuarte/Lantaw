// This custom hook manages all objectives and activities-related data fetching and mutations.
/**
  It encapsulates:
  - Objectives fetching and CRUD operations
  - Activities fetching and CRUD operations
  - Budget items fetching
  - Loading states
  - Error handling
 */

import { useState, useEffect, useCallback } from "react";
import type { Activity } from "../../../types/activity";
import type { Objective } from "../../../types/objective";
import type { BudgetLineItem } from "../../../types/budgetItem";
import {
  objectivesApi,
  activitiesApi,
  budgetItemsApi,
} from "../services/activitiesApi";

interface ActivitiesMap {
  [key: number]: Activity[];
}

interface UseActivitiesReturn {
  // Data
  objectives: Objective[];
  activitiesMap: ActivitiesMap;
  budgetLineItems: BudgetLineItem[];
  
  // Loading states
  loadingObjectives: boolean;
  loadingActivities: Record<number, boolean>;
  loadingBudgetItems: boolean;
  
  // Objectives operations
  fetchObjectives: () => Promise<void>;
  createObjective: (data: { title: string; description: string }) => Promise<void>;
  updateObjective: (id: number, data: { title: string; description: string }) => Promise<void>;
  deleteObjective: (id: number) => Promise<void>;
  
  // Activities operations
  fetchActivities: (objectiveId: number) => Promise<void>;
  createActivity: (
    objectiveId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ) => Promise<void>;
  updateActivity: (
    objectiveId: number,
    activityId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ) => Promise<void>;
  deleteActivity: (objectiveId: number, activityId: number) => Promise<void>;
  addExpense: (objectiveId: number, activityId: number, additionalAmount: number) => Promise<void>;
  
  // Budget item operations
  fetchBudgetItems: () => Promise<void>;
  
  // Error handling
  error: Error | null;
}

export const useActivities = (projectId: number | null): UseActivitiesReturn => {
  // State
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [activitiesMap, setActivitiesMap] = useState<ActivitiesMap>({});
  const [budgetLineItems, setBudgetLineItems] = useState<BudgetLineItem[]>([]);
  
  // Loading states
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState<Record<number, boolean>>({});
  const [loadingBudgetItems, setLoadingBudgetItems] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch objectives
  const fetchObjectives = useCallback(async () => {
    if (!projectId) return;
    
    setLoadingObjectives(true);
    setError(null);
    try {
      const data = await objectivesApi.getAll(projectId);
      setObjectives(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch objectives");
      setError(error);
      console.error("Failed to fetch objectives:", err);
    } finally {
      setLoadingObjectives(false);
    }
  }, [projectId]);

  // Fetch activities for an objective
  const fetchActivities = useCallback(async (objectiveId: number) => {
    if (!projectId) return;
    
    // Avoid refetch if data exists
    if (activitiesMap[objectiveId]) return;

    setLoadingActivities((prev) => ({ ...prev, [objectiveId]: true }));
    setError(null);
    
    try {
      const data = await activitiesApi.getByObjective(projectId, objectiveId);
      setActivitiesMap((prev) => ({
        ...prev,
        [objectiveId]: data,
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch activities");
      setError(error);
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoadingActivities((prev) => ({ ...prev, [objectiveId]: false }));
    }
  }, [projectId, activitiesMap]);

  // Fetch budget items
  const fetchBudgetItems = useCallback(async () => {
    if (!projectId) return;
    
    setLoadingBudgetItems(true);
    setError(null);
    try {
      const data = await budgetItemsApi.getAll(projectId);
      setBudgetLineItems(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch budget items");
      setError(error);
      console.error("Failed to fetch budget items", err);
    } finally {
      setLoadingBudgetItems(false);
    }
  }, [projectId]);

  // Create objective
  const createObjective = useCallback(async (data: { title: string; description: string }) => {
    if (!projectId) return;
    
    setError(null);
    try {
      const newObjective = await objectivesApi.create(projectId, data);
      setObjectives((prev) => [...prev, newObjective]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create objective");
      setError(error);
      console.error("Failed to create objective:", err);
      throw error;
    }
  }, [projectId]);

  // Update objective
  const updateObjective = useCallback(async (
    id: number,
    data: { title: string; description: string }
  ) => {
    if (!projectId) return;
    
    setError(null);
    try {
      const updatedObjective = await objectivesApi.update(projectId, id, data);
      setObjectives((prev) =>
        prev.map((obj) => (obj.id === updatedObjective.id ? updatedObjective : obj))
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update objective");
      setError(error);
      console.error("Failed to update objective:", err);
      throw error;
    }
  }, [projectId]);

  // Delete objective
  const deleteObjective = useCallback(async (id: number) => {
    if (!projectId) return;
    
    setError(null);
    try {
      await objectivesApi.delete(projectId, id);
      setObjectives((prev) => prev.filter((obj) => obj.id !== id));
      // Also remove activities for this objective
      setActivitiesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete objective");
      setError(error);
      console.error("Failed to delete objective:", err);
      throw error;
    }
  }, [projectId]);

  // Create activity
  const createActivity = useCallback(async (
    objectiveId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ) => {
    if (!projectId) return;
    
    setError(null);
    try {
      const newActivity = await activitiesApi.create(projectId, objectiveId, data);
      setActivitiesMap((prev) => ({
        ...prev,
        [objectiveId]: [...(prev[objectiveId] || []), newActivity],
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create activity");
      setError(error);
      console.error("Failed to create activity:", err);
      throw error;
    }
  }, [projectId]);

  // Update activity
  const updateActivity = useCallback(async (
    objectiveId: number,
    activityId: number,
    data: {
      title: string;
      activity_status: Activity["activity_status"];
      projected_expense: string | null;
      actual_expense: string | null;
      activity_budget_item: number | null;
    }
  ) => {
    if (!projectId) return;
    
    setError(null);
    try {
      const updatedActivity = await activitiesApi.update(projectId, objectiveId, activityId, data);
      setActivitiesMap((prev) => ({
        ...prev,
        [objectiveId]: prev[objectiveId].map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        ),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update activity");
      setError(error);
      console.error("Failed to update activity:", err);
      throw error;
    }
  }, [projectId]);

  // Delete activity
  const deleteActivity = useCallback(async (objectiveId: number, activityId: number) => {
    if (!projectId) return;
    
    setError(null);
    try {
      await activitiesApi.delete(projectId, objectiveId, activityId);
      setActivitiesMap((prev) => ({
        ...prev,
        [objectiveId]: prev[objectiveId].filter((act) => act.id !== activityId),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete activity");
      setError(error);
      console.error("Failed to delete activity:", err);
      throw error;
    }
  }, [projectId]);

  // Add expense to activity
  const addExpense = useCallback(async (
    objectiveId: number,
    activityId: number,
    additionalAmount: number,
    description: string
  ) => {
    if (!projectId) return;
    
    setError(null);
    try {
      // Get current activity
      const currentActivity = activitiesMap[objectiveId]?.find(
        (act) => act.id === activityId
      );
      
      if (!currentActivity) {
        throw new Error("Activity not found");
      }

      const currentExpense = Number(currentActivity.actual_expense || 0);
      const newTotalExpense = currentExpense + additionalAmount;

      const updatedActivity = await activitiesApi.update(
        projectId,
        objectiveId,
        activityId,
        {
          title: currentActivity.title,
          activity_status: currentActivity.activity_status,
          activity_budget_item: currentActivity.activity_budget_item ?? null,
          projected_expense: currentActivity.projected_expense,
          actual_expense: newTotalExpense.toString(),
          description: description,
        }
      );

      setActivitiesMap((prev) => ({
        ...prev,
        [objectiveId]: prev[objectiveId].map((act) =>
          act.id === updatedActivity.id ? updatedActivity : act
        ),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to add expense");
      setError(error);
      console.error("Failed to add expense:", err);
      throw error;
    }
  }, [projectId, activitiesMap]);

  // Initial data fetch
  useEffect(() => {
    if (projectId) {
      fetchObjectives();
      fetchBudgetItems();
    }
  }, [projectId, fetchObjectives, fetchBudgetItems]);

  return {
    // Data
    objectives,
    activitiesMap,
    budgetLineItems,
    
    // Loading states
    loadingObjectives,
    loadingActivities,
    loadingBudgetItems,
    
    // Objectives operations
    fetchObjectives,
    createObjective,
    updateObjective,
    deleteObjective,
    
    // Activities operations
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    addExpense,
    
    // Budget items
    fetchBudgetItems,
    
    // Error handling
    error,
  };
};
