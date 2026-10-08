import { isAxiosError } from "axios"
import { apiClient, type Envelope } from "@/lib/axios"
import type { CreateWorkspaceInput } from "@/lib/validation/workspace"
import type { Session, Workspace } from "@/types/workspace"

export async function fetchSession(): Promise<Session> {
  const { data } = await apiClient.get<Envelope<Session>>("/session")
  return data.data
}

/** For public pages: resolves to null when signed out instead of redirecting to login */
export async function fetchOptionalSession(): Promise<Session | null> {
  try {
    const { data } = await apiClient.get<Envelope<Session>>("/session", { skipAuthRedirect: true })
    return data.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null
    throw error
  }
}

export async function fetchWorkspace(slug: string): Promise<Workspace> {
  const { data } = await apiClient.get<Envelope<Workspace>>(`/workspaces/${slug}`)
  return data.data
}

export async function createWorkspace(payload: CreateWorkspaceInput): Promise<Workspace> {
  const { data } = await apiClient.post<Envelope<Workspace>>("/workspaces", payload)
  return data.data
}
