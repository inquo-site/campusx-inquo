import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Briefcase,
  Rocket,
  UserCircle,
  Search,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover Peers", icon: Users },
  { to: "/projects", label: "Project Hub", icon: FolderGit2 },
  { to: "/internships", label: "Internship Board", icon: Briefcase },
  { to: "/startups", label: "Startup Incubator", icon: Rocket },
  { to: "/profile", label: "My Profile", icon: UserCircle },
] as const;

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/discover": "Discover Peers",
  "/projects": "Project Hub",
  "/internships": "Internship Board",
  "/startups": "Startup Incubator",
  "/profile": "My Profile",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleMap[pathname] ?? "Campus X";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-20 items-center gap-2 px-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-display font-bold">
            X
          </div>
          <div className="font-display text-xl font-bold tracking-tight">
            Campus<span className="text-sidebar-primary">X</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Workspace
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
                      (active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground")
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="m-3 rounded-xl bg-sidebar-accent p-4">
          <div className="font-display text-sm font-semibold">Ship something this week.</div>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
            Post a project, find a collaborator, win the demo day.
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Campus X
            </div>
            <h1 className="truncate font-display text-2xl font-bold">{title}</h1>
          </div>

          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search peers, projects, internships..."
              className="h-11 w-80 rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground transition hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-lime" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-ink-foreground">
              AK
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-sm font-semibold leading-tight">Ananya K.</div>
              <div className="text-xs leading-tight text-muted-foreground">IIT Bombay</div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
