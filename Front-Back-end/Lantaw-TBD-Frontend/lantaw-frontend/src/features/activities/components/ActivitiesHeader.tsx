// Header section with title, project status badge, and action buttons.

import React from "react";
import { Button } from "../../../components/common/button";
import { Badge } from "../../../components/common/badge";
import { Edit, Plus } from "lucide-react";
import { getProjectStatusStyle } from "../utils/statusHelpers";

interface ActivitiesHeaderProps {
  projectName: string;
  projectStatus: string;
  onEditProjectStatus: () => void;
  onAddObjective: () => void;
  userRole?: string;
}

export const ActivitiesHeader: React.FC<ActivitiesHeaderProps> = ({
  projectName,
  projectStatus,
  onEditProjectStatus,
  onAddObjective,
  userRole,
}) => {
  const statusStyle = getProjectStatusStyle(projectStatus);

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-[24px] font-bold font-[Instrument_Sans]">
            Activities Management
          </h1>
          <Badge
            variant="outline"
            className={`text-xs ${statusStyle.badge} ${userRole !== "Executive" ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={userRole !== "Executive" ? onEditProjectStatus : undefined}
          >
            <div className={`w-2 h-2 rounded-full ${statusStyle.bg} mr-2`} />
            {projectStatus.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage objectives and activities for {projectName}.
        </p>
      </div>
      {userRole !== "Executive" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEditProjectStatus}
            className="bg-background hover:bg-muted"
          >
            <Edit className="h-4 w-4 mr-2" />
            Project Status
          </Button>
          <Button
            onClick={onAddObjective}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>
      )}
    </div>
  );
};
