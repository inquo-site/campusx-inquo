import { motion } from "motion/react";
import { Quote } from "lucide-react";

export function TestimonialsShowcase() {
  return (
    <section className="relative px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Success stories
          </div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Real stories, <span className="italic-serif">soon.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="card-noir card-noir-hover mx-auto max-w-3xl rounded-3xl p-10 text-center md:p-14"
        >
          <Quote className="mx-auto h-6 w-6 text-gold" />
          <p className="mt-6 font-display text-2xl leading-snug md:text-3xl">
            Real success stories coming as students{" "}
            <span className="italic-serif">land jobs.</span>
          </p>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            We won't invent quotes or logos. Every story published here will come
            from a Tier2X student who actually got the offer.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
