import type { MetadataRoute } from "next"
import { SITE_URL } from "@/constants/site"

/** Only the public pages are crawlable; workspaces, invites and the API are private */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/login", "/signup"], disallow: ["/w/", "/api/", "/invite/", "/onboarding"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
