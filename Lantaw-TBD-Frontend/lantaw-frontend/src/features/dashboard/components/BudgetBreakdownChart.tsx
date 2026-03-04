import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../components/common/button";
import type { DetailItem } from "../utils/pieChartHelper";

interface BudgetBreakdownChartProps {
  categoryData: DetailItem[];
  categoryName: string;
  detailColors: string[];
  onBack: () => void;
  hideFinancialValues?: boolean;
}

export const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({
  categoryData,
  categoryName,
  detailColors,
  onBack,
  hideFinancialValues = false,
}) => {
  const totalAmount = categoryData.reduce((sum, item) => sum + item.amount, 0);

  // Remap categoryData to stuitable format for pie
  const pieChartData = categoryData.map((item) => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Overview
        </Button>
      </div>
      <div className="text-center mb-4">
        <h4 className="font-medium mb-2">{categoryName} Breakdown</h4>
        <p className="text-sm text-muted-foreground">
          Total: {hideFinancialValues ? "---" : `₱${totalAmount.toLocaleString()}`}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={3}
            dataKey="value"
            label={(props: { payload?: { name?: string; percentage?: number } }) =>
              props.payload ? `${props.payload.name ?? ""}: ${props.payload.percentage ?? 0}%` : ""
            }
            labelLine={false}
          >
            {pieChartData.map((_entry, index) => (
              <Cell
                key={`cell-detail-${index}`}
                fill={detailColors[index % detailColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              hideFinancialValues ? "---" : `₱${value.toLocaleString()}`,
              `${name} (${props.payload.percentage}%)`,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
