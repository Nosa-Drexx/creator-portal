# AI Usage

> Draft — kept up to date during development and finalised before submission.

## Which AI tools did I use?

- **Claude Code (Claude Opus 5.5)** in the terminal, as a pair programmer for scaffolding, implementation, refactoring and documentation.
- **Generating demo assets.** The AI produced the deterministic synthetic seed data (videos, purchases, buyers) and generated the sample demo video clips, rendered from the seed images, that are used to test uploads and playback.
- **Claude in Chrome**, driven by Claude Code, for end-to-end checks of the running app at desktop, tablet and mobile widths.
- **Claude Code sub-agents** for parallel work. Purchases and Verification were built at the same time by separate agents, each told which files it owned and the conventions to follow. I then reviewed and integrated their output.

## How I directed the AI

Before any code was written, I gave the AI a detailed brief: what to build, how it should be structured, and the rules it had to follow on every file:

1. **Plan before building.** The AI first had to confirm the setup the project needed (tooling, database approach), then propose a prioritised build plan for me to approve.
2. **Architecture follows standard, scalable conventions:**
   - folders split by responsibility: `types`, `services`, API repositories, `hooks`, `utils` and `components`
   - the **API repository pattern**, with axios in the repositories and **TanStack Query** for every request
   - **shadcn/ui** with design-system colour tokens defined in `globals.css`
   - proven, reusable building blocks: a universal image component that handles remote/object-storage and local images plus their edge cases, a responsive drawer, a phone input and file-upload hooks
3. **No file over 350 lines.** Code is broken into components, hooks and utilities that can be reused and composed.
4. **pnpm only.** Use trusted packages rather than building everything from scratch.
5. **The UI must not look AI-generated.** It should be sleek and clean, with subtle animation and transitions used only where they help the user.
6. **Frontend quality comes first,** because that is where the assessment puts its weight.

## Working log: where I steered, corrected or overrode the AI

