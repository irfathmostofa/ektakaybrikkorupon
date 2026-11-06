import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  getLocale,
  isEnglishPath,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function applyLocale(request: NextRequest, response: NextResponse, locale: Locale) {
  response.headers.set("x-locale", locale);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (pathname === "/locale") {
    return NextResponse.next({ request });
  }

  const urlLocale: Locale = isEnglishPath(pathname) ? "en" : defaultLocale;
  const cookieLocale = getLocale(request.cookies.get(localeCookieName)?.value);
  let locale: Locale = urlLocale;

  if (!isAdminRoute && !pathname.startsWith("/api")) {
    const hasCookie = Boolean(request.cookies.get(localeCookieName));
    if (
      hasCookie &&
      cookieLocale === "en" &&
      urlLocale === "bn" &&
      (pathname === "/" || pathname === "")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/en";
      return applyLocale(request, NextResponse.redirect(url), "en");
    }
    locale = urlLocale;
  }

  response = applyLocale(request, response, locale);

  if (!env) {
    if (isAdminRoute && !isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        applyLocale(request, response, locale);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
