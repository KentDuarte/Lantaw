import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/common/select";
import { Input } from "../../../../components/common/input";
import { Button } from "../../../../components/common/button";
import { Label } from "../../../../components/common/label";

// Generic shape for Role and Department
export interface SelectOption {
  id: number;
  name: string;
}

interface CreatableSelectProps {
  label: string; // (Role, Department)
  options: SelectOption[]; // The list of items
  value?: number | string | null; // The selected ID
  onChange: (value: any) => void; // Pass the ID back to parent
  onCreate: (name: string) => Promise<SelectOption | null>; // Function to create new item
  disabled?: boolean;
  placeholder?: string;
}

export function CreatableSelect({
  label,
  options,
  value,
  onChange,
  onCreate,
  disabled,
  placeholder,
}: CreatableSelectProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Helper to handle creation
  const handleCreate = async () => {
    if (!inputValue.trim()) return;

    setIsCreating(true);
    try {
      const newItem = await onCreate(inputValue);

      // If creation succeeded, select the new item and close input mode
      if (newItem) {
        onChange(newItem.id);
        setIsAddingNew(false);
        setInputValue("");
      }
    } catch (error) {
      console.error(`Failed to create new ${label}`, error);
    } finally {
      setIsCreating(false);
    }
  };

  // Adding New
  if (isAddingNew) {
    return (
      <div className="space-y-2">
        <Label className="mb-2">{label}</Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}...`}
            disabled={isCreating}
            autoFocus
          />
          <Button
            size="icon"
            onClick={handleCreate}
            disabled={!inputValue.trim() || isCreating}
            type="button" // Prevent form submission
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAddingNew(false);
              setInputValue("");
            }}
            disabled={isCreating}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Selecting Item
  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <Select
        // Handle conversion to string for the Select component
        value={value?.toString() ?? ""}
        onValueChange={(val) => {
          if (val === "__add_new__") {
            setIsAddingNew(true);
          } else {
            const isNumeric =
              options.length > 0 && typeof options[0].id === "number";
            onChange(isNumeric ? parseInt(val, 10) : val);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id.toString()}>
              {opt.name}
            </SelectItem>
          ))}

          <div className="border-t my-1" />

          <SelectItem
            value="__add_new__"
            className="cursor-pointer font-medium text-green-700 focus:text-green-700"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New {label}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
