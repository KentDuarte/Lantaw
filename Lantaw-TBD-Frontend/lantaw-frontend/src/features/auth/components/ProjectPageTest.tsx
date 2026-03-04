import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import type { User } from "../../../types/user";

type Project = {
  id: number;
  name: string;
};

// Simple sample projects to exercise visibility and edit rules
const sampleProjects: Project[] = [
  { id: 1, name: "Mangrove Restoration" },
  { id: 2, name: "Watershed Monitoring" },
  { id: 3, name: "Community Outreach" },
  { id: 4, name: "Biodiversity Survey" },
  { id: 5, name: "Coastal Cleanup" },
];

// Mock users for testing assumptions regardless of the authenticated user
const mockUsers: Record<
  "ADMIN" | "PROJECT_STAFF" | "EXECUTIVE",
  Pick<
    User,
    "id" | "firstName" | "lastName" | "role" | "acccountStatus" | "projects"
  >
> = {
  ADMIN: {
    id: "u-admin",
    firstName: "Alice",
    lastName: "Admin",
    role: "ADMIN",
    acccountStatus: "ACTIVE",
    projects: [],
  },
  PROJECT_STAFF: {
    id: "u-staff",
    firstName: "Sam",
    lastName: "Staff",
    role: "PROJECT_STAFF",
    acccountStatus: "ACTIVE",
    projects: [1, 3],
  },
  EXECUTIVE: {
    id: "u-exec",
    firstName: "Eve",
    lastName: "Executive",
    role: "EXECUTIVE",
    acccountStatus: "ACTIVE",
    projects: [],
  },
};

const normalizeRole = (roleInput: unknown): User["role"] | null => {
  if (roleInput === null || roleInput === undefined) return null;
  const raw = String(roleInput).trim();
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  if (upper === "ADMIN") return "ADMIN";
  if (upper === "EXECUTIVE") return "EXECUTIVE";
  if (upper === "PROJECT_STAFF") return "PROJECT_STAFF";
  return null;
};

const normalizeUser = (u: unknown): User | null => {
  if (!u || typeof u !== "object") return null;
  const anyUser = u as Record<string, unknown>;
  const role: User["role"] | null = normalizeRole(
    anyUser.role ?? anyUser.user_role ?? anyUser.Role
  );
  if (!role) return null;

  const firstName = (anyUser.firstName ??
    anyUser.first_name ??
    anyUser.given_name ??
    "") as string;
  const lastName = (anyUser.lastName ??
    anyUser.last_name ??
    anyUser.family_name ??
    "") as string;
  const projects = Array.isArray(anyUser.projects)
    ? (anyUser.projects as unknown[]).map((p) => Number(p))
    : [];
  const status = (anyUser.acccountStatus ??
    anyUser.account_status ??
    anyUser.status ??
    "ACTIVE") as string;

  return {
    id: String(anyUser.id ?? anyUser.user_id ?? ""),
    firstName,
    lastName,
    role,
    acccountStatus: String(status).toUpperCase() as User["acccountStatus"],
    projects,
  } as User;
};

export default function ProjectPage() {
  const { user } = useAuth();

  // Local test harness state
  const [useMock, setUseMock] = useState<boolean>(true);
  const [selectedMockRole, setSelectedMockRole] = useState<
    "ADMIN" | "PROJECT_STAFF" | "EXECUTIVE"
  >("ADMIN");

  const effectiveUser: User | null = useMemo(() => {
    if (useMock) return mockUsers[selectedMockRole] as User;
    return normalizeUser(user as unknown);
  }, [useMock, selectedMockRole, user]);

  const visibleProjects: Project[] = useMemo(() => {
    if (!effectiveUser) return [];
    if (effectiveUser.role === "ADMIN") return sampleProjects;
    if (effectiveUser.role === "PROJECT_STAFF") {
      return sampleProjects.filter((p) =>
        effectiveUser.projects.includes(p.id)
      );
    }
    // EXECUTIVE can see everything but is read-only
    return sampleProjects;
  }, [effectiveUser]);

  const canEditProject = (projectId: number): boolean => {
    if (!effectiveUser) return false;
    if (effectiveUser.role === "ADMIN") return true;
    if (effectiveUser.role === "PROJECT_STAFF") {
      return effectiveUser.projects.includes(projectId);
    }
    return false; // EXECUTIVE is view-only
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">🧪 Project Permissions Test</h1>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
          />
          <span>Use mock users</span>
        </label>

        {useMock && (
          <select
            className="border rounded px-2 py-1"
            value={selectedMockRole}
            onChange={(e) =>
              setSelectedMockRole(
                e.target.value as "ADMIN" | "PROJECT_STAFF" | "EXECUTIVE"
              )
            }
          >
            <option value="ADMIN">ADMIN</option>
            <option value="PROJECT_STAFF">PROJECT_STAFF</option>
            <option value="EXECUTIVE">EXECUTIVE</option>
          </select>
        )}
      </div>

      <div className="bg-gray-50 border rounded p-3">
        <p className="mb-1">
          <strong>Effective User:</strong>
        </p>
        {effectiveUser ? (
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(effectiveUser, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-gray-600">No user available</p>
        )}
      </div>

      <div className="space-y-2">
        <p>
          <strong>Rules under test:</strong>
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>ADMIN: can see and edit all projects</li>
          <li>
            PROJECT_STAFF: can see and edit only projects they are part of
          </li>
          <li>EXECUTIVE: can see all projects but is view-only</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Projects</h2>
        {visibleProjects.length === 0 && (
          <p className="text-gray-600 text-sm">
            No visible projects for this user.
          </p>
        )}
        <ul className="space-y-2">
          {visibleProjects.map((p) => {
            const editable = canEditProject(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {effectiveUser?.role === "PROJECT_STAFF" &&
                    (effectiveUser.projects.includes(p.id) ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        member
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        not a member
                      </span>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded">View</button>
                  <button
                    className={`px-2 py-1 border rounded ${
                      editable
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                    disabled={!editable}
                  >
                    Edit
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {effectiveUser?.role === "EXECUTIVE" && (
        <p className="text-gray-500 italic">You have read-only access.</p>
      )}
    </div>
  );
}
