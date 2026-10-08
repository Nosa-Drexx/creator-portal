"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image02Icon } from "@hugeicons/core-free-icons"
import { useSignedUrl } from "@/hooks/use-signed-url"
import { cn } from "@/lib/utils"

interface S3ImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined
  /** Wrapper classes; the image fills it */
  containerClassName?: string
  zoomOnHover?: boolean
  fallback?: React.ReactNode
}

/**
 * Renders storage keys (via short-lived signed URLs), public paths and blob:
 * previews the same way, with a shimmer while loading and a fallback on error.
 */
export function S3Image({
  src,
  alt,
  className,
  containerClassName,
  zoomOnHover,
  fallback,
  sizes = "(max-width: 768px) 50vw, 320px",
  ...props
}: S3ImageProps) {
  const { signedUrl, isLoading, isError } = useSignedUrl(src)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showFallback = !src || isError || failed

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      {!showFallback && (!loaded || isLoading) && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
        </div>
      )}
      {showFallback
        ? (fallback ?? (
            <div className="absolute inset-0 grid place-items-center text-text-tertiary">
              <HugeiconsIcon icon={Image02Icon} size={22} />
            </div>
          ))
        : signedUrl && (
            <Image
              src={signedUrl}
              alt={alt}
              fill
              sizes={sizes}
              // Signed URLs expire, so caching optimized copies of them is wasted work
              unoptimized={!signedUrl.startsWith("/") || signedUrl.startsWith("/api/")}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={cn(
                "object-cover transition-opacity duration-500 ease-out-soft",
                loaded ? "opacity-100" : "opacity-0",
                zoomOnHover && "img-hover-zoom",
                className,
              )}
              {...props}
            />
          )}
    </div>
  )
}
