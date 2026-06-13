import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseContentDocument } from "../lib/content";
import { defaultLocale, localeConfig, locales, type Locale } from "../lib/i18n/config";
import { loadLocalEnvFiles, getRequiredEnv } from "./lib/env";
import { requestOpenAiJson } from "./lib/openai";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const ABOUT_DIR = path.join(process.cwd(), "content", "about");
const REFLECTIONS_DIR = path.join(process.cwd(), "content", "reflections");
const I18N_CONFIG_PATH = path.join(process.cwd(), "lib", "i18n", "config.ts");
const I18N_REGISTRY_PATH = path.join(process.cwd(), "lib", "i18n", "registry.ts");

type LocaleDirection = "ltr" | "rtl";

type ReflectionDocument = {
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
  locale: Locale;
  title: string;
  excerpt: string;
  content: string;
  filePath: string;
};

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

type MessageJson = string | number | boolean | null | MessageJson[] | { [key: string]: MessageJson };

type NewLocaleDefinition = {
  code: string;
  shortLabel: string;
  nativeName: string;
  metadataLocale: string;
  direction: LocaleDirection;
};

function getLanguageSubtag(localeCode: string) {
  return localeCode.split("-")[0];
}

function inferLocaleName(localeCode: string, displayLocales: string[]) {
  const languageCode = getLanguageSubtag(localeCode);

  for (const displayLocale of displayLocales) {
    try {
      const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" });
      const label = displayNames.of(languageCode)?.trim();

      if (label) {
        return label;
      }
    } catch {
      continue;
    }
  }

  return languageCode.toUpperCase();
}

function inferLocaleNativeName(localeCode: string) {
  const languageCode = getLanguageSubtag(localeCode);
  return inferLocaleName(localeCode, [languageCode, "en"]);
}

function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath: string, value: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
}

function listFiles(directoryPath: string): string[] {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    if (entry.isFile()) {
      return [entryPath];
    }

    return [];
  });
}

function stringifyFrontmatterValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
  }

  return JSON.stringify(value);
}

function parseReflectionFile(filePath: string): ReflectionDocument {
  const { frontmatter, content } = parseContentDocument<Record<string, string | string[] | boolean>>(
    readText(filePath),
  );

  return {
    id: String(frontmatter.id),
    locale: String(frontmatter.locale) as Locale,
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
    readText(filePath),
  );

  return {
    locale: String(frontmatter.locale) as Locale,
    title: String(frontmatter.title),
    excerpt: String(frontmatter.excerpt),
    content,
    filePath,
  };
}

function getReflectionDocuments(baseLocale: Locale) {
  return listFiles(path.join(REFLECTIONS_DIR, baseLocale))
    .filter((filePath) => filePath.endsWith(".mdx") || filePath.endsWith(".md"))
    .sort()
    .map(parseReflectionFile);
}

