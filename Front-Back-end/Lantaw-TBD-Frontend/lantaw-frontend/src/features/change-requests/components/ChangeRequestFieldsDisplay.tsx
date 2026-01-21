import React from "react";
import { Label } from "../../../components/common/label";
import { Badge } from "../../../components/common/badge";
import type { ChangeRequest } from "../../../types/changeRequest";
import { formatCurrency } from "../../../utils/formatHelpers";

interface ChangeRequestFieldsDisplayProps {
  changeRequest: ChangeRequest;
}

export const ChangeRequestFieldsDisplay: React.FC<ChangeRequestFieldsDisplayProps> = ({
  changeRequest,
}) => {
  const { change_type, operation, current_state, proposed_changes } = changeRequest;

  // Render field value based on type
  const renderFieldValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    // Handle dates
    if (key.includes("date") || key.includes("Date")) {
      return new Date(value).toLocaleDateString();
    }

    // Handle amounts/expenses
    if (key.includes("expense") || key.includes("amount") || key.includes("grant")) {
      return formatCurrency(value);
    }

    // Handle status fields
    if (key.includes("status")) {
      return <Badge variant="outline">{String(value)}</Badge>;
    }

    // Handle boolean
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "None";
    }

    // Handle objects (nested)
    if (typeof value === "object") {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }

    return String(value);
  };

  // Render fields in a structured way
  const renderFields = (fields: Record<string, any>, title: string, variant: "current" | "proposed" = "proposed") => {
    if (!fields || Object.keys(fields).length === 0) {
      return null;
    }

    // Define field order for personnel (if it's a personnel change request)
    const personnelFieldOrder = [
      "first_name",
      "last_name",
      "role_name",
      "department_name",
      "employment_status",
    ];

    const fieldLabels: Record<string, string> = {
      // Objective fields
      title: "Title",
      description: "Description",
      
      // Activity fields
      activity_status: "Status",
      activity_budget_item: "Budget Category",
      projected_expense: "Projected Expense",
      actual_expense: "Actual Expense",
      objective: "Objective",
      
      // Personnel fields
      first_name: "First Name",
      last_name: "Last Name",
      role: "Role",
      role_name: "Role Name",
      department: "Department",
      department_name: "Department Name",
      employment_status: "Employment Status",
      
      // Budget fields
      name: "Name",
      
      // Compensation fields
      type: "Type",
      budget_item: "Budget Item",
      personnel: "Personnel",
      reason: "Reason",
      amount: "Amount",
      date_effective: "Effective Date",
      
      // Project fields
      project_leader: "Project Leader",
      grant_amount: "Grant Amount",
      project_status: "Project Status",
      date_start: "Start Date",
      date_end: "End Date",
    };

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm mb-3">{title}</h4>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md ${
          variant === "current" 
            ? "bg-red-50 border border-red-200" 
            : "bg-green-50 border border-green-200"
        }`}>
          {(() => {
            // Sort fields: personnel fields first in order, then others
            const sortedEntries = Object.entries(fields).sort(([keyA], [keyB]) => {
              const indexA = personnelFieldOrder.indexOf(keyA);
              const indexB = personnelFieldOrder.indexOf(keyB);
              
              // If both are in the order list, sort by their position
              if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
              }
              // If only A is in the order list, it comes first
              if (indexA !== -1) return -1;
              // If only B is in the order list, it comes first
              if (indexB !== -1) return 1;
              // If neither is in the order list, maintain original order
              return 0;
            });

            return sortedEntries.map(([key, value]) => {
              // Skip internal IDs unless it's a reference field
              if (key === "id" || key === "project" || key === "project_id") {
                return null;
              }

              // Skip role/department ID fields when role_name/department_name exist
              if ((key === "role" && fields.role_name !== undefined) || 
                  (key === "department" && fields.department_name !== undefined) ||
                  (key === "role_id" && fields.role_name !== undefined) ||
                  (key === "department_id" && fields.department_name !== undefined)) {
                return null;
              }

              // Handle foreign key references (but skip role_id/department_id if names exist)
              if (key.includes("_id") && typeof value === "number") {
                const displayKey = key.replace("_id", "");
                // Skip role_id/department_id if we have name versions
                if ((displayKey === "role" && fields.role_name !== undefined) ||
                    (displayKey === "department" && fields.department_name !== undefined)) {
                  return null;
                }
                return (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground">
                      {fieldLabels[displayKey] || displayKey.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-sm font-medium">#{value}</p>
                  </div>
                );
              }

              const label = fieldLabels[key] || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="text-sm font-medium mt-1">
                    {renderFieldValue(key, value)}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    );
  };

  // For CREATE operations, only show proposed changes
  if (operation === "CREATE") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">New {change_type} Details</h3>
          {renderFields(proposed_changes, "Proposed Changes", "proposed")}
        </div>
      </div>
    );
  }

  // For UPDATE operations, show comparison
  if (operation === "UPDATE") {
    return (
      <div className="space-y-4">
        {current_state && renderFields(current_state, "Current State", "current")}
        {renderFields(proposed_changes, "Proposed Changes", "proposed")}
      </div>
    );
  }

  // For DELETE operations, show what will be deleted
  if (operation === "DELETE") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 text-destructive">
            This {change_type.toLowerCase()} will be deleted
          </h3>
          {current_state && renderFields(current_state, "Current State", "current")}
        </div>
      </div>
    );
  }

  return null;
};

