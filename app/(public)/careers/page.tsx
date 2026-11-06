import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { Badge } from "@/components/ui/badge";
import { getJobPostings, getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate, isPastDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("careers");
}

export default async function CareersPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, jobs] = await Promise.all([
    getPageContent("careers"),
    getJobPostings(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.careers.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {jobs.length === 0 ? (
          <EmptyState message={dict.careers.empty} />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const expired = isPastDate(job.deadline);
              return (
                <Link
                  key={job.id}
                  href={localizeHref(locale, `/careers/${job.slug}`)}
                  className="block rounded-2xl border border-border bg-card p-6 hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-xl">
                      {pickLocalized(locale, job.title, job.title_en)}
                    </h2>
                    <Badge variant={expired ? "outline" : "secondary"}>
                      {expired
                        ? dict.careers.expired
                        : dict.careers.types[job.employment_type]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pickLocalized(locale, job.department, job.department_en)} ·{" "}
                    {pickLocalized(locale, job.location, job.location_en)}
                    {job.deadline
                      ? ` · ${dict.careers.deadline}: ${formatDate(locale, job.deadline)}`
                      : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
