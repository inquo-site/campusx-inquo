import { useState } from "react";
import { motion } from "motion/react";
import {
  Hammer,
  Bug,
  Rocket,
  Compass,
  TrendingUp,
  Mail,
  BarChart3,
  Check,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AutopilotActivateDialog } from "@/components/autopilot-activate-dialog";

const agents = [
  {
    icon: Hammer,
    name: "Builder Agent",
    kaam: "Code likhna, features add karna (Lovable-style codegen).",
    trigger: "Feature backlog se",
  },
  {
    icon: Bug,
    name: "QA / Bug-Fix Agent",
    kaam: "Error logs monitor, auto-patch, regression test.",
    trigger: "Sentry / error webhook",
  },
  {
    icon: Rocket,
    name: "Deploy Agent",
    kaam: "CI/CD, staging → prod push.",
    trigger: "QA pass hone par",
  },
  {
    icon: Compass,
    name: "Feature-Discovery Agent",
    kaam: "User feedback, support tickets, usage analytics scan karke naye feature suggest kare.",
    trigger: "Weekly cron",
  },
  {
    icon: TrendingUp,
    name: "Growth Agent",
    kaam: "Ad copy, creatives generate, campaigns launch (Meta/Google Ads API).",
    trigger: "Budget threshold ke andar",
  },
  {
    icon: Mail,
    name: "Lead-Gen Agent",
    kaam: "Cold outreach, SEO content, waitlist nurture.",
    trigger: "Daily cron",
  },
  {
    icon: BarChart3,
    name: "Data / Analytics Agent",
    kaam: "Metrics dashboard, churn signals, cohort analysis → insights report.",
    trigger: "Real-time + daily digest",
  },
];

const included = [
  "All 7 agents active on your workspace",
  "Runs on Lovable AI — no extra API keys",
  "Slack / email digest of every agent run",
  "Cancel anytime, no lock-in",
];

export function AiAgentsSection() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sub } = useQuery({
    queryKey: ["my-autopilot-sub", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_subscriptions")
        .select("status,created_at,upi_txn_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const status = sub?.status;
  const ctaLabel =
    status === "approved" ? "Autopilot Active" :
    status === "pending" ? "Verification pending" :
    "Activate Autopilot";
  const CtaIcon =
    status === "approved" ? ShieldCheck :
    status === "pending" ? Clock :
    ArrowUpRight;

  return (
    <section id="agents" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
            <Sparkles className="h-3 w-3" /> Autonomous AI Team
          </div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Seven agents. One <span className="italic-serif">autopilot</span> for your product.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Build, ship, market, and analyze — a full AI team that runs your Campus X workspace 24×7.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="card-noir-hover bg-surface p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-lg leading-tight">{a.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.kaam}</p>
                <p className="mt-4 border-t border-border/60 pt-3 text-[11px] uppercase tracking-widest text-gold">
                  Trigger · <span className="text-foreground/80 normal-case tracking-normal">{a.trigger}</span>
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="ambient-glow rounded-3xl border border-gold/20 bg-surface p-8 md:p-10">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                — AI Autopilot Plan
              </div>
              {status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              )}
              {status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-amber-400">
                  <Clock className="h-3 w-3" /> Pending
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-6xl md:text-7xl">₹999</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Flat pricing. All seven agents. Manual UPI payment · billed monthly in INR.
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              disabled={!user}
              className="btn-ink group mt-8 disabled:opacity-50"
            >
              {ctaLabel}
              <CtaIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            {!user && (
              <p className="mt-3 text-[11px] text-muted-foreground">Sign in to activate autopilot.</p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
            <h3 className="font-display text-2xl">
              What's <span className="italic-serif">included</span>
            </h3>
            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[11px] text-muted-foreground">
              Agents run on Lovable AI Gateway. Fair-use limits apply.
            </p>
          </div>
        </div>
      </div>
      <AutopilotActivateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  );
}
