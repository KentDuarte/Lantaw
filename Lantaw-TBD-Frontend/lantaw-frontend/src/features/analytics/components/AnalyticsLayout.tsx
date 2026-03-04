import { useState, useMemo, useEffect } from "react";
import { useProject } from "../../../context/ProjectContext";
import { useAuth } from "../../../context/AuthContext";
import { useActivities } from "../../activities/hooks/useActivities";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/common/card";
import { AnalyticsFiltersComponent } from "./AnalyticsFilters";
import { ActivityExpenseChart } from "./ActivityExpenseChart";
import {
  filterActivitiesByCategory,
  filterActivitiesByDateRange,
  getActivityExpenseData,
} from "../utils/analyticsFilters";
import type { AnalyticsFilters, ChartViewType } from "../types/analytics";
import type { Activity } from "../../../types/activity";

const AnalyticsLayout = () => {
  const { currentProject } = useProject();
  const { loading: authLoading } = useAuth();

  // Show loading state while user data is being fetched
  if (authLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Early return if no project is selected
  if (!currentProject) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            No project selected. Please select a project from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Fetch activities
  const activities = useActivities(currentProject.id);

  // Fetch all activities for all objectives when component mounts or objectives change
  useEffect(() => {
    activities.objectives.forEach((objective) => {
      // Fetch activities if they haven't been loaded yet
      if (!activities.activitiesMap[objective.id]) {
        activities.fetchActivities(objective.id);
      }
    });
  }, [activities.objectives, activities.activitiesMap, activities.fetchActivities]);

  // Flatten all activities from all objectives
  const allActivities: Activity[] = useMemo(() => {
    return activities.objectives.flatMap((objective) => {
      // Use activitiesMap if available, otherwise fall back to objective.activities
      return activities.activitiesMap[objective.id] || objective.activities || [];
    });
  }, [activities.objectives, activities.activitiesMap]);

  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilters>({
    category: "ALL",
    startDate: null,
    endDate: null,
  });

  // Chart view type state
  const [chartViewType, setChartViewType] = useState<ChartViewType>("COLUMN");

  // Apply filters to activities
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Filter by category
    filtered = filterActivitiesByCategory(filtered, filters.category);

    // Filter by date range
    filtered = filterActivitiesByDateRange(
      filtered,
      filters.startDate,
      filters.endDate
    );

    return filtered;
  }, [allActivities, filters]);

  // Transform filtered activities to chart data
  const chartData = useMemo(() => {
    return getActivityExpenseData(filteredActivities);
  }, [filteredActivities]);

  // Helper function to check if financial values should be hidden
  const hideFinancialValues = false; // Executives can now view amounts

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track and analyze expenses by activities with advanced filtering
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Chart */}
      <ActivityExpenseChart
        data={chartData}
        hideFinancialValues={hideFinancialValues}
        viewType={chartViewType}
        onViewTypeChange={setChartViewType}
      />

      {/* Summary Info */}
      {filteredActivities.length === 0 && allActivities.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              No activities match the selected filters. Try adjusting your filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {allActivities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              No activities found for this project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsLayout;

