import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Body } from "@/components/feature/reflection/body";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { siteConfig } from "@/config/site";
import { getAboutDocument } from "@/lib/about";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";
import { buildLocalePath, createPageMetadata } from "@/lib/seo";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  props: AboutPageProps,
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const about = getAboutDocument(locale);

  if (!about) {
    return {};
  }

  return createPageMetadata({
    locale,
    pathname: buildLocalePath(locale, siteConfig.navigation.aboutPath),
    title: about.title,
    description: about.excerpt,
  });
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const about = getAboutDocument(locale);

  if (!about) {
    notFound();
  }

  const t = await getTranslator(locale, "pages.reflection");
  const routeMap = Object.fromEntries(
    locales.map((entryLocale) => [
      entryLocale,
      `/${entryLocale}/${siteConfig.navigation.aboutPath}`,
    ]),
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
        <header>
          <h1 className="max-w-3xl text-balance text-[2.5rem] font-medium tracking-[-0.05em] text-ink sm:text-[3.3rem]">
            {about.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[1.02rem] leading-8 text-muted sm:text-[1.08rem]">
            {about.excerpt}
          </p>
        </header>
        <Body content={about.content} />
      </article>
    </main>
  );
}
