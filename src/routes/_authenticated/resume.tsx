import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, Sparkles, Download, Github, Linkedin, Globe, Mail, MapPin } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { polishResumeBullets } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume")({
  component: ResumeBuilder,
});

type Exp = { id: string; role: string; org: string; period: string; bullets: string };
type Proj = { id: string; name: string; stack: string; bullets: string; link: string };
type Edu = { id: string; school: string; degree: string; period: string };
type ResumeData = {
  full_name: string; headline: string; email: string; phone: string; location: string;
  links: { github: string; linkedin: string; website: string };
  summary: string;
  skills: string;
  experience: Exp[];
  projects: Proj[];
  education: Edu[];
};

const blank = (): ResumeData => ({
  full_name: "", headline: "CS Undergrad · Builder", email: "", phone: "", location: "",
  links: { github: "", linkedin: "", website: "" },
  summary: "",
  skills: "",
  experience: [],
  projects: [],
  education: [],
});

const uid = () => Math.random().toString(36).slice(2, 9);

function ResumeBuilder() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [data, setData] = useState<ResumeData>(blank());

  const { data: resume } = useQuery({
    queryKey: ["resume", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("resumes").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (resume?.content) setData({ ...blank(), ...(resume.content as ResumeData) });
    else if (user) {
      supabase.from("profiles").select("full_name,bio,skills,github_url,linkedin_url,website_url,location").eq("id", user.id).maybeSingle().then(({ data: p }) => {
        if (p) setData((d) => ({
          ...d,
          full_name: p.full_name ?? "",
          email: user.email ?? "",
          location: p.location ?? "",
          summary: p.bio ?? "",
          skills: (p.skills ?? []).join(", "),
          links: { github: p.github_url ?? "", linkedin: p.linkedin_url ?? "", website: p.website_url ?? "" },
        }));
      });
    }
  }, [resume, user]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("resumes").upsert({ user_id: user!.id, content: data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Resume saved"); qc.invalidateQueries({ queryKey: ["resume"] }); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const addExp = () => setData({ ...data, experience: [...data.experience, { id: uid(), role: "", org: "", period: "", bullets: "" }] });
  const addProj = () => setData({ ...data, projects: [...data.projects, { id: uid(), name: "", stack: "", bullets: "", link: "" }] });
  const addEdu = () => setData({ ...data, education: [...data.education, { id: uid(), school: "", degree: "", period: "" }] });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Edit on the left, preview on the right. Use <span className="text-gold">Polish</span> to AI-rewrite bullets.</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs hover:border-gold/40"><Download className="h-3 w-3" /> Print / PDF</button>
            <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
              {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </button>
          </div>
        </div>

        <Card title="Basics">
          <Grid2>
            <Inp label="Full name" v={data.full_name} on={(v) => setData({ ...data, full_name: v })} />
            <Inp label="Headline" v={data.headline} on={(v) => setData({ ...data, headline: v })} />
            <Inp label="Email" v={data.email} on={(v) => setData({ ...data, email: v })} />
            <Inp label="Phone" v={data.phone} on={(v) => setData({ ...data, phone: v })} />
            <Inp label="Location" v={data.location} on={(v) => setData({ ...data, location: v })} />
          </Grid2>
          <Grid2>
            <Inp label="GitHub" v={data.links.github} on={(v) => setData({ ...data, links: { ...data.links, github: v } })} />
            <Inp label="LinkedIn" v={data.links.linkedin} on={(v) => setData({ ...data, links: { ...data.links, linkedin: v } })} />
            <Inp label="Website" v={data.links.website} on={(v) => setData({ ...data, links: { ...data.links, website: v } })} />
          </Grid2>
        </Card>

        <Card title="Summary" action={<PolishBtn text={data.summary} context="resume summary" onResult={(v) => setData({ ...data, summary: v })} />}>
          <Inp label="2-3 sentence pitch" v={data.summary} on={(v) => setData({ ...data, summary: v })} textarea />
        </Card>

        <Card title="Skills">
          <Inp label="Comma-separated" v={data.skills} on={(v) => setData({ ...data, skills: v })} placeholder="React, TypeScript, Postgres, Rust, AWS" />
        </Card>

        <Card title="Experience" action={<button onClick={addExp} className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline"><Plus className="h-3 w-3" /> Add</button>}>
          {data.experience.map((e, idx) => (
            <div key={e.id} className="space-y-2 rounded-xl border border-border bg-background p-3">
              <Grid2>
                <Inp label="Role" v={e.role} on={(v) => setData({ ...data, experience: data.experience.map((x, i) => i === idx ? { ...x, role: v } : x) })} />
                <Inp label="Organisation" v={e.org} on={(v) => setData({ ...data, experience: data.experience.map((x, i) => i === idx ? { ...x, org: v } : x) })} />
                <Inp label="Period" v={e.period} on={(v) => setData({ ...data, experience: data.experience.map((x, i) => i === idx ? { ...x, period: v } : x) })} placeholder="Jun 2024 – Aug 2024" />
              </Grid2>
              <Inp label="Bullets (one per line)" textarea v={e.bullets} on={(v) => setData({ ...data, experience: data.experience.map((x, i) => i === idx ? { ...x, bullets: v } : x) })} />
              <div className="flex items-center justify-between">
                <PolishBtn text={e.bullets} context={`Experience: ${e.role} at ${e.org}`} onResult={(v) => setData({ ...data, experience: data.experience.map((x, i) => i === idx ? { ...x, bullets: v } : x) })} />
                <button onClick={() => setData({ ...data, experience: data.experience.filter((x) => x.id !== e.id) })} className="text-[11px] text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Projects" action={<button onClick={addProj} className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline"><Plus className="h-3 w-3" /> Add</button>}>
          {data.projects.map((p, idx) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-border bg-background p-3">
              <Grid2>
                <Inp label="Name" v={p.name} on={(v) => setData({ ...data, projects: data.projects.map((x, i) => i === idx ? { ...x, name: v } : x) })} />
                <Inp label="Stack" v={p.stack} on={(v) => setData({ ...data, projects: data.projects.map((x, i) => i === idx ? { ...x, stack: v } : x) })} />
                <Inp label="Link" v={p.link} on={(v) => setData({ ...data, projects: data.projects.map((x, i) => i === idx ? { ...x, link: v } : x) })} />
              </Grid2>
              <Inp label="Bullets (one per line)" textarea v={p.bullets} on={(v) => setData({ ...data, projects: data.projects.map((x, i) => i === idx ? { ...x, bullets: v } : x) })} />
              <div className="flex items-center justify-between">
                <PolishBtn text={p.bullets} context={`Project: ${p.name} (${p.stack})`} onResult={(v) => setData({ ...data, projects: data.projects.map((x, i) => i === idx ? { ...x, bullets: v } : x) })} />
                <button onClick={() => setData({ ...data, projects: data.projects.filter((x) => x.id !== p.id) })} className="text-[11px] text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Education" action={<button onClick={addEdu} className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline"><Plus className="h-3 w-3" /> Add</button>}>
          {data.education.map((e, idx) => (
            <div key={e.id} className="rounded-xl border border-border bg-background p-3">
              <Grid2>
                <Inp label="School" v={e.school} on={(v) => setData({ ...data, education: data.education.map((x, i) => i === idx ? { ...x, school: v } : x) })} />
                <Inp label="Degree" v={e.degree} on={(v) => setData({ ...data, education: data.education.map((x, i) => i === idx ? { ...x, degree: v } : x) })} />
                <Inp label="Period" v={e.period} on={(v) => setData({ ...data, education: data.education.map((x, i) => i === idx ? { ...x, period: v } : x) })} />
              </Grid2>
              <button onClick={() => setData({ ...data, education: data.education.filter((x) => x.id !== e.id) })} className="mt-1 text-[11px] text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </Card>
      </div>

      <motion.aside initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="sticky top-28 self-start">
        <ResumePreview d={data} />
      </motion.aside>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-noir rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {title}</div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{children}</div>;
}

function Inp({ label, v, on, placeholder, textarea }: { label: string; v: string; on: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea rows={3} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-gold/60" />
      ) : (
        <input value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold/60" />
      )}
    </label>
  );
}

function PolishBtn({ text, context, onResult }: { text: string; context: string; onResult: (v: string) => void }) {
  const m = useMutation({
    mutationFn: async () => (await polishResumeBullets({ data: { text, context } })).bullets,
    onSuccess: (b) => { onResult(b); toast.success("Polished by AI"); },
    onError: (e: any) => toast.error(e.message ?? "AI failed"),
  });
  return (
    <button disabled={!text.trim() || m.isPending} onClick={() => m.mutate()} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] text-gold hover:bg-gold/20 disabled:opacity-50">
      {m.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Polish with AI
    </button>
  );
}

function ResumePreview({ d }: { d: ResumeData }) {
  const bullets = (s: string) => s.split("\n").map((l) => l.replace(/^•\s*/, "").trim()).filter(Boolean);
  return (
    <div id="resume-print" className="rounded-2xl border border-border bg-white p-10 font-mono text-[12px] leading-relaxed text-neutral-900 shadow-2xl shadow-black/40">
      <div className="border-b border-neutral-300 pb-4">
        <h1 className="font-display text-3xl font-semibold not-italic text-neutral-900">{d.full_name || "Your Name"}</h1>
        <p className="text-neutral-600">{d.headline}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-700">
          {d.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {d.email}</span>}
          {d.phone && <span>{d.phone}</span>}
          {d.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.location}</span>}
          {d.links.github && <span className="inline-flex items-center gap-1"><Github className="h-3 w-3" /> {d.links.github.replace(/^https?:\/\//, "")}</span>}
          {d.links.linkedin && <span className="inline-flex items-center gap-1"><Linkedin className="h-3 w-3" /> {d.links.linkedin.replace(/^https?:\/\//, "")}</span>}
          {d.links.website && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {d.links.website.replace(/^https?:\/\//, "")}</span>}
        </div>
      </div>

      {d.summary && (
        <Section title="Summary"><p>{d.summary}</p></Section>
      )}
      {d.skills && (
        <Section title="Skills"><p>{d.skills}</p></Section>
      )}
      {d.experience.length > 0 && (
        <Section title="Experience">
          {d.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div className="font-semibold">{e.role} <span className="font-normal text-neutral-600">· {e.org}</span></div>
                <div className="text-[11px] text-neutral-600">{e.period}</div>
              </div>
              <ul className="ml-4 mt-1 list-disc">{bullets(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}
      {d.projects.length > 0 && (
        <Section title="Projects">
          {d.projects.map((p) => (
            <div key={p.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div className="font-semibold">{p.name} <span className="font-normal text-neutral-600">· {p.stack}</span></div>
                <div className="text-[11px] text-neutral-600">{p.link}</div>
              </div>
              <ul className="ml-4 mt-1 list-disc">{bullets(p.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}
      {d.education.length > 0 && (
        <Section title="Education">
          {d.education.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between">
              <div><span className="font-semibold">{e.school}</span> · {e.degree}</div>
              <div className="text-[11px] text-neutral-600">{e.period}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-2 border-b border-neutral-300 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{title}</div>
      {children}
    </div>
  );
}
