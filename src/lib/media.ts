/** Values usable as-is: absolute URLs, blob: previews and files under /public */
export const isPublicPath = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("blob:") ||
  value.startsWith("data:") ||
  value.startsWith("/")
