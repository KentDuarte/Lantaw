import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/common/dialog";
import { Button } from "../../../../components/common/button";
import { Label } from "../../../../components/common/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/common/select";
import { Input } from "../../../../components/common/input";
import type { Compensation } from "../../../../types/compensation";
import type { Personnel } from "../../../../types/personnel";

interface EditCompensationModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Data props
  compensation: Compensation | null; // null = create, existing = edit
  personnel: Personnel;
  defaultBudgetItemId: number | null;

  // Actions
  onSubmit: (data: {
    type: Compensation["type"];
    budget_item: number;
    personnel: number;
    reason: string | null;
    amount: number;
    date_effective: string;
  }) => Promise<void>;
}

export const EditCompensationModal: React.FC<EditCompensationModalProps> = ({
  isOpen,
  onClose,
  compensation,
  personnel,
  defaultBudgetItemId,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    type: "SALARY" as Compensation["type"],
    budget_item: null as number | null,
    personnel: personnel?.id,
    reason: "",
    amount: "",
    date_effective: new Date().toISOString().split("T")[0], // Default to today
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (compensation) {
        setFormData({
          type: compensation.type,
          budget_item: compensation.budget_item,
          personnel: compensation.personnel,
          reason: compensation.reason || "",
          amount: compensation.amount ? compensation.amount.toString() : "",
          date_effective: compensation.date_effective || "",
        });
      } else {
        setFormData({
          type: "HONORARIA",
          budget_item: defaultBudgetItemId,
          personnel: personnel?.id, // Auto-assign to the current personnel
          reason: "",
          amount: "",
          date_effective: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, compensation, personnel, defaultBudgetItemId]);

  const handleSubmit = async () => {
    console.log("Submitting Form Data:", formData);
    // Basic Validation
    if (
      !formData.amount ||
      parseFloat(formData.amount) <= 0 ||
      !formData.budget_item ||
      !formData.personnel
    ) {
      // 2. Log here to confirm if validation is blocking you
      console.warn("Validation Failed!", {
        hasAmount: !!formData.amount,
        amountPositive: parseFloat(formData.amount) > 0,
        hasBudgetItem: !!formData.budget_item, // Check this specific one
        hasPersonnel: !!formData.personnel,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        type: formData.type,
        budget_item: formData.budget_item,
        personnel: formData.personnel,
        reason: formData.reason,
        amount: parseFloat(formData.amount), // Convert back to number
        date_effective: formData.date_effective,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save compensation item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {compensation ? "Edit Compensation" : "Add Compensation"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <Label htmlFor="item-type" className="mb-2">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as Compensation["type"],
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALARY">Salary</SelectItem>
                <SelectItem value="HONORARIA">Honoraria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason Input */}
          <div>
            <Label htmlFor="item-reason" className="mb-2">
              Reason
            </Label>
            <Input
              id="item-reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reason: e.target.value, // FIXED: was 'description'
                }))
              }
              placeholder="Enter reason (optional)..."
              disabled={isSubmitting}
            />
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="item-amount" className="mb-2">
              Amount (₱)
            </Label>
            <Input
              id="item-amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose} // FIXED: was isOpen(false)
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : compensation
              ? "Update Item"
              : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
