import { AnimatedNumber } from "@/components/shared/motion/AnimatedNumber"
import type { Content } from "@/types/content"

export function ContentStats({ item }: { item: Content }) {
  const conversion = item.views > 0 ? (item.purchases / item.views) * 100 : 0
  const stats = [
    { label: "Views", value: item.views, format: { maximumFractionDigits: 0 } },
    { label: "Purchases", value: item.purchases, format: { maximumFractionDigits: 0 } },
    {
      label: "Revenue",
      value: item.revenueCents / 100,
      format: { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const,
    },
    { label: "Conversion", value: conversion, format: { maximumFractionDigits: 1 }, suffix: "%" },
  ]

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-stroke shadow-card sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 bg-surface p-4">
          <dt className="text-xs font-medium text-text-tertiary">{stat.label}</dt>
          <dd>
            <AnimatedNumber
              value={stat.value}
              format={stat.format}
              suffix={stat.suffix}
              className="text-xl font-bold tracking-tight tabular"
            />
          </dd>
        </div>
      ))}
    </dl>
  )
}
