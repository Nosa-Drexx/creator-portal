"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <NuqsAdapter>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={250}>
              {children}
              <Toaster position="top-center" />
            </TooltipProvider>
          </MotionConfig>
        </NuqsAdapter>
      </ThemeProvider>
      <ReactQueryDevtools buttonPosition="top-right" />
    </QueryClientProvider>
  )
}
