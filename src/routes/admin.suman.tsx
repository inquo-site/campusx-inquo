import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetStats,
  adminListRooms,
  adminDeleteRoom,
  adminListJobs,
  adminToggleJobFeatured,
  adminDeleteJob,
  adminListDevProfiles,
  adminToggleProfileFeatured,
  adminListUsers,
  adminDeleteUser,
  adminAnalytics,
  adminListPromoCodes,
  adminCreatePromoCode,
  adminTogglePromoCode,
  adminDeletePromoCode,
} from "@/lib/admin.functions";
import {
  adminListBlogs,
  adminGetBlog,
  adminUpsertBlog,
  adminDeleteBlog,
  adminToggleBlogFeatured,
  adminSetBlogStatus,
  adminAiWriteBlog,
  adminAiOptimizeBlog,
  adminAiSummarizeBlog,
  validateBlogSeo,
  type SeoIssue,
} from "@/lib/blog.functions";
import {
  adminListAgentEvents,
  adminListAgentRuns,
  adminTriggerDailyAnalytics,
} from "@/lib/agents.functions";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";




export const Route = createFileRoute("/admin/suman")({
  component: AdminSuman,
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const ALLOWED_EMAILS = ["cartooninverse5@gmail.com", "inquo4@gmail.com"];
const ADMIN_PASSWORD = "SUMAN@12suman";
const STORAGE_KEY = "admin-suman-auth";
const TOKEN_KEY = "admin-suman-token";

type Tab = "overview" | "agent" | "autopilot" | "rooms" | "jobs" | "profiles" | "users" | "analytics" | "promo" | "blog";

function AdminSuman() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY)) {
      setAuthed(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailLc = email.trim().toLowerCase();
    if (
      ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(emailLc) &&
      password === ADMIN_PASSWORD
    ) {
      sessionStorage.setItem(STORAGE_KEY, emailLc);
      sessionStorage.setItem(TOKEN_KEY, password);
      setAuthed(true);
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setEmail("");
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 shadow-xl"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Restricted Access</h1>
            <p className="text-sm text-muted-foreground">Authorized personnel only.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const currentEmail =
    typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : "";

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "agent", label: "AI Agent" },
    { id: "autopilot", label: "Autopilot" },
    { id: "blog", label: "Blog" },
    { id: "rooms", label: "Moderate Rooms" },
    { id: "jobs", label: "Curate Jobs" },
    { id: "profiles", label: "Feature Profiles" },
    { id: "users", label: "Users" },
    { id: "analytics", label: "Analytics" },
    { id: "promo", label: "Promo Codes" },
  ];


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Signed in as {currentEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            Sign out
          </button>
        </div>
        <nav className="mx-auto max-w-7xl px-6 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm border-b-2 transition whitespace-nowrap ${
                tab === t.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && <OverviewPanel />}
        {tab === "agent" && <AgentPanel />}
        {tab === "autopilot" && <AutopilotPanel />}
        {tab === "blog" && <BlogPanel />}
        {tab === "rooms" && <RoomsPanel />}
        {tab === "jobs" && <JobsPanel />}
        {tab === "profiles" && <ProfilesPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "analytics" && <AnalyticsPanel />}
        {tab === "promo" && <PromoPanel />}

      </main>
    </div>
  );
}

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) ?? "" : "";
}

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OverviewPanel() {
  const fn = useServerFn(adminGetStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fn({ data: { token: getToken() } }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data) return <p className="text-sm text-destructive">Failed to load stats</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card label="Users" value={data.users} hint="Registered profiles" />
      <Card label="Rooms" value={data.rooms} hint="Peer discussion rooms" />
      <Card label="Messages" value={data.messages} hint="Total room messages" />
      <Card label="Jobs / Internships" value={data.jobs} />
      <Card label="Dev Profiles" value={data.devProfiles} hint="Public report cards" />
      <Card label="Promo Codes" value={data.promoCodes} />
    </div>
  );
}

