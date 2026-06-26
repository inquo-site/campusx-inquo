import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export const Route = createFileRoute("/discover")({
  component: Discover,
});

const ALL_SKILLS = ["React", "TypeScript", "Python", "Go", "Rust", "ML/AI", "Design", "Product", "Solidity", "Unity"];

const PEERS = [
  { name: "Raghav Mehta", college: "IIT Bombay", skills: ["Rust", "Go", "Systems"], open: true },
  { name: "Aisha Verma", college: "BITS Pilani", skills: ["React", "Design", "Product"], open: true },
  { name: "Kenji Tanaka", college: "NUS Singapore", skills: ["ML/AI", "Python"], open: false },
  { name: "Priya Nair", college: "NIT Trichy", skills: ["TypeScript", "React", "Node"], open: true },
  { name: "Diego Alvarez", college: "Stanford", skills: ["Solidity", "Rust"], open: true },
  { name: "Mei Lin", college: "Tsinghua", skills: ["ML/AI", "Go"], open: false },
  { name: "Arjun Khanna", college: "IIIT Hyderabad", skills: ["Unity", "C#"], open: true },
  { name: "Sara Okonkwo", college: "MIT", skills: ["Python", "ML/AI", "Product"], open: true },
];

function Discover() {
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [skillsOpen, setSkillsOpen] = useState(false);

  const filtered = PEERS.filter((p) => {
    if (openOnly && !p.open) return false;
    if (query && !`${p.name} ${p.college}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (selected.length && !selected.every((s) => p.skills.includes(s))) return false;
    return true;
  });

  const toggleSkill = (s: string) =>
    setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or college"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSkillsOpen((o) => !o)}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium md:w-56"
          >
            <span className="truncate">
              {selected.length ? `${selected.length} skill${selected.length > 1 ? "s" : ""}` : "Filter by skills"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </button>
          {skillsOpen && (
            <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-lg">
              {ALL_SKILLS.map((s) => {
                const on = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    {s}
                    {on && <Check className="h-4 w-4 text-foreground" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-medium">
          <span>Open to collaborate</span>
          <span
            onClick={() => setOpenOnly((o) => !o)}
            className={
              "relative inline-block h-5 w-9 rounded-full transition " +
              (openOnly ? "bg-lime" : "bg-muted")
            }
          >
            <span
              className={
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition " +
                (openOnly ? "left-[18px]" : "left-0.5")
              }
            />
          </span>
        </label>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} peer{filtered.length !== 1 ? "s" : ""} matched
      </div>

      {/* Peer grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article
            key={p.name}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink font-display font-bold text-ink-foreground">
                {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-base font-semibold">{p.name}</h3>
                <p className="truncate text-xs text-muted-foreground">{p.college}</p>
              </div>
              {p.open && (
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-foreground">
                  Open
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  {s}
                </span>
              ))}
            </div>

            <button className="mt-5 w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-ink-foreground transition hover:bg-ink/90">
              Connect
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
