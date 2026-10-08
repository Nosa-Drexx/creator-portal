# CreatorHub · Creator Portal

The first version of the CreatorHub **Creator Portal**. Creators upload and publish paid video, track revenue and purchases, and verify their identity before they can publish. It's built as a full-stack Next.js app with a deliberate focus on frontend architecture, mobile usability and real-world application states.

| | |
|---|---|
| **Docs** | [Video architecture, diagram and cost estimate](docs/ARCHITECTURE.md) · [Product improvements](docs/PRODUCT.md) · [AI usage](AI-USAGE.md) |
| **Stack** | Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · axios · react-hook-form + zod · motion · Recharts · Drizzle ORM + libSQL (SQLite) · Vitest |

---

## Quick start

Requires **Node 20.9+** and **pnpm**. Nothing else to install: no database server, no Docker, no API keys.

```bash
pnpm install
pnpm dev
```

Open **http://localhost:3000**. On the first request the app creates `.data/creatorhub.db`, runs migrations and seeds demo data automatically.

**Log in** with a one-click demo account on the login page, or with these credentials:

Every account uses the password `creatorhub-demo1`.

| Account | Email | What it shows |
|---|---|---|
| **Amara Lewis**, Owner | `amara@creatorhub.dev` | Everything. Owns *Amara Studio* (verified) and *Wild Frames* (unverified) |
| **Jordan Blake**, Admin | `jordan@creatorhub.dev` | Manages content and the team, but can't submit verification or grant ownership |
| **Priya Shah**, Editor | `priya@creatorhub.dev` | Uploads and edits only. No dashboard, no sales, can't publish or delete |
| **Sam Okafor**, Analyst | `sam@creatorhub.dev` | Read-only stats, content and purchases |
| **Theo Marsh**, Owner | `theo@creatorhub.dev` | Owns *Northbound Films* and has a **pending invite** to Amara Studio |

