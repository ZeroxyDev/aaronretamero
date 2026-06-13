import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { ReflectionSummary } from "@/lib/reflections";
import { getTranslator } from "@/lib/i18n/server";

type AdjacentProps = {
  locale: Locale;
  previous: ReflectionSummary | null;
  next: ReflectionSummary | null;
};

export async function Adjacent({ locale, previous, next }: AdjacentProps) {
  if (!previous && !next) {
    return null;
  }

  const t = await getTranslator(locale, "components.feature.reflection.adjacent");

  return (
    <nav
      aria-label={t("label")}
      className="mt-8 grid gap-8 pt-6 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/${locale}/reflexiones/${previous.slug}`}
          className="block py-2"
        >
          <p className="text-sm text-muted">{t("previous")}</p>
          <p className="mt-1 text-lg font-medium tracking-[-0.03em] text-ink">
            {previous.title}
          </p>
          <p className="mt-1 max-w-md text-sm leading-7 text-muted">{previous.excerpt}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/${locale}/reflexiones/${next.slug}`}
          className="block py-2 sm:text-right"
        >
          <p className="text-sm text-muted">{t("next")}</p>
          <p className="mt-1 text-lg font-medium tracking-[-0.03em] text-ink">
            {next.title}
          </p>
          <p className="mt-1 ml-auto max-w-md text-sm leading-7 text-muted">
            {next.excerpt}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
