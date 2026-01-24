// Main orchestrator component for activities management.

import { useState, useEffect, useMemo, useRef } from "react";
import { Accordion } from "../../../components/common/accordion";

// Context
import { useProject } from "../../../context/ProjectContext";
import { useAuth } from "../../../context/AuthContext";

// Hooks
import { useActivities } from "../hooks/useActivities";
import { useActivityFilters } from "../hooks/useActivityFilters";

// Components
import { ActivitiesHeader } from "./ActivitiesHeader";
import { ActivitiesFilters } from "./ActivitiesFilters";
import { ObjectiveAccordion } from "./ObjectiveAccordion";

// Modals
import { ObjectiveModal } from "./modals/ObjectiveModal";
import { ActivityModal } from "./modals/ActivityModal";
import { DeleteObjectiveModal } from "./modals/DeleteObjectiveModal";
import { DeleteActivityModal } from "./modals/DeleteActivityModal";
import { AddExpenseModal } from "./modals/AddExpenseModal";
import { ProjectStatusModal } from "./modals/ProjectStatusModal";
import { SubmitChangeRequestModal } from "../../change-requests/components/SubmitChangeRequestModal";

// API
import { projectsApi } from "../services/activitiesApi";
import { changeRequestsApi } from "../../change-requests/services/changeRequestsApi";

// Types
import type { Objective } from "../../../types/objective";
import type { Activity } from "../../../types/activity";

