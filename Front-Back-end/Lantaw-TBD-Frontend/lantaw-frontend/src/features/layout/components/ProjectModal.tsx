import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/common/dialog";
import { Label } from "../../../components/common/label";
import { Input } from "../../../components/common/input";
import { TextArea } from "../../../components/common/textarea";
import { Button } from "../../../components/common/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/common/select";

interface ProjectFormData {
  name: string;
  projectLeader: string;
  description: string;
  totalGrant: string;
  duration: string;
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
  userRole?: string;
  error?: string;
}

type FormErrors = Partial<Record<keyof ProjectFormData, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper function to calculate end date from start date + duration
// End date is calculated as the day BEFORE the anniversary date
// e.g., Start: Feb 2, 2026, Duration: 1 year → End: Feb 1, 2027
const calculateEndDate = (startDate: string, duration: string): string => {
  if (!startDate || !duration) return "";
  // Parse the date string to avoid timezone issues
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(year, month - 1, day); // month is 0-indexed
  start.setFullYear(start.getFullYear() + parseInt(duration));
  // Subtract 1 day to get the day before the anniversary
  start.setDate(start.getDate() - 1);
  // Format as YYYY-MM-DD without timezone conversion
  const endYear = start.getFullYear();
  const endMonth = String(start.getMonth() + 1).padStart(2, '0');
  const endDay = String(start.getDate()).padStart(2, '0');
  return `${endYear}-${endMonth}-${endDay}`;
};

