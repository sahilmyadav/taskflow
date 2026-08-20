# Backend — TaskFlow API (NestJS + Prisma)

## Run

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev   # http://localhost:4000/api
npm run build && npm run start:prod
```

## Env

See `.env` (SQLite by default). Swap to Postgres by changing `provider` in `prisma/schema.prisma` + `DATABASE_URL`.

## API

See root `README.md` for endpoints.

## Scripts

- `npm run build` — `prisma generate && nest build`
- `npm run start:dev` — watch
- `npm run start:prod` — `node dist/src/main`
- `npm run lint`, `npm run test`

## Tech

NestJS 11, Prisma 6, SQLite, JWT (passport-jwt), class-validator, helmet, cors.
