import { EUploadKind } from "@/enums/uploads"

const MB = 1024 * 1024

export const UPLOAD_RULES: Record<
  EUploadKind,
  { mimeTypes: string[]; maxBytes: number; label: string }
> = {
  [EUploadKind.Thumbnail]: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * MB,
    label: "JPG, PNG or WebP up to 5MB",
  },
  // Local demo cap; production would use multipart uploads straight to object storage
  [EUploadKind.Video]: {
    mimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
    maxBytes: 500 * MB,
    label: "MP4, MOV or WebM up to 500MB",
  },
  [EUploadKind.Document]: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    maxBytes: 10 * MB,
    label: "JPG, PNG, WebP or PDF up to 10MB",
  },
  [EUploadKind.Selfie]: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * MB,
    label: "JPG, PNG or WebP up to 5MB",
  },
}

export function validateUploadFile(kind: EUploadKind, file: { type: string; size: number }) {
  const rule = UPLOAD_RULES[kind]
  if (!rule.mimeTypes.includes(file.type)) return `Unsupported file type. Use ${rule.label}.`
  if (file.size > rule.maxBytes) return `File is too large. Use ${rule.label}.`
  if (file.size === 0) return "This file is empty."
  return null
}
