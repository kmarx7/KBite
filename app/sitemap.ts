import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://kbite.vercel.app";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: "daily", priority: 1 },
  { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/policy/terms`, changeFrequency: "yearly", priority: 0.3 },
  {
    url: `${BASE_URL}/policy/privacy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let restaurantEntries: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("restaurants")
      .select("id, updated_at")
      .eq("status", "approved")
      .order("updated_at", { ascending: false })
      .limit(500);

    restaurantEntries = (data ?? []).map((r) => ({
      url: `${BASE_URL}/restaurant/${r.id}`,
      lastModified: new Date(r.updated_at as string),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    /* silently skip dynamic entries if DB is unavailable at build time */
  }

  return [...STATIC_ROUTES, ...restaurantEntries];
}
