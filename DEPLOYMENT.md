# Deployment Guide — TaskFlow

This repo is ready to deploy **both frontend and backend to Vercel**. Cloudflare is documented as a fallback below.

- **Backend** (`backend/`) — NestJS 11 + Prisma 6 + PostgreSQL. Already adapted for Vercel Serverless Functions (`api/index.ts` + `src/bootstrap.ts` + `backend/vercel.json`).
- **Frontend** (`frontend/`) — Next.js 16 (App Router) + Tailwind 4. Zero-config on Vercel.
- Builds verified: `npm run build` passes in both workspaces as of 2026-08-21.

---

## Option A — Recommended: Both on Vercel (simplest)

Vercel hosts Next.js natively and also hosts Node/Express/NestJS as Serverless Functions. You need **two Vercel projects** (one per workspace) or a single monorepo project with separate deployments. Two projects is clearer and avoids CORS confusion.

### 1. Prerequisites

- PostgreSQL reachable from Vercel (Aiven/Neon/Supabase all work). Ensure `DATABASE_URL` includes `?sslmode=require&connection_limit=1&pool_timeout=20` — serverless functions each open their own pool, so keep the limit at 1 and that your Aiven firewall allows `0.0.0.0/0` or Vercel IPs.
- Push this repo to GitHub.

### 2. Deploy backend to Vercel

In Vercel Dashboard → **Add New Project** → Import your GitHub repo:

| Setting              | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| **Root Directory**   | `backend`                                                  |
| **Framework Preset** | `Other` (not Next.js)                                      |
| **Build Command**    | `npm run build` (default: `prisma generate && nest build`) |
| **Output Directory** | `dist`                                                     |
| **Install Command**  | `npm install`                                              |
| **Node Version**     | `20.x`                                                     |

**Environment variables** (Project → Settings → Environment Variables — add for Production + Preview):

```
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=1&pool_timeout=20"
JWT_SECRET="openssl rand -base64 32  — generate a new one, don't reuse dev-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://YOUR-FRONTEND.vercel.app"   # set after step 3, then redeploy backend
```

**What `backend/vercel.json` does:**

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

`api/index.ts` is the Serverless entry point. It imports `createApp()` from `src/bootstrap.ts` (shared with `src/main.ts` so local `npm run start:dev` and Vercel use the same CORS/helmet/validation config). The handler is cached between warm invocations. All routes are served under `/api` (via `app.setGlobalPrefix('api')`), so `https://your-backend.vercel.app/api/auth/guest` etc.

**Database migration:** Vercel does not run `prisma migrate deploy` automatically. On first deploy, run once from your machine with the **production** `DATABASE_URL`:

```bash
cd backend
DATABASE_URL="postgres://...production..." npx prisma migrate deploy
DATABASE_URL="postgres://...production..." npx prisma generate
```

Or add a one-off Vercel Build Command: `prisma migrate deploy && npm run build` (only if you want migrations on every deploy — usually not recommended).

**Verify:** Visit `https://YOUR-BACKEND.vercel.app/api` — should return the NestJS welcome JSON (or 401 for protected routes, which is expected).

### 3. Deploy frontend to Vercel

Second Vercel Project → Import **same** GitHub repo:

| Setting              | Value                     |
| -------------------- | ------------------------- |
| **Root Directory**   | `frontend`                |
| **Framework Preset** | `Next.js` (auto-detected) |
| **Build Command**    | `next build` (default)    |
| **Output Directory** | `.next` (default)         |

**Environment variable:**

```
NEXT_PUBLIC_API_URL="https://YOUR-BACKEND.vercel.app/api"
```

Rebuild the frontend after setting it.

**Then go back to backend project** → Settings → Environment Variables → set `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app` → Redeploy backend (Deployments → Redeploy) so CORS allows the real origin. Preview deployments (`*.vercel.app`) are already allowed by `src/bootstrap.ts` via the `VERCEL_PREVIEW` regex, so PR previews work even before you set `FRONTEND_URL`.

### 4. Update `frontend/src/lib/api.ts` — nothing to change

It already reads `process.env.NEXT_PUBLIC_API_URL`:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
```

### 5. Monorepo note

Root `package.json` has workspaces `["frontend","backend"]` but Vercel ignores the root when Root Directory is set to `backend` or `frontend`. You do **not** need a root `vercel.json`. If you want one deployment for the whole repo, use Vercel's monorepo support and set each project's Root Directory — that's the same as above.

### 6. Custom domain (optional)

Vercel → Project → Settings → Domains → Add `yourdomain.com` for frontend and `api.yourdomain.com` for backend. Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` accordingly and redeploy both.

