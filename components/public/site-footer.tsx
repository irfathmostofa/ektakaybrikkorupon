import { Suspense } from "react";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { CopyrightYear } from "@/components/public/copyright-year";
import { PUBLIC_NAV } from "@/lib/constants";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { pickLocalized, type Dictionary } from "@/lib/i18n/dictionary";
import type { PublicSiteSettings } from "@/lib/types/database";

export function SiteFooter({
  settings,
  locale,
  dict,
}: {
  settings: PublicSiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const name = pickLocalized(
    locale,
    settings.foundation_name,
    settings.foundation_name_en,
  );
  const address = pickLocalized(locale, settings.address, settings.address_en);
  const socials = Object.entries(settings.social_links ?? {}).filter(
    ([, url]) => Boolean(url),
  );
  const links = PUBLIC_NAV.filter((item) => settings.visibility[item.key] !== false);
  const mid = Math.ceil(links.length / 2);
  const leftLinks = links.slice(0, mid);
  const rightLinks = links.slice(mid);

  return (
    <footer className="mt-auto bg-canopy text-canopy-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="flex items-center gap-2 font-heading text-lg">
            <Leaf className="size-4 text-accent" />
            {name}
          </p>
          <p className="max-w-sm text-sm leading-7 text-canopy-foreground/80">
            {dict.brand.conservation}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-70">
            {dict.footer.explore}
          </p>
          <nav className="mt-4 grid gap-2 text-sm">
            {leftLinks.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(locale, item.href)}
                className="text-canopy-foreground/80 hover:text-canopy-foreground"
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-70">
            {dict.footer.pages}
          </p>
          <nav className="mt-4 grid gap-2 text-sm">
            {rightLinks.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(locale, item.href)}
                className="text-canopy-foreground/80 hover:text-canopy-foreground"
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-70">
            {dict.nav.contact}
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {address ? (
              <p className="text-canopy-foreground/80">{address}</p>
            ) : null}
            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="text-canopy-foreground/80 hover:text-canopy-foreground"
              >
                {settings.contact_email}
              </a>
            ) : null}
            {settings.contact_phone ? (
              <span className="text-canopy-foreground/80">{settings.contact_phone}</span>
            ) : null}
            {socials.map(([network, url]) => (
              <a
                key={network}
                href={url}
                className="capitalize text-canopy-foreground/80 hover:text-canopy-foreground"
              >
                {network}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl justify-between px-6 py-5 text-xs text-canopy-foreground/65">
          <span>
            <Suspense fallback="2026">
              <CopyrightYear />
            </Suspense>{" "}
            {name}. {dict.footer.rights}.
          </span>
          <span>{dict.brand.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
