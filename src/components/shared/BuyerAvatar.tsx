import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const HUES = [18, 42, 160, 200, 230, 280, 330]

/** Stable, soft colour per buyer so lists are easy to scan */
export function BuyerAvatar({ name, className }: { name: string; className?: string }) {
  const hue = HUES[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % HUES.length]
  return (
    <span
      className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold", className)}
      style={{ backgroundColor: `oklch(0.94 0.04 ${hue})`, color: `oklch(0.42 0.1 ${hue})` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
