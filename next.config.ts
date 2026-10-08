import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: { position: "bottom-right" },
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Migrations are read at runtime by the auto-setup on first request
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/server/db/migrations/**/*"],
  },
  images: {
    localPatterns: [
      { pathname: "/seed/**", search: "" },
      { pathname: "/api/media/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
