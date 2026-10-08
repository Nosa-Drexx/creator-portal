const ws = (slug: string) => `/w/${slug}`

export const routes = {
  overview: (slug: string) => ws(slug),
  content: (slug: string) => `${ws(slug)}/content`,
  newContent: (slug: string) => `${ws(slug)}/content/new`,
  contentDetail: (slug: string, id: string) => `${ws(slug)}/content/${id}`,
  editContent: (slug: string, id: string) => `${ws(slug)}/content/${id}/edit`,
  purchases: (slug: string) => `${ws(slug)}/purchases`,
  verification: (slug: string) => `${ws(slug)}/verification`,
  settings: (slug: string) => `${ws(slug)}/settings`,
  profile: (slug: string) => `${ws(slug)}/profile`,
  members: (slug: string) => `${ws(slug)}/members`,
  roles: (slug: string) => `${ws(slug)}/members/roles`,
}

/** Swaps the workspace segment so switching keeps you on the same section */
export function switchWorkspacePath(pathname: string, nextSlug: string) {
  const parts = pathname.split("/")
  if (parts[1] !== "w" || !parts[2]) return ws(nextSlug)
  const section = parts[3]
  // Detail pages belong to the old workspace, so fall back to the section index
  return section ? `${ws(nextSlug)}/${section}` : ws(nextSlug)
}
