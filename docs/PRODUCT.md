# Product improvements

Three improvements I'd make if I owned CreatorHub's creator experience. The first was **not requested in the brief and is implemented** in this repo.

---

## 1. Workspaces: multi-tenant creator accounts with roles *(implemented)*

**Priority: High**

**What I'd change.** Content, sales and verification would belong to a **workspace**, not directly to a person. One login can own or join several workspaces: a second channel, a brand, or clients an agency manages. Each workspace has its own catalogue, revenue, verification status, accent colour and members with roles (owner or editor).

**Why.** Successful creators rarely work alone, and many run more than one channel. Without workspaces, the alternatives are sharing a password (a security and audit problem) or creating separate accounts (fragmented payouts, constant logging in and out). Retrofitting tenancy later is one of the most expensive migrations a product can face, because every table, query, cache key and storage path has to change. Doing it in version one is cheap.

**How it improves the experience.**
- **Creators** switch between brands in one click, and the UI recolours so they always know which one they're in.
- **Agencies** can manage several creators without holding their credentials.
- **The platform** gets isolation by design. A request for another tenant's data returns 404, not 403, so it doesn't reveal that the workspace exists.

**What's built:**
- Tenant in the URL (`/w/:workspace/...`).
- Server-side membership checks on every route.
- Workspace-scoped storage keys and signed media URLs.
- Role-based access control: built-in Owner, Admin, Editor and Analyst roles plus custom roles from a permission matrix. Members are invited with email-bound links. Every endpoint is enforced server-side, and the UI is guarded by permission.
- Verification per workspace, since it represents the payout entity.
- A workspace switcher that keeps you on the same section.
- Creating a new workspace (name, handle, accent colour).
- A runtime accent colour per tenant.
- Tests for isolation.

**Next steps:**
- Emailing invitations (they're in-app and link-based today).
- Per-role permissions on payouts.
- An option to reuse a verified identity across workspaces owned by the same person.
- Subdomains (`studio.<your-domain>`) in production.

---

## 2. A background upload manager with resumable uploads and processing status

**Priority: High**

**What I'd change.** Move uploads out of the form into a global **upload tray**, a small persistent panel like Google Drive's. Uploads would keep going while the creator navigates around the portal, resume automatically after a dropped connection or a closed laptop (S3 multipart with locally saved part ETags), and then show **processing** progress (validating → generating thumbnails → transcoding → ready to publish), with a notification when the video is playable.

**Why.** Uploads are the biggest point of failure and frustration for creators, especially on mobile and on slower networks in many of the countries CreatorHub targets. Today, in most products, a multi-GB upload fails if the tab closes or the network blips, and creators often don't know whether the video is "done" after uploading. The upload-to-publish time and the upload failure rate drive how much content gets published, and content published drives revenue.

**How it improves the experience.** No lost uploads and no babysitting a progress bar. Creators can start uploading on their phone and finish the details on desktop, and they always know when a video is ready to go live. The current portal lays the groundwork: uploads already run in the background while the form is being filled in, with real progress, speed, time remaining, cancel and retry.

---

## 3. A conversion-focused video page: free preview clips and price insights

**Priority: Medium**

**What I'd change.**
- Let creators set a **free preview** (for example the first 30–60 seconds, or a separate trailer) that plays before the paywall.
- Show **conversion** per video (views → preview plays → purchases) in the dashboard, with simple **price guidance** ("Similar videos in your workspace convert 2× better at $9–$15").

**Why.** Creators set prices by guesswork and have no idea why a video with thousands of views doesn't sell. The data the portal already collects (views, purchases, revenue per video) is one step away from being actionable. The content detail page already shows a conversion rate. Previews are the most proven lever for paid video conversion, because buyers want to know what they're paying for.

**How it improves the experience.**
- **Creators** earn more from the same catalogue and stop guessing at prices.
- **Buyers** get a fairer purchase decision, which also means fewer refunds.

**Why medium priority.** Previews need the processing pipeline to output a separate clip rendition, and price guidance needs enough data per workspace to be honest. It should follow the upload work in #2.
