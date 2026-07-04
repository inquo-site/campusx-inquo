import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

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
      setAuthed(true);
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
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

  const currentEmail =
    typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Signed in as {currentEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Users", value: "—", hint: "Registered accounts" },
            { label: "Rooms", value: "—", hint: "Peer discussion rooms" },
            { label: "Dev Profiles", value: "—", hint: "Public report cards" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-2 text-3xl font-semibold">{c.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin tooling will appear here. Tell Lovable what controls you want
            (moderate rooms, curate jobs, feature profiles, etc.) and they'll be
            wired to Lovable Cloud.
          </p>
        </section>
      </main>
    </div>
  );
}
