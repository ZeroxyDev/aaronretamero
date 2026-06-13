import path from "node:path";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { parseContentDocument, readContentFile } from "@/lib/content";

export type AboutDocument = {
  locale: Locale;
  title: string;
  excerpt: string;
  content: string;
};

function getAboutFilePath(locale: Locale) {
  return path.join(process.cwd(), "content", "about", `${locale}.mdx`);
}

function readAboutDocument(locale: Locale): AboutDocument | null {
  try {
    const { frontmatter, content } = parseContentDocument<{
      locale: Locale;
      title: string;
      excerpt: string;
    }>(readContentFile(getAboutFilePath(locale)));

    return {
      locale: String(frontmatter.locale) as Locale,
      title: String(frontmatter.title),
      excerpt: String(frontmatter.excerpt),
      content,
    };
  } catch {
    return null;
  }
}

export function getAboutDocument(locale: Locale): AboutDocument | null {
  return readAboutDocument(locale) ?? (locale === defaultLocale ? null : readAboutDocument(defaultLocale));
}
