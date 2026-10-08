import { NextResponse, type NextRequest } from "next/server"
import { DEMO_COOKIES } from "@/constants/demo"

const AUTH_PAGES = ["/login", "/signup"]

/**
 * Optimistic redirects only: checks the session cookie exists. The API
 * validates the session on every request, so a stale cookie still gets a 401.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = request.cookies.has(DEMO_COOKIES.session)
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (!hasSession && !isAuthPage) {
    const url = new URL("/login", request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }
  if (hasSession && isAuthPage) return NextResponse.redirect(new URL("/", request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|seed|images|creatorhub_favicon_set|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|ico|mp4|woff2|webmanifest)$).*)",
  ],
}
