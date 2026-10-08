"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "motion/react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { EASE_OUT_SOFT } from "@/components/shared/motion/easing"
import { useSubmitVerification } from "@/hooks/mutations/use-verification-mutations"
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug"
import { verificationPayloadSchema, type VerificationFormValues } from "@/lib/validation/verification"
import { cn } from "@/lib/utils"
import { LAST_STEP, STEP_FIELDS, VERIFICATION_DEFAULTS } from "./constant"
import { StepNav } from "./StepNav"
import { DocumentStep } from "./steps/DocumentStep"
import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { ReviewStep } from "./steps/ReviewStep"
import { SelfieStep } from "./steps/SelfieStep"
import { useVerificationDraft } from "./use-verification-draft"
import { WizardStepper } from "./WizardStepper"

export function VerificationWizard() {
  const slug = useWorkspaceSlug()
  const { initial, save, clear } = useVerificationDraft(slug)
  const submit = useSubmitVerification()
  const [step, setStep] = useState(() => Math.min(initial?.step ?? 0, LAST_STEP))
  const [direction, setDirection] = useState(1)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [showConfirmError, setShowConfirmError] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationPayloadSchema),
    mode: "onTouched",
    defaultValues: { ...VERIFICATION_DEFAULTS, ...initial?.values } as VerificationFormValues,
  })

  useEffect(() => {
    save({ values: form.getValues(), step })
    return form.subscribe({ formState: { values: true }, callback: ({ values }) => save({ values, step }) })
  }, [form, save, step])

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    setBusy(false)
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [step])

  const flagInvalid = () => {
    setShake(true)
    const firstError = STEP_FIELDS[step].find((name) => form.getFieldState(name).invalid)
    if (firstError) form.setFocus(firstError)
  }

  const handleNext = async () => {
    if (step < LAST_STEP) {
      const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true })
      if (!valid) return flagInvalid()
      return goTo(step + 1)
    }

    if (!confirmed) {
      setShowConfirmError(true)
      return
    }
    await form.handleSubmit(
      (values) => submit.mutate(values, { onSuccess: clear }),
      (errors) => {
        // A stale draft can reach review with a missing upload; jump back to the first broken step
        const broken = Object.keys(STEP_FIELDS).map(Number).find((s) => STEP_FIELDS[s].some((f) => f in errors))
        if (broken !== undefined) goTo(broken)
      },
    )()
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-7" noValidate>
        <div ref={topRef} className="scroll-mt-24">
          <WizardStepper current={step} onStepClick={goTo} />
        </div>

        <div
          className={cn("min-h-[320px]", shake && "animate-shake")}
          onAnimationEnd={() => setShake(false)}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -16 }}
              transition={{ duration: 0.28, ease: EASE_OUT_SOFT }}
            >
              {step === 0 && <PersonalInfoStep />}
              {step === 1 && <DocumentStep onBusyChange={setBusy} />}
              {step === 2 && <SelfieStep onBusyChange={setBusy} />}
              {step === 3 && (
                <ReviewStep
                  onEdit={goTo}
                  confirmed={confirmed}
                  onConfirmedChange={(value) => {
                    setConfirmed(value)
                    if (value) setShowConfirmError(false)
                  }}
                  showConfirmError={showConfirmError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <StepNav
          step={step}
          isLast={step === LAST_STEP}
          onBack={() => goTo(step - 1)}
          onNext={handleNext}
          isSubmitting={submit.isPending}
          disabled={busy}
        />
      </form>
    </Form>
  )
}
