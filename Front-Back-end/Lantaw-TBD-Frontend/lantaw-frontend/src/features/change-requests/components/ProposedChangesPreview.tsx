import React from "react";
import { Label } from "../../../components/common/label";
import { Badge } from "../../../components/common/badge";
import { formatCurrency } from "../../../utils/formatHelpers";

interface ProposedChangesPreviewProps {
  proposedChanges: Record<string, any>;
  changeType: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  currentState?: Record<string, any> | null;
}

export const ProposedChangesPreview: React.FC<ProposedChangesPreviewProps> = ({
  proposedChanges,
  changeType,
  operation,
  currentState = null,
}) => {
  // Render field value based on type
  const renderFieldValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    // Handle dates
    if (key.includes("date") || key.includes("Date")) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return String(value);
      }
    }

    // Handle amounts/expenses
    if (key.includes("expense") || key.includes("amount") || key.includes("grant")) {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        return formatCurrency(numValue);
      }
      return String(value);
    }

    // Handle status fields
    if (key.includes("status")) {
      return <Badge variant="outline" className="text-xs">{String(value)}</Badge>;
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

  // Field labels mapping
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
    department: "Department",
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

  // Render fields in a structured way
  const renderFields = (fields: Record<string, any>, title: string, variant: "current" | "proposed" = "proposed") => {
    if (!fields || Object.keys(fields).length === 0) {
      return null;
    }

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm mb-2">{title}</h4>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md border ${
          variant === "current" 
            ? "bg-red-50 border-red-200" 
            : "bg-green-50 border-green-200"
        }`}>
          {Object.entries(fields).map(([key, value]) => {
            // Skip internal IDs unless it's a reference field
            if (key === "id" || key === "project" || key === "project_id") {
              return null;
            }

            // Handle foreign key references
            if (key.includes("_id") && typeof value === "number") {
              const displayKey = key.replace("_id", "");
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
          })}
        </div>
      </div>
    );
  };

  // For CREATE operations, only show proposed changes
  if (operation === "CREATE") {
    return (
      <div className="space-y-3">
        {renderFields(proposedChanges, "New Details", "proposed")}
      </div>
    );
  }

  // For UPDATE operations, show comparison
  if (operation === "UPDATE") {
    return (
      <div className="space-y-3">
        {currentState && renderFields(currentState, "Current State", "current")}
        {renderFields(proposedChanges, "Proposed Changes", "proposed")}
      </div>
    );
  }

  // For DELETE operations, show what will be deleted
  if (operation === "DELETE") {
    return (
      <div className="space-y-3">
        <div className="text-sm font-semibold text-destructive mb-2">
          This {changeType.toLowerCase()} will be deleted
        </div>
        {currentState && renderFields(currentState, "Current State", "current")}
      </div>
    );
  }

  return null;
};

