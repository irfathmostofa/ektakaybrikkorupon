import Link from "next/link";
import { notFound } from "next/navigation";
import { JobForm } from "@/components/public/job-form";
import { PageHero } from "@/components/public/page-hero";
import { RichHtml } from "@/components/public/rich-html";
import { getJobBySlug } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate, isPastDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const job = await getJobBySlug(slug);
  if (!job) {
    return {};
  }
  const location = pickLocalized(locale, job.location, job.location_en);
  const department = pickLocalized(locale, job.department, job.department_en);
  return buildMetadata({
    title: pickLocalized(locale, job.title, job.title_en),
    description:
      pickLocalized(locale, job.description, job.description_en) ||
      [department, location, dict.careers.types[job.employment_type]]
        .filter(Boolean)
        .join(" · "),
    path: `/careers/${job.slug}`,
    locale,
  });
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const job = await getJobBySlug(slug);
  if (!job) {
    notFound();
  }
  const expired = isPastDate(job.deadline);

  return (
    <>
      <PageHero
        eyebrow={pickLocalized(locale, job.department, job.department_en)}
        title={pickLocalized(locale, job.title, job.title_en)}
        subtitle={`${pickLocalized(locale, job.location, job.location_en)} · ${dict.careers.types[job.employment_type]}`}
        body={
          job.deadline
            ? `${dict.careers.deadline}: ${formatDate(locale, job.deadline)}`
            : undefined
        }
      />
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <article>
          <Link
            href={localizeHref(locale, "/careers")}
            className="text-sm text-primary"
          >
            {dict.actions.backToCareers}
          </Link>
          <RichHtml
            className="mt-8 text-base leading-8"
            html={pickLocalized(locale, job.description, job.description_en)}
          />
          <h2 className="mt-10 font-heading text-2xl">{dict.careers.requirements}</h2>
          <RichHtml
            className="mt-4 text-base leading-8"
            html={pickLocalized(locale, job.requirements, job.requirements_en)}
          />
        </article>
        <div>
          <h2 className="mb-4 font-heading text-2xl">{dict.careers.applyTitle}</h2>
          {expired ? (
            <p className="rounded-2xl border border-border bg-muted px-5 py-6 text-sm">
              {dict.careers.expired}
            </p>
          ) : (
            <JobForm jobId={job.id} locale={locale} dict={dict} />
          )}
        </div>
      </section>
    </>
  );
}
