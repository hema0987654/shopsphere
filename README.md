# ShopSphere Backend

Node.js + TypeScript + Express backend for ShopSphere (PostgreSQL).

## Requirements

- Node.js (recommended: Node 20+)
- PostgreSQL

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` from the template:
   - Copy `.env.example` → `.env` and fill your values
3. Run in development:
   - `npm run dev`

Server:
- Health check: `GET /health`
- Swagger UI: `GET /api-docs`

## Scripts

- `npm run dev` – run with `tsx` watch
- `npm run typecheck` – TypeScript typecheck only
- `npm run build` – compile TypeScript to `dist/`
- `npm run start` / `npm run start:prod` – run compiled app (`dist/app.js`)

## Docker

This repo includes a `Dockerfile`. Make sure you provide env vars at runtime (the container does not bundle your local `.env`):

- Build: `docker build -t shopsphere .`
- Run: `docker run --rm -p 3000:3000 --env-file .env shopsphere`

