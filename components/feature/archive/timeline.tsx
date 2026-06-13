import type { Locale } from "@/lib/i18n/config";
import type { GroupedReflections, ReflectionSummary } from "@/lib/reflections";
import { Row } from "./row";
import { YearGroup } from "./year-group";

type TimelineProps = {
  locale: Locale;
  groups: GroupedReflections;
  pinned: ReflectionSummary[];
  labels: {
    archive: string;
    pinned: string;
  };
};

export function Timeline({ locale, groups, pinned, labels }: TimelineProps) {
  return (
    <section id="archivo" aria-labelledby="archivo-heading">
      <div className="archive-shell">
        <h2 id="archivo-heading" className="sr-only">
          {labels.archive}
        </h2>
        <div className="space-y-10">
          {pinned.length > 0 ? (
            <section
              aria-labelledby="pinned-reflections-heading"
              className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-start sm:gap-5"
            >
              <h3
                id="pinned-reflections-heading"
                className="font-mono text-xs leading-6 uppercase tracking-[0.18em] text-muted"
              >
                {labels.pinned}
              </h3>
              <div className="space-y-1">
                {pinned.map((reflection) => (
                  <Row key={reflection.entryId} locale={locale} reflection={reflection} isPinned />
                ))}
              </div>
            </section>
          ) : null}
          {groups.map((yearGroup) => (
            <section
              key={yearGroup.year}
              aria-labelledby={`year-${yearGroup.year}`}
              className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-baseline sm:gap-5"
            >
              <h3
                id={`year-${yearGroup.year}`}
                className="font-mono text-xs leading-6 uppercase tracking-[0.18em] text-muted"
              >
                {yearGroup.year}
              </h3>
              <YearGroup locale={locale} reflections={yearGroup.reflections} />
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
