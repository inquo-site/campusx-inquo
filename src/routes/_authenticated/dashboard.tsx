import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { TrendingUp, Eye, Send, ArrowUpRight, Sparkles, Rocket, Briefcase, FolderGit2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dash-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [proj, apps, joins] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", user!.id),
        supabase.from("internship_applications").select("id", { count: "exact", head: true }).eq("applicant_id", user!.id),
        supabase.from("join_requests").select("id", { count: "exact", head: true }).eq("requester_id", user!.id),
      ]);
      return { projects: proj.count ?? 0, apps: apps.count ?? 0, joins: joins.count ?? 0 };
    },
  });

  const { data: feed } = useQuery({
    queryKey: ["dash-feed"],
    queryFn: async () => {
      const [p, s, i] = await Promise.all([
        supabase.from("projects").select("id,title,description,tech_stack,created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("startup_ideas").select("id,title,pitch,roles_needed,created_at").order("created_at", { ascending: false }).limit(2),
        supabase.from("internships").select("id,title,company,stipend,created_at").order("created_at", { ascending: false }).limit(2),
      ]);
      const items = [
        ...(p.data ?? []).map((x) => ({ kind: "project" as const, icon: FolderGit2, tag: "New project", title: x.title, body: x.description, meta: x.tech_stack?.join(" · "), t: x.created_at })),
        ...(s.data ?? []).map((x) => ({ kind: "startup" as const, icon: Rocket, tag: "Team forming", title: x.title, body: x.pitch, meta: x.roles_needed?.join(" · "), t: x.created_at })),
        ...(i.data ?? []).map((x) => ({ kind: "internship" as const, icon: Briefcase, tag: "Internship", title: `${x.title} @ ${x.company}`, body: x.stipend ?? "", meta: "", t: x.created_at })),
      ].sort((a, b) => (a.t > b.t ? -1 : 1));
      return items;
    },
  });

  const firstName = (profile?.full_name ?? user?.email?.split("@")[0] ?? "Builder").split(" ")[0];
  const cards = [
    { label: "Your projects", value: stats?.projects ?? 0, delta: "Live in Project Hub", icon: FolderGit2 },
    { label: "Applications sent", value: stats?.apps ?? 0, delta: "Across internships", icon: Send },
    { label: "Join requests", value: stats?.joins ?? 0, delta: "To peers and startups", icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      <section>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-gold/60" /> Campus X · {new Date().toLocaleDateString()}
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-6xl"
        >
          Hello, {firstName}. <br />
          <span className="italic-serif">build something real.</span>
        </motion.h2>
        <p className="mt-5 max-w-xl text-sm text-muted-foreground">
          Post a project, talk to your AI mentor, polish your resume — your full builder workspace, in one place.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/projects" className="group inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-primary-foreground hover:brightness-110">
            <Sparkles className="h-3.5 w-3.5" /> Post a project <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link to="/mentor" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-gold/40">
            Ask AI Mentor
          </Link>
          <Link to="/resume" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-gold/40">
            <FileText className="h-3.5 w-3.5" /> Build resume
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Snapshot</div>
          <span className="font-mono text-xs text-muted-foreground">003</span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {cards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card-noir-hover bg-surface p-7">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
                  <Icon className="h-3.5 w-3.5 text-gold/70" />
                </div>
                <div className="mt-6 font-display text-5xl leading-none">{String(s.value).padStart(2, "0")}</div>
                <div className="mt-3 text-xs text-muted-foreground">{s.delta}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-display text-3xl">Activity <span className="italic-serif">stream</span></h3>
        </div>
        <div className="space-y-3">
          {(feed ?? []).map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.05 }} className="card-noir card-noir-hover group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-5 rounded-2xl p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold/20 bg-gold/5 text-gold"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-gold">{item.tag}</span>
                    <span>{new Date(item.t).toLocaleDateString()}</span>
                  </div>
                  <h4 className="mt-2 font-display text-xl leading-snug">{item.title}</h4>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                  {item.meta && <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">{item.meta}</p>}
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground group-hover:text-gold" />
              </motion.article>
            );
          })}
          {feed && feed.length === 0 && (
            <div className="card-noir rounded-2xl p-10 text-center text-sm text-muted-foreground">
              Quiet so far. <Link to="/projects" className="text-gold hover:underline">Post the first project.</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
