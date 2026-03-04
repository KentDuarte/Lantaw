import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetItem } from "../utils/pieChartHelper";
import { OVERVIEW_COLORS } from "../utils/pieChartHelper";

interface BudgetOverviewChartProps {
  data: BudgetItem[];
  onSliceClick: (view: "PS" | "MOOE" | "CO") => void;
  hideFinancialValues?: boolean;
}

export const BudgetOverviewChart: React.FC<BudgetOverviewChartProps> = ({
  data,
  onSliceClick,
  hideFinancialValues = false,
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data as Array<{ name: string; value: number; percentage: number }>}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={5}
          dataKey="value"
          label={(props: { payload?: { name?: string; percentage?: number } }) =>
            props.payload ? `${props.payload.name ?? ""}: ${props.payload.percentage ?? 0}%` : ""
          }
          labelLine={false}
          onClick={(sliceData) => {
            if (sliceData.name === "Personnel Services") {
              onSliceClick("PS");
            } else if (sliceData.name === "MOOE") {
              onSliceClick("MOOE");
            } else if (sliceData.name === "Capital Outlay") {
              onSliceClick("CO");
            }
          }}
          style={{ cursor: "pointer " }}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-overview-${index}`}
              fill={OVERVIEW_COLORS[index % OVERVIEW_COLORS.length]}
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
  );
};
