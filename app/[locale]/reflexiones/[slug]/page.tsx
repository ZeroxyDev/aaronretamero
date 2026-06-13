import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Adjacent } from "@/components/feature/reflection/adjacent";
import { Body } from "@/components/feature/reflection/body";
import { Meta } from "@/components/feature/reflection/meta";
import { ViewTracker } from "@/components/feature/reflection/view-tracker";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { withReflectionView } from "@/lib/db/domain-actions";
import { getMetadataLocale, isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";
import {
  getAdjacentReflections,
  getAlternateReflectionSlugs,
  getReflectionBySlug,
  getReflectionStaticParams,
} from "@/lib/reflections";
import { buildLocalePath, createPageMetadata, translateMessage } from "@/lib/seo";

type ReflectionPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getReflectionStaticParams();
}

export async function generateMetadata(
  props: ReflectionPageProps,
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await props.params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const reflection = getReflectionBySlug(locale, slug);

  if (!reflection) {
    return {
      title: await translateMessage(locale, siteConfig.seo.notFoundTitleKey),
    };
  }

  const alternates = getAlternateReflectionSlugs(reflection.entryId);
  const siteName = await translateMessage(locale, siteConfig.seo.siteNameKey);

  return createPageMetadata({
    locale,
    title: reflection.title,
    description: reflection.excerpt,
    pathname: buildLocalePath(
      locale,
      `${siteConfig.navigation.reflectionsPath}/${reflection.slug}`,
    ),
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([entryLocale, entrySlug]) => [
        entryLocale as Locale,
        buildLocalePath(
          entryLocale as Locale,
          `${siteConfig.navigation.reflectionsPath}/${entrySlug}`,
        ),
      ]),
    ),
    openGraph: {
      type: "article",
      publishedTime: `${reflection.date}T${reflection.time}:00`,
      authors: [siteName],
      tags: reflection.tags,
      locale: getMetadataLocale(locale),
    },
  });
}

export default async function ReflectionPage(props: ReflectionPageProps) {
  const { locale: rawLocale, slug } = await props.params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const reflection = await (async () => {
    const entry = getReflectionBySlug(locale, slug);
    return entry ? withReflectionView(entry) : null;
  })();

  if (!reflection) {
    notFound();
  }

  const adjacent = getAdjacentReflections(locale, slug);
  const t = await getTranslator(locale, "pages.reflection");
  const routeMap = Object.fromEntries(
    Object.entries(getAlternateReflectionSlugs(reflection.entryId)).map(
      ([entryLocale, entrySlug]) => [
        entryLocale,
        `/${entryLocale}/reflexiones/${entrySlug}`,
      ],
    ),
  );

  return (
    <main className="page-shell w-full">
      <div className="archive-shell mb-12 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="archive-back-link inline-flex">
          {t("backToArchive")}
        </Link>
        <LocaleSwitcher locale={locale} locales={locales} routeMap={routeMap} />
      </div>
      <article className="archive-shell">
        <ViewTracker entryId={reflection.entryId} />
        <header>
          <h1 className="max-w-3xl text-balance text-[2.5rem] font-medium tracking-[-0.05em] text-ink sm:text-[3.3rem]">
            {reflection.title}
          </h1>
          <p className="max-w-2xl text-[1.02rem] leading-8 text-muted sm:text-[1.08rem]">
            {reflection.excerpt}
          </p>
          <Meta locale={locale} reflection={reflection} />
        </header>
        <Body content={reflection.content} />

        <Adjacent locale={locale} previous={adjacent.previous} next={adjacent.next} />
      </article>
    </main>
  );
}
