import { redirect } from "next/navigation"
import { DEFAULT_WORKSPACE_SLUG } from "@/constants/demo"
import { routes } from "@/constants/routes"

export default function Home() {
  redirect(routes.overview(DEFAULT_WORKSPACE_SLUG))
}
