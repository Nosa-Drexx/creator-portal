"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CameraStatus = "idle" | "starting" | "live" | "denied" | "unsupported" | "error"

/** Front camera stream that always releases the device when the component hides or unmounts */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>("idle")

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus((s) => (s === "live" || s === "starting" ? "idle" : s))
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported")
      return
    }
    setStatus("starting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setStatus("live")
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ""
      setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error")
    }
  }, [])

  /** Square, mirrored JPEG of the current frame */
  const capture = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const size = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9))
    return blob ? new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" }) : null
  }, [])

  useEffect(() => stop, [stop])

  return { videoRef, status, start, stop, capture }
}
