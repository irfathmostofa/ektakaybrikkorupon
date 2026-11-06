import { ContactForm } from "@/components/public/contact-form";
import { PageHero } from "@/components/public/page-hero";
import { getPublicSiteSettings } from "@/lib/cache";
import { getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("contact");
}

export default async function ContactPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, settings] = await Promise.all([
    getPageContent("contact"),
    getPublicSiteSettings(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.contact.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-secondary/50 p-6 leading-7">
          <p>{pickLocalized(locale, settings.address, settings.address_en)}</p>
          {settings.contact_email ? <p>{settings.contact_email}</p> : null}
          {settings.contact_phone ? <p>{settings.contact_phone}</p> : null}
        </div>
        <div>
          <h2 className="mb-4 font-heading text-2xl">{dict.contact.formTitle}</h2>
          <ContactForm dict={dict} locale={locale} />
        </div>
      </section>
    </>
  );
}
