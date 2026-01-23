// Main orchestrator component for dashboard overview

import { useState, useMemo, useEffect } from "react";

// Context
import { useProject } from "../../../context/ProjectContext";
import { useAuth } from "../../../context/AuthContext";

// Hooks
import { useActivities } from "../../activities/hooks/useActivities";
import api from "../../../api/client";

// Common Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/card";
import { Accordion } from "../../../components/common/accordion";

// Components
import { DashboardHeader } from "../components/DashboardHeader";
import { ProjectDurationCard } from "../components/ProjectDurationCard";
import { ObjectivesCompletedCard } from "../components/ObjectivesCompletedCard";
import { BudgetUtilizedCard } from "../components/BudgetUtilizedCard";
import { RemainingBudgetCard } from "../components/RemainingBudgetCard";
import { BudgetOverviewChart } from "../components/BudgetOverviewChart";
import { BudgetBreakdownChart } from "../components/BudgetBreakdownChart";
import { ExpenseComparisonChart } from "../components/ExpenseComparisonChart";
import { ObjectiveAccordion } from "../../activities/components/ObjectiveAccordion";

// Modals
import ProjectModal from "../../layout/components/ProjectModal";

// Helper functions
import { getProjectDuration } from "../utils/calculateProjectDuration";
import { getProjectMetrics } from "../utils/measureProjectMetrics";
import {
  generateColorVariations,
  getBaseColorForCategory,
} from "../utils/pieChartHelper";

// Types
import type { DetailItem } from "../utils/pieChartHelper";
import type { Project } from "../../../types/project";

