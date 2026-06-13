import {NextIntlClientProvider} from "next-intl";
import type {Locale} from "@/lib/i18n/config";
import type {MessageBundle} from "@/lib/i18n/registry";
import {getMessagesForBundles} from "@/lib/i18n/server";

type I18nProviderProps = {
  bundles: readonly MessageBundle[];
  children: React.ReactNode;
  locale: Locale;
};

export async function I18nProvider({
  bundles,
  children,
  locale,
}: I18nProviderProps) {
  const messages = await getMessagesForBundles(locale, bundles);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
