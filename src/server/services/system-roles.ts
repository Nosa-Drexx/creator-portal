import "server-only"

import { ESystemRole, SYSTEM_ROLES } from "@/constants/permissions"
import type { Database } from "@/server/db/client"
import { roles } from "@/server/db/schema"
import { newId } from "@/server/lib/ids"

type Tx = Pick<Database, "insert">

/** Every workspace starts with the same built-in roles; returns their ids by key */
export async function createSystemRoles(tx: Tx, workspaceId: string, ids?: Partial<Record<ESystemRole, string>>) {
  const rows = (Object.keys(SYSTEM_ROLES) as ESystemRole[]).map((key) => ({
    id: ids?.[key] ?? newId("rol"),
    workspaceId,
    name: SYSTEM_ROLES[key].name,
    description: SYSTEM_ROLES[key].description,
    systemKey: key,
    permissions: SYSTEM_ROLES[key].permissions,
  }))
  await tx.insert(roles).values(rows)
  return Object.fromEntries(rows.map((r) => [r.systemKey, r.id])) as Record<ESystemRole, string>
}
