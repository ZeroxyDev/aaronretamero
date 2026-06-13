import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Timeline } from "@/components/feature/archive/timeline";
import { Intro } from "@/components/feature/home/intro";
import { siteConfig } from "@/config/site";
import { withReflectionViews } from "@/lib/db/domain-actions";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";
import { getGroupedReflections, getPinnedReflections, getReflections } from "@/lib/reflections";
import { buildLocalePath, createPageMetadata } from "@/lib/seo";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  props: HomePageProps,
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const t = await getTranslator(locale, "pages.home");

  return createPageMetadata({
    locale,
    pathname: buildLocalePath(locale),
    title: t("metadataTitle"),
    descriptionKey: siteConfig.seo.defaultDescriptionKey,
  });
}

export default async function LocalizedHomePage(props: HomePageProps) {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const t = await getTranslator(locale, "pages.home");
  const reflections = await withReflectionViews(getReflections(locale));
  const pinnedReflections = getPinnedReflections(reflections);
  const groupedReflections = getGroupedReflections(reflections);
  const routeMap = Object.fromEntries(
    locales.map((entryLocale) => [entryLocale, `/${entryLocale}`]),
  );

  return (
    <main className="page-shell flex w-full flex-col">
      <Intro locale={locale} locales={locales} routeMap={routeMap} />
      <Timeline
        locale={locale}
        groups={groupedReflections}
        pinned={pinnedReflections}
        labels={{
          archive: t("archiveHeading"),
          pinned: t("pinnedHeading"),
        }}
      />
    </main>
  );
}
