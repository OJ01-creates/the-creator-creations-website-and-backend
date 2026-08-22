# The Creator Creations — Backend & Admin Dashboard

A full backend API + admin dashboard for the The Creator Creations design-studio website. Built with
Node.js, Express and a lightweight JSON file database (no external database server to install).

## What's included

- **REST API** for everything the site displays: projects, services, skills, journey
  milestones, about stats, site settings (hero/about/contact copy, plus the logo, hero
  background, and designer photo — every image on the site), contact messages, and
  newsletter subscribers.
- **JWT-based admin authentication** (single admin account, password stored hashed).
- **Admin dashboard UI** at `/admin` — a lightweight, dependency-free web app (no build
  step) styled to match the site's dark/gold aesthetic, with full CRUD screens, image
  upload, and a messages/subscribers inbox.
- **Image uploads** via `multer`, served back out of `/uploads`.

## Getting started

```bash
cd backend
npm install
npm start
```

The server starts on `http://localhost:4000` by default (override with `PORT=...`).

- API base: `http://localhost:4000/api`
- Admin dashboard: `http://localhost:4000/admin`

**Default admin login:** `admin` / `admin123` — please change this immediately from
**Account → Change Password** inside the dashboard after your first login.

The first time the server runs it copies `data/seed.json` (pre-filled with the current
site content) to `data/db.json`, which becomes your live, editable database. Delete
`data/db.json` at any time to reset back to the seed content.

## Environment variables (optional)

| Variable      | Default                          | Purpose                          |
|---------------|-----------------------------------|-----------------------------------|
| `PORT`        | `4000`                            | Port the server listens on        |
| `JWT_SECRET`  | dev default (change in production)| Secret used to sign admin tokens  |

Create a `.env`-style export before `npm start`, e.g. `PORT=5000 JWT_SECRET=supersecret npm start`.

## API overview

All list/read endpoints below are public (so the public website can fetch content).
Write endpoints (`POST` / `PUT` / `PATCH` / `DELETE`) require `Authorization: Bearer <token>`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password` |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `PATCH /api/projects/reorder` |
| Services | same pattern at `/api/services` |
| Skills | same pattern at `/api/skills` |
| Milestones | same pattern at `/api/milestones` |
| Stats | same pattern at `/api/stats` |
| Settings | `GET /api/settings` (public), `PUT /api/settings` (admin) |
| Messages | `POST /api/messages` (public, from the contact form), `GET/PUT/DELETE /api/messages/:id` (admin) |
| Subscribers | `POST /api/subscribers` (public, from the newsletter form), `GET/DELETE /api/subscribers/:id` (admin) |
| Upload | `POST /api/upload` (admin, multipart `image` field) → `{ url }` |
| Dashboard | `GET /api/dashboard` (admin) — counts + recent activity |

### Example: log in and create a project

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"New Work","category":"Branding","year":"2026","order":7}'
```

## Connecting the frontend

The React site in `../frontend` now fetches its content live from this backend by
default — every section component uses the hooks in `frontend/src/lib/useSiteData.ts`,
which point at `http://localhost:4000/api` out of the box. Run both together locally and
edits made in `/admin` (text and images) appear on the site automatically, no rebuild
needed.

If the backend isn't running, every component quietly falls back to its original
built-in content, so the site never breaks.

To point the frontend at a different backend (staging/production), create
`frontend/.env`:

```
VITE_API_URL=https://your-backend-domain.com/api
```

## Data storage & making it durable on free hosting

Data lives in `data/db.json` as plain JSON via [lowdb](https://github.com/typicode/lowdb).
Locally, that's all you need — it just works.

**If you're deploying to a free-tier host like Render**, the disk is wiped whenever the
instance restarts (which free tiers do automatically after ~15 minutes idle). Without
extra setup, that means admin edits and uploaded images would vanish on the next restart.
Two free services close that gap completely, and both are optional — the app runs fine
without them locally, and falls back gracefully if they're not configured:

**1. Upstash Redis (durable database)** — every write is snapshotted here, and it's
restored automatically the next time the server boots.
1. Go to [upstash.com](https://upstash.com), sign up free, create a Redis database
   (any region close to your Render region is fine).
2. On the database's page, find the **REST API** section and copy the
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` values.
3. Add both as environment variables on Render (Dashboard → your service →
   Environment).

**2. Cloudinary (durable image hosting)** — every image you upload through `/admin` goes
straight here instead of the server's local disk, so it's permanent from the moment you
upload it.
1. Go to [cloudinary.com](https://cloudinary.com), sign up free.
2. On your Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API
   Secret**.
3. Add them as environment variables on Render: `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Once both are set and you redeploy, admin edits and uploaded images survive restarts
indefinitely — no more re-uploading anything through GitHub.

For a production deployment with many concurrent writers, you'd eventually want a real
database (Postgres/MySQL) instead of this snapshot approach — the route files are
already organized so only `db.js` would need to change.

## Security notes

- Change the default admin password and `JWT_SECRET` before deploying.
- The JSON database is not encrypted; treat `data/db.json` as sensitive if you store
  personal contact data in it.
- Uploaded files are limited to 8MB and common image extensions.
