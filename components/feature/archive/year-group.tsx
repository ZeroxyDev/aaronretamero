import type { Locale } from "@/lib/i18n/config";
import type { ReflectionSummary } from "@/lib/reflections";
import { Row } from "./row";

type YearGroupProps = {
  locale: Locale;
  reflections: ReflectionSummary[];
};

export function YearGroup({ locale, reflections }: YearGroupProps) {
  return (
    <div className="space-y-1">
      {reflections.map((reflection) => (
        <Row key={reflection.slug} locale={locale} reflection={reflection} />
      ))}
    </div>
  );
}
