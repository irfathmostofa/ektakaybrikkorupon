import { Suspense } from "react";
import { JoinCta } from "@/components/public/join-cta";
import { JsonLd } from "@/components/public/json-ld";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicSiteSettings } from "@/lib/cache";
import { getRequestDictionary } from "@/lib/i18n/server";
import { organizationJsonLd } from "@/lib/seo";

function PublicHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/55 backdrop-blur-sm">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-6">
        <div className="h-9 w-40 rounded-full bg-muted" />
        <div className="h-9 w-48 rounded-full bg-muted" />
      </div>
    </header>
  );
}

function PublicFooterFallback() {
  return (
    <footer className="mt-auto bg-canopy text-canopy-foreground">
      <div className="mx-auto h-64 w-full max-w-6xl" />
    </footer>
  );
}

function PublicPageFallback() {
  return <div className="flex min-h-[60vh] flex-1 flex-col" />;
}

async function PublicTop() {
  const settings = await getPublicSiteSettings();
  const { locale, dict } = await getRequestDictionary();

  return (
    <>
      <JsonLd data={organizationJsonLd(locale, settings)} />
      <a href="#main-content" className="skip-link">
        {dict.nav.skipToContent}
      </a>
      <SiteHeader settings={settings} locale={locale} dict={dict} />
    </>
  );
}

async function PublicBottom() {
  const settings = await getPublicSiteSettings();
  const { locale, dict } = await getRequestDictionary();

  return (
    <>
      <JoinCta locale={locale} dict={dict} />
      <SiteFooter settings={settings} locale={locale} dict={dict} />
    </>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<PublicHeaderFallback />}>
        <PublicTop />
      </Suspense>
      <main id="main-content" className="flex flex-1 flex-col">
        <Suspense fallback={<PublicPageFallback />}>
          {children}
        </Suspense>
      </main>
      <Suspense fallback={<PublicFooterFallback />}>
        <PublicBottom />
      </Suspense>
    </div>
  );
}
