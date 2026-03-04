import type { Activity } from "../../../types/activity";
import type { ActivityExpenseItem, BudgetCategoryFilter } from "../types/analytics";

/**
 * Filter activities by budget category
 */
export const filterActivitiesByCategory = (
  activities: Activity[],
  category: BudgetCategoryFilter
): Activity[] => {
  if (category === "ALL") {
    return activities;
  }

  return activities.filter((activity) => {
    const activityCategory = activity.budget_item_name?.toUpperCase();
    return activityCategory === category;
  });
};

/**
 * Filter activities by date range
 * Uses date_created field for filtering
 */
export const filterActivitiesByDateRange = (
  activities: Activity[],
  startDate: string | null,
  endDate: string | null
): Activity[] => {
  if (!startDate && !endDate) {
    return activities;
  }

  return activities.filter((activity) => {
    const activityDate = new Date(activity.date_created);
    activityDate.setHours(0, 0, 0, 0); // Normalize to start of day

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (activityDate < start) {
        return false;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      if (activityDate > end) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Transform activities into chart data format
 */
export const getActivityExpenseData = (
  activities: Activity[]
): ActivityExpenseItem[] => {
  return activities.map((activity) => {
    const projected = activity.projected_expense
      ? parseFloat(activity.projected_expense)
      : 0;
    const actual = activity.actual_expense
      ? parseFloat(activity.actual_expense)
      : 0;

    return {
      activityName: activity.title,
      projected: isNaN(projected) ? 0 : projected,
      actual: isNaN(actual) ? 0 : actual,
    };
  });
};

