import type {Locale} from "@/lib/i18n/config";
import {getTranslator} from "@/lib/i18n/server";

type LocalizedNotFoundProps = {
  params: Promise<{locale: string}>;
};

export default async function LocalizedNotFoundPage({
  params
}: LocalizedNotFoundProps) {
  const {locale} = await params;
  const t = await getTranslator(locale as Locale, "pages.errors");

  return (
    <main className="shell flex min-h-screen items-center justify-center">
      <div className="archive-shell text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-6 text-4xl font-medium tracking-[-0.04em] text-ink">
          {t("notFoundTitle")}
        </h1>
      </div>
    </main>
  );
}
