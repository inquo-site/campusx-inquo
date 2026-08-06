import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, MapPin, CalendarDays, Users, ExternalLink, Search, BookmarkPlus, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hackathons")({
  component: HackathonsPage,
});

type Hack = {
  id: string;
  name: string;
  organiser: string | null;
  mode: string;
  location: string | null;
  theme: string | null;
  prize_pool: string | null;
  team_size: string | null;
  starts_at: string | null;
  ends_at: string | null;
  register_url: string | null;
  tags: string[];
  is_featured: boolean;
};

const MODES = ["all", "online", "offline", "hybrid"] as const;

function fmt(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function HackathonsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<string>("all");
  const [showPost, setShowPost] = useState(false);

  const { data: hacks, isLoading } = useQuery({
    queryKey: ["hackathons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Hack[];
    },
  });

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (hacks ?? []).filter((h) => {
      if (mode !== "all" && h.mode !== mode) return false;
      if (!needle) return true;
      return [h.name, h.organiser ?? "", h.theme ?? "", h.tags.join(" ")].join(" ").toLowerCase().includes(needle);
    });
  }, [hacks, q, mode]);

  const track = useMutation({
    mutationFn: async (h: Hack) => {
      const { error } = await supabase.from("applications").insert({
        user_id: user!.id,
        company: h.organiser ?? h.name,
        role: h.name,
        source: "hackathon",
        link: h.register_url,
        status: "saved",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added to your tracker");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
            <Trophy className="h-3 w-3" /> Hackathons
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Live and upcoming hackathons with dates, prizes and team size — track the ones you want to enter.
          </p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> Add one
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hackathon, theme or organiser…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-gold/60"
          />
        </div>
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "rounded-full border px-3.5 py-2 text-xs capitalize transition " +
              (mode === m
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-border bg-surface text-muted-foreground hover:text-foreground")
            }
          >
            {m}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-10 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((h, i) => (
          <motion.article
            key={h.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.35 }}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl leading-tight">{h.name}</h3>
              {h.is_featured && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">
                  Featured
                </span>
              )}
            </div>
            {h.organiser && <div className="mt-1 text-xs text-muted-foreground">{h.organiser}</div>}
            {h.theme && <p className="mt-3 text-sm text-muted-foreground">{h.theme}</p>}

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gold" />
                {fmt(h.starts_at) ?? "Dates TBA"}
                {h.ends_at && ` → ${fmt(h.ends_at)}`}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="capitalize">{h.mode}</span>
                {h.location && ` · ${h.location}`}
              </div>
              {h.team_size && (
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 text-gold" /> {h.team_size}
                </div>
              )}
              {h.prize_pool && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 shrink-0 text-gold" /> {h.prize_pool}
                </div>
              )}
            </div>

            {h.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {h.tags.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-foreground/70">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {h.register_url && (
                <a
                  href={h.register_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
                >
                  Register <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={() => track.mutate(h)}
                disabled={track.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground/80 hover:border-gold/40 hover:text-foreground"
              >
                <BookmarkPlus className="h-3.5 w-3.5" /> Track
              </button>
            </div>
          </motion.article>
        ))}

        {!isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground md:col-span-2">
            Nothing matches that filter yet.
          </div>
        )}
      </div>

      {showPost && <AddHackDialog onClose={() => setShowPost(false)} userId={user?.id} />}
    </div>
  );
}

function AddHackDialog({ onClose, userId }: { onClose: () => void; userId?: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    organiser: "",
    mode: "online",
    location: "",
    theme: "",
    prize_pool: "",
    team_size: "",
    starts_at: "",
    ends_at: "",
    register_url: "",
    tags: "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("hackathons").insert({
        name: form.name,
        organiser: form.organiser || null,
        mode: form.mode,
        location: form.location || null,
        theme: form.theme || null,
        prize_pool: form.prize_pool || null,
        team_size: form.team_size || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        register_url: form.register_url || null,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        posted_by: userId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Hackathon added");
      qc.invalidateQueries({ queryKey: ["hackathons"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-gold/60";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">Add a hackathon</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <input className={field} placeholder="Hackathon name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={field} placeholder="Organiser" value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className={field} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input className={field} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] text-muted-foreground">
              Starts
              <input type="date" className={field} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Ends
              <input type="date" className={field} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            </label>
          </div>
          <input className={field} placeholder="Theme" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="Prize pool" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} />
            <input className={field} placeholder="Team size" value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })} />
          </div>
          <input className={field} placeholder="Registration URL" value={form.register_url} onChange={(e) => setForm({ ...form, register_url: e.target.value })} />
          <input className={field} placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={!form.name || save.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add hackathon
        </button>
      </motion.div>
    </div>
  );
}
