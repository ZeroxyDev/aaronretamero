import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {I18nProvider} from "@/components/layout/i18n-provider";
import { siteConfig } from "@/config/site";
import { Footer } from "@/components/layout/footer";
import {
  getLocaleDirection,
  getMetadataLocale,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import {getTranslator} from "@/lib/i18n/server";
import { createPageMetadata, translateMessage } from "@/lib/seo";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: LocaleLayoutProps,
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const siteName = await translateMessage(locale, siteConfig.seo.siteNameKey);
  const metadata = await createPageMetadata({
    locale,
    pathname: `/${locale}`,
    descriptionKey: siteConfig.seo.defaultLongDescriptionKey,
    openGraph: {
      locale: getMetadataLocale(locale),
      type: "website",
    },
  });

  return {
    ...metadata,
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    applicationName: siteName,
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: metadata.description,
    },
  };
}

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { locale: rawLocale } = await props.params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const tFooter = await getTranslator(locale, "components.layout.footer");
  const siteName = await translateMessage(locale, siteConfig.seo.siteNameKey);
  const siteHandle = await translateMessage(locale, siteConfig.seo.siteHandleKey);

  return (
    <I18nProvider locale={locale} bundles={["components.ui.locale-switcher"]}>
      <div
        lang={locale}
        dir={getLocaleDirection(locale)}
        className="flex min-h-screen flex-col"
      >
        <div className="shell flex flex-1 flex-col py-6 sm:py-8">
          <div className="flex-1">{props.children}</div>
          <Footer
            name={siteName}
            handle={siteHandle}
            profileUrl={siteConfig.social.primaryProfileUrl}
            text={tFooter("minimal")}
          />
        </div>
      </div>
    </I18nProvider>
  );
}
