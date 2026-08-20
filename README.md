# TaskFlow — Task Management System

Full-stack **Task Management** app built for the assessment:
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** NestJS 11 + Prisma 6 + SQLite (swappable to Postgres)
- **Auth:** Guest Login (JWT Bearer) + user-scoped tasks
- **Themes:** Light / Dark / System — persisted in `localStorage`, applied before hydration to avoid flash

> Figma fidelity placeholder — final pixels will be matched once screenshots are provided. Theme switcher and layout are already built to be pixel-perfect swappable.

---

## ✨ Features

- **Guest Login** — optional username (`/api/auth/guest` → JWT). No password. Scoped per guest `user.id`.
- **Tasks CRUD** — create / read / update / delete / bulk status / reorder.
- **Fields:** title, description, status (`TODO`/`IN_PROGRESS`/`DONE`), priority (`LOW`/`MEDIUM`/`HIGH`), category, tags[], dueDate, order.
- **Kanban + List views**, search, status/priority/category filters, client-side sorting.
- **Stats** (`/api/tasks/stats`) — totals by status.
- **Validation** — `class-validator` on backend, `ValidationPipe` with `whitelist + transform`.
- **Reusable UI** — `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Card`, `Dialog`, `TaskCard`, `KanbanColumn`, `TaskDialog`, `Header`, `ThemeToggle`.
- **Responsive** — mobile-first, grid/stack breakpoints, scrollable kanban on small screens.
- **Project structure** — clean separation: `modules/prisma`, `modules/auth`, `modules/tasks`, `common/guards`, `common/decorators`.

---

## 🗂️ Monorepo Structure

```
Task/
├── frontend/               # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx  # Geist font, Header, theme hydration script
│   │   │   ├── page.tsx    # Landing + authed board/list
│   │   │   ├── login/page.tsx
│   │   │   └── globals.css # Tailwind v4 + custom dark variant
│   │   ├── components/
│   │   │   ├── ui/         # Button, Input, Card, Badge, Dialog...
│   │   │   ├── layout/     # Header, ThemeProvider, ThemeToggle
│   │   │   └── tasks/      # TaskCard, TaskDialog, KanbanColumn, TaskFilters
│   │   ├── lib/            # utils.cn, api (axios + JWT interceptor)
│   │   ├── stores/         # zustand: auth, tasks, theme
│   │   └── types/          # Task, Stats, User
│   └── .env.local          # NEXT_PUBLIC_API_URL
│
├── backend/                # NestJS
│   ├── prisma/
│   │   ├── schema.prisma   # User, Task, enums — SQLite file:./dev.db
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts         # helmet, cors, ValidationPipe, global prefix /api, JwtAuthGuard via APP_GUARD
│   │   ├── app.module.ts
│   │   ├── config/configuration.ts
│   │   ├── common/
│   │   │   ├── decorators/ # @Public, @CurrentUser
│   │   │   └── guards/     # JwtAuthGuard (respects @Public)
│   │   └── modules/
│   │       ├── prisma/     # PrismaService (global)
│   │       ├── auth/       # guestLogin, me, JwtStrategy
│   │       └── tasks/      # CRUD, search, stats, reorder, DTOs
│   └── .env                # DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
│
└── README.md
```

---

## 🚀 Quick Start

### Prereqs
Node 18+ (tested on 22), npm.

### 1) Backend

```bash
cd backend
npm install
# env is already committed as .env for assessment convenience
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev   # http://localhost:4000/api  (+ /api/health)
# or
npm run build && npm run start:prod
```

**Env (`backend/.env`)**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-in-production-please-use-strong-random"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```
To use **PostgreSQL**, change `datasource db { provider = "postgresql" }` in `prisma/schema.prisma` and set `DATABASE_URL` to your Postgres URL, then `npx prisma migrate dev`.

### 2) Frontend

```bash
cd frontend
npm install
# env
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev     # http://localhost:3000
npm run build && npm run start
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:4000/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | public | Health check |
| `POST` | `/auth/guest` | public | Body `{ username?: string }` → `{ accessToken, user }` |
| `GET` | `/auth/me` | bearer | Current user |
| `POST` | `/tasks` | bearer | Create task |
| `GET` | `/tasks?search=&status=&priority=&category=&sortBy=&sortOrder=&page=&limit=` | bearer | List (user-scoped) + meta |
| `GET` | `/tasks/stats` | bearer | `{ total, todo, inProgress, done, highPriority }` |
| `GET` | `/tasks/:id` | bearer | Get one |
| `PATCH` | `/tasks/:id` | bearer | Update (partial) |
| `PATCH` | `/tasks/bulk/status` | bearer | Body `{ ids: string[], status }` |
| `PATCH` | `/tasks/reorder` | bearer | Body `{ orderedIds: string[] }` |
| `DELETE` | `/tasks/:id` | bearer | Delete |

Auth header: `Authorization: Bearer <JWT>`.

**DTOs** are validated via `class-validator`; errors return `400` with details.

---

## 🎨 Theme

- Toggle in header: `Light / Dark / System`.
- Stored in `localStorage["theme"]`, resolved `light|dark` applied as `document.documentElement` class + `data-theme` attr + `style.colorScheme`.
- Hydration-safe inline script in `layout.tsx` prevents flash.
- Tailwind v4 uses `@custom-variant dark (&:where(.dark, .dark *));` so `dark:` works via class strategy.

---

## 🧩 Frontend Notes

- **State:** Zustand stores (`auth-store`, `task-store`, `theme-store`).
- **HTTP:** `lib/api.ts` axios instance with request interceptor → adds Bearer token, response interceptor → 401 logout+redirect.
- **UX:** board vs list view, Kanban columns, quick status switcher on cards, `TaskDialog` for create/edit, `TaskFilters` with debounced search.
- **Styling:** Tailwind v4 + `clsx`+`tailwind-merge` (`cn`), `class-variance-authority` for variants, `lucide-react` icons, `date-fns`.
- **Reusability:** all UI primitives are isolated in `components/ui` and consumed across tasks/layout.

---

## ☁️ Deployment

- **Frontend:** Vercel (set `NEXT_PUBLIC_API_URL` to your backend URL).
- **Backend:** Railway / Render / Fly / Vercel Functions. For SQLite on ephemeral FS, prefer Postgres in prod (swap provider). Run `prisma migrate deploy` on deploy.
- Keep both URLs public and repo public for 45+ days (per brief).

---

## 📸 Figma → Code

- Figma link: https://www.figma.com/design/obONCFmoTFN27V5H9PHS2X/Assessment-Task
- **Status:** core layout + theme + auth + CRUD are complete and responsive. Detailed pixel pass (spacing, typography, illustrations, motion) will be applied as soon as you share the exported screens/assets — the component system is ready to slot in Figma tokens in one pass (colors, radius, shadows, fonts via `globals.css` + `tailwind` theme).

---

## 🧪 Part 2 — AbleSpace "Take Data" (to be added)

Will be added to `/docs/part2.md` once assessment of the Caseload → Take Data flow is complete (or shared separately).

---

## 📝 Commits

Make many small meaningful commits (the repo is freshly initialized with your first meaningful commit; keep it going). The `.gitignore` for both apps is already set.

---

## License

UNLICENSED (assessment).
