import { Reveal } from "@/components/public/reveal";
import { RichHtml } from "@/components/public/rich-html";
import { stripHtml } from "@/lib/sanitize-html";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  body,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  body?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-mist/70">
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-tight text-balance md:text-5xl">
            {stripHtml(title) || title}
          </h1>
          <RichHtml
            className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground"
            html={subtitle}
          />
          <RichHtml
            className="mt-4 max-w-2xl text-base leading-8 text-foreground/80"
            html={body}
          />
        </Reveal>
      </div>
    </section>
  );
}
