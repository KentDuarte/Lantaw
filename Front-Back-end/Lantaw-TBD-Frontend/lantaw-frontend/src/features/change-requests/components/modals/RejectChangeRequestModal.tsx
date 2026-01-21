import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/common/dialog";
import { Button } from "../../../../components/common/button";
import { TextArea } from "../../../../components/common/textarea";
import { Label } from "../../../../components/common/label";
import { AlertTriangle } from "lucide-react";
import type { ChangeRequest } from "../../../../types/changeRequest";

interface RejectChangeRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeRequest: ChangeRequest | null;
  onReject: (reason: string) => Promise<void>;
}

export const RejectChangeRequestModal: React.FC<RejectChangeRequestModalProps> = ({
  open,
  onOpenChange,
  changeRequest,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    if (!changeRequest) return;

    setLoading(true);
    setError(null);

    try {
      await onReject(rejectionReason);
      setRejectionReason("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to reject change request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    setError(null);
    onOpenChange(false);
  };

  if (!changeRequest) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Change Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this change request. This will help the Project Staff understand why the request was not approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Note</p>
              <p>Once rejected, the change request cannot be approved later. The project data will remain unchanged.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Project: </span>
              <span className="text-sm">{changeRequest.project_name || `Project #${changeRequest.project}`}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Change Type: </span>
              <span className="text-sm">{changeRequest.change_type}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Description: </span>
              <p className="text-sm text-muted-foreground mt-1">{changeRequest.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <TextArea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be visible to the Project Staff who submitted the request.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

