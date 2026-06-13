import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseContentDocument } from "../lib/content";
import { localeConfig, type Locale } from "../lib/i18n/config";
import { loadLocalEnvFiles, getRequiredEnv } from "./lib/env";
import { requestOpenAiJson } from "./lib/openai";

const REFLECTIONS_DIR = path.join(process.cwd(), "content", "reflections");
const ABOUT_DIR = path.join(process.cwd(), "content", "about");

type ReflectionDocument = {
  type: "reflection";
  id: string;
  locale: Locale;
  title: string;
  slug: string;
  date: string;
  time: string;
  pinned: boolean;
  excerpt: string;
  tags: string[];
  state: string;
  content: string;
  filePath: string;
};

type AboutDocument = {
  type: "about";
  locale: Locale;
  title: string;
  excerpt: string;
  content: string;
  filePath: string;
};

type ContentDocument = ReflectionDocument | AboutDocument;

type ReflectionTranslation = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  state: string;
  content: string;
};

type AboutTranslation = {
  title: string;
  excerpt: string;
  content: string;
};

type ContentTranslation = ReflectionTranslation | AboutTranslation;

type ContentType = ContentDocument["type"];

const locales = Object.keys(localeConfig) as Locale[];

function readDocumentFile(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function listFiles(directoryPath: string): string[] {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    if (entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))) {
      return [entryPath];
    }

    return [];
  });
}

function parseReflectionFile(filePath: string): ReflectionDocument {
  const { frontmatter, content } = parseContentDocument<Record<string, string | string[] | boolean>>(
    readDocumentFile(filePath),
  );
  const locale = String(frontmatter.locale) as Locale;

  if (!locales.includes(locale)) {
    throw new Error(`Unsupported locale "${locale}" in ${filePath}`);
  }

  return {
    type: "reflection",
    id: String(frontmatter.id),
    locale,
    title: String(frontmatter.title),
    slug: String(frontmatter.slug),
    date: String(frontmatter.date),
    time: String(frontmatter.time),
    pinned: frontmatter.pinned === true || String(frontmatter.pinned).toLowerCase() === "true",
    excerpt: String(frontmatter.excerpt),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
    state: String(frontmatter.state),
    content,
    filePath,
  };
}

function parseAboutFile(filePath: string): AboutDocument {
  const { frontmatter, content } = parseContentDocument<Record<string, string | string[]>>(
    readDocumentFile(filePath),
  );
  const locale = String(frontmatter.locale) as Locale;

  if (!locales.includes(locale)) {
    throw new Error(`Unsupported locale "${locale}" in ${filePath}`);
  }

  return {
    type: "about",
    locale,
    title: String(frontmatter.title),
    excerpt: String(frontmatter.excerpt),
    content,
    filePath,
  };
}

function getReflectionGroups() {
  const groups = new Map<string, ReflectionDocument[]>();

  listFiles(REFLECTIONS_DIR)
    .sort()
    .forEach((filePath) => {
      const reflection = parseReflectionFile(filePath);
      const group = groups.get(reflection.id) ?? [];
      group.push(reflection);
      groups.set(reflection.id, group);
    });

  return groups;
}

function getAboutDocuments() {
  return new Map(
    listFiles(ABOUT_DIR)
      .sort()
      .map((filePath) => {
        const about = parseAboutFile(filePath);
        return [about.locale, about] as const;
      }),
  );
}

