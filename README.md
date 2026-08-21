# TaskFlow — Task Management System

Full-stack task management app built for the Full Stack Developer technical assessment.

| | |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| **Backend** | NestJS 11, Prisma 6, TypeScript |
| **Database** | PostgreSQL |
| **Auth** | Guest login, JWT bearer tokens |
| **Live app** | https://taskflow-web-plum.vercel.app |
| **Live API** | https://taskflow-api-kohl.vercel.app/api |

---

## Features

**Auth**
- Guest login with an optional display name — no password. A workspace and JWT are issued on first request, and all data is scoped to that guest's `user.id`.
- Token persisted in `localStorage`; an axios interceptor attaches it and redirects to `/login` on `401`.

**Tasks**
- Full CRUD, plus bulk status update and drag-and-drop reordering.
- Fields: title, description, status (`TODO` / `IN_PROGRESS` / `DONE` / `ON_HOLD`), priority (`NONE` / `LOW` / `MEDIUM` / `HIGH` / `URGENT`), category, tags, due date, order, project.
- **Kanban board** with drag-and-drop across and within columns (`@dnd-kit`), backed by an optimistic local reorder that reconciles with the API.
- **List view** as an alternative layout, with a Fields menu to toggle visible columns.
- **Task detail panel** with inline editing, subtasks and comments.
- Search, status / priority / category filters, and a stats endpoint.

**Projects**
- CRUD for projects; tasks can be assigned to a project, and each project has its own task page.

**Theming**
- Light / Dark / System modes plus six accent colors (Amber, Blue, Pink, Rose, Emerald, Black).
- Persisted in `localStorage` and re-applied by a blocking inline script in `layout.tsx`, so there is no flash of the wrong theme on refresh.
- System mode subscribes to `prefers-color-scheme` and follows OS changes live.

**Responsive**
- Mobile-first layout: collapsible sidebar, horizontally scrollable board on small screens, stacked forms and dialogs.

---

## Getting started

Requires Node 20+ and a PostgreSQL database.

### Backend

```bash
cd backend
npm install
cp .env.example .env          # then set DATABASE_URL and JWT_SECRET
npx prisma migrate deploy     # apply the schema
npx prisma generate
npm run start:dev             # http://localhost:4000/api
```

`backend/.env`:

```
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=10&pool_timeout=20"
JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Managed Postgres providers (Aiven, Neon, Supabase) need `?sslmode=require`. `connection_limit` is set below the provider's connection cap because Prisma's default pool is `cpus * 2 + 1`, which can exceed a small plan's limit.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm run dev                   # http://localhost:3000
```

Or run both from the repo root with `npm run dev`.

---

## API

Base URL: `http://localhost:4000/api`. All routes require `Authorization: Bearer <token>` unless marked public — a global `JwtAuthGuard` is registered via `APP_GUARD` and opts out through the `@Public()` decorator.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | public | Health check |
| `GET` | `/` | public | API name and version |
| `POST` | `/auth/guest` | public | `{ username? }` → `{ accessToken, user }` |
| `GET` | `/auth/me` | bearer | Current user profile |
| `GET` | `/users/me` | bearer | Current user |
| `PATCH` | `/users/me` | bearer | Update name, title, username, email, avatar, color mode |
| `DELETE` | `/users/me` | bearer | Leave workspace (cascades to tasks) |
| `POST` | `/tasks` | bearer | Create task |
| `GET` | `/tasks` | bearer | List with `search`, `status`, `priority`, `category`, `projectId`, `sortBy`, `sortOrder`, `page`, `limit`, `withRelations` |
| `GET` | `/tasks/stats` | bearer | Counts by status and priority |
| `PATCH` | `/tasks/bulk/status` | bearer | `{ ids: string[], status }` |
| `PATCH` | `/tasks/reorder` | bearer | `{ orderedIds: string[] }` |
| `GET` | `/tasks/:id` | bearer | One task with subtasks and comments |
| `PATCH` | `/tasks/:id` | bearer | Partial update |
| `DELETE` | `/tasks/:id` | bearer | Delete |
| `GET` | `/tasks/:taskId/subtasks` | bearer | List subtasks |
| `POST` | `/tasks/:taskId/subtasks` | bearer | Create subtask |
| `PATCH` | `/tasks/:taskId/subtasks/:id` | bearer | Update subtask |
| `DELETE` | `/tasks/:taskId/subtasks/:id` | bearer | Delete subtask |
| `GET` | `/tasks/:taskId/comments` | bearer | List comments |
| `POST` | `/tasks/:taskId/comments` | bearer | Add comment |
| `DELETE` | `/tasks/:taskId/comments/:id` | bearer | Delete comment |
| `POST` | `/projects` | bearer | Create project |
| `GET` | `/projects` | bearer | List with `search`, `priority` |
| `GET` | `/projects/:id` | bearer | Project with its tasks |
| `PATCH` | `/projects/:id` | bearer | Partial update |
| `DELETE` | `/projects/:id` | bearer | Delete |

