import "server-only";
import {cache} from "react";
import {createTranslator} from "next-intl";
import {defaultLocale, isLocale, type Locale} from "./config";
import {bundleRegistry, messageBundles, type MessageBundle} from "./registry";
import {mergeMessages, nestMessages, type MessageDictionary} from "./messages/shared";

type TranslationValues = Record<string, string | number | Date>;

export type Translator = (
  key: string,
  values?: TranslationValues,
) => string;

type TranslatorFactory = (config: {
  locale: Locale;
  messages: MessageDictionary;
  namespace?: string;
}) => Translator;

const buildTranslator = createTranslator as unknown as TranslatorFactory;

function normalizeBundles(bundles: readonly MessageBundle[]) {
  return [...new Set(bundles)].sort() as MessageBundle[];
}

function serializeBundles(bundles: readonly MessageBundle[]) {
  return normalizeBundles(bundles).join("|");
}

function deserializeBundles(serializedBundles: string) {
  return serializedBundles.split("|").filter(Boolean) as MessageBundle[];
}

function resolveBundle(key: string): MessageBundle {
  const match = [...messageBundles]
    .sort((left, right) => right.length - left.length)
    .find((bundle) => key === bundle || key.startsWith(`${bundle}.`));

  if (!match) {
    throw new Error(`No i18n bundle registered for key "${key}".`);
  }

  return match;
}

const loadBundle = cache(async (locale: Locale, bundle: MessageBundle) => {
  const messageModule = await bundleRegistry[bundle][locale]();
  return nestMessages(bundle, messageModule.default);
});

const loadBundles = cache(async (locale: Locale, serializedBundles: string) => {
  const bundles = deserializeBundles(serializedBundles);
  const dictionaries = await Promise.all(
    bundles.map((bundle) => loadBundle(locale, bundle)),
  );

  return mergeMessages(...dictionaries);
});

export async function resolveRequestLocale(
  requestedLocale: string | null | undefined,
): Promise<Locale> {
  if (requestedLocale && isLocale(requestedLocale)) {
    return requestedLocale;
  }

  return defaultLocale;
}

export async function getMessagesForBundles(
  locale: Locale,
  bundles: readonly MessageBundle[],
): Promise<MessageDictionary> {
  return loadBundles(locale, serializeBundles(bundles));
}

export async function getTranslator(
  locale: Locale,
  namespace: string,
  bundles: readonly MessageBundle[] = [resolveBundle(namespace)],
): Promise<Translator> {
  const messages = await getMessagesForBundles(locale, bundles);
  return buildTranslator({
    locale,
    messages,
    namespace,
  });
}

export async function translateMessage(locale: Locale, key: string): Promise<string> {
  const messages = await getMessagesForBundles(locale, [resolveBundle(key)]);
  const translator = buildTranslator({locale, messages});

  return translator(key);
}
