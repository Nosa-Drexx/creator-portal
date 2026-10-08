"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

type PageToken = number | "ellipsis-start" | "ellipsis-end"

function pageTokens(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const tokens: PageToken[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) tokens.push("ellipsis-start")
  for (let p = start; p <= end; p++) tokens.push(p)
  if (end < total - 1) tokens.push("ellipsis-end")
  tokens.push(total)
  return tokens
}

export function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: CustomPaginationProps) {
  if (totalItems === 0) return null
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-between gap-3", className)}>
      <p className="text-[13px] text-text-tertiary tabular">
        <span className="max-sm:hidden">
          Showing <span className="font-semibold text-text-secondary">{formatNumber(from)}–{formatNumber(to)}</span> of{" "}
          {formatNumber(totalItems)}
        </span>
        <span className="sm:hidden">
          Page <span className="font-semibold text-text-secondary">{currentPage}</span> of {totalPages}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="max-sm:size-10"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <div className="flex items-center gap-1 max-sm:hidden">
          {pageTokens(currentPage, totalPages).map((token) =>
            typeof token === "number" ? (
              <button
                key={token}
                type="button"
                onClick={() => onPageChange(token)}
                aria-current={token === currentPage ? "page" : undefined}
                className={cn(
                  "h-9 min-w-9 rounded-[10px] px-2 text-[13px] font-semibold tabular transition-colors",
                  token === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-muted hover:text-text-primary",
                )}
              >
                {token}
              </button>
            ) : (
              <span key={token} className="w-6 text-center text-text-tertiary" aria-hidden>
                …
              </span>
            ),
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="max-sm:size-10"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Button>
      </div>
    </nav>
  )
}
