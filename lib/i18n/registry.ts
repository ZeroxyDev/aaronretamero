import "server-only";
import type {Locale} from "./config";
import type {MessageModule} from "./messages/shared";

type BundleLoader = () => Promise<MessageModule>;

type BundleDefinition = Record<Locale, BundleLoader>;

export const bundleRegistry = {
  "common.site": {
    es: () => import("@/messages/es/common/site.json"),
    en: () => import("@/messages/en/common/site.json"),
    ca: () => import("@/messages/ca/common/site.json"),
  },
  "components.layout.footer": {
    es: () => import("@/messages/es/components/layout/footer.json"),
    en: () => import("@/messages/en/components/layout/footer.json"),
    ca: () => import("@/messages/ca/components/layout/footer.json"),
  },
  "components.ui.locale-switcher": {
    es: () => import("@/messages/es/components/ui/locale-switcher.json"),
    en: () => import("@/messages/en/components/ui/locale-switcher.json"),
    ca: () => import("@/messages/ca/components/ui/locale-switcher.json"),
  },
  "components.feature.home.intro": {
    es: () => import("@/messages/es/components/feature/home/intro.json"),
    en: () => import("@/messages/en/components/feature/home/intro.json"),
    ca: () => import("@/messages/ca/components/feature/home/intro.json"),
  },
  "components.feature.archive.row": {
    es: () => import("@/messages/es/components/feature/archive/row.json"),
    en: () => import("@/messages/en/components/feature/archive/row.json"),
    ca: () => import("@/messages/ca/components/feature/archive/row.json"),
  },
  "components.feature.reflection.adjacent": {
    es: () => import("@/messages/es/components/feature/reflection/adjacent.json"),
    en: () => import("@/messages/en/components/feature/reflection/adjacent.json"),
    ca: () => import("@/messages/ca/components/feature/reflection/adjacent.json"),
  },
  "components.feature.reflection.footer": {
    es: () => import("@/messages/es/components/feature/reflection/footer.json"),
    en: () => import("@/messages/en/components/feature/reflection/footer.json"),
    ca: () => import("@/messages/ca/components/feature/reflection/footer.json"),
  },
  "components.feature.reflection.meta": {
    es: () => import("@/messages/es/components/feature/reflection/meta.json"),
    en: () => import("@/messages/en/components/feature/reflection/meta.json"),
    ca: () => import("@/messages/ca/components/feature/reflection/meta.json"),
  },
  "pages.errors": {
    es: () => import("@/messages/es/pages/errors.json"),
    en: () => import("@/messages/en/pages/errors.json"),
    ca: () => import("@/messages/ca/pages/errors.json"),
  },
  "pages.home": {
    es: () => import("@/messages/es/pages/home.json"),
    en: () => import("@/messages/en/pages/home.json"),
    ca: () => import("@/messages/ca/pages/home.json"),
  },
  "pages.reflection": {
    es: () => import("@/messages/es/pages/reflection.json"),
    en: () => import("@/messages/en/pages/reflection.json"),
    ca: () => import("@/messages/ca/pages/reflection.json"),
  },
} as const satisfies Record<string, BundleDefinition>;

export type MessageBundle = keyof typeof bundleRegistry;

export const messageBundles = Object.keys(bundleRegistry) as MessageBundle[];
