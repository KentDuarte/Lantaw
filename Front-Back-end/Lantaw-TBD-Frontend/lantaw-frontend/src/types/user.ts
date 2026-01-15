export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Project Staff" | "Executive";
  acccountStatus: "Active" | "Deactivated" | "Suspended";
  projects: number[]; 
}