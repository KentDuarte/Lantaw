import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/common/dialog";
import { Label } from "../../../components/common/label";
import { Input } from "../../../components/common/input";
import { TextArea } from "../../../components/common/textarea";
import { Button } from "../../../components/common/button";

interface ProjectFormData {
  name: string;
  projectLeader: string;
  description: string;
  totalGrant: string;
  startDate: string;
  endDate: string;
  projectStaff: string;
}

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  onSubmit: () => void;
  checkStaffExists?: (email: string) => Promise<boolean>;
}

type FormErrors = Partial<Record<keyof ProjectFormData, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onOpenChange,
  isEdit = false, // Default to false (create mode)
  formData,
  setFormData,
  onSubmit,
  checkStaffExists,
}) => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [checkingStaff, setCheckingStaff] = useState(false);

  useEffect(() => {
    // Reset errors when modal open/close
    if (!open) setFormErrors({});
  }, [open]);

  // Sync field validation
  const validateField = (field: keyof ProjectFormData, value: string) => {
    let error = "";

    if (field === "projectLeader") {
      if (!value.trim()) error = "Project leader is required.";
    }

    if (field === "name") {
      if (!value.trim()) error = "Project name is required.";
    }

    if (field === "totalGrant") {
      if (value === "") {
        // allow blank (treated as 0) but you can require it if you want
        error = "";
      } else {
        const n = Number(value);
        if (isNaN(n)) error = "Grant must be a number.";
        else if (n < 0) error = "Grant cannot be negative.";
      }
    }

    if (field === "startDate" || field === "endDate") {
      const start = field === "startDate" ? value : formData.startDate;
      const end = field === "endDate" ? value : formData.endDate;

      if (start && end) {
        // If start > end => invalid
        if (new Date(start) > new Date(end)) {
          error =
            field === "startDate"
              ? "Start date must be on or before end date."
              : "End date must be on or after start date.";
        }
      }
    }

    if (!isEdit && field === "projectStaff") {
      if (!value.trim()) error = "Project staff email is required.";
      else if (!emailRegex.test(value.trim())) error = "Invalid email format.";
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const handleChange =
    (field: keyof ProjectFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    };

  // When staff input loses focus, do an existence check
  const handleStaffBlur = async () => {
    if (isEdit || !checkStaffExists) return;

    const email = formData.projectStaff.trim();
    // Run synchronous validation
    const syncError = validateField("projectStaff", email);
    if (syncError) return;

    setCheckingStaff(true);
    const exists = await checkStaffExists(email);
    setCheckingStaff(false);
    if (!exists) {
      setFormErrors((prev) => ({
        ...prev,
        projectStaff: "Staff does not exist in the system.",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, projectStaff: "" }));
    }
  };

  // Full-form validation before submission
  const validateAll = async (): Promise<boolean> => {
    const fields: (keyof ProjectFormData)[] = [
      "projectLeader",
      "name",
      "startDate",
      "endDate",
      "totalGrant",
    ];
    let hasError = false;

    for (const f of fields) {
      const value = (formData as any)[f] ?? "";
      const err = validateField(f, value);
      if (err) hasError = true;
    }

    // if projectStaff has no sync error, run the async existence check
    if (
      !isEdit &&
      checkStaffExists &&
      !formErrors.projectStaff &&
      formData.projectStaff.trim()
    ) {
      // NOTE: For editing, you might want to skip the staff check if the staff email hasn't changed.
      // However, for simplicity and safety, we'll keep the check here.
      setCheckingStaff(true);
      const exists = await checkStaffExists(formData.projectStaff.trim());
      setCheckingStaff(false);
      if (!exists) {
        setFormErrors((prev) => ({
          ...prev,
          projectStaff: "Staff does not exist in the system.",
        }));
        hasError = true;
      }
    }

    return !hasError;
  };

  const handleSubmit = async () => {
    const ok = await validateAll();
    if (!ok) return;
    onSubmit();
  };

  // Helper to show styling for invalid fields
  const inputBaseClass =
    "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2";
  const errorInputClass = "border-red-500 focus:ring-red-300";
  const normalInputClass = "border-gray-200 focus:ring-blue-300";

  // Determine whether Create/Save button should be disabled
  const hasErrors = Object.values(formErrors).some((v) => v && v.length > 0);
  const requiredMissing = isEdit
    ? !formData.name.trim() || !formData.projectLeader.trim()
    : !formData.name.trim() || !formData.projectLeader.trim() || !formData.projectStaff.trim();

  // Conditionally determine the modal title and submit button text
  const modalTitle = isEdit ? "Edit Project" : "Create New Project";
  const submitButtonText = isEdit ? "Save Changes" : "Create Project";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          {/* Conditional Title */}
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Leader */}
          <div>
            <Label htmlFor="create-project-leader" className="mb-2">
              Project Leader
            </Label>
            <Input
              id="create-project-leader"
              value={formData.projectLeader}
              onChange={handleChange("projectLeader")}
              placeholder="Enter project leader name..."
              className={`${inputBaseClass} ${
                formErrors.projectLeader ? errorInputClass : normalInputClass
              }`}
            />
            {formErrors.projectLeader ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.projectLeader}</p>
            ) : null}
          </div>

          {/* Project Name */}
          <div>
            <Label htmlFor="create-project-name" className="mb-2">
              Project Name
            </Label>
            <Input
              id="create-project-name"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Enter project name..."
              className={`${inputBaseClass} ${
                formErrors.name ? errorInputClass : normalInputClass
              }`}
            />
            {formErrors.name ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
            ) : null}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="create-project-description" className="mb-2">
              Description
            </Label>
            <TextArea
              id="create-project-description"
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Enter project description..."
              className="min-h-24"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-project-start-date" className="mb-2">
                Start Date
              </Label>
              <Input
                id="create-project-start-date"
                type="date"
                value={formData.startDate}
                onChange={handleChange("startDate")}
                className={`${inputBaseClass} ${
                  formErrors.startDate ? errorInputClass : normalInputClass
                }`}
              />
              {formErrors.startDate ? (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.startDate}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="create-project-end-date" className="mb-2">
                End Date
              </Label>
              <Input
                id="create-project-end-date"
                type="date"
                value={formData.endDate}
                onChange={handleChange("endDate")}
                className={`${inputBaseClass} ${
                  formErrors.endDate ? errorInputClass : normalInputClass
                }`}
              />
              {formErrors.endDate ? (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.endDate}
                </p>
              ) : null}
            </div>
          </div>

          {/* Grant */}
          <div>
            <Label htmlFor="create-project-grant" className="mb-2">
              Grant Amount (₱)
            </Label>
            <Input
              id="create-project-grant"
              type="text" // use text so we can validate ourselves
              value={formData.totalGrant}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only digits
                if (/^\d*$/.test(value)) {
                  setFormData((prev) => ({ ...prev, totalGrant: value }));
                  validateField("totalGrant", value); // validate as they type
                } else {
                  // Set error immediately if invalid character is typed
                  setFormErrors((prev) => ({
                    ...prev,
                    totalGrant: "Grant must be a number.",
                  }));
                }
              }}
              placeholder="0"
              className={`${inputBaseClass} ${
                formErrors.totalGrant ? errorInputClass : normalInputClass
              }`}
            />
            {formErrors.totalGrant && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.totalGrant}
              </p>
            )}
          </div>

          {/* Project Staff */}
          {checkStaffExists && (
            <div>
              <Label htmlFor="create-project-staff" className="mb-2">
                Project Staff (Email)
              </Label>
              <Input
                id="create-project-staff"
                type="email"
                value={formData.projectStaff}
                onChange={handleChange("projectStaff")}
                onBlur={handleStaffBlur}
                placeholder="staff@example.com"
                className={`${inputBaseClass} ${
                  formErrors.projectStaff ? errorInputClass : normalInputClass
                }`}
              />
              {checkingStaff ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Checking...
                </p>
              ) : formErrors.projectStaff ? (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.projectStaff}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={hasErrors || requiredMissing || checkingStaff}
          >
            {/* Conditional Button Text */}
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
