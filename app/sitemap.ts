import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/lib/i18n/config";
import { getReflectionAlternates } from "@/lib/reflections";
import { buildAbsoluteUrl, buildLocalePath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const reflectionAlternates = getReflectionAlternates();

  return [
    ...locales.flatMap((locale) => [
      {
        url: buildAbsoluteUrl(buildLocalePath(locale)),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1,
      },
      {
        url: buildAbsoluteUrl(buildLocalePath(locale, siteConfig.navigation.aboutPath)),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
    ]),
    ...reflectionAlternates.flatMap((group) =>
      Object.entries(group.slugs).map(([locale, slug]) => ({
        url: buildAbsoluteUrl(
          buildLocalePath(locale as (typeof locales)[number], `${siteConfig.navigation.reflectionsPath}/${slug}`),
        ),
        lastModified: new Date(`${group.date}T${group.time}:00`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}
