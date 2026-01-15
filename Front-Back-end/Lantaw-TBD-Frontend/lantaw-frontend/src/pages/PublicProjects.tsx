import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Button } from "../components/common/button";

interface Project {
  id: number;
  name: string;
}

export default function PublicProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects-public/");
        const data = response.data;
        const items: Project[] = Array.isArray(data) ? data : [];
        setProjects(items);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setError("Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back
          </Button>
        
        </div>
      
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Projects :</h1>

          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && projects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No projects found.
            </p>
          )}

          {!loading && !error && projects.length > 0 && (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-md border bg-card px-4 py-2 text-sm"
                >
                  {project.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

