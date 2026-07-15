import type { MetadataRoute } from "next";

const SITE = "https://nutricare-ten.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/book`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/signup`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/login`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
