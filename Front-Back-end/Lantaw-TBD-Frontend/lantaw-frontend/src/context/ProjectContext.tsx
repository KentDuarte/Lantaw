import React, { createContext, useContext, useState, ReactNode } from "react";
import { CURRENT_PROJECT } from "../api/constants";
import type { Project } from "../types/project";
import api from "../api/client";
interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  clearProject: () => void;
  // Added refetchProject
  refetchProject: (projectId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(
    () => {
      const saved = localStorage.getItem(CURRENT_PROJECT);
      return saved ? JSON.parse(saved) : null;
    }
  );

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    localStorage.setItem(CURRENT_PROJECT, JSON.stringify(project));
  };

  const clearProject = () => {
    setCurrentProjectState(null);
    localStorage.removeItem(CURRENT_PROJECT);
  };

  // Implementation of refetchProject
  const refetchProject = async (projectId: number): Promise<void> => {
    try {
      const response = await api.get(`/api/projects/${projectId}/`);
      const updatedProject: Project = response.data;

      // Use the existing setter which updates both state and localStorage
      setCurrentProject(updatedProject);
    } catch (error) {
      console.error(`Failed to refetch project ID ${projectId}:`, error);
      throw new Error("Failed to load updated project data.");
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        clearProject,
        refetchProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
