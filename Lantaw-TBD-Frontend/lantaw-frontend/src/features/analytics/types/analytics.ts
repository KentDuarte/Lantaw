export interface ActivityExpenseItem {
  activityName: string;
  projected: number;
  actual: number;
}

export type BudgetCategoryFilter = "ALL" | "PS" | "MOOE" | "CO";

export type ChartViewType = "COLUMN" | "BAR";

export interface AnalyticsFilters {
  category: BudgetCategoryFilter;
  startDate: string | null;
  endDate: string | null;
}

