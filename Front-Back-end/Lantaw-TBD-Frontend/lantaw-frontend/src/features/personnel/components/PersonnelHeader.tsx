// Header section with title and action buttons

import React from "react";
import { Button } from "../../../components/common/button";
import { Plus } from "lucide-react";

interface PersonnelHeaderProps {
  projectName: string;
  onAddPersonnel: () => void;
}

export const PersonnelHeader: React.FC<PersonnelHeaderProps> = ({
  projectName,
  onAddPersonnel,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-[24px] font-bold font-[Instrument_Sans]">
            Personnel Management
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage salary and honoraria records for project personnel in{" "}
          {projectName}.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onAddPersonnel}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Personnel
        </Button>
      </div>
    </div>
  );
};
