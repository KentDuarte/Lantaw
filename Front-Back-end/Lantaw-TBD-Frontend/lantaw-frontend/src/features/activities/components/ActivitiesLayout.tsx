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

// API
import { projectsApi } from "../services/activitiesApi";

// Types
import type { Objective } from "../../../types/objective";
import type { Activity } from "../../../types/activity";

const ActivitiesLayout = () => {
  const { currentProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  const activities = useActivities(currentProject?.id || null);
  const filters = useActivityFilters();

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
    await activities.createObjective(data);
  };

  const handleEditObjective = async (data: {
    title: string;
    description: string;
  }) => {
    if (!editingObjective) return;
    await activities.updateObjective(editingObjective.id, data);
  };

  const handleDeleteObjective = async () => {
    if (!editingObjective) return;
    await activities.deleteObjective(editingObjective.id);
    setEditingObjective(null);
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
    await activities.createActivity(editingObjective.id, data);
  };

  const handleEditActivity = async (data: {
    title: string;
    activity_status: Activity["activity_status"];
    projected_expense: string | null;
    actual_expense: string | null;
    activity_budget_item: number | null;
  }) => {
    if (!editingObjective || !editingActivity) return;
    await activities.updateActivity(
      editingObjective.id,
      editingActivity.id,
      data
    );
    setEditingActivity(null);
  };

  const handleDeleteActivity = async () => {
    if (!editingObjective || !editingActivity) return;
    await activities.deleteActivity(editingObjective.id, editingActivity.id);
    setEditingActivity(null);
  };

  const handleAddExpense = async (amount: number) => {
    if (!editingObjective || !editingActivity) return;
    await activities.addExpense(
      editingObjective.id,
      editingActivity.id,
      amount
    );
    setEditingActivity(null);
  };

  // Project status update
  const handleProjectStatusUpdate = async () => {
    if (!currentProject) return;

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
    </div>
  );
};

export default ActivitiesLayout;
