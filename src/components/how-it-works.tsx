import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Terminal,
  GitBranch,
  Rocket,
  Check,
  Cpu,
  Users,
  Star,
  Activity,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Step 01 — Code editor typing your builder profile                   */
/* ------------------------------------------------------------------ */
function ProfileEditorVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const lines = [
    { c: "muted", t: "// profile.ts" },
    { c: "kw", t: "export const" + " ", k: "me", eq: " = {" },
    { c: "field", k: "  name", v: '"Suman K."' },
    { c: "field", k: "  college", v: '"NIT Patna"' },
    { c: "field", k: "  stack", v: '["React", "TS", "Postgres"]' },
    { c: "field", k: "  shipping", v: "true" },
    { c: "kw", t: "}" },
  ];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.13_0.012_60)] font-mono text-xs shadow-2xl"
    >
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Terminal className="h-3 w-3 text-gold" /> profile.ts
        </div>
        <div className="text-[10px] text-muted-foreground">main*</div>
      </div>

      {/* code */}
      <div className="grid grid-cols-[2.5rem_1fr] gap-2 px-4 py-5 leading-relaxed">
        {lines.map((l, i) => (
          <>
            <div key={`n-${i}`} className="select-none text-right text-muted-foreground/40">
              {i + 1}
            </div>
            <motion.div
              key={`l-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.18 }}
              className="whitespace-pre"
            >
              {l.c === "muted" && <span className="text-muted-foreground/60">{l.t}</span>}
              {l.c === "kw" && (
                <>
                  <span className="text-[#c792ea]">{l.t}</span>
                  {l.k && <span className="text-[#82aaff]">{l.k}</span>}
                  {l.eq && <span className="text-foreground/80">{l.eq}</span>}
                </>
              )}
              {l.c === "field" && (
                <>
                  <span className="text-[#82aaff]">{l.k}</span>
                  <span className="text-foreground/80">: </span>
                  <span className="text-[#c3e88d]">{l.v}</span>
                  <span className="text-foreground/40">,</span>
                </>
              )}
            </motion.div>
          </>
        ))}

        {/* blinking cursor */}
        <div />
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6 }}
          className="flex items-center"
        >
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="ml-0 inline-block h-3.5 w-1.5 bg-gold"
          />
        </motion.div>
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between border-t border-white/5 bg-black/30 px-4 py-1.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          synced to campus-x
        </span>
        <span>TS · UTF-8</span>
      </div>

      {/* floating tags */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
        className="absolute right-4 top-16 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] text-gold backdrop-blur"
      >
        +12 skills indexed
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 02 — Network graph of peers                                    */
/* ------------------------------------------------------------------ */
function PeerGraphVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const nodes = [
    { x: 180, y: 120, label: "You", primary: true, r: 26 },
    { x: 60, y: 60, label: "React", r: 16 },
    { x: 80, y: 200, label: "Rust", r: 14 },
    { x: 300, y: 60, label: "AI/ML", r: 18 },
    { x: 320, y: 210, label: "Design", r: 15 },
    { x: 200, y: 240, label: "DevOps", r: 13 },
    { x: 30, y: 140, label: "Solo", r: 11 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.13_0.012_60)] p-6 shadow-2xl">
      {/* grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-gold" /> peer graph
        </span>
        <span>live · 142 online</span>
      </div>

      <svg ref={ref} viewBox="0 0 360 280" className="relative h-[260px] w-full">
        <defs>
          <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.82 0.12 82)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.82 0.12 82)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* edges */}
        {nodes.slice(1).map((n, i) => (
          <motion.line
            key={`e-${i}`}
            x1={180}
            y1={120}
            x2={n.x}
            y2={n.y}
            stroke="oklch(0.82 0.12 82 / 0.5)"
            strokeWidth={1}
            strokeDasharray="3 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.12 }}
          />
        ))}

        {/* travelling packets */}
        {nodes.slice(1).map((n, i) => (
          <motion.circle
            key={`p-${i}`}
            r={2.5}
            fill="oklch(0.82 0.12 82)"
            initial={{ cx: 180, cy: 120, opacity: 0 }}
            animate={inView ? { cx: [180, n.x], cy: [120, n.y], opacity: [0, 1, 0] } : {}}
            transition={{
              duration: 1.6,
              delay: 1 + i * 0.25,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}

        {/* nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={`n-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
          >
            {n.primary && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="url(#pulse)"
                animate={{ r: [n.r, n.r + 14, n.r], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.primary ? "oklch(0.82 0.12 82)" : "oklch(0.22 0.014 60)"}
              stroke={n.primary ? "oklch(0.94 0.025 85)" : "oklch(0.82 0.12 82 / 0.5)"}
              strokeWidth={1.2}
            />
            <text
              x={n.x}
              y={n.y + 3}
              textAnchor="middle"
              fontSize={n.primary ? 10 : 8}
              fontWeight={n.primary ? 600 : 400}
              fill={n.primary ? "oklch(0.16 0.012 60)" : "oklch(0.94 0.015 80)"}
              fontFamily="Geist, system-ui"
            >
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.8 }}
        className="relative mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs"
      >
        <Users className="h-3.5 w-3.5 text-gold" />
        <span className="text-muted-foreground">3 matches with</span>
        <span className="italic-serif">React · TypeScript</span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 03 — Deploy / shipped pipeline                                 */
/* ------------------------------------------------------------------ */
function DeployVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const steps = [
    { label: "build", time: "2.4s" },
    { label: "test", time: "1.1s" },
    { label: "deploy", time: "3.0s" },
    { label: "live", time: "ok" },
  ];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.13_0.012_60)] p-6 font-mono text-xs shadow-2xl"
    >
      <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <GitBranch className="h-3 w-3 text-gold" /> ci · main
        </span>
        <span className="text-[#28c840]">● passing</span>
      </div>

      {/* pipeline */}
      <div className="space-y-2.5">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.35 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.35, type: "spring", stiffness: 300 }}
              className="grid h-6 w-6 place-items-center rounded-full border border-gold/40 bg-gold/15 text-gold"
            >
              <Check className="h-3 w-3" />
            </motion.div>
            <div className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: "100%" } : {}}
                  transition={{ delay: 0.3 + i * 0.35, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-gold/60 to-gold"
                />
              </div>
            </div>
            <span className="w-14 text-right text-muted-foreground">{s.label}</span>
            <span className="w-10 text-right text-[10px] text-gold">{s.time}</span>
          </motion.div>
        ))}
      </div>

      {/* shipped card */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.95 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 1.9, type: "spring", stiffness: 200 }}
        className="mt-5 rounded-xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-gold" />
            <span className="font-sans text-sm">campus-graph.app</span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-[#28c840] shadow-[0_0_12px_#28c840]"
          />
        </div>
        <div className="mt-3 flex items-center gap-3 font-sans text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-gold" /> 84
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gold" /> 4 teammates
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-gold" /> edge
          </span>
        </div>
      </motion.div>

      {/* floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: [0, 0.8, 0], y: [-10, -50] } : {}}
          transition={{
            duration: 2.2,
            delay: 2 + i * 0.2,
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
          className="absolute h-1 w-1 rounded-full bg-gold"
          style={{ left: `${20 + i * 12}%`, bottom: "30%" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
const steps = [
  {
    n: "01",
    title: "Build your",
    italic: "builder profile",
    body: "Drop your stack, college, and the things you've already shipped. No buzzword resumes — your repos do the talking.",
    Visual: ProfileEditorVisual,
  },
  {
    n: "02",
    title: "Match with the right",
    italic: "peers",
    body: "We graph every builder by skills, interest, and current bandwidth. Find your co-founder, not a stranger.",
    Visual: PeerGraphVisual,
  },
  {
    n: "03",
    title: "Ship something",
    italic: "real",
    body: "Form teams, push commits, deploy live. Every shipped project is a public proof-of-work on your Campus X graph.",
    Visual: DeployVisual,
  },
];

export function HowItWorks() {
  return (
    <section className="relative px-4 py-24 md:px-8" id="how">
      {/* ambient bg */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — How it works
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">
            From <span className="italic-serif">profile</span> to{" "}
            <span className="italic-serif">production</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Three steps. Built for the way developers actually work.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((s, i) => {
            const Visual = s.Visual;
            const reversed = i % 2 === 1;
            return (
              <div
                key={s.n}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, x: reversed ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="font-mono text-xs text-gold">{s.n} / 03</div>
                  <h3 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
                    {s.title} <br />
                    <span className="italic-serif">{s.italic}</span>
                  </h3>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                  <div className="hairline mt-8 w-24" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Visual />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
