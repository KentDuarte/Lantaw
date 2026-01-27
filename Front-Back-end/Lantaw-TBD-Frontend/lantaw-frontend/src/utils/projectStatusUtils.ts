import type { Project } from "../types/project";

/**
 * Normalize project status from backend format (ON_HOLD) to frontend format (ONHOLD)
 */
export const normalizeProjectStatus = (project: Project): Project => {
  if (project.project_status === "ON_HOLD") {
    return { ...project, project_status: "ONHOLD" as Project["project_status"] };
  }
  return project;
};

/**
 * Normalize an array of projects
 */
export const normalizeProjects = (projects: Project[]): Project[] => {
  return projects.map(normalizeProjectStatus);
};

/**
 * Convert frontend status format to backend format
 * Frontend uses "ONHOLD", backend expects "ON_HOLD"
 */
export const toBackendStatus = (status: string): string => {
  return status === "ONHOLD" ? "ON_HOLD" : status;
};

/**
 * Convert backend status format to frontend format
 * Backend returns "ON_HOLD", frontend expects "ONHOLD"
 */
export const toFrontendStatus = (status: string): string => {
  return status === "ON_HOLD" ? "ONHOLD" : status;
};

