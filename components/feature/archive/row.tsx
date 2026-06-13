import Link from "next/link";
import { icons } from "@/components/ui/icons";
import { UiIcon } from "@/components/ui/ui-icon";
import type { Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";
import { formatViews, type ReflectionSummary } from "@/lib/reflections";

type RowProps = {
  locale: Locale;
  reflection: ReflectionSummary;
  isPinned?: boolean;
};

export async function Row({ locale, reflection, isPinned = false }: RowProps) {
  const t = await getTranslator(locale, "components.feature.archive.row");

  return (
    <Link
      href={`/${locale}/reflexiones/${reflection.slug}`}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-0 pb-2 pt-0"
    >
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          {isPinned ? (
            <UiIcon icon={icons.pin} className="block size-4 shrink-0 text-muted" />
          ) : null}
          <span className="block truncate text-[1.02rem] leading-6 tracking-[-0.02em] text-ink">
            {reflection.title}
          </span>
        </span>
        <span className="block text-sm leading-6 text-muted">
          {reflection.excerpt}
        </span>
      </span>
      <span className="pt-0.5 font-mono text-[0.78rem] text-muted">
        {formatViews(reflection.views, locale)} {t("views", { count: reflection.views })}
      </span>
    </Link>
  );
}