| # | What the AI did or proposed | What I changed and why |
| --- | --- | --- |
| 1 | Proposed a technical plan that followed the brief exactly. | I added **multi-tenancy** as a deliberate improvement beyond the brief, because the assessment explicitly rewards product ownership. |
| 2 | Proposed the project structure. | I required it to follow **standard, industry-proven conventions and practices** (layered architecture, the API repository pattern, shared typed contracts and validation) that keep the codebase scalable and easy for other engineers to work in. |
| 3 | Tended to write long, explanatory code comments. | **Corrected:** I told it to keep comments few and short, and only where they add information the code doesn't already show. |
| 4 | Proposed a hard-coded production domain for workspace URLs. | **Changed:** every URL and domain comes from env vars documented in `.env.example`, because the real domain depends on where the app is deployed (Vercel). |
| 5 | Planned to hand-build the dashboard charts. | I pointed it to **existing, trusted charting packages** (Recharts, wrapped in reusable chart components), following industry-standard practice for building charts and taking advantage of the accessibility, polish and customisability those packages offer. |
| 6 | Built multi-tenancy with a workspace switcher, but workspaces could only come from seed data. | **I spotted the gap:** a multi-tenant product needs a way to create a tenant. Added a "New workspace" flow (endpoint and UI). |
| 7 | Sidebar had fixed widths per breakpoint. | **I asked for a collapsible sidebar**, mainly for tablets. Added a collapse toggle (⌘B) that is remembered, and collapsed by default on tablet widths. |
| 8 | Built the theme toggle as an icon button that cross-faded sun and moon. | **I asked for a real switch** (shadcn `Switch`) so it reads and behaves like a toggle. The thumb now slides and carries the icon, and the theme is applied once the slide finishes. |
| 9 | Authentication was simulated: every request acted as a seeded demo user, because the brief didn't require production auth. | **I asked for real login.** A product with workspace members needs real accounts. Added sign up, log in and log out, hashed passwords, server-side sessions, a route guard, onboarding, and one-click demo accounts so reviewers can still get in instantly. |
| 10 | No way for users to manage their own account. | **I asked for profile management:** name, password and profile photo. I also had email made read-only, since it's the login identifier. Photos are cropped and resized in the browser, and changing the password signs out other devices. |
| 11 | Workspace access was all-or-nothing (owners plus a simple editor rule). | **I asked for real roles and permissions**, built the way I build permission guards in production apps: `action:module` permissions, permission helpers, a `usePermissions` hook, `<CanX>` and `<RequirePermission>` guard components, permission-filtered navigation, member invitations and custom roles. I also required server-side enforcement so the UI guards are only UX. |
| 12 | Allowed owners to grant ownership and only protected the *last* owner, and let people change their own role. | **I tightened the ownership rules:** the owner's role can never be changed (by themselves or by admins with member permissions), the owner can't be removed or leave, and nobody can change their own role. The AI made the Owner role non-assignable to keep "one fixed owner" consistent, enforced it in the API, mirrored it in the UI and added tests. |
| 13 | Put Log out inside the account menu, behind a row that didn't look clickable. | **I couldn't find how to log out**, which flagged a discoverability problem. The account row now shows a menu chevron, and **Demo & settings** has an Account card with a visible Log out button. |
| 14 | The app had no brand identity: a default favicon and no social metadata. | **I added branding and SEO as a feature.** The AI designed the app icon (an SVG source rendered to PNG), I generated the favicon set from it, then the AI produced the Open Graph banner and wired the site metadata (title template, description, icons, Open Graph and Twitter cards, `metadataBase`) following the standard Next.js metadata conventions. |
| 15 | The login page scrolled as a whole on desktop, dragging the brand panel along once more demo accounts were added. | **I caught the layout bug.** On large screens the page is now exactly one viewport: the brand panel is fixed and only the form column scrolls. The demo accounts became a compact two-column grid, so the form fits without scrolling. |
| 16 | The Content table rendered every video with no pagination, unnoticeable with only 14 seeded. | **I spotted the missing pagination.** The Content table now paginates (10 per page, page kept in the URL, reset when filters change) using the same component as Purchases, and the demo catalogue grew to 26 videos so it shows by default. |
| 17 | Draft rows without a video still showed a thumbnail and duration in the Content list, while the detail page said "No video uploaded yet". | **I caught the inconsistency.** The list now shows a generic "No video yet" tile when there's no video, and the API never returns video metadata (duration, file, size) without a video file. |
| 18 | Seeded videos had made-up durations (e.g. 1:10:00) and sizes, but all play the same 8-second sample clip, so the list and the player disagreed. | **I caught the mismatch.** Seeded videos now report the real duration and size of the clip they play. Uploaded videos already store the duration read from the actual file. |

_(more entries are added as development continues)_

## Problems caught during verification and fixed before they shipped

These are cases where the AI's first attempt was wrong, and testing (not trust) caught it:

