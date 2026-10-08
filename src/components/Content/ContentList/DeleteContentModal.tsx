"use client"

import { ConfirmationModal } from "@/components/shared/ConfirmationModal"
import { EContentStatus } from "@/enums/content"
import { useDeleteContent } from "@/hooks/mutations/use-content-mutations"
import { formatNumber } from "@/lib/format"
import type { Content } from "@/types/content"

interface DeleteContentModalProps {
  item: Content | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteContentModal({ item, onClose, onDeleted }: DeleteContentModalProps) {
  const remove = useDeleteContent()
  const hasBuyers = !!item && item.purchases > 0

  return (
    <ConfirmationModal
      open={!!item}
      onOpenChange={(open) => !open && onClose()}
      title="Delete this video?"
      description={
        item && (
          <>
            <span className="font-semibold text-text-primary">“{item.title}”</span>
            {item.status === EContentStatus.Published
              ? " will be removed from sale immediately. This can't be undone."
              : " will be permanently removed. This can't be undone."}
          </>
        )
      }
      confirmLabel="Delete video"
      isLoading={remove.isPending}
      onConfirm={() =>
        item &&
        remove.mutate(item, {
          onSuccess: () => {
            onClose()
            onDeleted?.()
          },
        })
      }
    >
      {hasBuyers && (
        <p className="rounded-lg bg-muted/70 p-3 text-[13px] leading-relaxed text-text-secondary">
          {formatNumber(item.purchases)} {item.purchases === 1 ? "buyer has" : "buyers have"} purchased this. Their
          purchase records are kept for your reporting and payouts.
        </p>
      )}
    </ConfirmationModal>
  )
}
