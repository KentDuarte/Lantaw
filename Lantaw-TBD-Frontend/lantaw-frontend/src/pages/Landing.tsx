import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/button";
import {
  Eye,
  LayoutDashboard,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleProjectsClick = () => navigate("/projects");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top bar with login button on the right */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-6">
        <div className="flex items-center">
          <Eye className="size-12 text-primary" aria-hidden />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
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

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            LANTAW
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Project visibility and team coordination in one place. Plan, track,
            and deliver with clarity.
          </p>
        </div>
      </main>

      {/* What is Lantaw */}
      <section className="px-4 sm:px-8 py-16 md:py-24 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            What is Lantaw?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Lantaw helps teams and organizations keep projects on track. From
            activities and personnel to analytics and change requests, you get a
            single view of progress and clear accountability—so everyone knows
            what’s done and what’s next.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-8 py-16 md:py-24 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why Lantaw?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-lg bg-card p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">Dashboard overview</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                See project status at a glance. One place for key metrics and
                recent activity.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <ClipboardList className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">Activities & tasks</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Track activities, assign owners, and manage change requests in a
                structured workflow.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">Personnel</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage team members and roles. Keep roles and access aligned with
                your structure.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <BarChart3 className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">Analytics & history</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Visualize progress with charts and review a full history log for
                audit and transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-8 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
          © 2026 Lantaw. All right reserve
          </p>
        </div>
      </footer>
    </div>
  );
}

