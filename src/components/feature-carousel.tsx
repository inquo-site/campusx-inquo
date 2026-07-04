import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  Users,
  FolderGit2,
  Briefcase,
  Rocket,
  Sparkles,
  FileText,
  MessageSquareCode,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
  FolderGit2,
  Briefcase,
  Rocket,
  Sparkles,
  FileText,
  MessageSquareCode,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Feature carousel — auto-scrolling "what you get" cards             */
/*  Composition mirrors Unmind's hero card row: image field, a         */
/*  category pill (top-left), and a floating detail chip (bottom).     */
/* ------------------------------------------------------------------ */

type Card = {
  key: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  detail: string;
  detailKicker: string;
  hue: string; // background gradient for the illustration panel
  accent: string; // small accent used inside the illustration
  Illustration: () => ReactNode;
};

/* Small SVG illustrations — hand-tuned, no external images */

const IllProjects = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <rect x="24" y="30" width="200" height="120" rx="14" fill="#1c1a17" opacity="0.92" />
    <rect x="36" y="46" width="90" height="8" rx="4" fill="#d4b062" />
    <rect x="36" y="62" width="150" height="4" rx="2" fill="#ffffff" opacity="0.35" />
    <rect x="36" y="72" width="120" height="4" rx="2" fill="#ffffff" opacity="0.25" />
    <rect x="36" y="96" width="176" height="42" rx="8" fill="#ffffff" opacity="0.06" />
    <rect x="46" y="106" width="70" height="4" rx="2" fill="#ffffff" opacity="0.4" />
    <rect x="46" y="118" width="140" height="4" rx="2" fill="#ffffff" opacity="0.2" />
    <circle cx="240" cy="60" r="30" fill="#f5d97a" />
    <circle cx="272" cy="112" r="22" fill="#e8a87c" />
    <rect x="234" y="140" width="60" height="34" rx="10" fill="#ffffff" />
    <rect x="244" y="150" width="34" height="4" rx="2" fill="#2b2620" />
    <rect x="244" y="160" width="24" height="4" rx="2" fill="#2b2620" opacity="0.5" />
  </svg>
);

