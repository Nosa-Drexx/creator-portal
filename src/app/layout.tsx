import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers/Providers"
import { FAVICON_SET, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/constants/site"
import { fontVariables } from "./fonts"
import "./globals.css"

// Declaring `icons` overrides file-based icons; app/favicon.ico is kept identical to the set's
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["creator portal", "sell videos", "video monetization", "creator analytics", "paid video", "CreatorHub"],
  category: "business",
  icons: {
    icon: [
      { url: `${FAVICON_SET}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${FAVICON_SET}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
    ],
    shortcut: `${FAVICON_SET}/android-chrome-192x192.png`,
    apple: `${FAVICON_SET}/apple-touch-icon.png`,
  },
  manifest: `${FAVICON_SET}/site.webmanifest`,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [OG_IMAGE],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0c" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