| What the AI first produced                                                                                                                          | How it was caught                                                                            | Fix                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| After `shadcn init`, it assumed `import { cn } from "cn"` was a CLI bug and rewrote every import. That created a circular import in `lib/utils.ts`. | `tsc` failed. Checking `node_modules` showed `cn` is a real shadcn package.                  | Reverted. `lib/utils` now re-exports the package.                                                |
| Read `useParams()` in the workspace layout without a `<Suspense>` boundary.                                                                         | The Next.js 16 dev overlay flagged "Blocking Route" (Cache Components).                      | A static shell, with granular boundaries per tenant-aware piece.                                 |
| Client-fetched queries rendered different markup on the server and the client, causing a hydration mismatch.                                        | Hydration error in the dev overlay, seen while testing in Chrome.                            | Added a `ClientBoundary` that renders the same skeleton on the server and during hydration.      |
| Seeded the demo user as _editor_ of the unverified workspace, so they couldn't verify it. That broke the main demo path.                            | Testing the API by hand. A separate agent working on the verification flow also hit the 403. | The demo user now owns both workspaces. Role rules are still enforced and tested.                |
| The Overview's "Top performing" card overflowed horizontally on phones.                                                                             | A 390px Chrome viewport check measuring `scrollWidth`.                                       | `min-w-0` on grid children (CSS grid `min-width: auto`).                                         |
| Compared month-to-date revenue with _all_ of last month, which showed a misleading −79%.                                                            | Reviewing the numbers in the UI.                                                             | Compare against the same number of days last month.                                              |
| A pending purchase showed a struck-through amount.                                                                                                  | Visual review.                                                                               | Strike-through only for refunded or failed purchases.                                            |
| Three components called `setState` inside effects.                                                                                                  | `eslint` (react-hooks rules).                                                                | `useSyncExternalStore` for media queries, and an imperative handle for "use frame as thumbnail". |
| A test for URL tampering swapped the signature's first character for `x`, which is a no-op when the signature already starts with `x` (about 1 run in 64). | Ran the suite repeatedly; it failed intermittently. | The test now always changes the character. |
| In dev, the cached database client kept a pre-migration schema, so login read users without a password hash. | A Chrome login failed even though the API logic passed its tests. Debugged with `curl` and the dev server log. | Cache only the raw connection, and rebuild the ORM wrapper on hot reload. |
| Per-route module copies in dev each ran the "seed if empty" step, so two requests raced to seed. | Duplicate-insert errors in the server log. | The setup promise is shared on `globalThis`. |
| The first auth design would have looped between `/login` and `/` when a session cookie was stale. | Code review of the proxy and 401 handling before testing. | The API clears an invalid session cookie when it returns 401. |
| The first pass at permissions hid revenue columns in the UI, but the content API still returned revenue to Editors. | Reviewing what each role's API responses contained, not just what the UI showed. | The server now leaves out views, purchases and revenue for roles without `view:analytics`, and a test asserts it. |
| Editors in a verified workspace were told to "verify your identity" when they tried to publish. | Walking through the Editor account in Chrome. | Separate lock reasons: a missing role permission vs workspace verification, each with its own message. |

## How I verified AI-generated code

- **Automated:** `pnpm typecheck`, `pnpm lint`, `pnpm test` (51 tests, including endpoint tests that call the real route handlers against a throwaway SQLite database) and `pnpm build`.
- **API by hand:** `curl` checks of the publishing rule (403 `VERIFICATION_REQUIRED`), tenant isolation (404 across workspaces), signed upload replay and tampering, and HTTP range requests for video seeking.
- **Browser:** end-to-end walkthroughs in Chrome of every flow (dashboard, upload with real progress, frame-to-thumbnail, publish gate, verification, destructive confirmations) at desktop and at a 390px mobile viewport, in light and dark themes.
- **Review:** I read every diff myself before committing.

## What I deliberately did myself, and why

- **The project architecture and conventions.** I defined these before the AI wrote any code: the folder structure, the layered data flow (API repositories → query and mutation hooks → components), shared validation, reusable component rules and the 350-line file limit. I owned this because architecture is what lets a codebase scale. It keeps the project usable by other contributors, prevents duplicated code, and keeps everything clean and reusable. The AI worked inside that structure rather than inventing its own.
- **Product scope and priorities.** I decided what to build beyond the brief and in what order: multi-tenant workspaces, workspace creation, the collapsible sidebar, and (later) authentication and role-based permissions. The AI proposed implementations; I decided what was worth building.
- **Final review.** I reviewed every diff and the UI itself before committing, because I'm accountable for every line I submit, not the AI.

## Where AI saved the most time

- **Scaffolding and boilerplate:** wiring the database schema, migrations, route handlers, query hooks and form plumbing to my conventions.
- **Keeping up with framework changes:** Next.js 16 behaves differently (Cache Components, `proxy` instead of `middleware`, async request APIs). The AI read the version-matched docs bundled with the framework and applied them, instead of me researching each change.
- **Parallel feature work:** independent features (Purchases and Verification) were built at the same time by separate agents, then reviewed and integrated.
- **Demo data and assets:** realistic, deterministic seed data and generated sample video clips for testing uploads and playback.
- **Verification loops:** running the app in Chrome at different viewport sizes and calling the API directly to confirm behaviour, then fixing issues straight away.
- **First drafts of the documentation:** the architecture design, cost model and README, which I then refined.
