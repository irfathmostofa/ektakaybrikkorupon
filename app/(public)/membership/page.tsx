import { EmptyState } from "@/components/public/empty-state";
import { MembershipForm } from "@/components/public/membership-form";
import { PageHero } from "@/components/public/page-hero";
import { getMembershipPlans, getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatCurrency } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("membership");
}

export default async function MembershipPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, plans] = await Promise.all([
    getPageContent("membership"),
    getMembershipPlans(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.membership.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-heading text-2xl">{dict.membership.plans}</h2>
          {plans.length === 0 ? (
            <div className="mt-6">
              <EmptyState message={dict.membership.emptyPlans} />
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-heading text-xl">
                      {pickLocalized(locale, plan.name, plan.name_en)}
                    </h3>
                    <p className="text-sm text-primary">
                      {formatCurrency(locale, Number(plan.fee_amount))} ·{" "}
                      {pickLocalized(
                        locale,
                        plan.duration_label,
                        plan.duration_label_en,
                      )}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {pickLocalized(locale, plan.description, plan.description_en)}
                  </p>
                  <p className="mt-3 text-sm">{pickLocalized(locale, plan.benefits, plan.benefits_en)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-4 font-heading text-2xl">{dict.membership.formTitle}</h2>
          <MembershipForm plans={plans} locale={locale} dict={dict} />
        </div>
      </section>
    </>
  );
}
