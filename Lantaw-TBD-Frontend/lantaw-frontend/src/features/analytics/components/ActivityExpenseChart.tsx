import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/card";
import { Button } from "../../../components/common/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/common/collapsible";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown, BarChart3, BarChart4 } from "lucide-react";
import { getBudgetStatus } from "../../dashboard/utils/barChartHelper";
import type { ActivityExpenseItem, ChartViewType } from "../types/analytics";

interface ActivityExpenseChartProps {
  data: ActivityExpenseItem[];
  hideFinancialValues?: boolean;
  viewType?: ChartViewType;
  onViewTypeChange?: (viewType: ChartViewType) => void;
}

export const ActivityExpenseChart: React.FC<ActivityExpenseChartProps> = ({
  data,
  hideFinancialValues = false,
  viewType = "COLUMN",
  onViewTypeChange,
}) => {
  // Calculate totals
  const totalProjected = data.reduce((sum, item) => sum + item.projected, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);

  // Truncate activity names for display if too long
  const formatActivityName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Prepare chart data with truncated names
  const chartData = data.map((item) => ({
    ...item,
    displayName: formatActivityName(item.activityName, 20),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No activity data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine chart height based on view type and data length
  const chartHeight = viewType === "BAR" ? Math.max(300, data.length * 40) : 300;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Expenses</CardTitle>
          {onViewTypeChange && (
            <div className="flex gap-2">
              <Button
                variant={viewType === "COLUMN" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewTypeChange("COLUMN")}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Column
              </Button>
              <Button
                variant={viewType === "BAR" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewTypeChange("BAR")}
                className="gap-2"
              >
                <BarChart4 className="h-4 w-4" />
                Bar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout={viewType === "BAR" ? "vertical" : undefined}
            margin={
              viewType === "BAR"
                ? { top: 5, right: 30, left: 100, bottom: 5 }
                : { top: 30, right: 30, left: 20, bottom: 60 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            {viewType === "COLUMN" ? (
              <>
                <XAxis
                  dataKey="displayName"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={(value) =>
                    hideFinancialValues ? "---" : `₱${(value / 1000).toFixed(0)}k`
                  }
                  fontSize={12}
                />
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    hideFinancialValues ? "---" : `₱${(value / 1000).toFixed(0)}k`
                  }
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  fontSize={12}
                  width={90}
                />
              </>
            )}
            <Tooltip
              formatter={(value: number) =>
                hideFinancialValues ? "---" : `₱${value.toLocaleString()}`
              }
              labelFormatter={(label) => {
                const fullName = data.find(
                  (item) => formatActivityName(item.activityName, 20) === label
                )?.activityName || label;
                return fullName;
              }}
              labelStyle={{ color: "#000" }}
            />
            <Bar
              dataKey="projected"
              fill="#078080"
              name="Projected"
              opacity={0.7}
            />
            <Bar dataKey="actual" fill="#f45d48" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Projected:</span>
            <span className="font-medium">
              {hideFinancialValues
                ? "---"
                : `₱${totalProjected.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Actual:</span>
            <span className="font-medium">
              {hideFinancialValues ? "---" : `₱${totalActual.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Overall Status:</span>
            <span
              className={`font-medium ${
                getBudgetStatus(
                  totalProjected,
                  totalActual,
                  hideFinancialValues
                ).color
              }`}
            >
              {
                getBudgetStatus(
                  totalProjected,
                  totalActual,
                  hideFinancialValues
                ).text
              }
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto text-sm font-medium"
              >
                Activity Breakdown
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {data.map((item, index) => {
                  const status = getBudgetStatus(
                    item.projected,
                    item.actual,
                    hideFinancialValues
                  );
                  return (
                    <div
                      key={`${item.activityName}-${index}`}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="truncate mr-2" title={item.activityName}>
                        {item.activityName}:
                      </span>
                      <span className={`font-medium ${status.color} flex-shrink-0`}>
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

