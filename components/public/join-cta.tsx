import Link from "next/link";
import { RichHtml } from "@/components/public/rich-html";
import { buttonVariants } from "@/components/ui/button";
import { getHomeSections } from "@/lib/content/public";
import { localizeHomeSections } from "@/lib/content/home-sections";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

export async function JoinCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const home = localizeHomeSections(locale, await getHomeSections());

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-heading text-3xl">{home.cta.title || dict.home.ctaTitle}</h2>
          <RichHtml
            className="mt-3 max-w-2xl text-muted-foreground"
            html={home.cta.body || dict.home.ctaBody}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={localizeHref(locale, "/membership")}
            className={buttonVariants({ size: "lg" })}
          >
            {home.cta.joinLabel || dict.home.ctaJoin}
          </Link>
          <Link
            href={localizeHref(locale, "/donate")}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {home.cta.donateLabel || dict.home.ctaDonate}
          </Link>
        </div>
      </div>
    </section>
  );
}
