"use client"

import { useEffect, useMemo, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { CountryFlag } from "./CountryFlag"
import { filterCountries, getCountryOptions, type CountryOption } from "./countries"

interface CountryOptionsListProps {
  value?: string
  onSelect: (option: CountryOption) => void
  showCallingCode?: boolean
}

/** Searchable, virtualized country list (~250 rows) shared by country and phone fields */
export function CountryOptionsList({ value, onSelect, showCallingCode }: CountryOptionsListProps) {
  const [search, setSearch] = useState("")
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const options = useMemo(() => filterCountries(getCountryOptions(), search), [search])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => scroller,
    estimateSize: () => 36,
    overscan: 6,
  })

  useEffect(() => {
    if (options.length) virtualizer.scrollToIndex(0)
  }, [search, options.length, virtualizer])

  return (
    <Command shouldFilter={false} className="rounded-xl!">
      <CommandInput value={search} onValueChange={setSearch} placeholder="Search country…" />
      <CommandList className="max-h-none overflow-hidden">
        {options.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-tertiary">No country found.</p>
        ) : (
          <div ref={setScroller} className="h-64 overflow-y-auto p-1">
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((row) => {
                const option = options[row.index]
                const selected = option.code === value
                return (
                  <div
                    key={option.code}
                    className="absolute inset-x-0 top-0"
                    style={{ transform: `translateY(${row.start}px)` }}
                  >
                    <CommandItem
                      value={option.code}
                      onSelect={() => onSelect(option)}
                      className={cn("h-9 gap-2.5 rounded-lg px-2", selected && "font-semibold")}
                    >
                      <CountryFlag country={option.code} />
                      <span className="flex-1 truncate">{option.name}</span>
                      {showCallingCode && <span className="text-xs text-text-tertiary tabular">{option.callingCode}</span>}
                      {selected && <HugeiconsIcon icon={Tick02Icon} size={15} className="text-brand" />}
                    </CommandItem>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CommandList>
    </Command>
  )
}
