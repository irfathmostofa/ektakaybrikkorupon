import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import {
  Fraunces,
  Geist_Mono,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
  Source_Sans_3,
} from "next/font/google";
import { DocumentLang } from "@/components/document-lang";
import { Toaster } from "@/components/ui/sonner";
import { getPublicSiteSettings } from "@/lib/cache";
import { defaultLocale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getSiteUrl } from "@/lib/payments/site-url";
import { absoluteAsset, buildMetadata } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-bangla-serif",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bangla-sans",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2f5d3a",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const locale = defaultLocale;
  const name = pickLocalized(
    locale,
    settings.foundation_name,
    settings.foundation_name_en,
  );
  const title =
    pickLocalized(locale, settings.meta_title, settings.meta_title_en) || name;
  const description = pickLocalized(
    locale,
    settings.meta_description,
    settings.meta_description_en,
  );
  const seo = await buildMetadata({
    title,
    description,
    path: "/",
    locale,
    image: settings.logo_url,
  });

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${name}`,
    },
    description: seo.description,
    verification: settings.google_site_verification_code
      ? { google: settings.google_site_verification_code }
      : undefined,
    openGraph: {
      type: "website",
      locale: seo.openGraph?.locale,
      siteName: name,
      title,
      description: seo.description ?? undefined,
      images: seo.openGraph?.images,
    },
    twitter: seo.twitter,
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/icon", type: "image/png", sizes: "32x32" },
        {
          url: settings.favicon_url
            ? absoluteAsset(settings.favicon_url)
            : "/api/site-icon",
        },
      ],
      shortcut: "/api/site-icon",
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      dir="ltr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fraunces.variable} ${sourceSans.variable} ${notoSerifBengali.variable} ${notoSansBengali.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/api/site-icon" />
        <link rel="shortcut icon" href="/api/site-icon" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;document.documentElement.lang=(p==="/en"||p.indexOf("/en/")===0)?"en":"${defaultLocale}"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <DocumentLang />
        </Suspense>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
