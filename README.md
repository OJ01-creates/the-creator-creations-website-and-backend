# The Creator Creations — Website + Backend Admin

This package contains the full The Creator Creations creative-design-studio website plus a
backend API and admin dashboard for managing its content — including every image on the
site.

```
.
├── frontend/   # React + Vite + Tailwind site — now pulls its content live from the backend
└── backend/    # Express API + JSON database + /admin dashboard
```

## Quick start

**1. Run the backend** (API + admin dashboard):

```bash
cd backend
npm install
npm start
```

- Admin dashboard: http://localhost:4000/admin (login: `admin` / `admin123`)
- API base: http://localhost:4000/api

**2. Run the frontend** (the public site):

```bash
cd frontend
npm install
npm run dev
```

- Site: http://localhost:8080 (or whatever port Vite prints)

The frontend is pre-configured to talk to `http://localhost:4000/api` by default, so as
long as the backend is running, everything you change in `/admin` — text **and
pictures** — appears on the site automatically (it refetches on tab focus and every 15s,
no rebuild needed). If the backend isn't running, the site quietly falls back to its
built-in default content, so it never breaks.

To point the frontend at a different backend (staging/production), create
`frontend/.env` with:

```
VITE_API_URL=https://your-backend-domain.com/api
```

## What the admin dashboard manages

- **Projects** — the Selected Works portfolio cards *and* the cinematic fullscreen
  slider (title, category, year, **image**, order)
- **Services** — the six service tiles
- **Skills** — the skill bars on the designer profile
- **Journey** — the career-milestone slider (year, title, description, **image**)
- **About Stats** — the four stat counters (150+ Projects, 12 Years, etc.)
- **Site Settings** — every other picture and headline on the site:
  - **Logo** (navbar + footer + loading screen)
  - **Hero background image**
  - **Designer photo**
  - Hero copy, about copy, designer bio, contact email/phone/location
- **Messages** — every contact-form submission, with read/unread + delete
- **Subscribers** — every newsletter signup, with delete
- **Account** — change the admin password

Every image field in the dashboard is a real file upload (drag a new photo in, it
replaces the old one immediately) — there's no picture on the site that can't be swapped
from `/admin`. See `backend/README.md` for the full API reference.

## The loading screen

The site now opens with an animated loading sequence (`frontend/src/components/LoadingScreen.tsx`):
a circular progress ring draws in around the logo, the site name reveals word-by-word,
a progress bar counts up, then the whole screen splits apart like a curtain to reveal the
hero underneath. It reads the live logo and site name from the backend too, so it stays
on-brand automatically if you change either in `/admin`.

## How the live wiring works

Each section component (`HeroSection`, `ProjectSlider`, `ServicesSection`,
`DesignerProfile`, `AboutSection`, `ContactSection`, `Navbar`, `Footer`) uses a small set
of React Query hooks in `frontend/src/lib/useSiteData.ts` to fetch its content from the
backend. If a request fails or the backend is offline, each component falls back to the
same default content it shipped with — so the site is never broken, only "extra alive"
when the backend is up.

Image paths returned by the API (e.g. `/uploads/xyz.jpg`) are resolved to full URLs by
`resolveImageUrl()` in `frontend/src/lib/api.ts`.
