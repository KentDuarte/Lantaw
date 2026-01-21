import React, { useState } from "react";
import { Button } from "../../../components/common/button";
import { Badge } from "../../../components/common/badge";
import { Card, CardContent, CardHeader } from "../../../components/common/card";
import { Eye, Check, X, Calendar, User } from "lucide-react";
import type { ChangeRequest } from "../../../types/changeRequest";
import { getStatusStyle, getOperationStyle, getChangeTypeDisplayName } from "../utils/statusHelpers";
// Date formatting helper
const formatDateDistance = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

interface ChangeRequestCardProps {
  changeRequest: ChangeRequest;
  onViewDetails: (request: ChangeRequest) => void;
  onApprove?: (request: ChangeRequest) => void;
  onReject?: (request: ChangeRequest) => void;
  showActions?: boolean;
}

export const ChangeRequestCard: React.FC<ChangeRequestCardProps> = ({
  changeRequest,
  onViewDetails,
  onApprove,
  onReject,
  showActions = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusStyle = getStatusStyle(changeRequest.status);
  const operationStyle = getOperationStyle(changeRequest.operation);
  const changeTypeName = getChangeTypeDisplayName(changeRequest.change_type);
  
  const isProcessed = changeRequest.status !== 'PENDING';
  const descriptionPreview = changeRequest.description.length > 150
    ? changeRequest.description.substring(0, 150) + '...'
    : changeRequest.description;

  // Generate auto title based on operation and change type
  const getAutoTitle = () => {
    // Special case: Check if it's an expense entry addition
    if (changeRequest.change_type === 'ACTIVITY' && 
        changeRequest.operation === 'UPDATE' &&
        changeRequest.proposed_changes &&
        changeRequest.current_state) {
      const currentExpense = Number(changeRequest.current_state.actual_expense || 0);
      const proposedExpense = Number(changeRequest.proposed_changes.actual_expense || 0);
      
      // Check if only actual_expense changed and it increased
      const onlyExpenseChanged = Object.keys(changeRequest.proposed_changes).every(key => 
        key === 'actual_expense' || 
        changeRequest.proposed_changes[key] === changeRequest.current_state[key]
      );
      
      if (onlyExpenseChanged && proposedExpense > currentExpense) {
        return 'Adding Expense Entry';
      }
    }
    
    const operationMap: Record<string, string> = {
      CREATE: 'Adding',
      UPDATE: 'Updating',
      DELETE: 'Deleting',
    };
    
    const operationText = operationMap[changeRequest.operation] || 'Modifying';
    return `${operationText} ${changeTypeName}`;
  };

  // Get entity reference for UPDATE/DELETE
  const getEntityReference = () => {
    if (changeRequest.operation === 'CREATE') return null;
    if (changeRequest.entity_id) {
      return `${changeTypeName} #${changeRequest.entity_id}`;
    }
    return null;
  };

  const entityRef = getEntityReference();
  const autoTitle = getAutoTitle();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {changeRequest.project_name && (
                <Badge variant="outline" className="text-xs">
                  {changeRequest.project_name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {changeTypeName}
              </Badge>
              <Badge className={operationStyle.badge}>
                {operationStyle.text}
              </Badge>
              <Badge className={statusStyle.badge}>
                {statusStyle.text}
              </Badge>
            </div>

            {/* Title/Description */}
            <div>
              <h3 className="font-semibold text-base mb-1">
                {autoTitle}
              </h3>
              {entityRef && (
                <p className="text-sm text-muted-foreground">
                  {entityRef}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {changeRequest.submitted_by_name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateDistance(changeRequest.date_submitted)}
              </span>
            </div>

            {/* Description Preview */}
            <div className="text-sm text-muted-foreground">
              {isExpanded ? (
                <div>
                  <p className="whitespace-pre-wrap">{changeRequest.description}</p>
                  {changeRequest.description.length > 150 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                      }}
                      className="text-primary hover:underline mt-1"
                    >
                      Read less
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p>{descriptionPreview}</p>
                  {changeRequest.description.length > 150 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="text-primary hover:underline mt-1"
                    >
                      Read more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(changeRequest);
                }}
                className="h-8"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              {!isProcessed && onApprove && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(changeRequest);
                  }}
                  className="h-8 bg-green-500 hover:bg-green-600"
                  disabled={isProcessed}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              )}
              {!isProcessed && onReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(changeRequest);
                  }}
                  className="h-8"
                  disabled={isProcessed}
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

