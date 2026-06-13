import Link from "next/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";

type IntroProps = {
  locale: Locale;
  locales: readonly Locale[];
  routeMap: Partial<Record<Locale, string>>;
};

export async function Intro({ locale, locales, routeMap }: IntroProps) {
  const t = await getTranslator(locale, "components.feature.home.intro");

  return (
    <section className="archive-shell mb-10 flex flex-col gap-4 pb-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pb-6">
      <div>
        <p className="max-w-3xl text-balance text-[1.65rem] font-medium tracking-[-0.05em] text-ink">
          {t("title")}
        </p>
        <p className="max-w-xl text-[1.02rem] leading-8 text-muted">
          {t("description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted sm:justify-end">
        <Link href={`/${locale}/${siteConfig.navigation.aboutPath}`} className="hover:text-ink">
          {t("links.about")}
        </Link>
        <a
          href={siteConfig.social.follow.url}
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink"
        >
          {siteConfig.social.follow.title}
        </a>
        <LocaleSwitcher locale={locale} locales={locales} routeMap={routeMap} />
      </div>
    </section>
  );
}
