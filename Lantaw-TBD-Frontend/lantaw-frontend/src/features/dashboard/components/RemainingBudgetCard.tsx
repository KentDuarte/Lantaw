// This card shows the summary of the budget used during the project

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/card";
import { Progress } from "../../../components/common/progress";

interface RemainingBudgetCardProps {
  remainingBudget: number;
}

export const RemainingBudgetCard: React.FC<RemainingBudgetCardProps> = ({
  remainingBudget,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
        <span className="text-2xl">🏦</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{remainingBudget.toFixed(1)}%</div>
        <Progress value={remainingBudget} className="mt-2" />
      </CardContent>
    </Card>
  );
};