---

## Option B — Frontend on Vercel, Backend elsewhere (if Vercel limits hit)

Vercel's Hobby plan has 10s Serverless execution limit and 100 GB-hours. If your backend hits cold-start or DB-connection limits (Prisma + Postgres over many concurrent lambdas), move the **backend only** to:

- **Render** — `render.com` (native NestJS/Docker, free tier okay)
- **Railway** — `railway.app` (`nixpacks`, one-click Postgres)
- **Fly.io** — `fly launch` (Docker)

All three accept your `backend/` as-is with `npm run build && npm run start:prod`. Point `frontend`'s `NEXT_PUBLIC_API_URL` to that URL instead. CORS is already handled.

---

## Option C — Cloudflare (fallback)

> **TL;DR:** Frontend → Cloudflare Pages (via `opennextjs-cloudflare`). Backend → **not** directly on Cloudflare Workers without a rewrite.

### Frontend on Cloudflare Pages — possible

Next.js on Cloudflare Pages requires the Cloudflare adapter:

```bash
cd frontend
npm install -D @opennextjs/cloudflare
npx opennextjs-cloudflare build
# then wrangler deploy or connect GitHub in Cloudflare Dashboard → Pages → Create → Connect to Git → Build command: npx opennextjs-cloudflare build
```

You would need a `wrangler.jsonc`:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "taskflow-frontend",
  "compatibility_date": "2026-08-21",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".open-next/assets",
  "vars": { "NEXT_PUBLIC_API_URL": "https://YOUR-BACKEND.vercel.app/api" },
}
```

### Backend on Cloudflare Workers — not compatible as-is

Cloudflare Workers is **not Node.js** — it is a V8 isolate with `workerd`. NestJS depends on Node APIs (`express`, `http`, `fs`, `crypto` native, `prisma` native query engine). Even with `nodejs_compat`, NestJS will not run correctly, and Prisma's Rust query engine cannot run in Workers. Your options if you must stay on Cloudflare:

| Approach                                                   | What changes                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Rewrite backend for Workers**                            | Replace NestJS with **Hono** + `prisma` driver adapters (`@prisma/adapter-d1` or Hyperdrive for Postgres), use D1/Neon HTTP. Significant rewrite.                                                      |
| **Cloudflare Containers (beta)**                           | Run your NestJS Docker image in Cloudflare's container runtime. You keep the current code, but it's beta and priced like a VM. Requires `wrangler.jsonc` with `containers` binding and a `Dockerfile`. |
| **Keep backend on Vercel/Render, put Cloudflare in front** | Add your domain to Cloudflare, proxy to `your-backend.vercel.app` with a CNAME, get WAF/DDoS/caching for free. No code change.                                                                         |

**Recommendation:** If Vercel is unacceptable for the backend, use **Render/Railway/Fly** for the backend (zero changes) and optionally put **frontend on Cloudflare Pages** or keep it on Vercel. Don't attempt to port NestJS to Workers unless you plan a rewrite.

---

## Environment templates

**`backend/.env.example`** already has:

```
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=10&pool_timeout=20"
JWT_SECRET="change-me-to-a-strong-random-string"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

For Vercel Production, set `FRONTEND_URL` to the actual `https://*.vercel.app` URL and `JWT_SECRET` to `openssl rand -base64 32`.

**`frontend/.env.example`**:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For Vercel Production, set to `https://YOUR-BACKEND.vercel.app/api`.

---

## Checklist

- [ ] Backend builds: `cd backend && npm run build` ✓
- [ ] Frontend builds: `cd frontend && npm run build` ✓
- [ ] `sqlite3` removed from backend deps (native module fails on Vercel) ✓
- [ ] `api/index.ts` + `src/bootstrap.ts` shared config ✓
- [ ] `backend/vercel.json` routes all to serverless function ✓
- [ ] Push to GitHub
- [ ] Create Vercel project for `backend` (Root Directory: `backend`), set env vars, deploy, run `prisma migrate deploy` once
- [ ] Create Vercel project for `frontend` (Root Directory: `frontend`), set `NEXT_PUBLIC_API_URL`, deploy
- [ ] Backfill `FRONTEND_URL` on backend, redeploy
- [ ] Test: guest login, create task, drag-and-drop, create project
- [ ] (Optional) Add custom domains

## Quick local verification before pushing

```bash
npm run build --workspace=backend && npm run build --workspace=frontend
# both should exit 0; warnings about Prisma major update are safe to ignore (stay on 6.16.x unless you migrate)
```

Need me to wire up GitHub Actions or run the first `vercel --prod` deploy from this machine? Say the word and I'll do it.
