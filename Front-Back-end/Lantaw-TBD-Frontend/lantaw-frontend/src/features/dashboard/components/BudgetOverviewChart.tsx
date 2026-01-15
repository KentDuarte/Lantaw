import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetItem } from "../utils/pieChartHelper";
import { OVERVIEW_COLORS } from "../utils/pieChartHelper";

interface BudgetOverviewChartProps {
  data: BudgetItem[];
  onSliceClick: (view: "PS" | "MOOE" | "CO") => void;
}

export const BudgetOverviewChart: React.FC<BudgetOverviewChartProps> = ({
  data,
  onSliceClick,
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percentage }) => `${name}: ${percentage}%`}
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-overview-${index}`}
              fill={OVERVIEW_COLORS[index % OVERVIEW_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `₱${value.toLocaleString()}`,
            `${name} (${props.payload.percentage}%)`,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
