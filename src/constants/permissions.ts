/** Permission strings are `action:module`, e.g. `publish:content`; `manage:all` grants everything */
export enum EModule {
  Analytics = "analytics",
  Content = "content",
  Purchases = "purchases",
  Verification = "verification",
  Members = "members",
  Roles = "roles",
  All = "all",
}

export enum EAction {
  View = "view",
  Create = "create",
  Edit = "edit",
  Delete = "delete",
  Publish = "publish",
  Manage = "manage",
}

export type Permission = `${EAction}:${EModule}`

export const perm = (action: EAction, module: EModule) => `${action}:${module}` as Permission

export const MANAGE_ALL = perm(EAction.Manage, EModule.All)

export interface PermissionDefinition {
  code: Permission
  label: string
  description: string
}

export interface PermissionGroup {
  module: EModule
  label: string
  permissions: PermissionDefinition[]
}

/** Everything a role can be granted, grouped for the role editor */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: EModule.Analytics,
    label: "Analytics",
    permissions: [{ code: "view:analytics", label: "View dashboard", description: "Revenue, purchase and performance stats" }],
  },
  {
    module: EModule.Content,
    label: "Content",
    permissions: [
      { code: "view:content", label: "View content", description: "See every video in the workspace" },
      { code: "create:content", label: "Upload videos", description: "Create drafts and upload media" },
      { code: "edit:content", label: "Edit videos", description: "Change titles, prices and media" },
      { code: "publish:content", label: "Publish & schedule", description: "Make videos public (needs verification)" },
      { code: "delete:content", label: "Delete videos", description: "Remove videos from the workspace" },
    ],
  },
  {
    module: EModule.Purchases,
    label: "Purchases",
    permissions: [{ code: "view:purchases", label: "View purchases", description: "Buyer activity and sales history" }],
  },
  {
    module: EModule.Verification,
    label: "Verification",
    permissions: [
      { code: "view:verification", label: "View status", description: "See the workspace's verification state" },
      { code: "manage:verification", label: "Submit verification", description: "Provide identity details for payouts" },
    ],
  },
  {
    module: EModule.Members,
    label: "Members",
    permissions: [
      { code: "view:members", label: "View members", description: "See who's in the workspace" },
      { code: "manage:members", label: "Manage members", description: "Invite, remove and change roles" },
    ],
  },
  {
    module: EModule.Roles,
    label: "Roles",
    permissions: [{ code: "manage:roles", label: "Manage roles", description: "Create and edit custom roles" }],
  },
]

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.code))

export enum ESystemRole {
  Owner = "owner",
  Admin = "admin",
  Editor = "editor",
  Analyst = "analyst",
}

export const SYSTEM_ROLES: Record<ESystemRole, { name: string; description: string; permissions: Permission[] }> = {
  [ESystemRole.Owner]: {
    name: "Owner",
    description: "Full control of the workspace, including billing and verification",
    permissions: [MANAGE_ALL],
  },
  [ESystemRole.Admin]: {
    name: "Admin",
    description: "Runs the workspace day to day: content, members and roles",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "manage:verification"),
  },
  [ESystemRole.Editor]: {
    name: "Editor",
    description: "Uploads and edits videos; can't publish or see sales",
    permissions: ["view:content", "create:content", "edit:content", "view:verification", "view:members"],
  },
  [ESystemRole.Analyst]: {
    name: "Analyst",
    description: "Read-only access to performance and sales",
    permissions: ["view:analytics", "view:content", "view:purchases", "view:members"],
  },
}

export const isValidPermission = (code: string): code is Permission =>
  code === MANAGE_ALL || (ALL_PERMISSIONS as string[]).includes(code)
