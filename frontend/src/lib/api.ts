/**
 * Lightweight client for the The Creator Creations backend API.
 *
 * Defaults to http://localhost:4000/api (the backend's default port) so the
 * site and admin dashboard work together out of the box in local dev. Override
 * with VITE_API_URL in a .env file for staging/production.
 *
 * Every getter here fails soft: if the backend isn't running or a request
 * errors, it resolves to `null` and calling code falls back to the site's
 * built-in default content — nothing on the page ever breaks because the
 * backend is unreachable.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  color: string;
  image: string;
  order: number;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Skill {
  id: number;
  name: string;
  level: number;
  order: number;
}

export interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

export interface Stat {
  id: number;
  value: string;
  label: string;
  order: number;
}

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  logoImage?: string;
  heroImage?: string;
  heroTitleLine1?: string;
  heroTitleHighlight?: string;
  heroTitleLine2?: string;
  heroSubtitle?: string;
  aboutHeading?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;
  designerName?: string;
  designerTitle?: string;
  designerImage?: string;
  designerBio1?: string;
  designerBio2?: string;
  yearsExperience?: number;
  contactEmail?: string;
  contactPhone?: string;
  contactLocation?: string;
}

/**
 * Resolves an image path returned by the API into a fully-qualified URL.
 * Backend uploads come back as "/uploads/xyz.jpg" (relative to the backend's
 * own origin, not the frontend's) — this stitches that together. Already-
 * absolute URLs pass through untouched. Falsy input returns undefined so
 * callers can easily fall back to a bundled local image.
 */
export function resolveImageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend not reachable — caller falls back to local defaults.
    return null;
  }
}

async function postJson(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  getSettings: () => getJson<SiteSettings>("/settings"),
  getProjects: () => getJson<Project[]>("/projects"),
  getServices: () => getJson<Service[]>("/services"),
  getSkills: () => getJson<Skill[]>("/skills"),
  getMilestones: () => getJson<Milestone[]>("/milestones"),
  getStats: () => getJson<Stat[]>("/stats"),

  /** Submit the contact form. Returns true if the backend accepted it. */
  sendContactMessage: (data: { name: string; email: string; subject: string; message: string }) =>
    postJson("/messages", data),

  /** Subscribe an email to the newsletter. Returns true if the backend accepted it. */
  subscribeNewsletter: (email: string) => postJson("/subscribers", { email }),
};
