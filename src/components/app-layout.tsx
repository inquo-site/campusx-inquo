import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Briefcase,
  Rocket,
  UserCircle,
  Search,
  Bell,
  ArrowUpRight,
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

const titleMap: Record<string, { eyebrow: string; title: string; italic: string }> = {
  "/": { eyebrow: "Home", title: "Builders that", italic: "ship things" },
  "/discover": { eyebrow: "Network", title: "Peers who", italic: "build with you" },
  "/projects": { eyebrow: "Showcase", title: "Projects that", italic: "actually run" },
  "/internships": { eyebrow: "Opportunities", title: "Internships worth", italic: "your hours" },
  "/startups": { eyebrow: "Incubator", title: "Founders looking for", italic: "a co-pilot" },
  "/profile": { eyebrow: "You", title: "Your builder", italic: "footprint" },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const head = titleMap[pathname] ?? titleMap["/"];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-gold/40 bg-gold/10 font-display text-xl italic text-gold">
            X
          </div>
          <div className="font-display text-2xl leading-none">
            Campus<span className="italic-serif">X</span>
          </div>
        </div>

        <div className="hairline mx-6" />

        <nav className="flex-1 px-3 py-5">
          <div className="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-sidebar-foreground/40">
            — Workspace
          </div>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300 " +
                      (active
                        ? "bg-sidebar-accent text-cream"
                        : "text-sidebar-foreground/65 hover:text-cream")
                    }
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {active && <ArrowUpRight className="ml-auto h-3 w-3 text-gold" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="m-3 overflow-hidden rounded-xl border border-border bg-sidebar-accent p-5">
          <div className="font-display text-lg leading-tight">
            Ship something <span className="italic-serif">real</span> this week.
          </div>
          <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/60">
            Post a project, find a collaborator, win demo day.
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:flex md:px-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-4 bg-gold/60" /> {head.eyebrow}
            </div>
            <motion.h1
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-0.5 truncate font-display text-2xl leading-tight"
            >
              {head.title} <span className="italic-serif">{head.italic}</span>
            </motion.h1>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search peers, projects, internships…"
                className="h-10 w-80 rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-gold/60"
              />
            </div>

            <button
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface transition hover:border-gold/40"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>

            <div className="flex items-center gap-3 rounded-full border border-border bg-surface py-1 pl-1 pr-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gold font-display text-sm text-primary-foreground">
                A
              </div>
              <div className="text-left">
                <div className="text-xs font-medium leading-tight">Ananya K.</div>
                <div className="text-[10px] leading-tight text-muted-foreground">IIT Bombay</div>
              </div>
            </div>
          </div>
        </header>

        <main className="ambient-glow relative flex-1 px-4 py-8 md:px-10 md:py-14">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
