"use client";

import { Menu, Sprout, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { localizeHref, stripLocalePrefix, type Locale } from "@/lib/i18n/config";
import type { PublicSiteSettings } from "@/lib/types/database";

export function SiteHeader({
  settings,
  locale,
  dict,
}: {
  settings: PublicSiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() || "/";
  const current = stripLocalePrefix(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const name = pickLocalized(
    locale,
    settings.foundation_name,
    settings.foundation_name_en,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "border-b border-border bg-background/92 backdrop-blur-md"
          : "border-b border-transparent bg-background/55 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href={localizeHref(locale, "/")}
          className="flex min-w-0 items-center gap-2.5 text-canopy"
        >
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={name}
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sprout className="size-4" />
            </span>
          )}
          <span className="truncate font-heading text-base font-semibold tracking-tight">
            {name}
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm lg:flex xl:gap-5">
          {PUBLIC_NAV.map((item) => {
            const href = localizeHref(locale, item.href);
            const active =
              current === item.href || current.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap transition-colors ${
                  active
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dict.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {/* <Link
            href={localizeHref(locale, "/membership")}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} hidden md:inline-flex`}
          >
            {dict.nav.becomeMember}
          </Link> */}
          <Link
            href={localizeHref(locale, "/donate")}
            className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
          >
            {dict.nav.donate}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-6 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(locale, item.href)}
                className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                {dict.nav[item.key]}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {/* <Link
                href={localizeHref(locale, "/membership")}
                className={`${buttonVariants({ variant: "outline" })} flex-1`}
              >
                {dict.nav.becomeMember}
              </Link> */}
              <Link
                href={localizeHref(locale, "/donate")}
                className={`${buttonVariants()} flex-1`}
              >
                {dict.nav.donate}
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
