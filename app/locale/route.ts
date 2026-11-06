import { NextResponse, type NextRequest } from "next/server";
import {
  getLocale,
  localeCookieName,
  localizeHref,
  stripLocalePrefix,
} from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  const locale = getLocale(request.nextUrl.searchParams.get("locale"));
  const rawNext = request.nextUrl.searchParams.get("next") || "/";
  const nextPath = stripLocalePrefix(
    rawNext.startsWith("/") ? rawNext : `/${rawNext}`,
  );
  const target = new URL(localizeHref(locale, nextPath), request.url);
  target.search = "";

  const response = NextResponse.redirect(target);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