const DashboardLayout = () => {
  // Context
  const { currentProject, refetchProject } = useProject();
  const { user, loading: authLoading } = useAuth();

  // Show loading state while user data is being fetched
  if (authLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Early return if no project is selected
  if (!currentProject) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Welcome to Lantaw Dashboard</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            No project selected. Please select a project from the sidebar or create a new one.
          </p>
          {user?.role === "Admin" && (
            <p className="text-sm text-muted-foreground">
              As an admin, you can create a new project using the "Create Project" button in the sidebar.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Hooks
  const { objectives } = useActivities(currentProject?.id);
  const activities = useActivities(currentProject?.id || null);

  // State
  const [budgetView, setBudgetView] = useState<BudgetViewType>("OVERVIEW");
  const [editFormData, setEditFormData] = useState({
    name: "",
    projectLeader: "",
    description: "",
    startDate: "",
    endDate: "",
    totalGrant: "",
    projectStaff: "",
  });

  //Modal states
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Editing states
  const [editingProject, setIsEditingProject] = useState<Project | null>(null);

  // Error states
  const [editProjectError, setEditProjectError] = useState("");

  // Helper functions for date
  const {
    totalDays,
    elapsedDays,
    remainingDays,
    progressPercentage,
    startDate,
    endDate,
    isOverdue,
  } = getProjectDuration(currentProject);

  // Helper functions for getting project metrics summary
  const {
    completedObjectives,
    totalObjectives,
    budgetUtilized,
    remainingBudget,
    actualBudgetItemTotal,
    activityDetailedItems,
    expenseComparisonPerBudgetItem,
    expenseSummary,
  } = getProjectMetrics(objectives, currentProject?.grant_amount);

  // Helper functions to render expense breakdown
  type BudgetViewType = "OVERVIEW" | "PS" | "MOOE" | "CO";

  const getBudgetCategoryData = (view: BudgetViewType): DetailItem[] => {
    // Check if the view is a specific category (PS, MOOE, CO)
    if (view !== "OVERVIEW" && activityDetailedItems[view]) {
      return activityDetailedItems[view];
    }
    return [];
  };

  const categoryData = getBudgetCategoryData(budgetView);
  const categoryName =
    budgetView === "PS"
      ? "Personnel Services"
      : budgetView === "MOOE"
      ? "MOOE"
      : "Capital Outlay";

  const detailColors = useMemo(() => {
    if (budgetView === "OVERVIEW") return [];

    const baseColor = getBaseColorForCategory(budgetView);
    return generateColorVariations(baseColor, categoryData.length);
  }, [budgetView, categoryData]);

  // Helper function to check if financial values should be hidden
  const hideFinancialValues = user?.role === "Executive";

  // Helper function to change views of budget pie chart based on click
  const renderBudgetBreakdown = () => {
    if (budgetView === "OVERVIEW") {
      return (
        <BudgetOverviewChart
          data={actualBudgetItemTotal}
          onSliceClick={setBudgetView}
          hideFinancialValues={hideFinancialValues}
        />
      );
    } else {
      return (
        <BudgetBreakdownChart
          categoryData={categoryData}
          categoryName={categoryName}
          detailColors={detailColors}
          onBack={() => setBudgetView("OVERVIEW")}
          hideFinancialValues={hideFinancialValues}
        />
      );
    }
  };

  // Helper for editing project
  useEffect(() => {
    if (currentProject && isEditProjectModalOpen) {
      setEditFormData({
        name: currentProject.name || "",
        projectLeader: currentProject.project_leader || "",
        description: currentProject.description || "",
        startDate: currentProject.date_start || "",
        endDate: currentProject.date_end || "",
        totalGrant: String(currentProject.grant_amount || 0),
        projectStaff: "",
      });
    }
  }, [currentProject, isEditProjectModalOpen]);

  // Handlers for editing project
  const handleOpenEditProjectModal = () => {
    setIsEditProjectModalOpen(true);
  };

  const handleEditProject = async () => {
    if (!currentProject?.id) {
      setEditProjectError("Error: Cannot find project ID for editing.");
      return;
    }

    // Authorization Check
    if (user?.role !== "Admin") {
      setEditProjectError("You are not authorized to edit projects.");
      return;
    }

    setEditProjectError("");

    // Basic Field Validation
    if (!editFormData.name.trim()) {
      setEditProjectError("Project name is required.");
      return;
    }

    try {
      // Create project payload
      const projectPayload = {
        name: editFormData.name,
        project_leader: editFormData.projectLeader,
        description: editFormData.description,
        date_start: editFormData.startDate,
        date_end: editFormData.endDate,
        grant_amount: parseFloat(editFormData.totalGrant) || 0,
      };

      // Patch API
      await api.patch(`/api/projects/${currentProject.id}/`, projectPayload);

      // Success handlers
      await refetchProject(currentProject.id);
      setIsEditProjectModalOpen(false);
      setEditProjectError("");
    } catch (err) {
      console.error("Failed to edit project:", err);
      setEditProjectError(
        "Something went wrong while saving changes. Please try again."
      );
    }
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <DashboardHeader
        projectName={currentProject.name}
        projectLeader={currentProject.project_leader}
        projectDescription={currentProject.description || ""}
        onEditProject={handleOpenEditProjectModal}
        userRole={user?.role}
      />

      {/* Summary Cards */}
      {/* Project Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectDurationCard
          projectStatus={currentProject.project_status}
          isOverdue={isOverdue}
          remainingDays={remainingDays}
          elapsedDays={elapsedDays}
          totalDays={totalDays}
          startDate={startDate}
          endDate={endDate}
          progressPercentage={progressPercentage}
        />

        {/* Objectives Completed */}
        <ObjectivesCompletedCard
          completedObjectives={completedObjectives}
          totalObjectives={totalObjectives}
        />

        {/* Budget Utilized */}
        <BudgetUtilizedCard budgetUtilized={budgetUtilized} />

        {/* Remaining Bugdet */}
        <RemainingBudgetCard remainingBudget={remainingBudget} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {budgetView === "OVERVIEW"
                ? "Budget Distribution"
                : budgetView === "PS"
                ? "Personnel Breakdown"
                : budgetView === "MOOE"
                ? "MOOE Breakdown"
                : "Capital Outlay Breakdown"}
            </CardTitle>
            {budgetView === "OVERVIEW" && (
              <p className="text-sm text-muted-foreground">
                Click on a section to view detailed breakdown.
              </p>
            )}
          </CardHeader>
          <CardContent>{renderBudgetBreakdown()}</CardContent>
        </Card>
        {/* Bar Chart */}
        <ExpenseComparisonChart
          data={expenseComparisonPerBudgetItem}
          projectSummary={expenseSummary}
          hideFinancialValues={hideFinancialValues}
        />
      </div>

      {/* Objectives Summary */}
      <Card>
        <CardHeader>Objectives Overview</CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Accordion type="multiple" className="w-full space-y-4">
              <Accordion type="multiple" className="w-full space-y-4">
                {activities.objectives.map((objective) => {
                  const allActivities =
                    activities.activitiesMap[objective.id] || [];

                  const isLoading = activities.loadingActivities[objective.id];

                  return (
                    <ObjectiveAccordion
                      key={objective.id}
                      objective={objective}
                      activities={allActivities}
                      isLoading={isLoading}
                      onExpand={activities.fetchActivities}
                      budgetLineItems={[]}
                      showActions={false}
                      hideFinancialValues={hideFinancialValues}
                    />
                  );
                })}
              </Accordion>
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      <ProjectModal
        open={isEditProjectModalOpen}
        onOpenChange={setIsEditProjectModalOpen}
        isEdit={true}
        formData={editFormData}
        setFormData={setEditFormData}
        onSubmit={handleEditProject}
        userRole={user?.role}
      />
    </div>
  );
};

export default DashboardLayout;
