import { Suspense } from "react";
import { DonationForm } from "@/components/public/donation-form";
import { PageHero } from "@/components/public/page-hero";
import { getPublishedCauses } from "@/lib/content/public";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, dict } = await getRequestDictionary();
  return buildMetadata({
    title: dict.donate.title,
    description: dict.donate.subtitle,
    path: "/donate",
    locale,
  });
}

function DonateFormFallback() {
  return <div className="h-96 rounded-2xl bg-muted" />;
}

async function DonateFormFromParams({
  searchParams,
}: {
  searchParams: Promise<{ cause?: string }>;
}) {
  const { locale, dict } = await getRequestDictionary();
  const [{ cause }, causes] = await Promise.all([
    searchParams,
    getPublishedCauses(),
  ]);
  const initialCauseId =
    causes.find((item) => item.id === cause || item.slug === cause)?.id ?? null;

  return (
    <DonationForm
      causes={causes.filter((item) => item.status === "active")}
      locale={locale}
      dict={dict}
      initialCauseId={initialCauseId}
    />
  );
}

export default function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ cause?: string }>;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-64 bg-mist/70" />}>
        <DonateHero />
      </Suspense>
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Suspense
          fallback={
            <>
              <div className="space-y-4">
                <div className="h-24 rounded-xl bg-muted" />
              </div>
              <DonateFormFallback />
            </>
          }
        >
          <DonateCopy />
          <DonateFormFromParams searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function DonateHero() {
  const { dict } = await getRequestDictionary();
  return (
    <PageHero
      eyebrow={dict.donate.eyebrow}
      title={dict.donate.title}
      subtitle={dict.donate.subtitle}
    />
  );
}

async function DonateCopy() {
  const { dict } = await getRequestDictionary();
  return (
    <div className="space-y-4 leading-7 text-muted-foreground">
      <p>{dict.brand.conservation}</p>
      <p>{dict.donate.secureNote}</p>
    </div>
  );
}
