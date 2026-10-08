"use client"

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { formatDate } from "@/lib/format"
import type { Member, RoleSummary } from "@/types/members"
import { MemberActionsMenu } from "./MemberActionsMenu"
import { MemberIdentity } from "./MemberIdentity"
import { RoleSelect } from "./RoleSelect"

interface MembersTableProps {
  members: Member[]
  roles: RoleSummary[]
  onRemove: (member: Member) => void
}

export function MembersTable({ members, roles, onRemove }: MembersTableProps) {
  const columns: DataTableColumn<Member>[] = [
    {
      id: "member",
      header: "Member",
      cell: ({ row }) => (
        <div className="min-w-[240px]">
          <MemberIdentity member={row.original} />
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => <RoleSelect member={row.original} roles={roles} />,
    },
    {
      id: "joined",
      header: "Joined",
      cell: ({ row }) => <span className="text-text-secondary tabular">{formatDate(row.original.joinedAt)}</span>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { align: "right", cellClassName: "w-12" },
      cell: ({ row }) => <MemberActionsMenu member={row.original} onRemove={onRemove} />,
    },
  ]

  return <DataTable columns={columns} data={members} getRowId={(m) => m.id} />
}
