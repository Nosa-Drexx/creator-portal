"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { SectionCard } from "@/components/shared/SectionCard"
import { Reveal } from "@/components/shared/motion/Reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/queries/use-session"
import { AvatarField } from "./AvatarField"
import { PasswordForm } from "./PasswordForm"
import { ProfileDetailsForm } from "./ProfileDetailsForm"

export function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Your profile" description="How you appear to teammates across every workspace you belong to." />
      {!session ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : (
        <Reveal className="flex flex-col gap-5">
          <SectionCard title="Profile" bodyClassName="flex flex-col gap-6 p-4 sm:p-5">
            <AvatarField user={session.user} />
            <ProfileDetailsForm user={session.user} />
          </SectionCard>
          <SectionCard
            title="Password"
            description="Changing it signs you out on every other device."
            bodyClassName="p-4 sm:p-5"
          >
            <PasswordForm />
          </SectionCard>
        </Reveal>
      )}
    </div>
  )
}
