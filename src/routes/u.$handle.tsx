import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Github, Trophy, ExternalLink, MapPin, Star, GitFork, Linkedin, Globe, Code2 } from "lucide-react";
import { getDevProfileByHandle } from "@/lib/dev-profile.functions";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/u/$handle")({
  loader: async ({ params }) => {
    const { profile } = await getDevProfileByHandle({ data: { handle: params.handle } });
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.profile
      ? [
          { title: `${loaderData.profile.display_name ?? loaderData.profile.handle} — Campus X report card` },
          { name: "description", content: loaderData.profile.headline ?? loaderData.profile.bio ?? "Builder report card on Campus X." },
          { property: "og:title", content: `${loaderData.profile.display_name ?? loaderData.profile.handle} on Campus X` },
          { property: "og:description", content: loaderData.profile.headline ?? "Builder report card on Campus X." },
        ]
      : [{ title: "Report card — Campus X" }],
  }),
  errorComponent: () => (
    <MarketingLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Card not found</h1>
        <p className="mt-3 text-muted-foreground">This builder hasn't published their report card yet.</p>
        <Link to="/" className="btn-ghost mt-8 inline-flex">Back home</Link>
      </div>
    </MarketingLayout>
  ),
  notFoundComponent: () => (
    <MarketingLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Card not found</h1>
        <Link to="/" className="btn-ghost mt-8 inline-flex">Back home</Link>
      </div>
    </MarketingLayout>
  ),
  component: PublicCard,
});

function PublicCard() {
  const { profile } = Route.useLoaderData();
  const gh: any = profile.github_data;
  const cf: any = profile.codeforces_data;

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="card-noir rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {gh?.avatar_url && (
              <img src={gh.avatar_url} alt={profile.display_name ?? profile.handle} className="h-24 w-24 rounded-2xl border border-border" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Campus X builder</div>
              <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
                {profile.display_name ?? profile.handle}
              </h1>
              {profile.headline && (
                <p className="mt-2 italic-serif text-lg text-gold">{profile.headline}</p>
              )}
              {profile.location && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {profile.location}
                </div>
              )}
            </div>
          </div>

          {profile.bio && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.github_username && (
              <LinkPill href={`https://github.com/${profile.github_username}`} icon={<Github className="h-3.5 w-3.5" />} label={`@${profile.github_username}`} />
            )}
            {profile.codeforces_handle && (
              <LinkPill href={`https://codeforces.com/profile/${profile.codeforces_handle}`} icon={<Trophy className="h-3.5 w-3.5" />} label={profile.codeforces_handle} />
            )}
            {profile.leetcode_url && <LinkPill href={profile.leetcode_url} icon={<Code2 className="h-3.5 w-3.5" />} label="LeetCode" />}
            {profile.linkedin_url && <LinkPill href={profile.linkedin_url} icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />}
            {profile.portfolio_url && <LinkPill href={profile.portfolio_url} icon={<Globe className="h-3.5 w-3.5" />} label="Portfolio" />}
          </div>
        </div>

        {(gh || cf) && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {gh && (
              <div className="card-noir rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Github className="h-3 w-3" /> GitHub</div>
                <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border text-center">
                  <Stat label="Repos" value={gh.public_repos ?? 0} />
                  <Stat label="Followers" value={gh.followers ?? 0} />
                  <Stat label="Following" value={gh.following ?? 0} />
                </div>
                <div className="mt-4 space-y-2">
                  {gh.top_repos?.map((r: any) => (
                    <a key={r.name} href={r.html_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-background p-3 text-sm hover:border-gold/40">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.name}</span>
                        <span className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{r.stars}</span>
                          <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" />{r.forks}</span>
                        </span>
                      </div>
                      {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {cf && (
              <div className="card-noir rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-3 w-3" /> Codeforces</div>
                <div className="mt-2 font-display text-xl">
                  {cf.handle} · <span className="italic-serif text-gold">{cf.rank ?? "unrated"}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border text-center">
                  <Stat label="Rating" value={cf.rating ?? "—"} />
                  <Stat label="Max" value={cf.maxRating ?? "—"} />
                  <Stat label="Contests" value={cf.contests_count ?? 0} />
                </div>
                {cf.recent_contests?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {cf.recent_contests.map((c: any) => (
                      <div key={c.name} className="rounded-lg border border-border bg-background p-3 text-xs">
                        <div className="truncate">{c.name}</div>
                        <div className="mt-1 flex justify-between text-muted-foreground">
                          <span>Rank #{c.rank}</span>
                          <span>{c.oldRating} → <span className="text-gold">{c.newRating}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {profile.synced_at && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Auto-synced {new Date(profile.synced_at).toLocaleDateString()}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg">{value}</div>
    </div>
  );
}

function LinkPill({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-gold/40">
      {icon} {label} <ExternalLink className="h-3 w-3 text-muted-foreground" />
    </a>
  );
}
