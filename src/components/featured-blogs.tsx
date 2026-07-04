import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowUpRight, Clock } from "lucide-react";
import { listFeaturedBlogs } from "@/lib/blog.functions";

export function FeaturedBlogsSection() {
  const { data } = useQuery({
    queryKey: ["blogs", "featured"],
    queryFn: () => listFeaturedBlogs(),
    staleTime: 60_000,
  });
  const posts = data ?? [];
  if (posts.length === 0) return null;

  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— From the journal</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Fresh <span className="italic-serif">reads</span> for builders.
            </h2>
          </div>
          <Link to="/blog" className="btn-ghost group">
            All posts
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="card-noir card-noir-hover group flex h-full flex-col overflow-hidden rounded-2xl"
              >
                {p.cover_image ? (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-gradient-to-br from-gold/10 via-surface to-background" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  {p.tags && p.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 3).map((t: string) => (
                        <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-display text-xl leading-snug">{p.title}</h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {p.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>{p.author_name || "Campus X"}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.read_minutes} min
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
