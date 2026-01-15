// Header section with title and action button

import React from "react";
import { Button } from "../../../components/common/button";
import { Edit } from "lucide-react";

interface DashboardHeaderProps {
  projectName: string;
  projectDescription: string;
  onEditProject: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  projectName,
  projectDescription,
  onEditProject,
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="mb-2">{projectName}</h1>
        <p className="text-muted-foreground">{projectDescription}</p>
      </div>
      <Button variant="outline" onClick={onEditProject}>
        <Edit className="h-4 w-4 mr-2" /> Edit Project
      </Button>
    </div>
  );
};
