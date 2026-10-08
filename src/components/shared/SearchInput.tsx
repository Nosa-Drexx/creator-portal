"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Local state keeps typing instant; the parent only hears about it after 300ms */
export function SearchInput({ value, onChange, placeholder = "Search", className }: SearchInputProps) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)
  const { debounced, cancel } = useDebouncedCallback(onChange, 300)

  // Adopt external resets (e.g. "Clear filters") without an effect
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  const clear = () => {
    cancel()
    setDraft("")
    onChange("")
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <HugeiconsIcon icon={Search01Icon} size={16} className="pointer-events-none absolute left-3 text-text-tertiary" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => {
          setDraft(e.target.value)
          debounced(e.target.value.trim())
        }}
        onKeyDown={(e) => e.key === "Escape" && draft && clear()}
        className="h-10 w-full rounded-[10px] border border-stroke-strong bg-surface pr-9 pl-9 text-[16px] text-text-primary shadow-[0_1px_1px_rgb(0_0_0/0.03)] transition-[border-color,box-shadow] outline-none placeholder:text-text-tertiary focus:border-brand/50 focus:ring-3 focus:ring-brand/15 sm:h-9 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-1.5 grid size-7 animate-pop place-items-center rounded-md text-text-tertiary transition-colors hover:bg-muted hover:text-text-primary"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </button>
      )}
    </div>
  )
}
