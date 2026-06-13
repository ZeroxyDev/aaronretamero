import type { Locale } from "@/lib/i18n/config";
import type { GroupedReflections } from "@/lib/reflections";
import { YearGroup } from "./year-group";

type TimelineProps = {
  locale: Locale;
  groups: GroupedReflections;
};

export function Timeline({ locale, groups }: TimelineProps) {
  return (
    <section id="archivo" aria-labelledby="archivo-heading">
      <div className="archive-shell">
        <h2 id="archivo-heading" className="sr-only">
          Archivo de reflexiones
        </h2>
        <div className="space-y-10">
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
