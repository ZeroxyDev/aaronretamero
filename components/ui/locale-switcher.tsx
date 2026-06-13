"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GlobeIcon } from "@/components/ui/icons";
import { getLocaleNativeName, type Locale } from "@/lib/i18n/config";

type LocaleSwitcherProps = {
  locale: Locale;
  locales: readonly Locale[];
  routeMap: Partial<Record<Locale, string>>;
};

export function LocaleSwitcher({
  locale,
  locales,
  routeMap,
}: LocaleSwitcherProps) {
  const t = useTranslations("components.ui.locale-switcher");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(
    () =>
      locales.map((entryLocale) => {
        const href =
          routeMap[entryLocale] ??
          (entryLocale === locale ? routeMap[locale] ?? `/${locale}` : `/${entryLocale}`);

        return {
          locale: entryLocale,
          href,
          isActive: entryLocale === locale,
          nativeName: getLocaleNativeName(entryLocale),
        };
      }),
    [locale, locales, routeMap],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      item.nativeName.toLowerCase().includes(normalizedQuery) ||
      item.locale.toLowerCase().includes(normalizedQuery),
    );
  }, [items, query]);

  function closeMenu() {
    setIsOpen(false);
    setQuery("");
  }

  function toggleMenu() {
    setIsOpen((current) => {
      const next = !current;

      if (!next) {
        setQuery("");
      }

      return next;
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative inline-flex text-sm text-muted">
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="inline-flex h-4 items-center leading-none text-muted hover:text-ink"
      >
        <GlobeIcon className="relative top-[2px] block size-[0.95rem]" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={t("label")}
          className="absolute right-0 top-full z-20 mt-3 min-w-[9rem] bg-surface/95 p-2 text-left text-sm text-muted backdrop-blur"
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent py-1 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
          />
          <nav aria-label={t("label")} className="mt-2 flex flex-col">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Link
                  key={item.locale}
                  href={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                  onClick={closeMenu}
                  className={[
                    "py-1 text-sm",
                    item.isActive
                      ? "text-ink underline underline-offset-4"
                      : "text-muted hover:text-ink",
                  ].join(" ")}
                >
                  {item.nativeName}
                </Link>
              ))
            ) : (
              <p className="py-1 text-sm text-muted">{t("empty")}</p>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
