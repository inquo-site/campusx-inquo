import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Sparkles, Plus, Users, ArrowUpRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/rooms/")({
  component: RoomsList,
});

type Room = {
  id: string; slug: string; name: string; kind: "college" | "interest";
  topic: string | null; description: string | null; created_by: string; created_at: string;
};

function RoomsList() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "college" | "interest">("all");

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Room[];
    },
  });

  const { data: myMemberships } = useQuery({
    queryKey: ["my-memberships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("room_members").select("room_id").eq("user_id", user!.id);
      return new Set((data ?? []).map((m) => m.room_id));
    },
  });

  const join = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase.from("room_members").insert({ room_id: roomId, user_id: user!.id });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      toast.success("Joined room");
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Join failed"),
  });

  const visible = (rooms ?? []).filter((r) => filter === "all" || r.kind === filter);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-border bg-surface p-1 text-xs">
          {(["all", "college", "interest"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={"rounded-full px-4 py-1.5 capitalize transition " + (filter === k ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="btn-ink">
          <Plus className="h-4 w-4" /> New room
        </button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((r, i) => {
          const joined = myMemberships?.has(r.id);
          const Icon = r.kind === "college" ? GraduationCap : Sparkles;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-noir card-noir-hover flex flex-col rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
                  <Icon className="h-3 w-3" /> {r.kind}
                </span>
                {r.topic && <span className="text-xs text-muted-foreground">#{r.topic}</span>}
              </div>
              <h3 className="mt-4 font-display text-2xl leading-tight">{r.name}</h3>
              {r.description && <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>}
              <div className="mt-5 flex items-center gap-2">
                {joined ? (
                  <Link to="/rooms/$slug" params={{ slug: r.slug }} className="btn-ink flex-1 justify-center">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <>
                    <button onClick={() => join.mutate(r.id)} disabled={join.isPending} className="btn-ink flex-1 justify-center">
                      {join.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
                      Join
                    </button>
                    <Link to="/rooms/$slug" params={{ slug: r.slug }} className="btn-ghost">Peek</Link>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No rooms yet — be the first to <button onClick={() => setShowModal(true)} className="italic-serif text-gold hover:underline">create one</button>.
          </div>
        )}
      </div>

      <AnimatePresence>{showModal && <CreateRoomModal onClose={() => setShowModal(false)} />}</AnimatePresence>
    </div>
  );
}

function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"college" | "interest">("interest");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

  const create = useMutation({
    mutationFn: async () => {
      if (!slug || slug.length < 2) throw new Error("Name must be at least 2 characters");
      const { data, error } = await supabase.from("rooms").insert({
        slug, name: name.trim(), kind, topic: topic.trim() || null, description: description.trim() || null, created_by: user!.id,
      }).select().single();
      if (error) throw error;
      // auto-join creator
      await supabase.from("room_members").insert({ room_id: data.id, user_id: user!.id });
      return data;
    },
    onSuccess: () => {
      toast.success("Room created");
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.message ?? "Create failed"),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="card-noir w-full max-w-md rounded-3xl p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">New <span className="italic-serif">room</span></h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block">
            <div className="mb-1.5 text-xs text-muted-foreground">Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="IIT Delhi builders" className="input-ink" />
            {slug && <div className="mt-1 text-[10px] text-muted-foreground">slug: <span className="italic-serif text-gold">{slug}</span></div>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["college", "interest"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} className={"rounded-full border px-4 py-2 text-sm capitalize transition " + (kind === k ? "border-gold/60 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-foreground")}>
                {k}
              </button>
            ))}
          </div>
          <label className="block">
            <div className="mb-1.5 text-xs text-muted-foreground">Topic (optional)</div>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={40} placeholder="dsa, ml, gsoc, web3" className="input-ink" />
          </label>
          <label className="block">
            <div className="mb-1.5 text-xs text-muted-foreground">Description</div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className="input-ink" />
          </label>
        </div>
        <button onClick={() => create.mutate()} disabled={create.isPending || !name.trim()} className="btn-ink mt-6 w-full justify-center">
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create room"}
        </button>
      </motion.div>
    </motion.div>
  );
}
