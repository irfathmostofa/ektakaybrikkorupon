import { EmptyState } from "@/components/public/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { getFinanceEntries, getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatCurrency, formatDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";
import type { FinanceEntry } from "@/lib/types/database";

function Ledger({
  title,
  rows,
  locale,
  dict,
  amountClass,
}: {
  title: string;
  rows: FinanceEntry[];
  locale: "bn" | "en";
  dict: Awaited<ReturnType<typeof getRequestDictionary>>["dict"];
  amountClass: string;
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{dict.transparency.date}</th>
              <th className="px-4 py-3 font-medium">{dict.transparency.title}</th>
              <th className="px-4 py-3 font-medium">{dict.transparency.category}</th>
              <th className="px-4 py-3 font-medium">{dict.transparency.amount}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(locale, row.entry_date)}
                </td>
                <td className="px-4 py-3">
                  <p>{pickLocalized(locale, row.title, row.title_en)}</p>
                  {row.receipt_url ? (
                    <a href={row.receipt_url} className="text-xs text-primary">
                      {dict.transparency.receipt}
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {pickLocalized(
                    locale,
                    row.category?.name,
                    row.category?.name_en,
                  ) || row.source_or_payee}
                </td>
                <td className={`px-4 py-3 font-medium ${amountClass}`}>
                  {formatCurrency(locale, Number(row.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return pageMetadata("transparency");
}

export default async function TransparencyPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, entries] = await Promise.all([
    getPageContent("transparency"),
    getFinanceEntries(),
  ]);
  const copy = localizePage(locale, page);
  const collections = entries.filter((item) => item.kind === "collection");
  const expenses = entries.filter((item) => item.kind === "expense");
  const collected = collections.reduce((sum, item) => sum + Number(item.amount), 0);
  const spent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <>
      <PageHero
        eyebrow={dict.transparency.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {entries.length === 0 ? (
          <EmptyState message={dict.transparency.empty} />
        ) : (
          <div className="space-y-12">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  {dict.transparency.collected}
                </p>
                <p className="mt-2 font-heading text-3xl text-primary">
                  {formatCurrency(locale, collected)}
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  {dict.transparency.spent}
                </p>
                <p className="mt-2 font-heading text-3xl text-earth">
                  {formatCurrency(locale, spent)}
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  {dict.transparency.balance}
                </p>
                <p className="mt-2 font-heading text-3xl">
                  {formatCurrency(locale, collected - spent)}
                </p>
              </article>
            </div>
            <p className="text-sm text-muted-foreground">{dict.transparency.currencyNote}</p>
            <Ledger
              title={dict.transparency.collections}
              rows={collections}
              locale={locale}
              dict={dict}
              amountClass="text-primary"
            />
            <Ledger
              title={dict.transparency.expenses}
              rows={expenses}
              locale={locale}
              dict={dict}
              amountClass="text-earth"
            />
          </div>
        )}
      </section>
    </>
  );
}
