"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { validateUploadFile } from "@/constants/uploads"
import type { EUploadKind } from "@/enums/uploads"
import { getApiErrorMessage } from "@/lib/axios"
import { createUploadIntent } from "@/services/api/uploads"
import { useWorkspaceSlug } from "./use-workspace-slug"

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "cancelled"

export interface UploadState {
  status: UploadStatus
  progress: number
  loaded: number
  total: number
  bytesPerSecond: number
  error: string | null
  key: string | null
}

const INITIAL: UploadState = {
  status: "idle",
  progress: 0,
  loaded: 0,
  total: 0,
  bytesPerSecond: 0,
  error: null,
  key: null,
}

function putWithProgress(
  url: string,
  file: File,
  headers: Record<string, string>,
  xhr: XMLHttpRequest,
  onProgress: (loaded: number, total: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    xhr.open("PUT", url)
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded, e.total)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = "Upload failed. Please try again."
      try {
        message = JSON.parse(xhr.responseText)?.error?.message ?? message
      } catch {}
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error("Connection lost during upload. Check your network and retry."))
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"))
    xhr.send(file)
  })
}

/** Two-step upload: ask the API for a signed URL, then PUT the file straight to storage */
export function useFileUpload(kind: EUploadKind) {
  const slug = useWorkspaceSlug()
  const [state, setState] = useState<UploadState>(INITIAL)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const lastFileRef = useRef<File | null>(null)

  useEffect(() => () => xhrRef.current?.abort(), [])

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      lastFileRef.current = file
      const invalid = validateUploadFile(kind, file)
      if (invalid) {
        setState({ ...INITIAL, status: "error", error: invalid })
        return null
      }

      const startedAt = performance.now()
      setState({ ...INITIAL, status: "uploading", total: file.size })

      try {
        const intent = await createUploadIntent(slug, {
          kind,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        })
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr
        await putWithProgress(intent.uploadUrl, file, intent.headers, xhr, (loaded, total) => {
          const seconds = (performance.now() - startedAt) / 1000
          setState((s) => ({
            ...s,
            loaded,
            total,
            progress: Math.min(99, Math.round((loaded / total) * 100)),
            bytesPerSecond: seconds > 0 ? loaded / seconds : 0,
          }))
        })
        setState((s) => ({ ...s, status: "success", progress: 100, loaded: file.size, key: intent.key }))
        return intent.key
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setState({ ...INITIAL, status: "cancelled" })
          return null
        }
        const message =
          error instanceof Error && !("isAxiosError" in error)
            ? error.message
            : getApiErrorMessage(error, "Upload failed. Please try again.")
        setState((s) => ({ ...s, status: "error", error: message }))
        return null
      } finally {
        xhrRef.current = null
      }
    },
    [kind, slug],
  )

  const cancel = useCallback(() => xhrRef.current?.abort(), [])
  const retry = useCallback(() => (lastFileRef.current ? upload(lastFileRef.current) : Promise.resolve(null)), [upload])
  const reset = useCallback(() => {
    xhrRef.current?.abort()
    lastFileRef.current = null
    setState(INITIAL)
  }, [])

  return { ...state, upload, cancel, retry, reset }
}
