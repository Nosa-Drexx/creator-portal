import type { EUploadKind } from "@/enums/uploads"

export interface UploadIntentPayload {
  kind: EUploadKind
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface UploadIntent {
  key: string
  uploadUrl: string
  method: "PUT"
  headers: Record<string, string>
  expiresAt: string
}
