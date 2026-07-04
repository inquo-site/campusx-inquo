import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Users, GraduationCap, Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/rooms/$slug")({
  component: RoomDetail,
});

type Room = {
  id: string; slug: string; name: string; kind: "college" | "interest";
  topic: string | null; description: string | null; created_by: string;
};
type Msg = { id: string; room_id: string; user_id: string; body: string; created_at: string };

function RoomDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as Room | null;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["room-members", room?.id],
    enabled: !!room,
    queryFn: async () => {
      const { data } = await supabase.from("room_members").select("user_id").eq("room_id", room!.id);
      return data ?? [];
    },
  });

  const isMember = !!members?.some((m) => m.user_id === user?.id);
  const isCreator = room?.created_by === user?.id;

  const { data: profiles } = useQuery({
    queryKey: ["room-profiles", room?.id, members?.length],
    enabled: !!members && members.length > 0,
    queryFn: async () => {
      const ids = members!.map((m) => m.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
      const map: Record<string, { name: string; avatar: string | null }> = {};
      (data ?? []).forEach((p: any) => { map[p.id] = { name: p.full_name ?? "Builder", avatar: p.avatar_url }; });
      return map;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["room-messages", room?.id],
    enabled: !!room && isMember,
    queryFn: async () => {
      const { data, error } = await supabase.from("room_messages").select("*").eq("room_id", room!.id).order("created_at", { ascending: true }).limit(200);
      if (error) throw error;
      return data as Msg[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!room || !isMember) return;
    const channel = supabase
      .channel(`room-${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${room.id}` },
        (payload) => {
          qc.setQueryData(["room-messages", room.id], (old: Msg[] | undefined) => {
            const next = payload.new as Msg;
            if (old?.some((m) => m.id === next.id)) return old;
            return [...(old ?? []), next];
          });
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "room_messages", filter: `room_id=eq.${room.id}` },
        (payload) => {
          qc.setQueryData(["room-messages", room.id], (old: Msg[] | undefined) =>
            (old ?? []).filter((m) => m.id !== (payload.old as any).id));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room, isMember, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  const join = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("room_members").insert({ room_id: room!.id, user_id: user!.id });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      toast.success("Joined");
      qc.invalidateQueries({ queryKey: ["room-members"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const send = useMutation({
    mutationFn: async () => {
      const text = body.trim();
      if (!text) return;
      const { error } = await supabase.from("room_messages").insert({ room_id: room!.id, user_id: user!.id, body: text });
      if (error) throw error;
    },
    onSuccess: () => setBody(""),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("room_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!room) return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-display text-3xl">Room not found</h1>
      <Link to="/rooms" className="btn-ghost mt-6 inline-flex">Back to rooms</Link>
    </div>
  );

  const Icon = room.kind === "college" ? GraduationCap : Sparkles;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="card-noir flex h-[70vh] flex-col rounded-3xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="min-w-0">
            <Link to="/rooms" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold">
              <ArrowLeft className="h-3 w-3" /> All rooms
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                <Icon className="h-3 w-3" /> {room.kind}
              </span>
              {room.topic && <span className="text-[10px] text-muted-foreground">#{room.topic}</span>}
            </div>
            <h1 className="mt-1 truncate font-display text-2xl">{room.name}</h1>
          </div>
        </div>

        {/* messages */}
        {!isMember ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground max-w-sm">
              Join the room to read and post messages. Members-only for signal density.
            </p>
            <button onClick={() => join.mutate()} disabled={join.isPending} className="btn-ink">
              {join.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Join room
            </button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              <AnimatePresence initial={false}>
                {(messages ?? []).map((m) => {
                  const p = profiles?.[m.user_id];
                  const mine = m.user_id === user?.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={"group flex items-start gap-3 " + (mine ? "flex-row-reverse" : "")}>
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold font-display text-xs text-primary-foreground">
                        {(p?.name ?? "B").charAt(0).toUpperCase()}
                      </div>
                      <div className={"max-w-[75%] " + (mine ? "text-right" : "")}>
                        <div className="text-[10px] text-muted-foreground">
                          {p?.name ?? "Builder"} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className={"mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm " + (mine ? "bg-gold text-primary-foreground" : "border border-border bg-background")}>
                          {m.body}
                        </div>
                        {(mine || isCreator) && (
                          <button onClick={() => del.mutate(m.id)} className="ml-2 mt-1 opacity-0 transition group-hover:opacity-60 hover:opacity-100">
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {(messages ?? []).length === 0 && (
                <div className="py-16 text-center text-xs text-muted-foreground italic-serif">
                  Room's quiet. Say something.
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send.mutate(); }} className="flex gap-2 border-t border-border p-4">
              <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} placeholder="Type a message…" className="input-ink flex-1" />
              <button type="submit" disabled={!body.trim() || send.isPending} className="btn-ink">
                {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* members sidebar */}
      <aside className="card-noir h-fit rounded-3xl p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— About</div>
        <p className="mt-2 text-sm text-muted-foreground">{room.description ?? "A place for builders to talk shop."}</p>
        <div className="hairline my-4" />
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Members / {(members ?? []).length}</div>
        <ul className="mt-3 space-y-2">
          {(members ?? []).slice(0, 20).map((m) => {
            const p = profiles?.[m.user_id];
            return (
              <li key={m.user_id} className="flex items-center gap-2 text-xs">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gold/20 text-gold font-display">{(p?.name ?? "B").charAt(0).toUpperCase()}</div>
                <span className="truncate">{p?.name ?? "Builder"}</span>
                {m.user_id === room.created_by && <span className="ml-auto text-[9px] italic-serif text-gold">creator</span>}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