function buildPrompt(source: ContentDocument, targetLocale: Locale) {
  if (source.type === "reflection") {
    return [
      "You are an expert literary translator for a minimal editorial website.",
      "Translate the reflection as faithfully as possible into the target language.",
      "Preserve the author's original voice, tone, cadence, intimacy, and structure.",
      "The result must read as if it had been originally written by a native speaker of the target language.",
      "Adapt expressions where needed so they feel natural in the target language instead of literally translated.",
      "Avoid translationese completely.",
      "Use colloquial phrasing or light idiomatic language only when it helps preserve the original tone.",
      "Do not over-localize with strong region-specific slang unless it is truly necessary to keep the same voice.",
      "Preserve Markdown headings, emphasis, separators, and paragraph breaks.",
      "Do not add explanations, notes, or commentary.",
      "Return valid JSON only.",
      'Use this JSON shape exactly: {"title":"","slug":"","excerpt":"","tags":[],"state":"","content":""}',
      "The slug must be natural in the target language and kebab-case.",
      "",
      `Content type: ${source.type}`,
      `Source locale: ${source.locale}`,
      `Target locale: ${targetLocale}`,
      "",
      "Source content:",
      JSON.stringify(
        {
          title: source.title,
          slug: source.slug,
          excerpt: source.excerpt,
          tags: source.tags,
          state: source.state,
          content: source.content,
        },
        null,
        2,
      ),
    ].join("\n");
  }

  return [
    "You are an expert literary translator for a minimal editorial website.",
    "Translate the about page as faithfully as possible into the target language.",
    "Preserve the author's original voice, tone, cadence, intimacy, and structure.",
    "The result must read as if it had been originally written by a native speaker of the target language.",
    "Adapt expressions where needed so they feel natural in the target language instead of literally translated.",
    "Avoid translationese completely.",
    "Use colloquial phrasing or light idiomatic language only when it helps preserve the original tone.",
    "Do not over-localize with strong region-specific slang unless it is truly necessary to keep the same voice.",
    "Preserve Markdown headings, emphasis, separators, and paragraph breaks.",
    "Do not add explanations, notes, or commentary.",
    "Return valid JSON only.",
    'Use this JSON shape exactly: {"title":"","excerpt":"","content":""}',
    "",
    `Content type: ${source.type}`,
    `Source locale: ${source.locale}`,
    `Target locale: ${targetLocale}`,
    "",
    "Source content:",
    JSON.stringify(
      {
        title: source.title,
        excerpt: source.excerpt,
        content: source.content,
      },
      null,
      2,
    ),
  ].join("\n");
}

async function translateContent(source: ContentDocument, targetLocale: Locale) {
  return source.type === "reflection"
    ? requestOpenAiJson<ReflectionTranslation>(buildPrompt(source, targetLocale))
    : requestOpenAiJson<AboutTranslation>(buildPrompt(source, targetLocale));
}

function stringifyFrontmatterValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
  }

  return JSON.stringify(value);
}

function buildDocument(source: ContentDocument, locale: Locale, translation: ContentTranslation) {
  if (source.type === "reflection") {
    const reflectionTranslation = translation as ReflectionTranslation;

    return [
      "---",
      `id: ${JSON.stringify(source.id)}`,
      `locale: ${JSON.stringify(locale)}`,
      `title: ${stringifyFrontmatterValue(reflectionTranslation.title)}`,
      `slug: ${stringifyFrontmatterValue(reflectionTranslation.slug)}`,
      `date: ${JSON.stringify(source.date)}`,
      `time: ${JSON.stringify(source.time)}`,
      `pinned: ${JSON.stringify(source.pinned)}`,
      `excerpt: ${stringifyFrontmatterValue(reflectionTranslation.excerpt)}`,
      `tags: ${stringifyFrontmatterValue(reflectionTranslation.tags)}`,
      `state: ${stringifyFrontmatterValue(reflectionTranslation.state)}`,
      "---",
      "",
      reflectionTranslation.content.trim(),
      "",
    ].join("\n");
  }

  const aboutTranslation = translation as AboutTranslation;

  return [
    "---",
    `locale: ${JSON.stringify(locale)}`,
    `title: ${stringifyFrontmatterValue(aboutTranslation.title)}`,
    `excerpt: ${stringifyFrontmatterValue(aboutTranslation.excerpt)}`,
    "---",
    "",
    aboutTranslation.content.trim(),
    "",
  ].join("\n");
}

function buildTargetPath(source: ContentDocument, targetLocale: Locale, translation: ContentTranslation) {
  if (source.type === "reflection") {
    const { slug } = translation as ReflectionTranslation;
    const [year, month] = source.date.split("-");
    return path.join(REFLECTIONS_DIR, targetLocale, year, month, `${slug}.mdx`);
  }

  return path.join(ABOUT_DIR, `${targetLocale}.mdx`);
}

async function promptForContentType(readline: ReturnType<typeof createInterface>) {
  while (true) {
    const answer = (
      await readline.question('Que contenido quieres traducir? ("reflection" o "about") [reflection]: ')
    )
      .trim()
      .toLowerCase();

    if (!answer || answer === "reflection" || answer === "about") {
      return (answer || "reflection") as ContentType;
    }

    output.write(`Tipo no valido: ${answer}\n`);
  }
}

async function promptForLocale(
  readline: ReturnType<typeof createInterface>,
  message: string,
  fallback: Locale,
) {
  while (true) {
    const answer = (await readline.question(
      `${message} (${locales.join(", ")}) [${fallback}]: `,
    )).trim();
    const locale = (answer || fallback) as Locale;

    if (locales.includes(locale)) {
      return locale;
    }

    output.write(`Locale no valido: ${locale}\n`);
  }
}

