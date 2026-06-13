import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import type { Reflection } from "@/lib/reflections";
import { estimateReadingTimeMinutes, formatDisplayDate, formatViews } from "@/lib/reflections";
import { getTranslator, translateMessage } from "@/lib/i18n/server";

type MetaProps = {
  locale: Locale;
  reflection: Reflection;
};

export async function Meta({ locale, reflection }: MetaProps) {
  const siteHandle = await translateMessage(locale, siteConfig.seo.siteHandleKey);
  const t = await getTranslator(locale, "components.feature.reflection.meta");
  const readingTime = estimateReadingTimeMinutes(reflection.content);

  return (
    <div className="flex items-baseline justify-between gap-4 text-sm leading-6 text-muted">
      <p className="min-w-0">
        <a
          href={siteConfig.social.primaryProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {siteHandle}
        </a>
        {" · "}
        {formatDisplayDate(reflection.date, reflection.time, locale)}
      </p>
      <p className="shrink-0">
        {t("readingTime", { count: readingTime })}
        {" · "}
        {formatViews(reflection.views, locale)} {t("views", { count: reflection.views })}
      </p>
    </div>
  );
}
