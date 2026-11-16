import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["ar", "en"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const pref = req.cookies.get("lang")?.value;
  const locale = pref && LOCALES.includes(pref) ? pref : "ar";
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

// Skip admin, API, Next internals and static files.
export const config = { matcher: ["/((?!api|admin|_next|img|uploads|icon.svg|favicon.ico|robots.txt|sitemap.xml).*)"] };