function RoomsPanel() {
  const list = useServerFn(adminListRooms);
  const del = useServerFn(adminDeleteRoom);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: () => list({ data: { token: getToken() } }),
  });
  const delMut = useMutation({
    mutationFn: (roomId: string) => del({ data: { token: getToken(), roomId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rooms"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Kind</th>
            <th className="text-left px-4 py-3">Topic</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.kind}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.topic}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => {
                    if (confirm(`Delete room "${r.name}"? This also deletes all messages.`)) {
                      delMut.mutate(r.id);
                    }
                  }}
                  className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobsPanel() {
  const list = useServerFn(adminListJobs);
  const toggle = useServerFn(adminToggleJobFeatured);
  const del = useServerFn(adminDeleteJob);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => list({ data: { token: getToken() } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-jobs"] });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; featured: boolean }) =>
      toggle({ data: { token: getToken(), ...v } }),
    onSuccess: invalidate,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { token: getToken(), id } }),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-left px-4 py-3">Location</th>
            <th className="text-center px-4 py-3">Featured</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((j) => (
            <tr key={j.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{j.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{j.company}</td>
              <td className="px-4 py-3 text-muted-foreground">{j.location}</td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={!!j.is_featured}
                  onChange={(e) =>
                    toggleMut.mutate({ id: j.id, featured: e.target.checked })
                  }
                />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => {
                    if (confirm(`Delete "${j.title}"?`)) delMut.mutate(j.id);
                  }}
                  className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfilesPanel() {
  const list = useServerFn(adminListDevProfiles);
  const toggle = useServerFn(adminToggleProfileFeatured);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-devprofiles"],
    queryFn: () => list({ data: { token: getToken() } }),
  });
  const toggleMut = useMutation({
    mutationFn: (v: { userId: string; featured: boolean }) =>
      toggle({ data: { token: getToken(), ...v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-devprofiles"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Handle</th>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Headline</th>
            <th className="text-center px-4 py-3">Featured</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((p) => (
            <tr key={p.user_id} className="border-t border-border">
              <td className="px-4 py-3 font-mono text-xs">@{p.handle}</td>
              <td className="px-4 py-3">{p.display_name}</td>
              <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{p.headline}</td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={!!p.is_featured}
                  onChange={(e) =>
                    toggleMut.mutate({ userId: p.user_id, featured: e.target.checked })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersPanel() {
  const list = useServerFn(adminListUsers);
  const del = useServerFn(adminDeleteUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => list({ data: { token: getToken() } }),
  });
  const delMut = useMutation({
    mutationFn: (userId: string) => del({ data: { token: getToken(), userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">College</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-4 py-3">{u.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.college}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => {
                    if (confirm(`Delete user ${u.email}? This is permanent.`)) {
                      delMut.mutate(u.id);
                    }
                  }}
                  className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsPanel() {
  const fn = useServerFn(adminAnalytics);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fn({ data: { token: getToken() } }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data) return null;

  const series: { title: string; rows: { date: string; count: number }[] }[] = [
    { title: "New users", rows: data.users },
    { title: "Messages", rows: data.messages },
    { title: "New rooms", rows: data.rooms },
    { title: "New jobs", rows: data.jobs },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {series.map((s) => {
        const max = Math.max(1, ...s.rows.map((r) => r.count));
        const total = s.rows.reduce((a, b) => a + b.count, 0);
        return (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">14d · {total}</p>
            </div>
            <div className="mt-4 flex items-end gap-1 h-24">
              {s.rows.map((r) => (
                <div
                  key={r.date}
                  title={`${r.date}: ${r.count}`}
                  className="flex-1 bg-primary/70 rounded-t"
                  style={{ height: `${(r.count / max) * 100}%`, minHeight: r.count ? 2 : 0 }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PromoPanel() {
  const list = useServerFn(adminListPromoCodes);
  const create = useServerFn(adminCreatePromoCode);
  const toggle = useServerFn(adminTogglePromoCode);
  const del = useServerFn(adminDeletePromoCode);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: () => list({ data: { token: getToken() } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-promos"] });

  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [discount, setDiscount] = useState(10);
  const [maxUses, setMaxUses] = useState<string>("");
  const [expires, setExpires] = useState("");
  const [err, setErr] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          token: getToken(),
          code,
          description: desc || null,
          discount_percent: discount,
          max_uses: maxUses ? Number(maxUses) : null,
          expires_at: expires ? new Date(expires).toISOString() : null,
        },
      }),
    onSuccess: () => {
      setCode(""); setDesc(""); setDiscount(10); setMaxUses(""); setExpires(""); setErr("");
      invalidate();
    },
    onError: (e: Error) => setErr(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; active: boolean }) =>
      toggle({ data: { token: getToken(), ...v } }),
    onSuccess: invalidate,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { token: getToken(), id } }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!code.trim()) return;
          createMut.mutate();
        }}
        className="rounded-2xl border border-border bg-card p-5 grid gap-3 sm:grid-cols-5"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CODE"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase"
          required
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          placeholder="% off"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Max uses"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={expires}
          onChange={(e) => setExpires(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
        />
        <button
          type="submit"
          disabled={createMut.isPending}
          className="rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition sm:col-span-3"
        >
          {createMut.isPending ? "Creating…" : "Create promo code"}
        </button>
        {err && <p className="text-xs text-destructive sm:col-span-5">{err}</p>}
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Uses</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-center px-4 py-3">Active</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">{p.code}</td>
                  <td className="px-4 py-3">{p.discount_percent}%</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.uses}{p.max_uses ? ` / ${p.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!p.is_active}
                      onChange={(e) =>
                        toggleMut.mutate({ id: p.id, active: e.target.checked })
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete promo "${p.code}"?`)) delMut.mutate(p.id);
                      }}
                      className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============= Blog panel =============
type BlogFormState = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_format: "markdown" | "html";
  cover_image: string;
  tags: string;
  status: "draft" | "published";
  is_featured: boolean;
  author_name: string;
  read_minutes: number;
};

const emptyBlog: BlogFormState = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  content_format: "markdown",
  cover_image: "",
  tags: "",
  status: "draft",
  is_featured: false,
  author_name: "",
  read_minutes: 3,
};


function BlogPanel() {
  const list = useServerFn(adminListBlogs);
  const getOne = useServerFn(adminGetBlog);
  const upsert = useServerFn(adminUpsertBlog);
  const del = useServerFn(adminDeleteBlog);
  const toggleFeat = useServerFn(adminToggleBlogFeatured);
  const setStatus = useServerFn(adminSetBlogStatus);
  const aiWrite = useServerFn(adminAiWriteBlog);
  const aiOptimize = useServerFn(adminAiOptimizeBlog);
  const aiSummarize = useServerFn(adminAiSummarizeBlog);
  const validateSeo = useServerFn(validateBlogSeo);
  const qc = useQueryClient();

  const [form, setForm] = useState<BlogFormState>(emptyBlog);
  const [editing, setEditing] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [optResult, setOptResult] = useState<null | Awaited<ReturnType<typeof aiOptimize>>>(null);
  const [notice, setNotice] = useState<string>("");
  const [publishError, setPublishError] = useState<null | {
    kind: "forbidden" | "domain" | "generic";
    title: string;
    detail: string;
    host?: string;
  }>(null);
  const [seoIssues, setSeoIssues] = useState<SeoIssue[] | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-blogs"] });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: () => list({ data: { token: getToken() } }),
  });

  const openNew = () => {
    setForm(emptyBlog);
    setOptResult(null);
    setEditing(true);
  };

  const openEdit = async (id: string) => {
    const row = await getOne({ data: { token: getToken(), id } });
    if (!row) return;
    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      content_format: ((row as { content_format?: string }).content_format === "html" ? "html" : "markdown"),
      cover_image: row.cover_image ?? "",
      tags: (row.tags ?? []).join(", "),
      status: (row.status as "draft" | "published") ?? "draft",
      is_featured: !!row.is_featured,
      author_name: row.author_name ?? "",
      read_minutes: row.read_minutes ?? 3,
    });
    setOptResult(null);
    setEditing(true);
  };

  const buildTags = () =>
    form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  const runSeoCheck = async () => {
    try {
      const res = await validateSeo({
        data: {
          token: getToken(),
          title: form.title,
          slug: form.slug || form.title,
          excerpt: form.excerpt,
          cover_image: form.cover_image,
          content: form.content,
          content_format: form.content_format,
          tags: buildTags(),
        },
      });
      setSeoIssues(res.issues);
      return res.issues;
    } catch (e) {
      console.error("[seo check]", e);
      return [] as SeoIssue[];
    }
  };

  const classifyPublishError = (
    e: unknown,
  ): { kind: "forbidden" | "domain" | "generic"; title: string; detail: string; host?: string } => {
    const raw = (e as Error)?.message || String(e ?? "Save failed.");
    const msg = raw.toLowerCase();
    // Try to pick out a hostname the platform is complaining about.
    const hostMatch =
      raw.match(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/i) ||
      raw.match(/\b([a-z0-9-]+\.lovable\.app)\b/i) ||
      raw.match(/\b([a-z0-9-]+\.(?:app|com|dev|io|net|co|xyz))\b/i);
    const host = hostMatch?.[1];
    if (msg.includes("forbidden") && (msg.includes("host") || msg.includes("domain") || msg.includes("origin") || host)) {
      return {
        kind: "domain",
        title: "That domain isn't allowed yet",
        detail:
          "Your site (or the image / link you referenced) is on a domain that isn't in the allowed list. Add it to Allowed Hosts / Site URL and try again.",
        host,
      };
    }
    if (msg.includes("forbidden") || msg.includes("403") || msg.includes("unauthorized") || msg.includes("401")) {
      return {
        kind: "forbidden",
        title: "You're not signed in as admin",
        detail:
          "Your admin session expired or the password is wrong. Log out and sign back in with the admin email + password, then try publishing again.",
        host,
      };
    }
    return { kind: "generic", title: "Publish failed", detail: raw, host };
  };

  const save = async (publish?: boolean, force?: boolean) => {
    setNotice("");
    setPublishError(null);
    // On publish, run SEO validation first; block if errors and not forced.
    if (publish && !force) {
      const issues = await runSeoCheck();
      const hardErrors = issues.filter((i) => i.level === "error");
      if (hardErrors.length > 0) {
        setNotice(
          `Blocked by ${hardErrors.length} SEO issue${hardErrors.length > 1 ? "s" : ""}. Fix them below, or click "Publish anyway".`,
        );
        return;
      }
    }
    try {
      const payload = {
        token: getToken(),
        id: form.id,
        title: form.title,
        slug: form.slug || null,
        excerpt: form.excerpt || null,
        content: form.content,
        content_format: form.content_format,
        cover_image: form.cover_image || null,
        tags: buildTags(),
        status: (publish ? "published" : form.status) as "draft" | "published",
        is_featured: form.is_featured,
        author_name: form.author_name || null,
        read_minutes: Number(form.read_minutes) || 3,
        force: !!force,
      };
      const res = await upsert({ data: payload });
      setNotice(publish ? "Published ✓" : "Saved ✓");
      setSeoIssues(null);
      setForm((f) => ({ ...f, id: res.id, slug: res.slug, status: payload.status }));
      invalidate();
    } catch (e) {
      console.error("[blog save] failed", e);
      setPublishError(classifyPublishError(e));
    }
  };

  const runSummarize = async () => {
    if (!form.title || !form.content) return;
    setAiBusy(true);
    setNotice("");
    try {
      const out = await aiSummarize({
        data: { token: getToken(), title: form.title, content: form.content },
      });
      setForm((f) => ({ ...f, excerpt: out.summary }));
      setNotice("Summary written into excerpt ✓");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };


  const runAiWrite = async () => {
    if (!aiTopic.trim()) return;
    setAiBusy(true);
    setNotice("");
    try {
      const out = await aiWrite({
        data: { token: getToken(), topic: aiTopic, tone: aiTone || undefined },
      });
      setForm((f) => ({
        ...f,
        title: out.title,
        slug: out.slug,
        excerpt: out.excerpt,
        tags: out.tags.join(", "),
        content: out.content_markdown,
        read_minutes: out.read_minutes,
      }));
      setNotice("AI draft loaded — review and save.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  const runAiOptimize = async () => {
    if (!form.title || !form.content) return;
    setAiBusy(true);
    setNotice("");
    try {
      const out = await aiOptimize({
        data: { token: getToken(), title: form.title, content: form.content },
      });
      setOptResult(out);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {form.id ? "Edit post" : "New post"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Drafts stay private. Published posts appear on /blog and the landing page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => save(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Save draft
            </button>
            <button
              onClick={runSeoCheck}
              className="rounded-lg border border-gold/40 px-3 py-1.5 text-sm text-gold hover:bg-gold/10"
            >
              Check SEO
            </button>
            <button
              onClick={runSummarize}
              disabled={aiBusy || !form.title || !form.content}
              className="rounded-lg border border-gold/40 px-3 py-1.5 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              {aiBusy ? "…" : "AI Summary"}
            </button>
            <button
              onClick={() => save(true)}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Publish
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Back to list
            </button>
          </div>
        </div>
        {notice && (
          <div className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm">
            {notice}
          </div>
        )}
        {publishError && (
          <div
            role="alertdialog"
            aria-labelledby="publish-error-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-lg rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  ⚠
                </div>
                <div className="flex-1">
                  <h3 id="publish-error-title" className="text-base font-semibold">
                    {publishError.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{publishError.detail}</p>
                  {publishError.host && (
                    <p className="mt-2 text-xs">
                      <span className="text-muted-foreground">Blocked host:</span>{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{publishError.host}</code>
                    </p>
                  )}
                </div>
              </div>

              {publishError.kind === "domain" && (
                <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-sm">
                  <p className="font-medium">How to fix</p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                    <li>
                      Open <span className="font-mono text-foreground">Project settings → Domains</span> and confirm your
                      published <span className="font-mono">.lovable.app</span> URL (or custom domain) is listed and{" "}
                      <b>Active</b>.
                    </li>
                    <li>
                      In <span className="font-mono text-foreground">Backend → Auth → URL Configuration</span>, add the
                      same origin under <b>Site URL</b> and under <b>Additional Redirect URLs / Allowed Hosts</b>.
                    </li>
                    <li>
                      If the block is on the <b>cover image URL</b>, use an https URL from an allowed host (your own
                      domain or a CDN like <span className="font-mono">i.imgur.com</span>,{" "}
                      <span className="font-mono">images.unsplash.com</span>).
                    </li>
                    <li>Save the setting, wait ~30 seconds, then click Publish again.</li>
                  </ol>
                </div>
              )}

              {publishError.kind === "forbidden" && (
                <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-sm">
                  <p className="font-medium">How to fix</p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                    <li>Click <b>Log out</b> in the top right.</li>
                    <li>Sign back in with the admin email and password.</li>
                    <li>Try Publish again.</li>
                  </ol>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setPublishError(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPublishError(null);
                    save(true);
                  }}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
        {seoIssues && seoIssues.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                SEO validation — {seoIssues.filter((i) => i.level === "error").length} errors,{" "}
                {seoIssues.filter((i) => i.level === "warn").length} warnings
              </p>
              {seoIssues.some((i) => i.level === "error") && (
                <button
                  onClick={() => save(true, true)}
                  className="rounded-lg border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                >
                  Publish anyway
                </button>
              )}
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {seoIssues.map((i, idx) => (
                <li key={idx} className="flex gap-2">
                  <span
                    className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] uppercase ${
                      i.level === "error"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-gold/15 text-gold"
                    }`}
                  >
                    {i.level}
                  </span>
                  <span>
                    <span className="font-mono text-xs text-muted-foreground">{i.field}</span> — {i.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {seoIssues && seoIssues.length === 0 && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            SEO looks good — safe to publish ✓
          </div>
        )}

        {/* AI writer */}
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">AI blog writer</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Topic (e.g. How Indian students should approach their first FAANG resume)"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              placeholder="Tone (optional)"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={runAiWrite}
              disabled={aiBusy || !aiTopic.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {aiBusy ? "Writing…" : "Draft with AI"}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Slug (URL) — leave blank to auto-generate">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="my-post-slug"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
              />
            </Field>
            <Field label="Excerpt (shown in listings, meta description)">
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Content format:</span>
              {(["markdown", "html"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setForm({ ...form, content_format: fmt })}
                  className={`rounded-md border px-2.5 py-1 text-xs uppercase tracking-wide transition ${
                    form.content_format === fmt
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <Field
              label={
                form.content_format === "html"
                  ? "Content (raw HTML — paste your <h2>, <p>, <img> etc.)"
                  : "Content (Markdown)"
              }
            >
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={22}
                placeholder={
                  form.content_format === "html"
                    ? "<h2>Section title</h2>\n<p>Your HTML paragraph…</p>"
                    : "## Section title\n\nYour markdown paragraph…"
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
              />
            </Field>
          </div>

          <aside className="space-y-4">
            <Field label="Cover image URL">
              <input
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="career, resume, internships"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Author name">
              <input
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Read minutes">
              <input
                type="number"
                min={1}
                max={120}
                value={form.read_minutes}
                onChange={(e) =>
                  setForm({ ...form, read_minutes: Number(e.target.value) || 3 })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              Feature on landing page
            </label>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "draft" | "published" })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>

            <div className="grid gap-2 pt-2">
              <button
                onClick={() => save(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                Save draft
              </button>
              <button
                onClick={() => save(true)}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Publish
              </button>
              <button
                onClick={runAiOptimize}
                disabled={aiBusy || !form.title || !form.content}
                className="rounded-lg border border-gold/40 px-3 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
              >
                {aiBusy ? "Analyzing…" : "AI Optimize"}
              </button>
            </div>
            {notice && (
              <p className="rounded-md border border-border bg-card px-3 py-2 text-xs">
                {notice}
              </p>
            )}
          </aside>
        </div>

        {optResult && (
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gold">AI SEO analysis</p>
              <span className="text-xs text-muted-foreground">
                Score: <strong className="text-foreground">{optResult.score}/100</strong>
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Suggested SEO title</p>
                <p className="mt-1">{optResult.seo_title}</p>
                <button
                  onClick={() => setForm((f) => ({ ...f, title: optResult.seo_title }))}
                  className="mt-1 text-xs text-gold underline"
                >
                  Apply
                </button>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Suggested excerpt</p>
                <p className="mt-1">{optResult.seo_excerpt}</p>
                <button
                  onClick={() => setForm((f) => ({ ...f, excerpt: optResult.seo_excerpt }))}
                  className="mt-1 text-xs text-gold underline"
                >
                  Apply
                </button>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
                <p className="mt-1">{optResult.suggested_tags.join(", ")}</p>
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, tags: optResult.suggested_tags.join(", ") }))
                  }
                  className="mt-1 text-xs text-gold underline"
                >
                  Apply
                </button>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Rewritten intro</p>
                <p className="mt-1 whitespace-pre-wrap">{optResult.rewritten_intro}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Strengths</p>
                <ul className="mt-1 list-disc pl-5">
                  {optResult.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Improvements</p>
                <ul className="mt-1 list-disc pl-5">
                  {optResult.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {publishError && (
        <div
          role="alertdialog"
          aria-labelledby="publish-error-title-list"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                ⚠
              </div>
              <div className="flex-1">
                <h3 id="publish-error-title-list" className="text-base font-semibold">
                  {publishError.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{publishError.detail}</p>
                {publishError.host && (
                  <p className="mt-2 text-xs">
                    <span className="text-muted-foreground">Blocked host:</span>{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{publishError.host}</code>
                  </p>
                )}
              </div>
            </div>
            {publishError.kind === "domain" && (
              <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-sm">
                <p className="font-medium">How to fix</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                  <li>
                    Open <span className="font-mono text-foreground">Project settings → Domains</span> and confirm the
                    site URL is <b>Active</b>.
                  </li>
                  <li>
                    In <span className="font-mono text-foreground">Backend → Auth → URL Configuration</span>, add that
                    origin to <b>Site URL</b> and <b>Additional Redirect URLs / Allowed Hosts</b>.
                  </li>
                  <li>Save, wait ~30s, then click Publish again.</li>
                </ol>
              </div>
            )}
            {publishError.kind === "forbidden" && (
              <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-sm">
                <p className="font-medium">How to fix</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                  <li>Click <b>Log out</b> in the top right.</li>
                  <li>Sign back in with the admin email and password.</li>
                  <li>Try Publish again.</li>
                </ol>
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setPublishError(null)}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Blog posts</h2>
          <p className="text-xs text-muted-foreground">
            Publish, edit, feature and unpublish posts. Published posts appear on /blog.
          </p>
        </div>
        <button
          onClick={openNew}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + New post
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Featured</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        p.status === "published"
                          ? "bg-gold/10 text-gold border border-gold/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!p.is_featured}
                      onChange={(e) =>
                        toggleFeat({
                          data: { token: getToken(), id: p.id, featured: e.target.checked },
                        }).then(invalidate)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(p.id)}
                      className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </button>
                    {p.status === "published" ? (
                      <button
                        onClick={() =>
                          setStatus({ data: { token: getToken(), id: p.id, status: "draft" } })
                            .then(invalidate)
                            .catch((e) => setPublishError(classifyPublishError(e)))
                        }
                        className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setStatus({
                            data: { token: getToken(), id: p.id, status: "published" },
                          })
                            .then(invalidate)
                            .catch((e) => setPublishError(classifyPublishError(e)))
                        }
                        className="rounded-md border border-gold/40 px-3 py-1 text-xs text-gold hover:bg-gold/10"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"?`))
                          del({ data: { token: getToken(), id: p.id } }).then(invalidate);
                      }}
                      className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No posts yet. Click "+ New post" to write your first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function AgentPanel() {
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/admin/agent-chat",
      body: () => ({ token: getToken() }),
    }),
  });

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  };

  const quickPrompts = [
    "Give me a snapshot of the platform today.",
    "Show the 5 most recent blog posts.",
    "Draft a blog on ‘how Indian students can crack their first internship’.",
    "How many new users joined recently and how active are the rooms?",
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Campus X Admin Agent</h2>
        <p className="text-xs text-muted-foreground">
          Ask about users, blogs, rooms and jobs, or ask it to draft a blog. It calls real tools against the database.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            disabled={busy}
            onClick={() => void sendMessage({ text: q })}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="max-h-[60vh] min-h-[320px] space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Say hi 👋 — try one of the quick prompts, or ask anything about the platform.
          </p>
        )}
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const toolCalls = m.parts.filter((p) => p.type.startsWith("tool-"));
          return (
            <div
              key={m.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                m.role === "user"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {m.role === "user" ? "You" : "Agent"}
              </p>
              {toolCalls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {toolCalls.map((tc, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold"
                    >
                      🔧 {tc.type.replace(/^tool-/, "")}
                    </span>
                  ))}
                </div>
              )}
              {text ? (
                <div className="prose prose-sm max-w-none prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-pre:my-2">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              ) : (
                busy && m.role === "assistant" && (
                  <p className="text-xs text-muted-foreground">Thinking…</p>
                )
              )}
            </div>
          );
        })}
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the admin agent…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
