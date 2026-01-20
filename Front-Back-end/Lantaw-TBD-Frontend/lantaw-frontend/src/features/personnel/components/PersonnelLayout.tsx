// Main orchestrator component for personnel management.

import { useState, useMemo } from "react";
import { Accordion } from "../../../components/common/accordion";

// Context
import { useProject } from "../../../context/ProjectContext";
import { useAuth } from "../../../context/AuthContext";

// Hooks
import { usePersonnel } from "../hooks/usePersonnel";
import { usePersonnelFilters } from "../hooks/usePersonnelFilter";
import { useCompensation } from "../hooks/useCompensation";
import { useRole } from "../hooks/useRole";
import { useDepartment } from "../hooks/useDepartment";
import { useActivities } from "../../../features/activities/hooks/useActivities";

// Components
import { PersonnelHeader } from "./PersonnelHeader";
import { PersonnelFilters } from "./PersonnelFilters";
import { PersonnelAccordion } from "./PersonnelAccordion";

// Modals
import { AddPersonnelModal } from "./modals/AddPersonnelModal";
import { DeletePersonnelModal } from "./modals/DeletePersonnelModal";
import { EditCompensationModal } from "./modals/EditCompensationModal";
import { DeleteCompensationModal } from "./modals/DeleteCompensationModal";

// Types
import type { Personnel } from "../../../types/personnel";
import type { Compensation } from "../../../types/compensation";

