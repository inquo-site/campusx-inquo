import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  Sparkles,
  FileText,
  LogOut,
  Trophy,
  ClipboardList,
  Users2,
  MessagesSquare,
  Github,
  Linkedin,
  Bot,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover Peers", icon: Users },
  { to: "/projects", label: "Project Hub", icon: FolderGit2 },
  { to: "/internships", label: "Internship Board", icon: Briefcase },
  { to: "/jobs", label: "Off-Campus Jobs", icon: Briefcase },
  { to: "/hackathons", label: "Hackathons", icon: Trophy },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/alumni", label: "Alumni Referrals", icon: Users2 },
  { to: "/rooms", label: "Peer Rooms", icon: MessagesSquare },
  { to: "/devprofile", label: "Dev Report Card", icon: Github },
  { to: "/linkedin-optimizer", label: "LinkedIn Optimizer", icon: Linkedin },
  { to: "/startups", label: "Startup Incubator", icon: Rocket },
  { to: "/mentor", label: "AI Mentor", icon: Sparkles },
  { to: "/resume", label: "Resume Builder", icon: FileText },
  { to: "/profile", label: "My Profile", icon: UserCircle },
] as const;

const titleMap: Record<string, { eyebrow: string; title: string; italic: string }> = {
  "/dashboard": { eyebrow: "Home", title: "Builders that", italic: "ship things" },
  "/discover": { eyebrow: "Network", title: "Peers who", italic: "build with you" },
  "/projects": { eyebrow: "Showcase", title: "Projects that", italic: "actually run" },
  "/internships": { eyebrow: "Opportunities", title: "Internships worth", italic: "your hours" },
  "/jobs": { eyebrow: "Opportunities", title: "Off-campus drives,", italic: "curated" },
  "/hackathons": { eyebrow: "Opportunities", title: "Hackathons worth", italic: "your weekend" },
  "/applications": { eyebrow: "Tracker", title: "Every application,", italic: "one board" },
  "/alumni": { eyebrow: "Network", title: "Warm intros,", italic: "not cold DMs" },
  "/rooms": { eyebrow: "Network", title: "Peer rooms that", italic: "ship together" },
  "/devprofile": { eyebrow: "Network", title: "Your public builder", italic: "report card" },
  "/linkedin-optimizer": { eyebrow: "Profile", title: "Your LinkedIn,", italic: "recruiter-ready" },
  "/mentor": { eyebrow: "Mentor", title: "An AI mentor that", italic: "actually knows code" },
  "/resume": { eyebrow: "Resume", title: "Your resume,", italic: "AI-polished" },
  "/profile": { eyebrow: "You", title: "Your builder", italic: "footprint" },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const head = titleMap[pathname] ?? titleMap["/dashboard"];
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, college").eq("id", user.id).maybeSingle().then(({ data }) => {
      setDisplayName(data?.full_name ?? user.email?.split("@")[0] ?? "Builder");
      setCollege(data?.college ?? "Campus X");
    });
  }, [user]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initial = (displayName || "B").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
        <Link to="/" className="flex h-20 items-center gap-3 px-6">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-gold/40 bg-gold/10 font-display text-xl italic text-gold">X</div>
          <div className="font-display text-2xl leading-none">
            Campus<span className="italic-serif">X</span>
          </div>
        </Link>

        <div className="hairline mx-6" />

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-sidebar-foreground/40">— Workspace</div>
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
                      (active ? "bg-sidebar-accent text-cream" : "text-sidebar-foreground/65 hover:text-cream")
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

        <button
          onClick={signOut}
          className="mx-3 mb-3 inline-flex items-center gap-2 rounded-lg border border-border bg-sidebar-accent px-3 py-2.5 text-xs text-sidebar-foreground/70 hover:text-cream"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </aside>

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
                className="h-10 w-72 rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-gold/60"
              />
            </div>
            <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface hover:border-gold/40" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <Link to="/profile" className="flex items-center gap-3 rounded-full border border-border bg-surface py-1 pl-1 pr-4 hover:border-gold/40">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gold font-display text-sm text-primary-foreground">{initial}</div>
              <div className="text-left">
                <div className="text-xs font-medium leading-tight">{displayName || "Builder"}</div>
                <div className="text-[10px] leading-tight text-muted-foreground">{college || "Campus X"}</div>
              </div>
            </Link>
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