const IllInternships = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <rect x="30" y="34" width="260" height="132" rx="16" fill="#efe6d3" />
    <rect x="46" y="52" width="90" height="10" rx="5" fill="#2b2620" />
    <rect x="46" y="70" width="150" height="6" rx="3" fill="#2b2620" opacity="0.35" />
    <g transform="translate(46,96)">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0, ${i * 22})`}>
          <rect width="228" height="16" rx="6" fill="#ffffff" />
          <circle cx="12" cy="8" r="4" fill={["#2dd4a8", "#e8a87c", "#f5d97a"][i]} />
          <rect x="26" y="4" width="80" height="4" rx="2" fill="#2b2620" opacity="0.7" />
          <rect x="150" y="4" width="60" height="8" rx="4" fill="#2b2620" opacity="0.08" />
        </g>
      ))}
    </g>
  </svg>
);

const IllMentor = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <rect x="26" y="34" width="268" height="132" rx="16" fill="#1c1a17" />
    <g fill="#f5d97a">
      <circle cx="60" cy="70" r="14" />
    </g>
    <rect x="82" y="60" width="150" height="24" rx="12" fill="#ffffff" opacity="0.1" />
    <rect x="92" y="70" width="120" height="4" rx="2" fill="#ffffff" opacity="0.6" />
    <g transform="translate(0,40)">
      <rect x="86" y="60" width="180" height="28" rx="14" fill="#d4b062" />
      <rect x="98" y="72" width="140" height="4" rx="2" fill="#1c1a17" />
    </g>
    <rect x="82" y="140" width="120" height="18" rx="9" fill="#ffffff" opacity="0.12" />
    <rect x="92" y="148" width="80" height="4" rx="2" fill="#ffffff" opacity="0.5" />
  </svg>
);

const IllStartup = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="1" stopColor="#f4c04f" />
      </linearGradient>
    </defs>
    <rect x="20" y="24" width="280" height="152" rx="16" fill="url(#sky)" />
    <path d="M60 150 L160 60 L260 150 Z" fill="#2b2620" />
    <path d="M60 150 L160 90 L260 150 Z" fill="#4a3e2f" />
    <circle cx="230" cy="60" r="20" fill="#ffffff" opacity="0.9" />
    <circle cx="250" cy="70" r="26" fill="#ffffff" opacity="0.7" />
    <rect x="150" y="150" width="20" height="18" rx="2" fill="#efe6d3" />
    <rect x="156" y="156" width="8" height="12" rx="1" fill="#2b2620" />
  </svg>
);

const IllResume = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <rect x="70" y="20" width="180" height="160" rx="10" fill="#ffffff" />
    <rect x="86" y="38" width="80" height="10" rx="5" fill="#2b2620" />
    <rect x="86" y="56" width="120" height="4" rx="2" fill="#2b2620" opacity="0.4" />
    <rect x="86" y="80" width="148" height="4" rx="2" fill="#2b2620" opacity="0.2" />
    <rect x="86" y="92" width="120" height="4" rx="2" fill="#2b2620" opacity="0.2" />
    <rect x="86" y="104" width="140" height="4" rx="2" fill="#2b2620" opacity="0.2" />
    <rect x="86" y="128" width="60" height="14" rx="4" fill="#f5d97a" />
    <rect x="152" y="128" width="60" height="14" rx="4" fill="#efe6d3" />
    <rect x="86" y="150" width="148" height="4" rx="2" fill="#2b2620" opacity="0.15" />
  </svg>
);

const IllDiscover = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
    <rect x="20" y="20" width="280" height="160" rx="14" fill="#efe6d3" />
    {[
      { x: 40, y: 40, c: "#2b2620", t: "P" },
      { x: 110, y: 32, c: "#d4b062", t: "A" },
      { x: 190, y: 46, c: "#e8a87c", t: "M" },
      { x: 250, y: 40, c: "#2dd4a8", t: "R" },
      { x: 60, y: 110, c: "#f5d97a", t: "S" },
      { x: 150, y: 118, c: "#c45c7c", t: "T" },
      { x: 230, y: 108, c: "#87a878", t: "N" },
    ].map((n, i) => (
      <g key={i} transform={`translate(${n.x - 22},${n.y - 12})`}>
        <rect width="80" height="34" rx="17" fill="#ffffff" />
        <circle cx="18" cy="17" r="10" fill={n.c} />
        <text x="18" y="21" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">
          {n.t}
        </text>
        <rect x="34" y="10" width="36" height="4" rx="2" fill="#2b2620" opacity="0.6" />
        <rect x="34" y="20" width="24" height="4" rx="2" fill="#2b2620" opacity="0.3" />
      </g>
    ))}
  </svg>
);

const CARDS: Card[] = [
  {
    key: "projects",
    label: "Project Hub",
    icon: FolderGit2,
    headline: "Ship live projects",
    detailKicker: "New",
    detail: "Realtime portfolio · GitHub linked",
    hue: "linear-gradient(160deg,#faf0d8 0%,#f1d99a 100%)",
    accent: "#d4b062",
    Illustration: IllProjects,
  },
  {
    key: "internships",
    label: "Internships",
    icon: Briefcase,
    headline: "Real, paid roles",
    detailKicker: "12 open",
    detail: "Filtered for CS undergrads",
    hue: "linear-gradient(160deg,#fff4e0 0%,#f7d9a5 100%)",
    accent: "#e8a87c",
    Illustration: IllInternships,
  },
  {
    key: "mentor",
    label: "AI Mentor",
    icon: MessageSquareCode,
    headline: "Chat with Campus X",
    detailKicker: "Gemini",
    detail: "Ask about stack, resume, interviews",
    hue: "linear-gradient(160deg,#f5efe1 0%,#e8dcc0 100%)",
    accent: "#d4b062",
    Illustration: IllMentor,
  },
  {
    key: "startup",
    label: "Startup Incubator",
    icon: Rocket,
    headline: "Find your co-founder",
    detailKicker: "Live",
    detail: "Pitch board · role matching",
    hue: "linear-gradient(160deg,#ffeec2 0%,#f4c04f 100%)",
    accent: "#f4c04f",
    Illustration: IllStartup,
  },
  {
    key: "resume",
    label: "Resume Builder",
    icon: FileText,
    headline: "AI-polished bullets",
    detailKicker: "1-click",
    detail: "Recruiter-tuned PDF export",
    hue: "linear-gradient(160deg,#fbf6e9 0%,#eaddb8 100%)",
    accent: "#e0c26a",
    Illustration: IllResume,
  },
  {
    key: "discover",
    label: "Discover Peers",
    icon: Users,
    headline: "Meet the builders",
    detailKicker: "600+",
    detail: "Skill + college filters",
    hue: "linear-gradient(160deg,#fff2d6 0%,#f0d99a 100%)",
    accent: "#d4b062",
    Illustration: IllDiscover,
  },
];

function CarouselCard({ c }: { c: Card }) {
  return (
    <div className="group relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-3xl border border-foreground/8 shadow-[0_18px_40px_-24px_rgba(43,38,32,0.35)] transition-transform duration-500 ease-out hover:-translate-y-1 sm:w-[320px] md:w-[360px]">
      <div className="relative h-[220px] w-full" style={{ background: c.hue }}>
        <div className="absolute inset-0 opacity-90">
          <c.Illustration />
        </div>

        {/* Category pill */}
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <c.icon className="h-3.5 w-3.5" style={{ color: c.accent }} />
          {c.label}
        </div>

        {/* Floating detail chip */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-2xl bg-background px-4 py-2.5 shadow-lg">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-[10px] font-semibold uppercase tracking-wider text-background">
            {c.detailKicker.length > 5 ? c.detailKicker.slice(0, 3) : c.detailKicker}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-sm">{c.headline}</div>
            <div className="truncate text-[11px] text-muted-foreground">{c.detail}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureCarousel() {
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...CARDS, ...CARDS];

  return (
    <div className="relative mx-auto mt-14 w-full max-w-[110rem] overflow-hidden">
      {/* soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-28" />

      <motion.div
        className="flex gap-5 will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 42,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {loop.map((c, i) => (
          <CarouselCard key={`${c.key}-${i}`} c={c} />
        ))}
      </motion.div>

      {/* Kicker */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Everything you'll find inside</span>
        <Trophy className="h-3 w-3" />
      </div>
    </div>
  );
}
