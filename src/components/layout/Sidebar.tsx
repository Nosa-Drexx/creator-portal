import { SidebarNav } from "./SidebarNav"
import { UserCard } from "./UserCard"
import { VerifyCallout } from "./VerifyCallout"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { CreateButton } from "./CreateButton"

/** Icon rail on tablet, full sidebar on desktop, hidden on mobile */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col gap-5 border-r border-stroke bg-canvas px-3 py-4 md:flex lg:w-[252px] lg:px-4">
      <WorkspaceSwitcher className="max-lg:justify-center" />
      <CreateButton />
      <SidebarNav />
      <div className="mt-auto flex flex-col gap-4">
        <VerifyCallout />
        <UserCard />
      </div>
    </aside>
  )
}
