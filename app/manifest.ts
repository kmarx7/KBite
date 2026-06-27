import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KBite",
    short_name: "KBite",
    description:
      "Find halal, vegan, and authentic home cuisine restaurants in Korea",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FF6B35",
    theme_color: "#FF6B35",
    scope: "/",
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["food", "lifestyle"],
  };
}
