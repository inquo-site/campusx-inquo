import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

type T = {
  name: string;
  college: string;
  role: string;
  quote: string;
  accent: string; // avatar bg
};

const TESTIMONIALS: T[] = [
  {
    name: "Priya R.",
    college: "NIT Trichy",
    role: "Founder, ClimaLoop",
    quote:
      "Found my co-founder for our climate startup on Campus X within two weeks. We're now in YC's Startup School.",
    accent: "#f4c04f",
  },
  {
    name: "Arjun S.",
    college: "IIIT Hyderabad",
    role: "SDE Intern, YC-backed",
    quote:
      "The internship board got me a paid SDE role. The dual-pane view is so much better than chasing recruiters over email.",
    accent: "#e8a87c",
  },
  {
    name: "Meera K.",
    college: "BITS Pilani",
    role: "Frontend Lead, Kori",
    quote:
      "I posted a project and three frontend devs joined within 48 hours. We shipped to production in a month.",
    accent: "#c45c7c",
  },
  {
    name: "Rohan T.",
    college: "IIT Kharagpur",
    role: "Builder in Residence",
    quote:
      "Finally a platform that treats students like the builders we are. The vibe here is unlike any other community.",
    accent: "#2dd4a8",
  },
  {
    name: "Ananya G.",
    college: "VIT Vellore",
    role: "ML Engineer",
    quote:
      "The AI mentor unblocked me on interview prep at 2 AM. Cracked two SDE-1 offers the same month.",
    accent: "#87a878",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function TestimonialsShowcase() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  const total = TESTIMONIALS.length;
  const current = TESTIMONIALS[index];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % total);
    }, 5500);
    return () => window.clearInterval(id);
  }, [paused, total]);

  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  return (
    <section className="relative px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — What builders say
          </div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Loved by people who <span className="italic-serif">ship.</span>
          </h2>
        </div>

        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* animated soft halo behind the featured card */}
          <motion.div
            aria-hidden
            key={`glow-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
            style={{
              background: `radial-gradient(60% 60% at 50% 40%, ${current.accent}55 0%, transparent 70%)`,
            }}
          />

          {/* orbiting decorative avatars */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {TESTIMONIALS.map((t, i) => {
              const angle = (i / total) * Math.PI * 2;
              const r = 42; // vw-ish percentage via CSS below
              const cx = 50 + Math.cos(angle) * r;
              const cy = 50 + Math.sin(angle) * r * 0.55;
              const active = i === index;
              return (
                <motion.div
                  key={t.name}
                  className="absolute grid place-items-center rounded-full font-display shadow-lg"
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    background: t.accent,
                    color: "#1c1a17",
                  }}
                  animate={{
                    width: active ? 56 : 34,
                    height: active ? 56 : 34,
                    x: "-50%",
                    y: "-50%",
                    opacity: active ? 1 : 0.55,
                    scale: active ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <span className="text-sm font-semibold">{t.name[0]}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Featured card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/70 p-8 shadow-[0_30px_80px_-40px_rgba(43,38,32,0.4)] backdrop-blur-xl md:p-14">
            <Quote className="h-8 w-8 text-foreground/30" />

            <div className="relative mt-6 min-h-[220px] md:min-h-[200px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={current.name}
                  custom={dir}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <blockquote className="font-display text-2xl leading-snug tracking-tight md:text-4xl">
                    {current.quote.split(" ").map((word, wi) => (
                      <motion.span
                        key={wi}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          ease: EASE,
                          delay: 0.15 + wi * 0.025,
                        }}
                        className="inline-block"
                      >
                        {word}&nbsp;
                      </motion.span>
                    ))}
                  </blockquote>

                  <motion.figcaption
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
                    className="mt-8 flex items-center gap-4"
                  >
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full font-display text-lg shadow-md"
                      style={{ background: current.accent, color: "#1c1a17" }}
                    >
                      {current.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{current.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {current.role} · {current.college}
                      </div>
                    </div>
                    <div className="ml-auto hidden items-center gap-0.5 sm:flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-gold text-gold"
                        />
                      ))}
                    </div>
                  </motion.figcaption>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="mt-10 h-[2px] w-full overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                key={`bar-${index}-${paused}`}
                className="h-full origin-left"
                style={{ background: current.accent }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused ? 0 : 1 }}
                transition={{
                  duration: paused ? 0 : 5.5,
                  ease: "linear",
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-foreground/15 bg-background text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-foreground/5 active:translate-y-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-label={`Show ${t.name}`}
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-foreground"
                      : "w-2 bg-foreground/25 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-foreground/15 bg-background text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-foreground/5 active:translate-y-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
