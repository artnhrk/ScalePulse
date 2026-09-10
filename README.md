# ScalePulse

## Prerequisites

- Node.js `>=22.0.0 <23.0.0`
- Docker
- npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the `.env` file

```env
NODE_ENV=development
PORT=6969
LOG_LEVEL=warn
COOKIE_SECRET=<at-least-32-characters>
DATABASE_URL="postgresql://admin:password123@localhost:5432/scalepulse?schema=public"
```

> `COOKIE_SECRET` must be at least 32 characters long. Valid `NODE_ENV` values: `development`, `production`, `test`, `staging`.

### 3. Start the database

```bash
docker compose up -d
```

> If port `5432` is already in use by another Postgres, stop it (`brew services stop postgresql@<version>`) or change the port in `docker-compose.yml` and update `DATABASE_URL` accordingly.

### 4. Apply migrations

```bash
npx prisma generate
npx prisma migrate dev
```

or 

```bash
npx prisma migrate deploy
```

## Run the Application

Development (hot reload):

```bash
npm run dev
```

Production-style build:

```bash
npm run build
npm start
```

Server runs at `http://localhost:6969` (or `PORT`).

## Test

```bash
npm test
```
