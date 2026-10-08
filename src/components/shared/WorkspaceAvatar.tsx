import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

interface WorkspaceAvatarProps {
  name: string
  color: string
  className?: string
}

export function WorkspaceAvatar({ name, color, className }: WorkspaceAvatarProps) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[9px] text-[12px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-1px_0_rgb(0_0_0/0.12)]",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
