import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, GraduationCap, Trophy, Radar, Building2, Clock } from "lucide-react";

export type LiveOpportunity = {
  kind: "job" | "internship" | "hackathon";
  title: string;
  org: string;
  location: string | null;
  created_at: string;
};

export type RadarData = {
  jobs: number;
  internships: number;
  hackathons: number;
  companies: string[];
  latest: LiveOpportunity[];
};

async function fetchRadarData(): Promise<RadarData> {
  const [jobsCount, internCount, hackCount, jobRows, internRows, hackRows] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("internships").select("id", { count: "exact", head: true }),
    supabase.from("hackathons").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("title,company,location,created_at").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("internships")
      .select("title,company,location,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("hackathons")
      .select("name,organiser,location,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const latest: LiveOpportunity[] = [
    ...(jobRows.data ?? []).map((r) => ({
      kind: "job" as const,
      title: r.title,
      org: r.company,
      location: r.location,
      created_at: r.created_at,
    })),
    ...(internRows.data ?? []).map((r) => ({
      kind: "internship" as const,
      title: r.title,
      org: r.company,
      location: r.location,
      created_at: r.created_at ?? new Date().toISOString(),
    })),
    ...(hackRows.data ?? []).map((r) => ({
      kind: "hackathon" as const,
      title: r.name,
      org: r.organiser ?? "Open",
      location: r.location,
      created_at: r.created_at,
    })),
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const companies = Array.from(
    new Set([...(jobRows.data ?? []).map((r) => r.company), ...(internRows.data ?? []).map((r) => r.company)]),
  ).slice(0, 12);

  return {
    jobs: jobsCount.count ?? 0,
    internships: internCount.count ?? 0,
    hackathons: hackCount.count ?? 0,
    companies,
    latest: latest.slice(0, 10),
  };
}

export function useRadarData() {
  return useQuery({ queryKey: ["radar-live-data"], queryFn: fetchRadarData, staleTime: 60_000 });
}

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - +new Date(iso)) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const kindMeta = {
  job: { label: "Off-campus job", icon: Briefcase },
  internship: { label: "Internship", icon: GraduationCap },
  hackathon: { label: "Hackathon", icon: Trophy },
} as const;

/* ---------------- Radar sweep with real listings orbiting ---------------- */
export function RadarScope({ data }: { data?: RadarData }) {
  const points = (data?.latest ?? []).slice(0, 8);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-full border border-gold/15" />
      <div className="absolute inset-[12%] rounded-full border border-gold/10" />
      <div className="absolute inset-[28%] rounded-full border border-gold/10" />
      <div className="absolute inset-[44%] rounded-full border border-gold/10" />

      {/* sweep */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, oklch(0.8 0.16 85 / 0.28) 0deg, transparent 55deg, transparent 360deg)",
          maskImage: "radial-gradient(circle, black 65%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 65%, transparent 70%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-background/80 backdrop-blur">
        <Radar className="h-5 w-5 text-gold" />
      </div>

      {points.map((p, i) => {
        const angle = (i / Math.max(points.length, 1)) * Math.PI * 2;
        const radius = 30 + (i % 3) * 8;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <motion.div
            key={`${p.title}-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
          >
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.35 }}
              className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_2px_oklch(0.8_0.16_85_/_0.5)]"
            />
            <div className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-background/85 px-2 py-0.5 text-[10px] text-foreground/70 backdrop-blur md:block">
              {p.org}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Real counters ---------------- */
export function LiveCounters({ data, loading }: { data?: RadarData; loading: boolean }) {
  const items = [
    { label: "Off-campus jobs tracked", value: data?.jobs, icon: Briefcase },
    { label: "Internships tracked", value: data?.internships, icon: GraduationCap },
    { label: "Hackathons tracked", value: data?.hackathons, icon: Trophy },
    { label: "Companies in the index", value: data?.companies.length, icon: Building2 },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-noir rounded-2xl border border-border p-5"
          >
            <Icon className="h-4 w-4 text-gold" />
            <div className="mt-4 font-display text-4xl leading-none">
              {loading ? <span className="text-muted-foreground">—</span> : (it.value ?? 0)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{it.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Live feed of real rows ---------------- */
export function LiveFeed({ data, loading }: { data?: RadarData; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-surface/50" />
        ))}
      </div>
    );
  }
  if (!data || data.latest.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
        The radar is warming up. New listings appear here as they land.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {data.latest.map((o, i) => {
        const meta = kindMeta[o.kind];
        const Icon = meta.icon;
        return (
          <motion.div
            key={`${o.title}-${i}`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            className="card-noir flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/5 text-gold">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm text-foreground/90">{o.title}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {o.org}
                  {o.location ? ` · ${o.location}` : ""} · {meta.label}
                </div>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {ago(o.created_at)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Real company marquee ---------------- */
export function CompanyMarquee({ data }: { data?: RadarData }) {
  const list = data?.companies ?? [];
  if (list.length === 0) return null;
  const loop = [...list, ...list];
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((c, i) => (
          <span
            key={`${c}-${i}`}
            className="whitespace-nowrap rounded-full border border-border bg-surface/60 px-4 py-2 text-xs text-foreground/75"
          >
            {c}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
