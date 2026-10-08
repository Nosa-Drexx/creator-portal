/** Every deployment sets NEXT_PUBLIC_APP_URL to its own origin so social previews resolve */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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
