// Vercel's system URLs are set at build time, so previews still resolve if NEXT_PUBLIC_APP_URL is missing
const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL

/** Public origin without a trailing slash */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/+$/, "")

export const SITE_NAME = "CreatorHub Studio"
export const SITE_TITLE = "CreatorHub Studio | Publish and sell your video content"
export const SITE_DESCRIPTION =
  "The creator portal for CreatorHub: upload and publish paid videos, track revenue and purchases, verify your identity and manage your team, all in one place."

export const OG_IMAGE = {
  url: "/images/creatorhub-og-banner.jpg",
  width: 1200,
  height: 630,
  alt: "CreatorHub Studio: publish videos people pay for",
  type: "image/jpeg",
}

export const FAVICON_SET = "/creatorhub_favicon_set"