async function promptForReflectionSource(
  readline: ReturnType<typeof createInterface>,
  baseLocale: Locale,
  groups: Map<string, ReflectionDocument[]>,
) {
  const available = [...groups.entries()]
    .map(([id, reflections]) => ({
      id,
      source: reflections.find((reflection) => reflection.locale === baseLocale) ?? null,
      locales: reflections.map((reflection) => reflection.locale).sort(),
    }))
    .filter((item) => item.source);

  output.write(`\nReflections disponibles en ${baseLocale}:\n`);
  available.forEach(({ id, source, locales: itemLocales }) => {
    output.write(`- ${id} | ${source?.date} | ${source?.title} | [${itemLocales.join(", ")}]\n`);
  });

  while (true) {
    const reflectionId = (await readline.question("\nCual es el ID de la reflection a traducir?: ")).trim();
    const reflectionGroup = groups.get(reflectionId);
    const sourceReflection = reflectionGroup?.find((item) => item.locale === baseLocale) ?? null;

    if (sourceReflection) {
      return sourceReflection;
    }

    output.write("No encontre esa reflection para el idioma base seleccionado.\n");
  }
}

async function promptForAboutSource(
  readline: ReturnType<typeof createInterface>,
  baseLocale: Locale,
  documents: Map<Locale, AboutDocument>,
) {
  const source = documents.get(baseLocale);

  if (!source) {
    throw new Error(`No encontre content/about/${baseLocale}.mdx`);
  }

  output.write(`\nAbout disponible en ${baseLocale}: ${source.title}\n`);
  const answer = (await readline.question('Pulsa enter para traducir "about": ')).trim();
  void answer;
  return source;
}

async function promptForTargetLocales(
  readline: ReturnType<typeof createInterface>,
  baseLocale: Locale,
) {
  const availableTargets = locales.filter((locale) => locale !== baseLocale);
  const answer = (await readline.question(
    `Idiomas destino ("all" o lista separada por comas) [all]: `,
  )).trim();

  if (!answer || answer.toLowerCase() === "all") {
    return availableTargets;
  }

  const selected = answer
    .split(",")
    .map((value) => value.trim() as Locale)
    .filter(Boolean)
    .filter((locale) => availableTargets.includes(locale));

  if (selected.length === 0) {
    return availableTargets;
  }

  return [...new Set(selected)];
}

async function promptForOverwrite(readline: ReturnType<typeof createInterface>) {
  const answer = (await readline.question("Sobrescribir traducciones existentes? [y/N]: "))
    .trim()
    .toLowerCase();
  return answer === "y" || answer === "yes" || answer === "s" || answer === "si";
}

function getExistingTranslation(
  source: ContentDocument,
  targetLocale: Locale,
  reflectionGroups: Map<string, ReflectionDocument[]>,
  aboutDocuments: Map<Locale, AboutDocument>,
) {
  if (source.type === "reflection") {
    return reflectionGroups.get(source.id)?.find((item) => item.locale === targetLocale) ?? null;
  }

  return aboutDocuments.get(targetLocale) ?? null;
}

async function main() {
  const readline = createInterface({ input, output });

  try {
    loadLocalEnvFiles();
    getRequiredEnv("OPENAI_KEY");

    const contentType = await promptForContentType(readline);
    const reflectionGroups = contentType === "reflection" ? getReflectionGroups() : new Map();
    const aboutDocuments = contentType === "about" ? getAboutDocuments() : new Map();
    const baseLocale = await promptForLocale(readline, "Cual es tu idioma base?", "es");
    const source =
      contentType === "reflection"
        ? await promptForReflectionSource(readline, baseLocale, reflectionGroups)
        : await promptForAboutSource(readline, baseLocale, aboutDocuments);
    const targetLocales = await promptForTargetLocales(readline, baseLocale);
    const overwriteExisting = await promptForOverwrite(readline);

    output.write(
      `\nTraduciendo ${source.type === "reflection" ? `"${source.title}" (${source.id})` : `"${source.title}"`}...\n`,
    );

    for (const targetLocale of targetLocales) {
      const existingTranslation = getExistingTranslation(
        source,
        targetLocale,
        reflectionGroups,
        aboutDocuments,
      );

      if (existingTranslation && !overwriteExisting) {
        output.write(`- ${targetLocale}: ya existe, se omite.\n`);
        continue;
      }

      output.write(`- ${targetLocale}: generando traduccion...\n`);
      const translation = await translateContent(source, targetLocale);
      const targetPath = buildTargetPath(source, targetLocale, translation);

      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, buildDocument(source, targetLocale, translation), "utf8");

      output.write(`  guardado en ${path.relative(process.cwd(), targetPath)}\n`);
    }
  } finally {
    readline.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
