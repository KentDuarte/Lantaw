// This card shows the summary of objectives completed in the project

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/card";
import { Progress } from "../../../components/common/progress";

interface ObjectivesCompletedCardProps {
  completedObjectives: number;
  totalObjectives: number;
}

export const ObjectivesCompletedCard: React.FC<
  ObjectivesCompletedCardProps
> = ({ completedObjectives, totalObjectives }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Objectives Completed
        </CardTitle>
        <span className="text-2xl">📊</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {completedObjectives}/{totalObjectives}
        </div>
        <Progress
          value={(completedObjectives / totalObjectives) * 100}
          className="mt-2"
        />
      </CardContent>
    </Card>
  );
};
