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
import { ChevronDown } from "lucide-react";
import type {
  ExpenseComparisonItem,
  ProjectSummary,
  BudgetStatus,
} from "../utils/barChartHelper";
import { getBudgetStatus } from "../utils/barChartHelper";

interface ExpenseComparisonChartProps {
  data: ExpenseComparisonItem[];
  projectSummary: ProjectSummary;
}

export const ExpenseComparisonChart: React.FC<ExpenseComparisonChartProps> = ({
  data,
  projectSummary,
}) => {
  const { totalGrant, projectedExpenses, totalSpent } = projectSummary;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected vs Actual Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" fontSize={12} />
            <YAxis
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number) => `₱${value.toLocaleString()}`}
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
            <span>Total Grant:</span>
            <span className="font-medium">₱{totalGrant.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Projected:</span>
            <span className="font-medium">
              ₱{projectedExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Spent:</span>
            <span className="font-medium">₱{totalSpent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Overall Status:</span>
            <span
              className={`font-medium ${
                getBudgetStatus(projectedExpenses, totalSpent).color
              }`}
            >
              {getBudgetStatus(projectedExpenses, totalSpent).text}
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
                Category Breakdown
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-1">
                {data.map((item) => {
                  const status = getBudgetStatus(item.projected, item.actual);
                  return (
                    <div
                      key={item.category}
                      className="flex justify-between items-center text-xs"
                    >
                      <span>{item.category}:</span>
                      <span className={`font-medium ${status.color}`}>
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
