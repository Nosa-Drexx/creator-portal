import { ClientBoundary } from "@/components/shared/ClientBoundary"
import { HomeRedirect } from "@/components/Workspace/HomeRedirect"

export default function Home() {
  return (
    <ClientBoundary fallback={null}>
      <HomeRedirect />
    </ClientBoundary>
  )
}