Every request body is a `class-validator` DTO behind a global `ValidationPipe` (`whitelist: true`, `transform: true`), so unknown properties are stripped and invalid input returns `400` with field-level messages. Query strings are validated the same way.

---

## Architecture

```
backend/
├── prisma/
│   ├── schema.prisma        # User, Project, Task, Subtask, Comment + enums
│   └── migrations/
└── src/
    ├── main.ts              # helmet, CORS, ValidationPipe, /api prefix, global JwtAuthGuard
    ├── config/              # typed env configuration
    ├── common/
    │   ├── decorators/      # @Public, @CurrentUser
    │   └── guards/          # JwtAuthGuard (honours @Public)
    └── modules/
        ├── prisma/          # PrismaService (global module)
        ├── auth/            # guest login, JWT strategy
        ├── users/           # profile read/update/delete
        ├── tasks/           # tasks + nested subtasks and comments
        └── projects/

frontend/src/
├── app/                     # App Router: /, /login, /profile, /projects, /projects/[id]
├── components/
│   ├── ui/                  # Avatar, Badge, Button, Card, Dialog, Input, Select, Textarea
│   ├── app/                 # Sidebar, Topbar, BoardColumn, BoardCard, ListView, TaskDetail, FieldsMenu, Toast, Splash
│   ├── tasks/               # TaskDialog, TaskFilters
│   ├── projects/            # ProjectDialog
│   └── layout/              # ThemeProvider, ThemeToggle
├── stores/                  # Zustand: auth, tasks, projects, theme
├── lib/                     # axios client, error formatting, cn(), motion presets
└── types/                   # shared domain types
```

**Notes on a few decisions**

- **Prisma types over hand-written shapes.** Service layers use `Prisma.TaskUpdateInput` and friends rather than `any` payload objects, so a schema change surfaces as a compile error.
- **`tags` is a JSON string column.** Tasks store tags as serialised JSON and the service maps it to a `string[]` at the API boundary, keeping the wire format array-shaped.
- **Render-time state seeding.** Dialogs and the detail panel seed their form from props during render (React's documented adjust-state-on-prop-change pattern) instead of `useEffect` + `setState`, which avoids a cascading second render on every open.
- **One `Avatar` primitive.** Avatar URLs are arbitrary user-supplied strings, which `next/image` cannot pre-authorise via `remotePatterns`, so a plain `<img>` is used in a single wrapper rather than at seven call sites.

---

## Quality

```bash
cd backend  && npx tsc --noEmit && npx eslint "src/**/*.ts" && npm test
cd frontend && npx tsc --noEmit && npx eslint src
```

Both packages typecheck and lint clean.

---

## Part 2 — AbleSpace "Take Data" walkthrough

See [`docs/part2.md`](docs/part2.md).

---

## License

UNLICENSED — submitted as a technical assessment.