const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onOpenChange,
  isEdit = false, // Default to false (create mode)
  formData,
  setFormData,
  onSubmit,
  checkStaffExists,
  userRole,
  error,
}) => {
  const hideFinancialValues = false; // Executives can now view amounts
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [checkingStaff, setCheckingStaff] = useState(false);

  useEffect(() => {
    // Reset errors when modal open/close
    if (!open) setFormErrors({});
  }, [open]);

  // Auto-calculate End Date when Start Date or Duration changes
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const calculatedEndDate = calculateEndDate(formData.startDate, formData.duration);
      if (calculatedEndDate) {
        // Check if calculated end date has the same DAY (day of month) as start date
        const startDay = formData.startDate.split('-')[2];
        const calculatedEndDay = calculatedEndDate.split('-')[2];
        let finalEndDate = calculatedEndDate;
        
        if (startDay === calculatedEndDay) {
          // Parse date to avoid timezone issues and subtract 1 more day
          const [year, month, day] = calculatedEndDate.split('-').map(Number);
          const end = new Date(year, month - 1, day);
          end.setDate(end.getDate() - 1);
          const endYear = end.getFullYear();
          const endMonth = String(end.getMonth() + 1).padStart(2, '0');
          const endDayAdjusted = String(end.getDate()).padStart(2, '0');
          finalEndDate = `${endYear}-${endMonth}-${endDayAdjusted}`;
        }
        
        // Update end date (only if it changed to avoid infinite loops)
        setFormData((prev) => {
          if (prev.endDate !== finalEndDate) {
            return { ...prev, endDate: finalEndDate };
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.duration]);

  // Auto-adjust End Date if it's on the same DAY as Start Date (for manual edits or edge cases)
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      // Check if the DAY (day of month) is the same
      const startDay = formData.startDate.split('-')[2]; // Extract day (YYYY-MM-DD format)
      const endDay = formData.endDate.split('-')[2]; // Extract day (YYYY-MM-DD format)
      
      if (startDay === endDay) {
        // Update error message with countdown starting at 5
        setFormErrors((prev) => ({
          ...prev,
          endDate: "End date cannot be on the same day of the month as start date. Auto-adjusting in 5...",
        }));
        
        // Countdown timer from 5 to 0
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setFormErrors((prev) => ({
            ...prev,
            endDate: `End date cannot be on the same day of the month as start date. Auto-adjusting in ${countdown}...`,
          }));
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            // Parse date to avoid timezone issues
            const [year, month, day] = formData.endDate.split('-').map(Number);
            const end = new Date(year, month - 1, day);
            end.setDate(end.getDate() - 1);
            const endYear = end.getFullYear();
            const endMonth = String(end.getMonth() + 1).padStart(2, '0');
            const endDayAdjusted = String(end.getDate()).padStart(2, '0');
            const adjustedEndDate = `${endYear}-${endMonth}-${endDayAdjusted}`;
            
            setFormData((prev) => {
              // Check if day is still the same before adjusting
              const prevStartDay = prev.startDate?.split('-')[2];
              const prevEndDay = prev.endDate?.split('-')[2];
              if (prevStartDay === prevEndDay && prev.endDate !== adjustedEndDate) {
                return { ...prev, endDate: adjustedEndDate };
              }
              return prev;
            });
            
            // Clear error after adjustment
            setTimeout(() => {
              setFormErrors((prev) => ({ ...prev, endDate: "" }));
            }, 500);
          }
        }, 1000); // Update every second
        
        return () => {
          clearInterval(countdownInterval);
        };
      } else {
        // Clear error if days are no longer the same
        if (formErrors.endDate?.includes("End date cannot be on the same day of the month as start date")) {
          setFormErrors((prev) => ({ ...prev, endDate: "" }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate]);

  // Auto-adjust End Date if it's later than calculated end date from Duration
  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.duration) {
      const calculatedEndDate = calculateEndDate(formData.startDate, formData.duration);
      
      if (calculatedEndDate && new Date(formData.endDate) > new Date(calculatedEndDate)) {
        // Update error message with countdown starting at 5
        setFormErrors((prev) => ({
          ...prev,
          endDate: "End date cannot be later than the calculated end date based on the selected duration. Auto-adjusting in 5...",
        }));
        
        // Countdown timer from 5 to 0
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setFormErrors((prev) => ({
            ...prev,
            endDate: `End date cannot be later than the calculated end date based on the selected duration. Auto-adjusting in ${countdown}...`,
          }));
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            // Adjust end date to the calculated end date
            setFormData((prev) => {
              // Recalculate to ensure we have the latest calculated date
              const latestCalculatedEndDate = calculateEndDate(prev.startDate, prev.duration);
              if (latestCalculatedEndDate && prev.endDate !== latestCalculatedEndDate) {
                return { ...prev, endDate: latestCalculatedEndDate };
              }
              return prev;
            });
            
            // Clear error after adjustment
            setTimeout(() => {
              setFormErrors((prev) => ({ ...prev, endDate: "" }));
            }, 500);
          }
        }, 1000); // Update every second
        
        return () => {
          clearInterval(countdownInterval);
        };
      } else {
        // Clear error if end date is no longer later than calculated date
        if (formErrors.endDate?.includes("End date cannot be later than the calculated end date based on the selected duration")) {
          setFormErrors((prev) => ({ ...prev, endDate: "" }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate, formData.duration]);

  // Sync field validation
  const validateField = (field: keyof ProjectFormData, value: string) => {
    let error = "";

    if (field === "projectLeader") {
      if (!value.trim()) error = "Project leader is required.";
    }

    if (field === "name") {
      if (!value.trim()) error = "Project name is required.";
    }

    if (field === "duration") {
      if (!value.trim()) error = "Duration is required.";
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
        // Check if the DAY (day of month) is the same - not allowed
        const startDay = start.split('-')[2]; // Extract day (YYYY-MM-DD format)
        const endDay = end.split('-')[2]; // Extract day (YYYY-MM-DD format)
        if (startDay === endDay) {
          error =
            field === "startDate"
              ? "Start date and end date cannot be on the same day of the month."
              : "End date cannot be on the same day of the month as start date.";
        }
        // Check if end date is later than calculated end date from duration
        else if (formData.duration && formData.startDate && field === "endDate") {
          const calculatedEndDate = calculateEndDate(formData.startDate, formData.duration);
          if (calculatedEndDate && new Date(end) > new Date(calculatedEndDate)) {
            error = "End date cannot be later than the calculated end date based on the selected duration.";
          }
        }
        // If start > end => invalid
        else if (new Date(start) > new Date(end)) {
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
      
      // Update the field value first
      setFormData((prev) => ({ ...prev, [field]: value }));
      
      // Then validate - this will show error if dates are equal
      validateField(field, value);
    };

  const handleDurationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, duration: value }));
    validateField("duration", value);
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
      "duration",
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

    // Explicit check for same DAY (day of month) - not allowed
    // Check both the current end date and the calculated end date from duration
    if (formData.startDate && formData.endDate) {
      const startDay = formData.startDate.split('-')[2]; // Extract day (YYYY-MM-DD format)
      const endDay = formData.endDate.split('-')[2]; // Extract day (YYYY-MM-DD format)
      
      // Check if current end date has same day as start date
      if (startDay === endDay) {
        setFormErrors((prev) => ({
          ...prev,
          endDate: "End date cannot be on the same day of the month as start date.",
        }));
        hasError = true;
      }
      
      // Also check if calculated end date from duration would have same day
      if (formData.duration && formData.startDate) {
        const calculatedEndDate = calculateEndDate(formData.startDate, formData.duration);
        if (calculatedEndDate) {
          const calculatedEndDay = calculatedEndDate.split('-')[2];
          if (startDay === calculatedEndDay) {
            setFormErrors((prev) => ({
              ...prev,
              endDate: "End date cannot be on the same day of the month as start date.",
            }));
            hasError = true;
          }
          
          // Check if manually set end date is later than calculated end date from duration
          if (new Date(formData.endDate) > new Date(calculatedEndDate)) {
            setFormErrors((prev) => ({
              ...prev,
              endDate: "End date cannot be later than the calculated end date based on the selected duration.",
            }));
            hasError = true;
          }
        }
      }
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
    ? !formData.name.trim() || !formData.projectLeader.trim() || !formData.duration.trim()
    : !formData.name.trim() || !formData.projectLeader.trim() || !formData.duration.trim() || !formData.projectStaff.trim();

  // Conditionally determine the modal title and submit button text
  const modalTitle = isEdit ? "Edit Project" : "Create New Project";
  const submitButtonText = isEdit ? "Save Changes" : "Create Project";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          {/* Conditional Title */}
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the project details below."
              : "Fill in the details to create a new project."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Project Leader and Project Name */}
          <div className="grid grid-cols-2 gap-4">
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
              <div className="mt-1 min-h-[20px]">
                {formErrors.projectLeader ? (
                  <p className="text-xs text-red-600">{formErrors.projectLeader}</p>
                ) : null}
              </div>
            </div>

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
              <div className="mt-1 min-h-[20px]">
                {formErrors.name ? (
                  <p className="text-xs text-red-600">{formErrors.name}</p>
                ) : null}
              </div>
            </div>
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
              className="min-h-16"
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="create-project-duration" className="mb-2">
              Duration
            </Label>
            <Select
              value={formData.duration}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger
                id="create-project-duration"
                className={
                  formErrors.duration
                    ? "border-red-500 focus-visible:ring-red-300"
                    : ""
                }
              >
                <SelectValue placeholder="Select duration..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
                <SelectItem value="4">4 years</SelectItem>
                <SelectItem value="5">5 years</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-1 min-h-[20px]">
              {formErrors.duration ? (
                <p className="text-xs text-red-600">{formErrors.duration}</p>
              ) : null}
            </div>
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
              <div className="mt-1 min-h-[20px]">
                {formErrors.startDate ? (
                  <p className="text-xs text-red-600">
                    {formErrors.startDate}
                  </p>
                ) : null}
              </div>
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
              <div className="mt-1 min-h-[20px]">
                {formErrors.endDate ? (
                  <p className="text-xs text-red-600">
                    {formErrors.endDate}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Grant and Project Staff */}
          <div className={checkStaffExists ? "grid grid-cols-2 gap-4" : ""}>
            {!hideFinancialValues && (
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
                <div className="mt-1 min-h-[20px]">
                  {formErrors.totalGrant && (
                    <p className="text-xs text-red-600">
                      {formErrors.totalGrant}
                    </p>
                  )}
                </div>
              </div>
            )}

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
                <div className="mt-1 min-h-[20px]">
                  {checkingStaff ? (
                    <p className="text-xs text-muted-foreground">
                      Checking...
                    </p>
                  ) : formErrors.projectStaff ? (
                    <p className="text-xs text-red-600">
                      {formErrors.projectStaff}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
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
