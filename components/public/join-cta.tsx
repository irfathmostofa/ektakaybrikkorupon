import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function JoinCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-heading text-3xl">{dict.home.ctaTitle}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{dict.home.ctaBody}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={localizeHref(locale, "/membership")}
            className={buttonVariants({ size: "lg" })}
          >
            {dict.home.ctaJoin}
          </Link>
          <Link
            href={localizeHref(locale, "/donate")}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {dict.home.ctaDonate}
          </Link>
        </div>
      </div>
    </section>
  );
}
