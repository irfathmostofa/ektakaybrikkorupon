import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/payments/site-url";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/locale",
          "/donate/success",
          "/donate/fail",
          "/donate/cancel",
          "/en/donate/success",
          "/en/donate/fail",
          "/en/donate/cancel",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
