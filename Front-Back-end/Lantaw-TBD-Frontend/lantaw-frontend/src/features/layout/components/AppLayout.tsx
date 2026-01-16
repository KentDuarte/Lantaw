import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "./Sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../../components/common/collapsible";
import { Button } from "../../../components/common/button";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard,
  Activity,
  Users,
  UserCircle,
  FolderOpen,
  ChevronDown,
  Eye,
  Plus,
} from "lucide-react";
import api from "../../../api/client";
import { useProject } from "../../../context/ProjectContext";
import ProjectModal from "../components/ProjectModal";

interface Project {
  id: number;
  name: string;
  project_status: "ACTIVE" | "COMPLETED" | "ONHOLD";
}

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const { currentProject, setCurrentProject } = useProject();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [createProjectError, setCreateProjectError] = useState("");
  const [createProjectForm, setCreateProjectForm] = useState({
    name: "",
    projectLeader: "",
    description: "",
    startDate: "",
    endDate: "",
    totalGrant: "",
    projectStaff: "",
  });

  // Helper function to check if  the staff exists in the database  first
  const checkStaffExists = async (email: string): Promise<boolean> => {
    if (!email.trim()) return false;
    try {
      const staffRes = await api.get(`/api/users/check/?email=${encodeURIComponent(email.trim())}`);
      return staffRes.data.exists === true;
    } catch (err) {
      console.error("Failed to lookup staff:", err);
      // Return false so we can show in the UI
      return false;
    }
  };

  const handleCreateProject = async () => {
    if (user?.role !== "Admin") {
      setCreateProjectError("You are not authorized to create projects.");
      return;
    }

    setCreateProjectError("");

    if (!createProjectForm.projectLeader.trim()) {
      setCreateProjectError("Project leader is required.");
      return;
    }
    if (!createProjectForm.name.trim()) {
      setCreateProjectError("Project name is required.");
      return;
    }
    if (!createProjectForm.projectStaff.trim()) {
      setCreateProjectError("Project staff email is required.");
      return;
    }

    try {
      // Check if staff exists
      const staffRes = await api.get(
        `/api/users/check/?email=${encodeURIComponent(createProjectForm.projectStaff.trim())}`
      );

      if (!staffRes.data.exists) {
        setCreateProjectError(
          "Staff does not exist. Please enter a valid email."
        );
        return;
      }

      const userId = staffRes.data.id;

      // Create project
      const projectPayload = {
        name: createProjectForm.name,
        project_leader: createProjectForm.projectLeader,
        description: createProjectForm.description,
        date_start: createProjectForm.startDate,
        date_end: createProjectForm.endDate,
        grant_amount: parseFloat(createProjectForm.totalGrant) || 0,
      };

      const projectRes = await api.post("/api/projects/", projectPayload);
      const projectId = projectRes.data.id;

      // Assign set staff to project via membership
      await api.post(`/api/projects/${projectId}/members/`, {
        user: userId,
        project: projectId,
      });

      // Reset & close modal
      setIsCreateProjectModalOpen(false);
      setCreateProjectForm({
        name: "",
        projectLeader: "",
        description: "",
        startDate: "",
        endDate: "",
        totalGrant: "",
        projectStaff: "",
      });
      setCreateProjectError("");
    } catch (err) {
      console.error("Failed to create project:", err);
      setCreateProjectError("Something went wrong. Please try again.");
    }
  };

  const location = useLocation();

  // Sidebar menu items
  const allMenuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/" },
    { name: "Activities", icon: Activity, path: "/activities" },
    { name: "Personnel", icon: Users, path: "/personnel" },
    { name: "Profile", icon: UserCircle, path: "/profile" },
  ];

  // Filter menu items based on user role - hide Activities for Executive users
  const menuItems = allMenuItems.filter((item) => {
    if (item.name === "Activities" && user?.role === "Executive") {
      return false;
    }
    return true;
  });

  // Helper: status color
  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "ONHOLD":
        return "bg-gray-400";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.projects?.length) return;

      try {
        const responses = await Promise.all(
          user.projects.map((id) => api.get(`/api/projects/${id}/`))
        );
        const projectData = responses.map((res) => res.data);
        setProjects(projectData);
        if (projectData.length > 0) setCurrentProject(projectData[0]);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, [user]);

  // Determine current page title based on route path
  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name ||
    "Dashboard";

  return (
    <SidebarProvider>
      <Sidebar>
        {/* Sidebar Header */}
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Eye />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Lantaw</span>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Map over menu items */}
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.name}>
                      <NavLink to={item.path}>
                        <item.icon />
                        <span>{item.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer (Projects) */}
        <SidebarFooter className="border-t">
          <Collapsible>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="group/collapsible w-full flex items-center justify-between p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Projects
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Create Project Button */}
                    {user?.role === "Admin" && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="Create Project">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-xs mb-2 group-data-[collapsible=icon]:justify-center"
                              onClick={() => setIsCreateProjectModalOpen(true)}
                            >
                              <Plus className="h-3 w-3 mr-2 group-data-[collapsible=icon]:mr-0" />
                              <span className="group-data-[collapsible=icon]:hidden">
                                Create Project
                              </span>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <ProjectModal
                          open={isCreateProjectModalOpen}
                          onOpenChange={setIsCreateProjectModalOpen}
                          formData={createProjectForm}
                          setFormData={setCreateProjectForm}
                          onSubmit={handleCreateProject}
                          checkStaffExists={checkStaffExists}
                        />
                      </>
                    )}

                    {/* Project Modal */}
                    <ProjectModal
                      open={isCreateProjectModalOpen}
                      onOpenChange={setIsCreateProjectModalOpen}
                      formData={createProjectForm}
                      setFormData={setCreateProjectForm}
                      onSubmit={handleCreateProject}
                      checkStaffExists={checkStaffExists}
                    />

                    {/* Dynamically Render User's Projects */}
                    {projects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={currentProject?.id === project.id}
                          tooltip={project.name}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-xs"
                            onClick={() => setCurrentProject(project)}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${getProjectStatusColor(
                                project.project_status
                              )} flex-shrink-0`}
                            />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {project.name}
                            </span>
                          </Button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset>
        {/* Header with sidebar toggle */}
        <header className="sticky top-0 flex h-14 items-center gap-2 border-b bg-white px-4 z-10">
          <SidebarTrigger />

          {/* Title and breadcrumb inline */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{currentPage}</h1>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {currentProject?.name || "No Project Selected"}
            </span>
          </div>
        </header>

        {/* Main content area — page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
