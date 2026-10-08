export const ACCENT_COLORS = [
  { value: "#e5562b", label: "Ember" },
  { value: "#3355ff", label: "Cobalt" },
  { value: "#1d8a52", label: "Moss" },
  { value: "#8b5cf6", label: "Iris" },
  { value: "#db2777", label: "Rose" },
  { value: "#0e9fb5", label: "Lagoon" },
  { value: "#b7791f", label: "Ochre" },
  { value: "#1f1f1d", label: "Ink" },
] as const

export const MAX_WORKSPACES_PER_USER = 10

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}
