import type { Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";

type FooterProps = {
  locale: Locale;
};

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslator(locale, "components.feature.reflection.footer");

  return (
    <footer className="mt-14">
      <p className="text-base leading-8 text-muted">{t("note")}</p>
    </footer>
  );
}
