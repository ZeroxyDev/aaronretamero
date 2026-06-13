import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, type Locale } from "./i18n/config";
import {translateMessage as translateServerMessage} from "./i18n/server";

type MessageReference = `${string}.${string}`;

function trimSlash(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

export function buildAbsoluteUrl(pathname: string) {
  return `${siteConfig.url}${trimSlash(pathname)}`;
}

export function buildLocalePath(locale: Locale, pathname = "") {
  const normalizedPath = pathname ? trimSlash(pathname) : "";
  return `/${locale}${normalizedPath}`;
}

function extractLocaleRelativePath(pathname: string) {
  const segments = trimSlash(pathname).split("/").filter(Boolean);
  const [, ...rest] = segments;
  return rest.join("/");
}

export function buildLocaleAlternates(pathByLocale: Partial<Record<Locale, string>>) {
  return Object.fromEntries(
    Object.entries(pathByLocale).map(([locale, path]) => [locale, trimSlash(path ?? "/")]),
  );
}

type CreatePageMetadataOptions = {
  locale: Locale;
  title?: string;
  description?: string;
  descriptionKey?: MessageReference;
  pathname: string;
  alternates?: Partial<Record<Locale, string>>;
  openGraph?: Partial<NonNullable<Metadata["openGraph"]>>;
};

export async function translateMessage(locale: Locale, key: MessageReference) {
  return translateServerMessage(locale, key);
}

export async function createPageMetadata(options: CreatePageMetadataOptions) {
  const { locale, title, description, descriptionKey, pathname, alternates, openGraph } =
    options;
  const resolvedDescription =
    description ??
    (await translateMessage(locale, descriptionKey ?? siteConfig.seo.defaultDescriptionKey));
  const resolvedSiteName = await translateMessage(locale, siteConfig.seo.siteNameKey);
  const localeRelativePath = extractLocaleRelativePath(pathname);

  return {
    title: title ?? resolvedSiteName,
    description: resolvedDescription,
    alternates: {
      canonical: trimSlash(pathname),
      languages: buildLocaleAlternates(
        alternates ??
          Object.fromEntries(
            locales.map((entryLocale) => [
              entryLocale,
              buildLocalePath(entryLocale, localeRelativePath),
            ]),
          ),
      ),
    },
    openGraph: {
      title: title ?? resolvedSiteName,
      description: resolvedDescription,
      url: buildAbsoluteUrl(pathname),
      siteName: resolvedSiteName,
      ...openGraph,
    },
  } satisfies Metadata;
}
