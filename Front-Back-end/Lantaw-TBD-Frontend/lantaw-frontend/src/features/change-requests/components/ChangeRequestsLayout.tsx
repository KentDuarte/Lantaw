// Main orchestrator component for change requests management.

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useChangeRequests } from "../hooks/useChangeRequests";
import { useChangeRequestFilters } from "../hooks/useChangeRequestFilters";
import { ChangeRequestsHeader } from "./ChangeRequestsHeader";
import { ChangeRequestCard } from "./ChangeRequestCard";
import { ChangeRequestDetail } from "./ChangeRequestDetail";
import { ApproveChangeRequestModal } from "./modals/ApproveChangeRequestModal";
import { RejectChangeRequestModal } from "./modals/RejectChangeRequestModal";
import { Card, CardContent } from "../../../components/common/card";
import type { ChangeRequest } from "../../../types/changeRequest";
import type { Project } from "../../../types/project";
import api from "../../../api/client";

interface ChangeRequestsLayoutProps {
  projectId?: number | null;
}

export const ChangeRequestsLayout: React.FC<ChangeRequestsLayoutProps> = ({
  projectId = null,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isProjectStaff = user?.role === "Project Staff";
  const changeRequests = useChangeRequests(projectId);
  const filters = useChangeRequestFilters();

  // View state
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects for Admin and Project Staff filters
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let projectData: Project[] = [];
        
        if (isAdmin) {
          // Admin: fetch all projects
          const response = await api.get("/api/projects/");
          // Handle paginated response (Django REST Framework returns { results: [...] })
          projectData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.results || []);
        } else if (isProjectStaff && user?.projects?.length) {
          // Project Staff: fetch only assigned projects
          const responses = await Promise.all(
            user.projects.map((id) => api.get(`/api/projects/${id}/`))
          );
          projectData = responses.map((res) => res.data);
        }
        
        setProjects(projectData);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      }
    };
    
    if (isAdmin || isProjectStaff) {
      fetchProjects();
    }
  }, [isAdmin, isProjectStaff, user?.projects]);

  // Refetch when filters change
  useEffect(() => {
    changeRequests.fetchChangeRequests(projectId || undefined, filters.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters.filters), projectId]);

  // Handlers
  const handleViewDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
  };

  const handleApproveClick = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await changeRequests.approveChangeRequest(selectedRequest.project, selectedRequest.id);
      setIsApproveModalOpen(false);
      // Refresh the list
      await changeRequests.fetchChangeRequests(projectId || undefined, filters.filters);
      // Refresh the selected request detail view
      const updatedRequest = await changeRequests.fetchChangeRequestById(selectedRequest.project, selectedRequest.id);
      if (updatedRequest) {
        setSelectedRequest(updatedRequest);
      }
    } catch (error) {
      // Error is handled by the hook, just re-throw to let modal handle it
      throw error;
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;
    try {
      await changeRequests.rejectChangeRequest(selectedRequest.project, selectedRequest.id, reason);
      setIsRejectModalOpen(false);
      // Refresh the list
      await changeRequests.fetchChangeRequests(projectId || undefined, filters.filters);
      // Refresh the selected request detail view
      const updatedRequest = await changeRequests.fetchChangeRequestById(selectedRequest.project, selectedRequest.id);
      if (updatedRequest) {
        setSelectedRequest(updatedRequest);
      }
    } catch (error) {
      // Error is handled by the hook, just re-throw to let modal handle it
      throw error;
    }
  };

  // Filtered change requests
  const filteredRequests = changeRequests.changeRequests.filter((req) => {
    if (filters.filters.status && req.status !== filters.filters.status) return false;
    if (filters.filters.change_type && req.change_type !== filters.filters.change_type) return false;
    if (filters.filters.operation && req.operation !== filters.filters.operation) return false;
    if (filters.filters.project && req.project !== filters.filters.project) return false;
    return true;
  });

  // Detail view
  if (selectedRequest) {
    return (
      <>
        <ChangeRequestDetail
          changeRequest={selectedRequest}
          onBack={handleBackToList}
          onApprove={isAdmin ? () => handleApproveClick(selectedRequest) : undefined}
          onReject={isAdmin ? () => handleRejectClick(selectedRequest) : undefined}
          showActions={isAdmin}
        />
        {isAdmin && (
          <>
            <ApproveChangeRequestModal
              open={isApproveModalOpen}
              onOpenChange={setIsApproveModalOpen}
              changeRequest={selectedRequest}
              onApprove={handleApprove}
            />
            <RejectChangeRequestModal
              open={isRejectModalOpen}
              onOpenChange={setIsRejectModalOpen}
              changeRequest={selectedRequest}
              onReject={handleReject}
            />
          </>
        )}
      </>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <ChangeRequestsHeader
        filters={filters}
        isAdmin={isAdmin}
        projects={projects}
      />

      {changeRequests.loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading change requests...</p>
          </CardContent>
        </Card>
      ) : changeRequests.error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Error: {changeRequests.error.message}
            </p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {Object.keys(filters.filters).length > 0
                ? "No change requests match the selected filters."
                : "No change requests found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <ChangeRequestCard
              key={request.id}
              changeRequest={request}
              onViewDetails={handleViewDetails}
              onApprove={isAdmin ? handleApproveClick : undefined}
              onReject={isAdmin ? handleRejectClick : undefined}
              showActions={isAdmin}
            />
          ))}
        </div>
      )}

      {isAdmin && selectedRequest && (
        <>
          <ApproveChangeRequestModal
            open={isApproveModalOpen}
            onOpenChange={setIsApproveModalOpen}
            changeRequest={selectedRequest}
            onApprove={handleApprove}
          />
          <RejectChangeRequestModal
            open={isRejectModalOpen}
            onOpenChange={setIsRejectModalOpen}
            changeRequest={selectedRequest}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  );
};

