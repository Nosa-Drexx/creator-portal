/** Reads duration in the browser, so creators get instant feedback before upload finishes */
export function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)
    const done = (value: number | null) => {
      URL.revokeObjectURL(url)
      resolve(value)
    }
    video.preload = "metadata"
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : null)
    video.onerror = () => done(null)
    video.src = url
  })
}

/** Grabs a JPEG frame from a playable video URL */
export function captureVideoFrame(src: string, atSeconds = 1): Promise<File | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"
    video.preload = "auto"
    video.onloadeddata = () => {
      video.currentTime = Math.min(atSeconds, Math.max(0, video.duration / 2))
    }
    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      canvas.width = Math.min(video.videoWidth, 1280)
      canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight)
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], "video-frame.jpg", { type: "image/jpeg" }) : null),
        "image/jpeg",
        0.86,
      )
    }
    video.onerror = () => resolve(null)
    video.src = src
  })
}
