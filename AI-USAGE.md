# AI Usage

> Draft — kept up to date during development and finalised before submission.

## Which AI tools did I use?

- **Claude Code (Claude Opus 5.5)** in the terminal, as a pair programmer for reading the brief, scaffolding, implementation, refactoring and documentation.
- **Claude in Chrome**, driven by Claude Code, for end-to-end checks of the running app at desktop, tablet and mobile widths.
- **Claude Code sub-agents** for parallel work. Purchases and Verification were built at the same time by separate agents, each told which files it owned and the conventions to follow. I then reviewed and integrated their output.

## How I directed the AI

I didn't ask for "build me a creator portal." Before any code was written, I gave the AI a detailed brief that set out how I work. It had to follow these rules on every file:

1. **Read the brief before building anything.** The AI read the full assessment PDF first and checked what was installed on my machine. It then had to tell me what to install globally before writing any code.
2. **Architecture follows my standard project conventions:**
   - folders split by responsibility: `types`, `services`, API repositories, `hooks`, `utils` and `components`
   - the **API repository pattern**, with axios in the repositories and **TanStack Query** for every request
   - **shadcn/ui** with design-system colour tokens defined in `globals.css`
   - my existing reusable building blocks: a universal image component that handles remote/object-storage and local images plus their edge cases, a responsive drawer, a phone input and file-upload hooks
3. **No file over 350 lines.** Code is broken into components, hooks and utilities that can be reused and composed.
4. **pnpm only.** Use trusted packages rather than building everything from scratch.
5. **The UI must not look AI-generated.** It should be sleek and clean, with subtle animation and transitions used only where they help the user.
6. **Frontend quality comes first,** because that is where the assessment puts its weight.

## Working log: where I steered, corrected or overrode the AI

| # | What the AI did or proposed | What I changed and why |
|---|---|---|
| 1 | Flagged the Saturday deadline as a risk and suggested saving time for the write-ups. | I told it the timeline was fine and that UI polish and smoothness were the priority. |
| 2 | Proposed a technical plan that followed the brief exactly. | I added **multi-tenancy** as a deliberate improvement beyond the brief, because the assessment explicitly rewards product ownership. |
| 3 | — | I set a rule that project documentation describes patterns as my own conventions and does not refer to other codebases. |
| 4 | Tends to write long, explanatory code comments. | **Corrected:** I told it to keep comments few and short, and only where they add information the code doesn't already show. |
| 5 | Proposed a hard-coded production domain for workspace URLs. | **Changed:** every URL and domain comes from env vars documented in `.env.example`, because the real domain depends on where the app is deployed (Vercel). |
| 6 | Planned charts from scratch, since my reference patterns didn't include a dashboard chart. | I pointed it to my existing admin-portal chart patterns so the dashboard matches how I already build charts. |

_(more entries are added as development continues)_

## Problems caught during verification and fixed before they shipped

These are cases where the AI's first attempt was wrong, and testing (not trust) caught it:

| What the AI first produced | How it was caught | Fix |
|---|---|---|
| After `shadcn init`, it assumed `import { cn } from "cn"` was a CLI bug and rewrote every import. That created a circular import in `lib/utils.ts`. | `tsc` failed. Checking `node_modules` showed `cn` is a real shadcn package. | Reverted. `lib/utils` now re-exports the package. |
| Read `useParams()` in the workspace layout without a `<Suspense>` boundary. | The Next.js 16 dev overlay flagged "Blocking Route" (Cache Components). | A static shell, with granular boundaries per tenant-aware piece. |
| Client-fetched queries rendered different markup on the server and the client, causing a hydration mismatch. | Hydration error in the dev overlay, seen while testing in Chrome. | Added a `ClientBoundary` that renders the same skeleton on the server and during hydration. |
| Seeded the demo user as *editor* of the unverified workspace, so they couldn't verify it. That broke the main demo path. | Testing the API by hand. A separate agent working on the verification flow also hit the 403. | The demo user now owns both workspaces. Role rules are still enforced and tested. |
| The Overview's "Top performing" card overflowed horizontally on phones. | A 390px Chrome viewport check measuring `scrollWidth`. | `min-w-0` on grid children (CSS grid `min-width: auto`). |
| Compared month-to-date revenue with *all* of last month, which showed a misleading −79%. | Reviewing the numbers in the UI. | Compare against the same number of days last month. |
| A pending purchase showed a struck-through amount. | Visual review. | Strike-through only for refunded or failed purchases. |
| Three components called `setState` inside effects. | `eslint` (react-hooks rules). | `useSyncExternalStore` for media queries, and an imperative handle for "use frame as thumbnail". |

## How I verified AI-generated code

- **Automated:** `pnpm typecheck`, `pnpm lint`, `pnpm test` (23 tests, including endpoint tests that call the real route handlers against a throwaway SQLite database) and `pnpm build`.
- **API by hand:** `curl` checks of the publishing rule (403 `VERIFICATION_REQUIRED`), tenant isolation (404 across workspaces), signed upload replay and tampering, and HTTP range requests for video seeking.
- **Browser:** end-to-end walkthroughs in Chrome of every flow (dashboard, upload with real progress, frame-to-thumbnail, publish gate, verification, destructive confirmations) at desktop and at a 390px mobile viewport, in light and dark themes.
- **Review:** I read every diff myself before committing.

## What I deliberately did myself, and why

_TODO (author): to be written by me._

## Where AI saved the most time

_TODO: finalise at the end._