function getAboutDocument(baseLocale: Locale) {
  const filePath = path.join(ABOUT_DIR, `${baseLocale}.mdx`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No encontre ${path.relative(process.cwd(), filePath)}`);
  }

  return parseAboutFile(filePath);
}

function buildReflectionPrompt(source: ReflectionDocument, targetLocale: string) {
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

function buildAboutPrompt(source: AboutDocument, targetLocale: string) {
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

function buildMessagesPrompt(
  sourceLocale: Locale,
  targetLocale: string,
  relativePath: string,
  sourceJson: MessageJson,
) {
  return [
    "You are translating JSON message files for a minimal editorial website.",
    "Translate every human-readable string value into the target language.",
    "Preserve keys exactly.",
    "Preserve the JSON structure exactly.",
    "Preserve ICU message syntax, placeholders, interpolation variables, punctuation intent, and formatting tokens.",
    "Do not rename keys.",
    "Do not add or remove fields.",
    "If a value is not a translatable user-facing string, preserve it as-is.",
    "The translation must feel native in the target language and avoid literal translation when it sounds unnatural.",
    "Return valid JSON only.",
    "",
    `Source locale: ${sourceLocale}`,
    `Target locale: ${targetLocale}`,
    `Message file: ${relativePath}`,
    "",
    "Source JSON:",
    JSON.stringify(sourceJson, null, 2),
  ].join("\n");
}

function buildReflectionDocument(source: ReflectionDocument, targetLocale: string, translation: ReflectionTranslation) {
  return [
    "---",
    `id: ${JSON.stringify(source.id)}`,
    `locale: ${JSON.stringify(targetLocale)}`,
    `title: ${stringifyFrontmatterValue(translation.title)}`,
    `slug: ${stringifyFrontmatterValue(translation.slug)}`,
    `date: ${JSON.stringify(source.date)}`,
    `time: ${JSON.stringify(source.time)}`,
    `pinned: ${JSON.stringify(source.pinned)}`,
    `excerpt: ${stringifyFrontmatterValue(translation.excerpt)}`,
    `tags: ${stringifyFrontmatterValue(translation.tags)}`,
    `state: ${stringifyFrontmatterValue(translation.state)}`,
    "---",
    "",
    translation.content.trim(),
    "",
  ].join("\n");
}

function buildAboutDocument(targetLocale: string, translation: AboutTranslation) {
  return [
    "---",
    `locale: ${JSON.stringify(targetLocale)}`,
    `title: ${stringifyFrontmatterValue(translation.title)}`,
    `excerpt: ${stringifyFrontmatterValue(translation.excerpt)}`,
    "---",
    "",
    translation.content.trim(),
    "",
  ].join("\n");
}

function updateLocaleConfig(definition: NewLocaleDefinition) {
  const source = readText(I18N_CONFIG_PATH);

  if (source.includes(`\n  ${definition.code}: {`)) {
    throw new Error(`El locale "${definition.code}" ya existe en lib/i18n/config.ts`);
  }

  const localeEntry = [
    `  ${definition.code}: {`,
    `    shortLabel: ${JSON.stringify(definition.shortLabel)},`,
    `    nativeName: ${JSON.stringify(definition.nativeName)},`,
    `    direction: ${JSON.stringify(definition.direction)},`,
    `    metadataLocale: ${JSON.stringify(definition.metadataLocale)},`,
    "    isDefault: false,",
    "  },",
  ].join("\n");

  const updated = source.replace(
    /export const localeConfig = \{\n/,
    `export const localeConfig = {\n${localeEntry}\n`,
  );

  writeText(I18N_CONFIG_PATH, updated);
}

function updateI18nRegistry(localeCode: string) {
  const source = readText(I18N_REGISTRY_PATH);

  if (source.includes(`    ${localeCode}: () => import("@/messages/${localeCode}/`)) {
    return;
  }

  const updated = source.replace(
    /(^\s+"([^"]+)": \{\n)([\s\S]*?)(^\s+\},?$)/gm,
    (match, start, bundleName, inner, end) => {
      if (inner.includes(`    ${localeCode}: () => import("@/messages/${localeCode}/`)) {
        return match;
      }

      const bundlePath = String(bundleName).replaceAll(".", "/");
      const localeLoader = `    ${localeCode}: () => import("@/messages/${localeCode}/${bundlePath}.json"),\n`;
      return `${start}${inner}${localeLoader}${end}`;
    },
  );

  writeText(I18N_REGISTRY_PATH, updated);
}

async function prompt(
  readline: ReturnType<typeof createInterface>,
  message: string,
  fallback = "",
) {
  const suffix = fallback ? ` [${fallback}]` : "";
  return (await readline.question(`${message}${suffix}: `)).trim() || fallback;
}

async function promptLocaleCode(readline: ReturnType<typeof createInterface>) {
  while (true) {
    const answer = (await prompt(readline, "Codigo del nuevo idioma", "")).toLowerCase();

    if (!answer) {
      continue;
    }

    if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(answer)) {
      output.write(`Codigo no valido: ${answer}\n`);
      continue;
    }

    if (Object.hasOwn(localeConfig, answer)) {
      output.write(`El locale ${answer} ya existe.\n`);
      continue;
    }

    return answer;
  }
}

async function promptBaseLocale(readline: ReturnType<typeof createInterface>) {
  while (true) {
    const answer = await prompt(readline, "Idioma base", defaultLocale);
    const locale = answer as Locale;

    if (locales.includes(locale)) {
      return locale;
    }

    output.write(`Locale base no valido: ${answer}\n`);
  }
}

async function promptDirection(readline: ReturnType<typeof createInterface>) {
  while (true) {
    const answer = (await prompt(readline, 'Direccion ("ltr" o "rtl")', "ltr")).toLowerCase();

    if (answer === "ltr" || answer === "rtl") {
      return answer as LocaleDirection;
    }

    output.write(`Direccion no valida: ${answer}\n`);
  }
}

async function promptYesNo(
  readline: ReturnType<typeof createInterface>,
  message: string,
  fallback = false,
) {
  const fallbackLabel = fallback ? "Y/n" : "y/N";
  const answer = (await readline.question(`${message} [${fallbackLabel}]: `)).trim().toLowerCase();

  if (!answer) {
    return fallback;
  }

  return answer === "y" || answer === "yes" || answer === "s" || answer === "si";
}

async function translateMessages(baseLocale: Locale, targetLocale: string) {
  const baseRoot = path.join(MESSAGES_DIR, baseLocale);
  const files = listFiles(baseRoot).filter((filePath) => filePath.endsWith(".json")).sort();

  output.write(`\nTraduciendo messages (${files.length} archivos)...\n`);

  for (const filePath of files) {
    const relativePath = path.relative(baseRoot, filePath);
    const sourceJson = JSON.parse(readText(filePath)) as MessageJson;
    const translatedJson = await requestOpenAiJson<MessageJson>(
      buildMessagesPrompt(baseLocale, targetLocale, relativePath, sourceJson),
    );
    const targetPath = path.join(MESSAGES_DIR, targetLocale, relativePath);

    writeText(targetPath, `${JSON.stringify(translatedJson, null, 2)}\n`);
    output.write(`- ${path.relative(process.cwd(), targetPath)}\n`);
  }
}

async function translateAbout(baseLocale: Locale, targetLocale: string, overwrite: boolean) {
  const source = getAboutDocument(baseLocale);
  const targetPath = path.join(ABOUT_DIR, `${targetLocale}.mdx`);

  if (fs.existsSync(targetPath) && !overwrite) {
    output.write(`\nAbout ${targetLocale} ya existe, se omite.\n`);
    return;
  }

  output.write(`\nTraduciendo about desde ${baseLocale}...\n`);
  const translation = await requestOpenAiJson<AboutTranslation>(
    buildAboutPrompt(source, targetLocale),
  );

  writeText(targetPath, buildAboutDocument(targetLocale, translation));
  output.write(`- ${path.relative(process.cwd(), targetPath)}\n`);
}

async function translateReflections(baseLocale: Locale, targetLocale: string, overwrite: boolean) {
  const reflections = getReflectionDocuments(baseLocale);

  output.write(`\nTraduciendo reflections (${reflections.length})...\n`);

  for (const reflection of reflections) {
    const [year, month] = reflection.date.split("-");
    const existingTargetDir = path.join(REFLECTIONS_DIR, targetLocale, year, month);
    const existingMatches = fs.existsSync(existingTargetDir)
      ? listFiles(existingTargetDir).filter(
          (filePath) =>
            (filePath.endsWith(".mdx") || filePath.endsWith(".md")) &&
            parseReflectionFile(filePath).id === reflection.id,
        )
      : [];

    if (existingMatches.length > 0 && !overwrite) {
      output.write(`- ${reflection.id}: ya existe, se omite.\n`);
      continue;
    }

    const translation = await requestOpenAiJson<ReflectionTranslation>(
      buildReflectionPrompt(reflection, targetLocale),
    );
    const targetPath = path.join(REFLECTIONS_DIR, targetLocale, year, month, `${translation.slug}.mdx`);

    writeText(targetPath, buildReflectionDocument(reflection, targetLocale, translation));
    output.write(`- ${path.relative(process.cwd(), targetPath)}\n`);
  }
}

async function main() {
  loadLocalEnvFiles();
  getRequiredEnv("OPENAI_KEY");

  const readline = createInterface({ input, output });

  try {
    const baseLocale = await promptBaseLocale(readline);
    const code = await promptLocaleCode(readline);
    const nativeName = await prompt(readline, "Nombre nativo del idioma", inferLocaleNativeName(code));
    const shortLabel = await prompt(readline, "Short label", code.toUpperCase());
    const metadataLocale = await prompt(readline, "Metadata locale", `${code}_${code.toUpperCase()}`);
    const direction = await promptDirection(readline);
    const overwrite = await promptYesNo(readline, "Sobrescribir archivos ya existentes?", false);
    const includeMessages = await promptYesNo(readline, "Generar messages del nuevo idioma?", true);
    const includeAbout = await promptYesNo(readline, "Generar about del nuevo idioma?", true);
    const includeReflections = await promptYesNo(readline, "Generar reflections del nuevo idioma?", true);

    const definition: NewLocaleDefinition = {
      code,
      nativeName,
      shortLabel,
      metadataLocale,
      direction,
    };

    output.write(`\nRegistrando locale ${code}...\n`);
    updateLocaleConfig(definition);
    updateI18nRegistry(code);

    if (includeMessages) {
      await translateMessages(baseLocale, code);
    }

    if (includeAbout) {
      await translateAbout(baseLocale, code, overwrite);
    }

    if (includeReflections) {
      await translateReflections(baseLocale, code, overwrite);
    }
  } finally {
    readline.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
