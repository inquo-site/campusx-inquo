import { createServerFn } from "@tanstack/react-start";

const ADMIN_SECRET = "SUMAN@12suman";

function verify(token: string) {
  if (token !== ADMIN_SECRET) {
    throw new Error("Forbidden");
  }
}

export const adminGetStats = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, rooms, msgs, jobs, devs, promos] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("rooms").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("room_messages").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("dev_profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("promo_codes").select("*", { count: "exact", head: true }),
    ]);
    return {
      users: users.count ?? 0,
      rooms: rooms.count ?? 0,
      messages: msgs.count ?? 0,
      jobs: jobs.count ?? 0,
      devProfiles: devs.count ?? 0,
      promoCodes: promos.count ?? 0,
    };
  });

export const adminListRooms = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("rooms")
      .select("id, slug, name, kind, topic, description, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminDeleteRoom = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; roomId: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("room_messages").delete().eq("room_id", data.roomId);
    await supabaseAdmin.from("room_members").delete().eq("room_id", data.roomId);
    const { error } = await supabaseAdmin.from("rooms").delete().eq("id", data.roomId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListJobs = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("internships")
      .select("id, title, company, location, stipend, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminToggleJobFeatured = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string; featured: boolean }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("internships")
      .update({ is_featured: data.featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteJob = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("internships").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListDevProfiles = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("dev_profiles")
      .select("user_id, handle, display_name, headline, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminToggleProfileFeatured = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; userId: string; featured: boolean }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("dev_profiles")
      .update({ is_featured: data.featured })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, college, location, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const { data: auth } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const emailMap = new Map(auth?.users?.map((u) => [u.id, u.email]) ?? []);
    return (profiles ?? []).map((p) => ({ ...p, email: emailMap.get(p.id) ?? null }));
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; userId: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAnalytics = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const [newUsers, newMsgs, newRooms, newJobs] = await Promise.all([
      supabaseAdmin.from("profiles").select("created_at").gte("created_at", since),
      supabaseAdmin.from("room_messages").select("created_at").gte("created_at", since),
      supabaseAdmin.from("rooms").select("created_at").gte("created_at", since),
      supabaseAdmin.from("internships").select("created_at").gte("created_at", since),
    ]);

    const bucket = (rows: { created_at: string }[] | null) => {
      const map = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        map.set(d, 0);
      }
      (rows ?? []).forEach((r) => {
        const d = r.created_at.slice(0, 10);
        if (map.has(d)) map.set(d, (map.get(d) ?? 0) + 1);
      });
      return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    };

    return {
      users: bucket(newUsers.data),
      messages: bucket(newMsgs.data),
      rooms: bucket(newRooms.data),
      jobs: bucket(newJobs.data),
    };
  });

export const adminListPromoCodes = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminCreatePromoCode = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      token: string;
      code: string;
      description?: string | null;
      discount_percent: number;
      max_uses?: number | null;
      expires_at?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("promo_codes").insert({
      code: data.code.trim().toUpperCase(),
      description: data.description ?? null,
      discount_percent: data.discount_percent,
      max_uses: data.max_uses ?? null,
      expires_at: data.expires_at ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminTogglePromoCode = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string; active: boolean }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("promo_codes")
      .update({ is_active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePromoCode = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verify(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
