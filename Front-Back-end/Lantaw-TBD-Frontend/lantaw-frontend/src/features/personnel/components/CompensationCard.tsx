// Displays a single compensation record with all its details.
// Handles edit, delete, and addition of honorarum.

import React from "react";
import { Button } from "../../../components/common/button";
import { Edit, Trash2 } from "lucide-react";
import type { Compensation } from "../../../types/compensation";
import { formatCurrency } from "../../../utils/formatHelpers";

interface CompensationItemCardProps {
  item: Compensation;
  onEdit: (item: Compensation) => void;
  onDelete: (item: Compensation) => void;
  showActions?: boolean;
  hideFinancialValues?: boolean;
}

export const CompensationItemCard: React.FC<CompensationItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  showActions = true,
  hideFinancialValues = false,
}) => {
  const isHonoraria = item.type?.toLowerCase() === "honoraria";

  return (
    <div className="border rounded-lg p-3 bg-card hover:bg-accent/5 transition-colors group">
      <div className="flex items-start justify-between">
        {/* Information Section */}
        <div className="flex-1">
          <p className="font-medium text-sm text-foreground">{item.reason}</p>
          <p className="text-sm font-bold text-foreground mt-1">
            {formatCurrency(item.amount, hideFinancialValues)}
          </p>
        </div>

        {/* Action Buttons (Hidden until hover) */}
        {showActions && (
          <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {isHonoraria && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export alias for backward compatibility
export const CompensationCard = CompensationItemCard;