const PersonnelLayout = () => {
  // Hooks
  const { currentProject } = useProject();
  const { user } = useAuth();
  const filters = usePersonnelFilters();

  const personnel = usePersonnel(currentProject?.id || null);
  const {
    compensation: compensationList,
    loadingCompensation,
    fetchCompensation,
    addCompensation,
    updateCompensation,
    deleteCompensation,
  } = useCompensation(currentProject?.id, personnel || null);

  const {
    role: roles,
    loadingRole,
    addRole,
    error: roleError,
  } = useRole(currentProject?.id || null);

  const {
    department: departments,
    loadingDepartment,
    addDepartment,
    error: departmentError,
  } = useDepartment(currentProject?.id || null);

  const { budgetLineItems } = useActivities(currentProject?.id || null);

  // Modal states
  const [isAddPersonnelModalOpen, setIsAddPersonnelModalOpen] = useState(false);
  const [isDeletePersonnelModalOpen, setIsDeletePersonnelModalOpen] =
    useState(false);
  const [isEditCompensationModalOpen, setIsEditCompensationModalOpen] =
    useState(false);
  const [isDeleteCompensationModalOpen, setIsDeleteCompensationModalOpen] =
    useState(false);

  // Editing states
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(
    null
  );
  const [editingCompensation, setEditingCompensation] =
    useState<Compensation | null>(null);

  // Handlers for personnel
  const handleOpenAddPersonnelModal = () => {
    setEditingPersonnel(null);
    setIsAddPersonnelModalOpen(true);
  };

  const handleOpenEditPersonnelModal = (person: Personnel) => {
    setEditingPersonnel(person);
    setIsAddPersonnelModalOpen(true);
  };

  const handleOpenDeletePersonnelModal = (person: Personnel) => {
    setEditingPersonnel(person);
    setIsDeletePersonnelModalOpen(true);
  };

  const handleCreatePersonnel = async (data: {
    first_name: string;
    last_name: string;
    role: number | null;
    department: number | null;
    employment_status: Personnel["employment_status"];
  }) => {
    await personnel.addPersonnel(data);
  };

  const handleEditPersonnel = async (data: {
    first_name: string;
    last_name: string;
    role: number | null;
    department: number | null;
    employment_status: Personnel["employment_status"];
  }) => {
    if (!editingPersonnel) return;
    await personnel.updatePersonnel(editingPersonnel.id, data);
    setEditingPersonnel(null);
    setIsAddPersonnelModalOpen(false);
  };

  const handleDeletePersonnel = async () => {
    if (!editingPersonnel) return;
    await personnel.deletePersonnel(editingPersonnel.id);
    setEditingPersonnel(null);
  };

  // Handlers for compensation
  const handleSaveCompensation = async (data: {
    type: Compensation["type"];
    budget_item: number | null;
    personnel: number;
    reason: string | null;
    amount: number;
    date_effective: string;
  }) => {
    try {
      const payload = {
        ...data,
        amount: data.amount.toString(),
        reason: data.reason || "",
        budget_item: data.budget_item || 0,
      };

      if (editingCompensation) {
        // Edit Mode
        await updateCompensation(editingCompensation.id, payload);
      } else {
        // Create Mode
        await addCompensation(payload);
      }

      // Close modal
      setIsEditCompensationModalOpen(false);
      setEditingPersonnel(null);
      setEditingCompensation(null);
    } catch (error) {
      console.error("Error saving compensation", error);
    }
  };

  const handleDeleteCompensation = async () => {
    if (!editingCompensation) return;
    await deleteCompensation(editingCompensation.id);
    setEditingPersonnel(null);
  };

  // Add honoraria
  const handleAddHonoraria = (person: Personnel) => {
    setEditingPersonnel(person);
    setEditingCompensation(null);
    setIsEditCompensationModalOpen(true);
  };

  // Edit salary or honoraria
  const handleEditCompensation = (
    person: Personnel,
    compensationId: number
  ) => {
    const compItem = compensationList.find((c) => c.id === compensationId);
    if (!compItem) return;

    setEditingPersonnel(person);
    setEditingCompensation(compItem);
    setIsEditCompensationModalOpen(true);
  };

  // Delete salary or honoraria
  const handleDeleteCompensationItem = async (
    person: Personnel,
    compensationId: number
  ) => {
    const compItem = compensationList.find((c) => c.id === compensationId);
    if (!compItem) return;

    setEditingPersonnel(person);
    setEditingCompensation(compItem);
    setIsDeleteCompensationModalOpen(true);
  };

  // Helper wrappers to match accordion props
  const handleEditSalary = (p: Personnel, id: number) =>
    handleEditCompensation(p, id);
  const handleEditHonoraria = (p: Personnel, id: number) =>
    handleEditCompensation(p, id);

  const handleDeleteSalary = (p: Personnel, id: number) =>
    handleDeleteCompensationItem(p, id);
  const handleDeleteHonoraria = (p: Personnel, id: number) =>
    handleDeleteCompensationItem(p, id);

  // Role handlers
  // Adapter for creating a role from the modal
  const handleCreateRole = async (name: string) => {
    return await addRole({ name });
  };

  // Department handlers
  const handleCreateDepartment = async (name: string) => {
    return await addDepartment({ name });
  };

  // Personnel operations
  // Fetch compensations when accordion expands
  const handleExpandPersonnel = async () => {
    if (!currentProject) return;
    if (compensationList.length === 0 && !loadingCompensation) {
      await fetchCompensation();
    }
  };

  // Get filtered personnel
  const getFilteredPersonnel = () => {
    return filters.filterPersonnel(personnel.personnel);
  };

  const filteredPersonnel = getFilteredPersonnel();

  const compensationByPersonnel = useMemo(() => {
    const map: Record<number, typeof compensationList> = {};
    compensationList.forEach((item) => {
      if (!map[item.personnel]) {
        map[item.personnel] = [];
      }
      map[item.personnel].push(item);
    });
    return map;
  }, [compensationList]);

  const personnelServicesBudgetId = useMemo(() => {
    const psItem = budgetLineItems.find((item) => item.name === "PS");
    return psItem ? psItem.id : null;
  }, [budgetLineItems]);

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No project selected.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PersonnelHeader
        projectName={currentProject.name}
        onAddPersonnel={handleOpenAddPersonnelModal}
        userRole={user?.role}
      />

      {/* Search and Filters */}
      <PersonnelFilters filters={filters} departments={departments} />

      {/* Personnel Accordion */}
      <div className="space-y-4">
        <Accordion type="multiple" className="w-full space-y-4">
          {filteredPersonnel.map((person) => {
            const compensations = compensationByPersonnel[person.id] || [];

            return (
              <PersonnelAccordion
                key={person.id}
                personnel={person}
                compensations={compensations}
                isLoading={loadingCompensation}
                isBudgetReady={!!personnelServicesBudgetId}
                onExpand={handleExpandPersonnel}
                onEditPersonnel={handleOpenEditPersonnelModal}
                onDeletePersonnel={handleOpenDeletePersonnelModal}
                onEditSalary={handleEditSalary}
                onDeleteSalary={handleDeleteSalary}
                onAddHonoraria={handleAddHonoraria}
                onEditHonoraria={handleEditHonoraria}
                onDeleteHonoraria={handleDeleteHonoraria}
                showActions={user?.role !== "Executive"}
              />
            );
          })}
        </Accordion>
      </div>

      {/* Empty State */}
      {!personnel.loadingPersonnel && filteredPersonnel.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {personnel.personnel.length === 0
              ? "No personnel added yet."
              : "No personnel match your filters."}
          </p>
        </div>
      )}

      {/* Loading State */}
      {personnel.loadingPersonnel && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading personnel...</p>
        </div>
      )}

      {/* Modals */}
      {/* Add/Edit Personnel */}
      <AddPersonnelModal
        isOpen={isAddPersonnelModalOpen}
        onClose={() => {
          setIsAddPersonnelModalOpen(false);
          setEditingPersonnel(null);
        }}
        personnel={editingPersonnel}
        onSubmit={
          editingPersonnel ? handleEditPersonnel : handleCreatePersonnel
        }
        // Pass data
        roles={roles}
        departments={departments}
        // Pass Loading States
        // Disable dropdowns if fetching lists OR saving personnel
        isLoadingOptions={loadingRole || loadingDepartment}
        isSubmittingMain={personnel.loadingPersonnel}
        // Pass the Bridge Functions
        onCreateRole={handleCreateRole}
        onCreateDepartment={handleCreateDepartment}
      />

      {/* Delete Personnel */}
      <DeletePersonnelModal
        isOpen={isDeletePersonnelModalOpen}
        onClose={() => {
          setIsDeletePersonnelModalOpen(false);
          setEditingPersonnel(null);
        }}
        onConfirm={handleDeletePersonnel}
        personnelFirstName={editingPersonnel?.first_name}
        personnelLastName={editingPersonnel?.last_name}
      />

      {/* Integrated Add/Edit Compensation Modal */}
      {editingPersonnel && (
        <EditCompensationModal
          isOpen={isEditCompensationModalOpen}
          onClose={() => {
            setIsEditCompensationModalOpen(false);
            setEditingCompensation(null);
            // Don't clear Personnel yet, triggers flicker or undefined error if modal is closing
          }}
          onSubmit={handleSaveCompensation}
          compensation={editingCompensation}
          personnel={editingPersonnel}
          defaultBudgetItemId={personnelServicesBudgetId}
        />
      )}

      {/* Delete Compensation */}
      {editingCompensation && (
        <DeleteCompensationModal
          isOpen={isDeleteCompensationModalOpen}
          onClose={() => {
            setIsDeleteCompensationModalOpen(false);
            setEditingCompensation(null);
            setEditingPersonnel(null);
          }}
          onConfirm={handleDeleteCompensation}
          compensation={editingCompensation}
        />
      )}
    </div>
  );
};

export default PersonnelLayout;
