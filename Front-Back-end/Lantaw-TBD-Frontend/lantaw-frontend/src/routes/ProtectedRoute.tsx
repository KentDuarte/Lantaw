import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  projectScoped?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  projectScoped = false,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { id: projectId } = useParams();

  // Show loading indicator while waiting for auth state.
  if (loading) return <div>Loading in protected route...</div>;

  // If user isn't authenticated, redirect to login (and save their intended location).
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} />;

  // If route is project-scoped and user is required to be a member:
  if (projectScoped && user?.role === "PROJECT_STAFF") {
    const numericId = Number(projectId);

    // Robustly check membership
    if (!user.projects || !user.projects.includes(numericId)) {
      return <Navigate to="/" replace />;
    }
  }

  // Render the protected content if all checks pass.
  return <>{children}</>;
};
