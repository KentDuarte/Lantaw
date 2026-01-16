import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Personnel from "./pages/Personnel";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import AppLayout from "../src/features/layout/components/AppLayout";
import PublicProjects from "./pages/PublicProjects";

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<RegisterAndLogout />} />
            <Route path="/projects" element={<PublicProjects />} />

            {/* Protected routes inside AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route
                path="/activities"
                element={
                  <RoleRoute allowedRoles={["Admin", "Project Staff"]}>
                    <Activities />
                  </RoleRoute>
                }
              />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="/notfound" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
