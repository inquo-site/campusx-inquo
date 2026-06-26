import { Link } from "@tanstack/react-router";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/dashboard", label: "App" },
] as const;

const footerLinks = [
  { to: "/about", label: "About Us" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Glass Navbar */}
      <header className="fixed inset-x-0 top-4 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-background/40 px-4 py-3 backdrop-blur-2xl md:px-6"
        style={{ boxShadow: "0 8px 32px oklch(0 0 0 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.06)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md border border-gold/40 bg-gold/10 font-display text-lg italic text-gold">
            X
          </div>
          <span className="font-display text-xl leading-none">
            Campus<span className="italic-serif">X</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-foreground/70 transition hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 md:text-sm"
        >
          Launch App
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <main className="ambient-glow pt-28">{children}</main>

      {/* Glass Footer */}
      <footer className="relative mt-24 px-4 pb-8 md:px-8">
        <div
          className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-background/40 p-8 backdrop-blur-2xl md:p-12"
          style={{ boxShadow: "0 8px 40px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.05)" }}
        >
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-gold/40 bg-gold/10 font-display text-xl italic text-gold">
                  X
                </div>
                <span className="font-display text-2xl">
                  Campus<span className="italic-serif">X</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Where student builders ship live projects, find internships,
                and form startup teams that <span className="italic-serif">actually</span> launch.
              </p>
              <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gold" />
                  <a href="mailto:campusx4@gmail.com" className="hover:text-gold">campusx4@gmail.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  Purnia, Bihar 854315, India
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Explore</div>
              <ul className="space-y-2.5 text-sm">
                {navLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-foreground/70 transition hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Legal</div>
              <ul className="space-y-2.5 text-sm">
                {footerLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-foreground/70 transition hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hairline mt-10" />
          <div className="mt-5 flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
            <div>© {new Date().getFullYear()} Campus X. Built by Suman Kumar.</div>
            <div className="italic-serif text-gold">ship things that matter.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
