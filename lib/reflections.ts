import fs from "node:fs";
import path from "node:path";
import { parseContentDocument } from "./content";
import { defaultLocale, locales, type Locale } from "./i18n/config";

const REFLECTIONS_DIR = path.join(process.cwd(), "content", "reflections");

export type ReflectionFrontmatter = {
  id: string;
  locale: Locale;
  title: string;
  slug: string;
  date: string;
  time: string;
  excerpt: string;
  tags: string[];
  state: string;
};

export type Reflection = ReflectionFrontmatter & {
  entryId: string;
  content: string;
  availableLocales: Locale[];
  views: number;
};

export type ReflectionSummary = Omit<Reflection, "content">;

export type GroupedReflections = Array<{
  year: string;
  reflections: ReflectionSummary[];
}>;

type ReflectionGroup = {
  entryId: string;
  date: string;
  time: string;
  translations: Partial<Record<Locale, Reflection>>;
};

function resolveReflectionTranslation(group: ReflectionGroup, locale: Locale) {
  return (
    group.translations[locale] ??
    group.translations[defaultLocale] ??
    Object.values(group.translations).find(Boolean) ??
    null
  );
}

function parseReflectionFile(fileContent: string): ReflectionFrontmatter & { content: string } {
  const { frontmatter, content } = parseContentDocument<Record<string, string | string[] | number>>(
    fileContent,
  );
  const data = frontmatter;

  return {
    id: String(data.id || ""),
    locale: String(data.locale) as Locale,
    title: String(data.title),
    slug: String(data.slug),
    date: String(data.date),
    time: String(data.time),
    excerpt: String(data.excerpt),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    state: String(data.state),
    content,
  };
}

function getReflectionSortValue(reflection: Pick<ReflectionFrontmatter, "date" | "time">) {
  return new Date(`${reflection.date}T${reflection.time}:00`).getTime();
}

function getReflectionEntryId(reflection: Pick<ReflectionFrontmatter, "date" | "time">) {
  return `${reflection.date}T${reflection.time}`;
}

function listReflectionFiles(directoryPath: string): string[] {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return listReflectionFiles(entryPath);
    }

    if (entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))) {
      return [entryPath];
    }

    return [];
  });
}

function listReflectionGroups(): ReflectionGroup[] {
  const groups = new Map<string, ReflectionGroup>();
  const files = listReflectionFiles(REFLECTIONS_DIR).sort();

  files.forEach((filePath) => {
    const parsed = parseReflectionFile(fs.readFileSync(filePath, "utf8"));
    const entryId = parsed.id || getReflectionEntryId(parsed);
    const group =
      groups.get(entryId) ??
      ({
        entryId,
        date: parsed.date,
        time: parsed.time,
        translations: {},
      } satisfies ReflectionGroup);

    group.translations[parsed.locale] = {
      ...parsed,
      entryId,
      availableLocales: [],
      views: 0,
    };

    groups.set(entryId, group);
  });

  return Array.from(groups.values()).map((group) => {
    const availableLocales = Object.keys(group.translations) as Locale[];

    availableLocales.forEach((locale) => {
      const reflection = group.translations[locale];

      if (reflection) {
        reflection.availableLocales = availableLocales;
      }
    });

    return group;
  });
}

function toSummary(reflection: Reflection): ReflectionSummary {
  const { content, ...summary } = reflection;
  void content;
  return summary;
}

function getLocaleReflectionsMap(locale: Locale) {
  return listReflectionGroups()
    .map((group) => resolveReflectionTranslation(group, locale))
    .filter((entry): entry is Reflection => Boolean(entry))
    .sort((left, right) => getReflectionSortValue(right) - getReflectionSortValue(left));
}

export function getReflections(locale: Locale): Reflection[] {
  return getLocaleReflectionsMap(locale);
}

export function getReflectionBySlug(locale: Locale, slug: string): Reflection | null {
  return getReflections(locale).find((reflection) => reflection.slug === slug) ?? null;
}

export function getReflectionStaticParams() {
  return listReflectionGroups().flatMap((group) =>
    locales
      .map((locale) => {
        const reflection = resolveReflectionTranslation(group, locale);

        if (!reflection) {
          return null;
        }

        return {
          locale,
          slug: reflection.slug,
        };
      })
      .filter((entry): entry is { locale: Locale; slug: string } => Boolean(entry)),
  );
}

export function getAlternateReflectionSlugs(entryId: string) {
  const group = listReflectionGroups().find((entry) => entry.entryId === entryId);

  if (!group) {
    return {};
  }

  return Object.fromEntries(
    locales
      .map((locale) => {
        const reflection = resolveReflectionTranslation(group, locale);
        return reflection ? [locale, reflection.slug] : null;
      })
      .filter((entry): entry is [Locale, string] => Boolean(entry)),
  ) as Partial<Record<Locale, string>>;
}

export function getReflectionAlternates() {
  return listReflectionGroups().map((group) => ({
    entryId: group.entryId,
    date: group.date,
    time: group.time,
    slugs: Object.fromEntries(
      locales
        .map((locale) => {
          const reflection = resolveReflectionTranslation(group, locale);
          return reflection ? [locale, reflection.slug] : null;
        })
        .filter((entry): entry is [Locale, string] => Boolean(entry)),
    ) as Partial<Record<Locale, string>>,
  }));
}

export function getAdjacentReflections(locale: Locale, slug: string): {
  previous: ReflectionSummary | null;
  next: ReflectionSummary | null;
} {
  const reflections = getReflections(locale);
  const currentIndex = reflections.findIndex((reflection) => reflection.slug === slug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  const previous = reflections[currentIndex + 1] ?? null;
  const next = currentIndex > 0 ? reflections[currentIndex - 1] : null;

  return {
    previous: previous ? toSummary(previous) : null,
    next: next ? toSummary(next) : null,
  };
}

export function getGroupedReflections(reflections: Reflection[]): GroupedReflections {
  const years = new Map<string, ReflectionSummary[]>();

  reflections.forEach((reflection) => {
    const [year] = reflection.date.split("-");
    const yearReflections = years.get(year) ?? [];

    yearReflections.push(toSummary(reflection));
    years.set(year, yearReflections);
  });

  return Array.from(years.entries())
    .sort(([leftYear], [rightYear]) => Number(rightYear) - Number(leftYear))
    .map(([year, yearReflections]) => ({
      year,
      reflections: yearReflections.sort(
        (left, right) => getReflectionSortValue(right) - getReflectionSortValue(left),
      ),
    }));
}

export function formatMonthDay(date: string, locale: Locale) {
  const [year, month, day] = date.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
  });

  return formatter
    .formatToParts(new Date(Date.UTC(year, month - 1, day)))
    .filter((part) => part.type === "month" || part.type === "day")
    .map((part) =>
      part.type === "month" ? part.value.replace(".", "").toUpperCase() : part.value,
    )
    .join(" ");
}

export function formatDisplayDate(date: string, _time: string, locale: Locale) {
  const [year, month, day] = date.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return formatter.format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatViews(views: number, locale: Locale) {
  return new Intl.NumberFormat(locale).format(views);
}