You can also **create an account**. New users go through a short onboarding step to create their first workspace.

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build && pnpm start` | Production build |
| `pnpm test` | Unit and API tests (Vitest) |
| `pnpm typecheck` · `pnpm lint` | TypeScript and ESLint |
| `pnpm db:reset` | Wipe uploads and re-seed the database |
| `pnpm db:studio` | Browse the database with Drizzle Studio |

Environment variables are all optional locally. See [`.env.example`](.env.example).

---

## What to try (about 5 minutes)

Log in as **Amara Lewis**, who owns two workspaces. Switch between them from the top of the sidebar (or the top bar on mobile).

| Workspace | State | Use it to see |
|---|---|---|
| **Amara Studio** (`/w/amara-studio`) | Verified, 26 videos, 1,762 purchases | Dashboard, chart ranges, content table with pagination, purchase search, filters, sorting and pagination, edit, delete |
| **Wild Frames** (`/w/wild-frames`) | **Unverified**, 3 drafts, no sales | Empty states and the **publishing gate** |

1. **Publishing rule.** In *Wild Frames*, click **Upload video** and try **Publish now**. You'll get a "Verify to publish" prompt that offers to save your work as a draft. The API enforces the same rule: `POST`/`PUT` content with `published` or `scheduled` returns `403 VERIFICATION_REQUIRED`.
2. **Upload.** Drop any MP4 into the editor. There's real upload progress (bytes, speed, time left), cancel and retry, **"Use frame as thumbnail"**, and a live buyer preview. A sample clip is at `public/seed/videos/sample-reel.mp4`.
3. **Verification.** Open **Verification** in *Wild Frames*. Personal info → ID document → selfie (camera, or upload) → review → submitted. The simulated review approves in about 20 seconds and publishing unlocks **without a refresh**. Refresh mid-wizard and your progress is kept.
4. **Content and purchases.** The Content table paginates 10 per page client-side, with the page, filters and sort kept in the URL. On Purchases you can search by buyer, email, video or country. Filter by status, sort by date or amount, and paginate. All of it is server-side and kept in the URL, so filtered views can be shared.
5. **Multi-tenancy.** Create a workspace from the switcher (**New workspace**), or open another creator's workspace (`/w/northbound-films`) and get a 404.
6. **Mobile.** Narrow the window to about 390px. You'll see a bottom tab bar with a centre upload button, card layouts instead of tables, bottom-sheet dialogs, and sticky primary actions.
7. **Your profile and logging out.** Open the account menu (your name at the bottom of the sidebar, or your avatar top-right on mobile) for **Your profile**, **Team** and **Log out**. You can also log out from **Demo & settings → Account**. In your profile you can change your name, password or profile photo (your email is your login, so it's read-only). Changing the password signs out your other sessions.
8. **Roles and permissions.** Log in as Priya (Editor) and Sam (Analyst) and compare the navigation, the content columns and the publish options. Opening a page you can't access by URL shows an access-denied screen. As Amara, open **Team** to invite members (you get a copyable invite link), change roles, and create custom roles with the permission matrix. Log in as Theo to accept his invitation from the workspace switcher.
9. **Collapsible sidebar.** Use the edge toggle or press **⌘B / Ctrl+B**. It's collapsed by default on tablets, and your choice is remembered.

### Demo-state controls

**Demo & settings** (in the sidebar) has reviewer controls, so you never need to touch the database:

| Control | Effect |
|---|---|
| **Verification state** | Switch the current workspace between Unverified, In review and Verified |
| **API behaviour** | **Slow** adds about 2s to every request (loading states). **Failing** returns 503s (error states and retry) |
| **Tenant isolation** | Opens a workspace you don't belong to |
| **Reset demo data** | Restores the seed and clears uploads, with confirmation |

### Data, persistence and reset

- **Records persist across refreshes and server restarts.** Everything is stored in a SQLite file (`.data/creatorhub.db`) and uploads in `.data/uploads`. Both are git-ignored.
- **To reset:** use **Demo & settings → Reset demo data**, or run `pnpm db:reset`, or delete the `.data/` folder (it's re-created and re-seeded on the next request).
- **Seed:** 3 workspaces, 30 videos (Published, Scheduled and Draft) and 1,831 purchases (Completed, Pending, Refunded and Failed) spread over 12 months. The data is synthetic and deterministic, with dates relative to "now" so the dashboard always looks current.

---

## Architecture

### Why the app is structured this way

```
src/
├── app/                      # Routes only: thin pages + API route handlers
│   ├── w/[workspace]/…       # Tenant-scoped pages (overview, content, purchases, verification, settings)
│   └── api/…                 # REST endpoints (the "lightweight backend")
├── components/
│   ├── ui/                   # shadcn primitives (customised to the design system)
│   ├── shared/               # Reusable building blocks: S3Image, DataTable, ResponsiveModal,
│   │                         #   ConfirmationModal, EmptyState, ErrorState, StatusBadge, motion/…
│   ├── layout/               # Shell: collapsible sidebar, mobile top/tab bars, workspace switcher
│   └── <Feature>/            # Overview, Content, Purchases, Verification, Settings
├── services/api/             # API repositories: one file per domain, axios calls only
├── hooks/
│   ├── queries/              # TanStack Query hooks; each exports its query key
│   ├── mutations/            # Mutations: invalidation, toasts, error handling
│   └── use-*.ts              # Upload, signed URL, hydration, media queries, sidebar state…
├── lib/validation/           # zod schemas shared by forms AND API routes
├── types/ · enums/ · constants/
└── server/                   # Backend only (guarded by `server-only`)
    ├── db/                   # Drizzle schema, migrations, seed
    ├── services/             # Business rules: publishing, tenancy, verification, analytics
    ├── storage/              # Local object storage + HMAC URL signing
    └── lib/                  # Route wrapper, errors, env, session
