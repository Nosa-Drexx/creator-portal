/**
 * Reads duration in the browser, so creators get instant feedback before upload finishes.
 * Resolves null on unsupported codecs, and after a timeout (background tabs may never load media).
 */
export function readVideoDuration(file: File, timeoutMs = 8_000): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)
    const timer = setTimeout(() => done(null), timeoutMs)
    const done = (value: number | null) => {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve(value)
    }
    video.preload = "metadata"
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : null)
    video.onerror = () => done(null)
    video.src = url
  })
}

function canvasToFile(source: CanvasImageSource, width: number, height: number): Promise<File | null> {
  const canvas = document.createElement("canvas")
  canvas.width = Math.min(width, 1280)
  canvas.height = Math.round((canvas.width / width) * height)
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? new File([blob], "video-frame.jpg", { type: "image/jpeg" }) : null), "image/jpeg", 0.86),
  )
}

/** Captures exactly what the player is showing right now */
export function captureCurrentFrame(video: HTMLVideoElement): Promise<File | null> {
  if (video.readyState < 2 || !video.videoWidth) return Promise.resolve(null)
  try {
    return canvasToFile(video, video.videoWidth, video.videoHeight)
  } catch {
    return Promise.resolve(null)
  }
}

/** Grabs a JPEG frame from a playable video URL at a given time (used when no player is ready) */
export function captureVideoFrame(src: string, atSeconds = 1): Promise<File | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"
    video.preload = "auto"
    video.onloadeddata = () => {
      video.currentTime = Math.min(atSeconds, video.duration || atSeconds)
    }
    video.onseeked = () => void canvasToFile(video, video.videoWidth, video.videoHeight).then(resolve)
    video.onerror = () => resolve(null)
    video.src = src
  })
}