const ActivitiesLayout = () => {
  const { currentProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  const activities = useActivities(currentProject?.id || null);
  const filters = useActivityFilters();
  
  // Helper to check if financial values should be hidden
  const hideFinancialValues = user?.role === "Executive";

  // Project status state
  const [projectStatus, setProjectStatus] = useState<
    "ACTIVE" | "COMPLETED" | "ONHOLD"
  >(currentProject?.project_status || "ACTIVE");

  // Modal states
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isProjectStatusModalOpen, setIsProjectStatusModalOpen] =
    useState(false);
  const [isDeleteActivityModalOpen, setIsDeleteActivityModalOpen] =
    useState(false);
  const [isDeleteObjectiveModalOpen, setIsDeleteObjectiveModalOpen] =
    useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSubmitChangeRequestModalOpen, setIsSubmitChangeRequestModalOpen] = useState(false);

  // Change request state
  const [pendingChangeRequest, setPendingChangeRequest] = useState<{
    changeType: 'OBJECTIVE' | 'ACTIVITY';
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    entityId?: number | null;
    currentState?: Record<string, any> | null;
    proposedChanges: Record<string, any>;
  } | null>(null);

  // Editing states
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null
  );
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Expanded objectives state (controlled accordion)
  const [expandedObjectives, setExpandedObjectives] = useState<string[]>([]);
  
  // Track the last search query to avoid refetching unnecessarily
  const lastSearchQueryRef = useRef<string>("");

  // Update project status when currentProject changes
  useEffect(() => {
    if (currentProject?.project_status) {
      setProjectStatus(currentProject.project_status);
    }
  }, [currentProject]);

  // Handlers
  const handleOpenAddObjectiveModal = () => {
    setEditingObjective(null);
    setIsObjectiveModalOpen(true);
  };

  const handleOpenEditObjectiveModal = (objective: Objective) => {
    setEditingObjective(objective);
    setIsObjectiveModalOpen(true);
  };

  const handleOpenAddActivityModal = (objective: Objective) => {
    setEditingObjective(objective);
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivityModal = (
    activity: Activity,
    objective: Objective
  ) => {
    setEditingActivity(activity);
    setEditingObjective(objective);
    setIsActivityModalOpen(true);
  };

  const handleOpenDeleteObjectiveModal = (objective: Objective) => {
    setEditingObjective(objective);
    setIsDeleteObjectiveModalOpen(true);
  };

  const handleOpenDeleteActivityModal = (
    activity: Activity,
    objective: Objective
  ) => {
    setEditingActivity(activity);
    setEditingObjective(objective);
    setIsDeleteActivityModalOpen(true);
  };

  const handleOpenAddExpenseModal = (
    activity: Activity,
    objective: Objective
  ) => {
    setEditingActivity(activity);
    setEditingObjective(objective);
    setIsAddExpenseModalOpen(true);
  };

  // Objective operations
  const handleCreateObjective = async (data: {
    title: string;
    description: string;
  }) => {
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'OBJECTIVE',
        operation: 'CREATE',
        entityId: null,
        currentState: null,
        proposedChanges: data,
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsObjectiveModalOpen(false);
    } else {
      // Admin can create directly
      await activities.createObjective(data);
    }
  };

  const handleEditObjective = async (data: {
    title: string;
    description: string;
  }) => {
    if (!editingObjective) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'OBJECTIVE',
        operation: 'UPDATE',
        entityId: editingObjective.id,
        currentState: {
          title: editingObjective.title,
          description: editingObjective.description,
        },
        proposedChanges: data,
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsObjectiveModalOpen(false);
    } else {
      // Admin can update directly
      await activities.updateObjective(editingObjective.id, data);
    }
  };

  const handleDeleteObjective = async () => {
    if (!editingObjective) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'OBJECTIVE',
        operation: 'DELETE',
        entityId: editingObjective.id,
        currentState: {
          title: editingObjective.title,
          description: editingObjective.description,
        },
        proposedChanges: {},
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsDeleteObjectiveModalOpen(false);
    } else {
      // Admin can delete directly
      await activities.deleteObjective(editingObjective.id);
      setEditingObjective(null);
    }
  };

  // Activity operations
  const handleCreateActivity = async (data: {
    title: string;
    activity_status: Activity["activity_status"];
    projected_expense: string | null;
    actual_expense: string | null;
    activity_budget_item: number | null;
  }) => {
    if (!editingObjective) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'ACTIVITY',
        operation: 'CREATE',
        entityId: null,
        currentState: null,
        proposedChanges: {
          ...data,
          objective: editingObjective.id,
        },
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsActivityModalOpen(false);
    } else {
      // Admin can create directly
      await activities.createActivity(editingObjective.id, data);
    }
  };

  const handleEditActivity = async (data: {
    title: string;
    activity_status: Activity["activity_status"];
    projected_expense: string | null;
    actual_expense: string | null;
    activity_budget_item: number | null;
  }) => {
    if (!editingObjective || !editingActivity) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'ACTIVITY',
        operation: 'UPDATE',
        entityId: editingActivity.id,
        currentState: {
          title: editingActivity.title,
          activity_status: editingActivity.activity_status,
          projected_expense: editingActivity.projected_expense,
          actual_expense: editingActivity.actual_expense,
          activity_budget_item: editingActivity.activity_budget_item,
        },
        proposedChanges: data,
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsActivityModalOpen(false);
    } else {
      // Admin can update directly
      await activities.updateActivity(
        editingObjective.id,
        editingActivity.id,
        data
      );
      setEditingActivity(null);
    }
  };

  const handleDeleteActivity = async () => {
    if (!editingObjective || !editingActivity) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'ACTIVITY',
        operation: 'DELETE',
        entityId: editingActivity.id,
        currentState: {
          title: editingActivity.title,
          activity_status: editingActivity.activity_status,
          projected_expense: editingActivity.projected_expense,
          actual_expense: editingActivity.actual_expense,
          activity_budget_item: editingActivity.activity_budget_item,
        },
        proposedChanges: {},
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsDeleteActivityModalOpen(false);
    } else {
      // Admin can delete directly
      await activities.deleteActivity(editingObjective.id, editingActivity.id);
      setEditingActivity(null);
    }
  };

  const handleAddExpense = async (amount: number) => {
    if (!editingObjective || !editingActivity) return;
    
    if (user?.role === "Project Staff" && currentProject) {
      // Calculate new actual expense
      const currentActual = Number(editingActivity.actual_expense || 0);
      const newActual = currentActual + amount;
      
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'ACTIVITY',
        operation: 'UPDATE',
        entityId: editingActivity.id,
        currentState: {
          title: editingActivity.title,
          activity_status: editingActivity.activity_status,
          projected_expense: editingActivity.projected_expense,
          actual_expense: editingActivity.actual_expense,
          activity_budget_item: editingActivity.activity_budget_item,
        },
        proposedChanges: {
          title: editingActivity.title,
          activity_status: editingActivity.activity_status,
          projected_expense: editingActivity.projected_expense,
          actual_expense: newActual.toString(),
          activity_budget_item: editingActivity.activity_budget_item,
        },
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsAddExpenseModalOpen(false);
    } else {
      // Admin can add expense directly
      await activities.addExpense(
        editingObjective.id,
        editingActivity.id,
        amount
      );
      setEditingActivity(null);
    }
  };

  // Project status update
  const handleProjectStatusUpdate = async () => {
    if (!currentProject) return;

    // Prevent Executives from updating project status
    if (user?.role === "Executive") {
      setIsProjectStatusModalOpen(false);
      return;
    }

    if (user?.role === "Project Staff") {
      // Show change request modal for Project Staff
      setPendingChangeRequest({
        changeType: 'PROJECT',
        operation: 'UPDATE',
        entityId: currentProject.id,
        currentState: {
          project_status: currentProject.project_status,
        },
        proposedChanges: {
          project_status: projectStatus,
        },
      });
      setIsSubmitChangeRequestModalOpen(true);
      setIsProjectStatusModalOpen(false);
    } else {
      // Admin can update directly
      try {
        const updatedProject = await projectsApi.updateStatus(
          currentProject.id,
          projectStatus
        );
        setCurrentProject(updatedProject);
        setIsProjectStatusModalOpen(false);
      } catch (error) {
        console.error("Failed to update project status:", error);
      }
    }
  };

  // Get filtered activities for an objective
  const getFilteredActivitiesForObjective = (objectiveId: number) => {
    const rawActivities = activities.activitiesMap[objectiveId];
    return filters.filterActivities(rawActivities);
  };

  // Compute which objectives should be auto-expanded based on search query
  const objectivesToAutoExpand = useMemo(() => {
    const searchQuery = filters.filters.searchQuery.trim();
    
    // If search query is empty, don't auto-expand (let user control manually)
    if (!searchQuery) {
      return [];
    }

    const searchLower = searchQuery.toLowerCase();
    
    // Find objectives that should be auto-expanded
    const toExpand: string[] = [];
    
    activities.objectives.forEach((objective) => {
      // Check if objective title or description matches
      const objectiveMatches = 
        objective.title.toLowerCase().includes(searchLower) ||
        objective.description.toLowerCase().includes(searchLower);
      
      // Check if objective has matching activities (if activities are loaded)
      const objectiveActivities = activities.activitiesMap[objective.id];
      const hasActivitiesLoaded = objectiveActivities !== undefined;
      const filteredActivities = hasActivitiesLoaded 
        ? filters.filterActivities(objectiveActivities)
        : [];
      const hasMatchingActivities = filteredActivities.length > 0;
      
      // Auto-expand if:
      // 1. Objective matches by title/description (expand immediately, even if activities not loaded), OR
      // 2. Objective has matching activities (after activities are loaded)
      if (objectiveMatches || hasMatchingActivities) {
        toExpand.push(`objective-${objective.id}`);
      }
    });

    return toExpand;
  }, [filters.filters.searchQuery, activities.objectives, activities.activitiesMap, filters.filterActivities]);

  // Fetch activities for all objectives when search query is set (only once per search query)
  useEffect(() => {
    const searchQuery = filters.filters.searchQuery.trim();
    
    // Only fetch if search query changed and is not empty
    if (searchQuery && searchQuery !== lastSearchQueryRef.current) {
      lastSearchQueryRef.current = searchQuery;
      
      // Proactively fetch activities for all objectives when searching
      // This ensures we can check for matching activities even if they weren't loaded yet
      activities.objectives.forEach((objective) => {
        // Fetch activities if they haven't been loaded yet
        if (!activities.activitiesMap[objective.id]) {
          activities.fetchActivities(objective.id);
        }
      });
    } else if (!searchQuery) {
      // Reset ref when search is cleared
      lastSearchQueryRef.current = "";
    }
  }, [filters.filters.searchQuery]);

  // Update expanded objectives when search query or activities change
  useEffect(() => {
    const searchQuery = filters.filters.searchQuery.trim();
    
    if (searchQuery) {
      // When searching, auto-expand objectives with matching activities
      // Only update if the expansion list actually changed to avoid infinite loops
      setExpandedObjectives((prev) => {
        const prevSet = new Set(prev);
        const newSet = new Set(objectivesToAutoExpand);
        
        // Check if arrays are different
        if (prev.length !== objectivesToAutoExpand.length) {
          return objectivesToAutoExpand;
        }
        
        const hasChanges = objectivesToAutoExpand.some(
          (id) => !prevSet.has(id)
        ) || prev.some((id) => !newSet.has(id));
        
        return hasChanges ? objectivesToAutoExpand : prev;
      });
    }
    // When search is cleared, keep current expansion state (user's manual choices)
    // This allows users to maintain their manual expansion preferences
  }, [objectivesToAutoExpand, filters.filters.searchQuery]);

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No project selected.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ActivitiesHeader
        projectName={currentProject.name}
        projectStatus={projectStatus}
        onEditProjectStatus={() => setIsProjectStatusModalOpen(true)}
        onAddObjective={handleOpenAddObjectiveModal}
        userRole={user?.role}
      />

      {/* Search and Filters */}
      <ActivitiesFilters filters={filters} />

      {/* Objectives Accordion */}
      <div className="space-y-4">
        <Accordion 
          type="multiple" 
          className="w-full space-y-4"
          value={expandedObjectives}
          onValueChange={setExpandedObjectives}
        >
          {activities.objectives
            .filter((objective) => {
              const objectiveActivities = activities.activitiesMap[objective.id];
              return filters.filterObjectives(objective, objectiveActivities);
            })
            .map((objective) => {
              const filteredActivities = getFilteredActivitiesForObjective(
                objective.id
              );
              const isLoading = activities.loadingActivities[objective.id];

              return (
                <ObjectiveAccordion
                  key={objective.id}
                  objective={objective}
                  activities={filteredActivities}
                  isLoading={isLoading}
                  onExpand={activities.fetchActivities}
                  budgetLineItems={activities.budgetLineItems}
                  onEditObjective={handleOpenEditObjectiveModal}
                  onDeleteObjective={handleOpenDeleteObjectiveModal}
                  onAddActivity={handleOpenAddActivityModal}
                  onEditActivity={handleOpenEditActivityModal}
                  onDeleteActivity={handleOpenDeleteActivityModal}
                  onAddExpense={handleOpenAddExpenseModal}
                  showActions={user?.role !== "Executive"}
                  hideFinancialValues={hideFinancialValues}
                />
              );
            })}
        </Accordion>
      </div>

      {/* Modals */}
      <ProjectStatusModal
        isOpen={isProjectStatusModalOpen}
        onClose={() => setIsProjectStatusModalOpen(false)}
        projectStatus={projectStatus}
        onStatusChange={(status) =>
          setProjectStatus(status as "ACTIVE" | "COMPLETED" | "ONHOLD")
        }
        onUpdate={handleProjectStatusUpdate}
      />

      <ObjectiveModal
        isOpen={isObjectiveModalOpen}
        onClose={() => {
          setIsObjectiveModalOpen(false);
          setEditingObjective(null);
        }}
        objective={editingObjective}
        onSubmit={
          editingObjective ? handleEditObjective : handleCreateObjective
        }
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
          setEditingObjective(null);
        }}
        activity={editingActivity}
        budgetLineItems={activities.budgetLineItems}
        onSubmit={editingActivity ? handleEditActivity : handleCreateActivity}
      />

      <DeleteObjectiveModal
        isOpen={isDeleteObjectiveModalOpen}
        onClose={() => {
          setIsDeleteObjectiveModalOpen(false);
          setEditingObjective(null);
        }}
        onConfirm={handleDeleteObjective}
        objectiveTitle={editingObjective?.title}
      />

      <DeleteActivityModal
        isOpen={isDeleteActivityModalOpen}
        onClose={() => {
          setIsDeleteActivityModalOpen(false);
          setEditingActivity(null);
          setEditingObjective(null);
        }}
        onConfirm={handleDeleteActivity}
        activityTitle={editingActivity?.title}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setEditingActivity(null);
          setEditingObjective(null);
        }}
        activity={editingActivity}
        onSubmit={handleAddExpense}
      />

      {/* Change Request Submission Modal */}
      {pendingChangeRequest && currentProject && (
        <SubmitChangeRequestModal
          open={isSubmitChangeRequestModalOpen}
          onOpenChange={setIsSubmitChangeRequestModalOpen}
          projectId={currentProject.id}
          changeType={pendingChangeRequest.changeType}
          operation={pendingChangeRequest.operation}
          entityId={pendingChangeRequest.entityId}
          currentState={pendingChangeRequest.currentState}
          proposedChanges={pendingChangeRequest.proposedChanges}
          onSubmit={async (data) => {
            await changeRequestsApi.create(currentProject.id, data);
            setPendingChangeRequest(null);
            // Refresh activities to show updated data
            await activities.fetchObjectives();
          }}
        />
      )}
    </div>
  );
};

export default ActivitiesLayout;