```

- **One-way data flow per request type.** A component calls a query hook, which calls a repository (axios), which calls a route handler, which calls a server service, which queries the database. Every layer has one job. Components never see axios, and route handlers never contain business rules.
- **Business rules live in one place and are tested.** `server/services/publishing.ts` is the single source of truth for "unverified creators cannot publish". It's used by both the create and update endpoints. The UI mirrors it for instant feedback, but the server is the authority.
- **Validation is shared.** The same zod schemas validate the API payload and power the form error messages, so the client and server can't disagree.
- **The tenant is part of every request.** Workspace-scoped routes go through `requireTenant(slug)`, which checks membership and returns 404 for non-members. Queries, storage keys and signed URLs are all scoped to the workspace.
- **Composable, reusable UI.** For example, `S3Image` renders storage keys (through short-lived signed URLs), public paths and `blob:` previews, with a shimmer and a fallback. `ResponsiveModal` is a dialog on desktop and a bottom sheet on mobile, and powers every confirmation. `DataTable` is generic, with server-side sorting.
- **Small files.** No source file is longer than 350 lines. Large features are split into sections and hooks.

### Roles and permissions

Permissions are `action:module` strings (for example `publish:content` or `view:purchases`), and `manage:all` grants everything.

- **Roles belong to a workspace.** Each workspace gets four built-in roles (Owner, Admin, Editor, Analyst) and can define custom ones in the permission-matrix editor.
- **The server is the authority.** Every service checks the permission it needs (`assertPermission`), and sales and performance numbers are left out of responses for roles without `view:analytics`. Protections:
  - You can't grant permissions you don't hold.
  - **The owner is fixed:** a workspace has one owner (its creator). Nobody, including the owner, can change the owner's role, remove the owner, or make someone else Owner. The owner can't leave.
  - Nobody can change their own role.
  - A role that's in use can't be deleted.
- **The frontend guards are UX, not security.** They live in `components/shared/Permissions`:
  - pure helpers (`canRead`, `canCreate`, `canPublish`…);
  - a `usePermissions()` hook built on the workspace query;
  - `<CanRead>`, `<CanCreate>`, `<CanUpdate>`, `<CanDelete>`, `<CanManage>` and `<CanTakeAction>` wrappers;
  - `<RequirePermission>` on every route, with an `AccessDenied` fallback.

  Navigation is filtered by permission (`navItemsForPermissions`), and login or workspace switching lands on the first page your role can open.
- **Two separate publish locks.** "Your role can't publish" is distinct from "verify your identity". An Editor in a verified workspace gets the first message, not a misleading verification prompt.
- **Invitations are bound to an email address.** They expire after 14 days, and the link token is stored hashed. There's no email sending in the demo: the inviter copies a link, and invitees also see pending invites in-app.

### Additional feature: branding and SEO

- **Identity.** The app icon (`public/images/brand/app-icon.svg`, rendered to a 1024px PNG) is the source of the favicon set in `public/creatorhub_favicon_set/`, together with a completed `site.webmanifest` (name, colours and icon paths). `src/app/favicon.ico` is kept identical to the set's.
- **Social previews.** `public/images/creatorhub-og-banner.jpg` is 1200×630 (1.91:1, the size every major platform expects) at about 116 KB, comfortably under WhatsApp's roughly 300 KB limit. Key content sits inside the centre safe zone, so platform crops don't cut the logo or headline.
- **Metadata** lives in `src/app/layout.tsx`, with constants in `src/constants/site.ts`: `metadataBase` from `NEXT_PUBLIC_APP_URL`, a title template, description, keywords, icons, manifest, Open Graph and Twitter `summary_large_image` cards with the image's size, type and alt text.
- **Crawling.** `robots.ts` and `sitemap.ts` expose only the public pages (`/login`, `/signup`). Workspaces, onboarding and invite pages are `noindex`. The proxy lets crawlers fetch the image, icons, manifest, robots and sitemap without signing in.
- **To deploy:** set `NEXT_PUBLIC_APP_URL` to the live origin so preview URLs are absolute and resolvable.

### Key technical choices

| Choice | Why |
|---|---|
| **libSQL / SQLite + Drizzle** | Zero setup for reviewers, real persistence, real SQL (aggregations, joins, indexes, transactions). The same Drizzle code runs on Turso, or on Postgres with a dialect change. |
| **Next.js route handlers as the backend** | One deployable unit. The brief asks for at least one endpoint that enforces the publishing rule; all of them go through the same validation, tenancy and error handling. |
| **TanStack Query + axios repositories** | Caching, background refetching, `keepPreviousData` for smooth pagination, polling while a verification is in review, and invalidation after mutations. |
| **URL state (nuqs)** | Filters, sorting, pages and chart ranges survive a refresh and can be shared. |
| **Signed URLs for uploads and media** | Mirrors production (presigned S3 PUT and signed CDN GET). Uploads go straight to storage, not through business logic, and paid media is never publicly addressable. |
| **Cache Components (PPR)** | Each route ships a static shell instantly. Tenant-aware parts stream in behind small Suspense boundaries with matching skeletons. |
| **motion, used sparingly** | A sliding nav indicator, rolling numbers, staggered stat cards, step transitions in the wizard, and accent colour transitions between workspaces. Everything respects `prefers-reduced-motion`. |

### Additional feature: multi-tenancy (workspaces)

Not requested in the brief. I added it as the product improvement I chose to implement. Details are in [docs/PRODUCT.md](docs/PRODUCT.md#1-workspaces-multi-tenant-creator-accounts-with-roles-implemented).

- Workspaces with owner and editor roles, membership checks on every endpoint, and **404 instead of 403** to avoid revealing which workspaces exist.
- Verification, content, purchases, analytics and storage are all scoped per workspace.
- A workspace switcher that keeps you on the same section, **creating new workspaces**, and a runtime accent colour per tenant.
- Covered by tests (`tests/api/tenant-isolation.test.ts`, `tests/api/workspaces.test.ts`).

---

## Testing

```bash
pnpm test
```

There are 51 tests. The API tests call the **real route handlers** against a throwaway SQLite database.

- **The publishing rule at the endpoint:** unverified, pending and verified workspaces; create vs update; draft vs publish vs schedule.
- **Tenant isolation:** foreign workspaces, foreign content IDs, purchase scoping, cross-tenant media signing, and per-user access.
- **Workspace creation:** ownership, slug collisions, validation.
- **Profile:** name updates (email can't be changed), password change signing out other sessions, avatar upload and serving, path-traversal and file-type rejection.
- **Roles and permissions:**
  - what each built-in role can and can't do at the endpoint;
  - metrics hidden from roles without analytics;
  - escalation blocked;
  - the owner lock (role, removal and leaving) and no self role changes;
  - leaving a workspace;
  - custom role rules;
  - role changes applying on the next request.
- **Invitations:** in-app accept, email-bound links, sign up and then accept, and revoked or re-sent links becoming invalid.
- **Authentication:** 401 without a session, login, identical errors for unknown email vs wrong password, rate limiting, signup, and session invalidation on logout (a replayed cookie is rejected).
- **Unit tests:** the publishing rule, content payload validation, and signed URL expiry and tampering.

Each change was also checked by hand in Chrome at desktop and 390px mobile widths, in light and dark themes, and with a production build (`pnpm build`).

---

## Assumptions

- **Email and password authentication** is built in (scrypt-hashed passwords, opaque server-side sessions in an `httpOnly` cookie, rate-limited login). There's no email verification, password reset or OAuth yet.
- **Verification is simulated** and auto-approves after `VERIFICATION_REVIEW_SECONDS` (default 20). No external provider is called.
- **Verification belongs to the workspace** (the payout entity), not the person. A new workspace starts unverified.
- **"Publishing" includes scheduling.** Both make content public, so both require verification.
- **Revenue counts only completed purchases.** Refunded, failed and pending purchases are shown but don't count. "Revenue this month" is compared with the same number of days last month.
- **Deleting content is a soft delete.** Purchase history stays intact for reporting and payouts.
- **Currency is USD only.**

## Limitations

- **No real transcoding or CDN.** Uploaded videos play back as uploaded, through signed, range-capable URLs. The production pipeline is designed in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Uploads are single-request PUTs,** capped at 500 MB in the demo. Production would use resumable multipart uploads (described in the architecture doc).
- **Scheduled content goes live when it's next read,** not from a background scheduler.
- **Seeded media is public** (`/public/seed`). Uploaded media is private and signed. All seeded videos play one short bundled clip, so they honestly report its real 8-second length and size. Videos you upload show their own.
- **On Vercel without `DATABASE_URL`,** the database and uploads live in `/tmp` and reset on cold starts. Point `DATABASE_URL` at Turso for a persistent deployed demo. Local setup is fully persistent.
- **Invitations aren't emailed.** Invites appear in-app and as a copyable link, and sending them via an email provider is the next step. Role changes take effect on the member's next request.

## Time spent

_TODO (author): approximately N hours._

## Next priorities

1. **Resumable multipart uploads with a global upload tray** (see [Product #2](docs/PRODUCT.md)). This is the biggest reliability win for creators on mobile and slow networks.
2. **Hardening auth:** email verification, password reset, OAuth and optional 2FA.
3. **A processing pipeline stub:** a job table, states (`processing` → `ready` / `failed`) and an event-driven UI, so the product reflects how video really works.
4. **Postgres plus rollup tables for analytics** before data volume grows.
5. **Playwright end-to-end tests** for the publish gate and verification flow, run in CI with the existing Vitest suite.

---

## Engineering judgment

**Architecture: why this structure?**
The separation follows how the app changes over time. UI changes most often, business rules change rarely, and storage changes almost never. Repositories, hooks, services and schemas are separate so each can change without touching the others. The backend lives inside Next.js route handlers to keep a single deployable unit for v1, but `server/` has no dependency on React, so it could become its own service. Tenancy and the publishing rule are built into the data model and request pipeline rather than handled in the UI, because those are the things that are expensive to retrofit.

**Scale: what would change at millions of users?**
- Postgres instead of SQLite, with read replicas and purchases partitioned by month.
- Precomputed analytics rollups instead of aggregating on read, and events streamed to a columnar store.
- Redis for hot counters and entitlement caching.
- Session lookups cached in Redis.
- Object storage and a CDN with the processing pipeline in [ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Background jobs (scheduled publishing, review webhooks) on a queue.
- Rate limiting per tenant.
- On the frontend: route-level code splitting is already in place. Next would be virtualised tables for very large catalogues and cursor pagination.

**Security: what to address before production?**
- Auth hardening: email verification, password reset, session rotation and a "sign out everywhere" option, Redis-backed rate limiting (the current limiter is per-process), and CSRF tokens on mutations (`SameSite=Lax` cookies cover the common cases today).
- Encryption of verification PII and documents at rest (KMS), with a retention policy and access auditing.
- Content-type sniffing and malware scanning of uploads.
- Rotating `MEDIA_SIGNING_SECRET` through a secrets manager.
- Rate limiting and abuse detection on uploads, signing and playback.
- Strict CSP and security headers.
- Removing the demo endpoints (`/api/demo`) and the one-click demo accounts.
- Row-level security as defence in depth for tenancy.
- Dependency and secret scanning in CI.
- An audit log of who published or deleted what.

**Performance: how to keep the frontend fast as it grows?**
- Static shells with streamed content (Cache Components).
- TanStack Query caching with `keepPreviousData`, so data changes don't jank.
- Server-side pagination and filtering.
- Images sized by `next/image`.
- Animations only on `transform` and `opacity`.
- Charts loaded only where they're used.
- Next: per-route bundle budgets in CI, virtualised long lists, prefetching on hover, and Web Vitals (INP, LCP) tracked per release.

**Reliability: what happens when a service fails?**
Covered in detail in [ARCHITECTURE.md → Reliability](docs/ARCHITECTURE.md#reliability-what-happens-when-something-fails): upload interrupted, processing failure, CDN down, API down, and payment succeeding while authorisation fails. In the portal today:
- every list, chart and page has a loading, empty and error state with **Retry**;
- queries retry transient failures but not 4xx;
- form input is never lost on errors;
- uploads can be retried in place.

You can trigger all of this live with **Demo & settings → API behaviour**.

**Observability: what to monitor in production?**
- **Product:** upload success rate and time to playable, publish-gate hits and verification conversion, the payment-to-entitlement gap.
- **Playback:** startup time, rebuffering, errors by country.
- **Engineering:** API p95 and error rate by route and tenant, queue depth and job failures, frontend Web Vitals and JS errors (Sentry).
- **Cost:** egress per view, encode minutes per published minute.

Structured logs carry a request ID and tenant ID, and alerts are tied to user-facing SLOs.

**Next steps: with another week, what first?**
Resumable uploads and processing states (#1 and #3 in Next priorities). Upload reliability decides whether creators publish at all, and processing state is what makes the product honest about how video works. Then real auth and invitations, so multi-tenancy is usable by actual teams.
