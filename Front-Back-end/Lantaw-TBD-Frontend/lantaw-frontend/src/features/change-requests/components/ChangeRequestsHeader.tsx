// Header section with title and filters for change requests.

import React from "react";
import { Card, CardContent } from "../../../components/common/card";
import { Button } from "../../../components/common/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/common/select";
import { Filter, X } from "lucide-react";
import type { UseChangeRequestFiltersReturn } from "../hooks/useChangeRequestFilters";
import type { ChangeRequest } from "../../../types/changeRequest";

interface ChangeRequestsHeaderProps {
  filters: UseChangeRequestFiltersReturn;
  isAdmin?: boolean;
  projects?: Array<{ id: number; name: string }>;
}

export const ChangeRequestsHeader: React.FC<ChangeRequestsHeaderProps> = ({
  filters,
  isAdmin = false,
  projects = [],
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-bold font-[Instrument_Sans]">
          Change Requests
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Review and manage change requests from Project Staff across all projects."
            : "View the status of your submitted change requests."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filters */}
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              {/* Status Filter */}
              <Select
                value={filters.filters.status || "all"}
                onValueChange={(value) => filters.setStatusFilter(value === "all" ? undefined : value as ChangeRequest['status'])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Change Type Filter */}
              <Select
                value={filters.filters.change_type || "all"}
                onValueChange={(value) => filters.setChangeTypeFilter(value === "all" ? undefined : value as ChangeRequest['change_type'])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ACTIVITY">Activity</SelectItem>
                  <SelectItem value="OBJECTIVE">Objective</SelectItem>
                  <SelectItem value="PERSONNEL">Personnel</SelectItem>
                  <SelectItem value="BUDGET">Budget</SelectItem>
                  <SelectItem value="COMPENSATION">Compensation</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="ROLE">Role</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                </SelectContent>
              </Select>

              {/* Operation Filter */}
              <Select
                value={filters.filters.operation || "all"}
                onValueChange={(value) => filters.setOperationFilter(value === "all" ? undefined : value as ChangeRequest['operation'])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>

              {/* Project Filter (Admin and Project Staff) */}
              {projects.length > 0 && (
                <Select
                  value={filters.filters.project?.toString() || "all"}
                  onValueChange={(value) => filters.setProjectFilter(value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={filters.clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

