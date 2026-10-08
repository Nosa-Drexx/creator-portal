"use client"

import { forwardRef, useId, useMemo, useState } from "react"
import type { Country } from "react-phone-number-input"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CountryFlag } from "./CountryFlag"
import { CountryOptionsList } from "./CountryOptionsList"
import { getCountryOptions } from "./countries"
import { fieldBase } from "./field-styles"

interface CountrySelectProps {
  value?: string
  onChange: (code: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  id?: string
  "aria-invalid"?: boolean
}

export const CountrySelect = forwardRef<HTMLButtonElement, CountrySelectProps>(function CountrySelect(
  { value, onChange, onBlur, placeholder = "Select country", className, ...props },
  ref,
) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const selected = useMemo(() => getCountryOptions().find((o) => o.code === value), [value])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(fieldBase, "flex items-center gap-2.5 text-left", className)}
          {...props}
        >
          {selected ? (
            <>
              <CountryFlag country={selected.code as Country} />
              <span className="flex-1 truncate">{selected.name}</span>
            </>
          ) : (
            <span className="flex-1 truncate text-text-tertiary">{placeholder}</span>
          )}
          <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="shrink-0 text-text-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent id={listId} align="start" className="w-(--radix-popover-trigger-width) min-w-[280px] p-0">
        <CountryOptionsList
          value={value}
          onSelect={(option) => {
            onChange(option.code)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
})
