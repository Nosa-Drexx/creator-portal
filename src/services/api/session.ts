import { apiClient, type Envelope } from "@/lib/axios"
import type { CreateWorkspaceInput } from "@/lib/validation/workspace"
import type { Session, Workspace } from "@/types/workspace"

export async function fetchSession(): Promise<Session> {
  const { data } = await apiClient.get<Envelope<Session>>("/session")
  return data.data
}

export async function fetchWorkspace(slug: string): Promise<Workspace> {
  const { data } = await apiClient.get<Envelope<Workspace>>(`/workspaces/${slug}`)
  return data.data
}

export async function createWorkspace(payload: CreateWorkspaceInput): Promise<Workspace> {
  const { data } = await apiClient.post<Envelope<Workspace>>("/workspaces", payload)
  return data.data
}
