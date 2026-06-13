export type LocaleDefinition = {
  direction: "ltr" | "rtl";
  isDefault: boolean;
  metadataLocale: string;
  nativeName: string;
  shortLabel: string;
};

export const localeConfig = {
  en: {
    shortLabel: "EN",
    nativeName: "English",
    direction: "ltr",
    metadataLocale: "en_EN",
    isDefault: false,
  },
  ca: {
    shortLabel: "CA",
    nativeName: "Català",
    direction: "ltr",
    metadataLocale: "ca_CA",
    isDefault: false,
  },
  es: {
    shortLabel: "ES",
    nativeName: "Español",
    direction: "ltr",
    metadataLocale: "es_ES",
    isDefault: true,
  },
} as const satisfies Record<string, LocaleDefinition>;

export type Locale = keyof typeof localeConfig;

export const locales = Object.keys(localeConfig) as Locale[];

export const defaultLocale: Locale =
  locales.find((locale) => localeConfig[locale].isDefault) ?? locales[0];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getMetadataLocale(locale: Locale) {
  return localeConfig[locale].metadataLocale;
}

export function getLocaleShortLabel(locale: Locale) {
  return localeConfig[locale].shortLabel;
}

export function getLocaleNativeName(locale: Locale) {
  return localeConfig[locale].nativeName;
}

export function getLocaleDirection(locale: Locale) {
  return localeConfig[locale].direction;
}
