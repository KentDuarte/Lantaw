import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/button";

export default function Landing() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleProjectsClick = () => {
    navigate("/projects");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top bar with login button on the right */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-lg font-semibold tracking-tight">
          Lantaw
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleProjectsClick}
            className="px-6"
          >
            Projects
          </Button>
          <Button onClick={handleLoginClick} className="px-6">
            Login
          </Button>
        </div>
      </header>

      {/* Center content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-xl -mt-[150px]">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            LANTAW
          </h1>
         
       
        </div>
      </main>
    </div>
  );
}

