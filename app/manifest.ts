import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchCart",
    short_name: "MatchCart",
    description:
      "Compare grocery prices across the stores you shop at.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f4ed",
    theme_color: "#243239",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}