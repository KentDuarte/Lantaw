// Main orchestrator component for activities management.

import { useState, useEffect } from "react";
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
        <Accordion type="multiple" className="w-full space-y-4">
          {activities.objectives.map((objective) => {
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
