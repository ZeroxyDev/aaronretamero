type MessageReference = `${string}.${string}`;

export const siteConfig = {
  domain: "aaronretamero.com",
  url: "https://aaronretamero.com",
  cookies: {
    visitorIdName: "aaronretamero_visitor_id",
  },
  social: {
    primaryProfileUrl: "https://instagram.com/aaronretamero",
    sourceUrl: "https://github.com/zeroxydev/aaronretamero",
    follow: {
      title: "Disocy",
      url: "https://disocy.com",
    },
  },
  navigation: {
    aboutPath: "sobre-mi",
    reflectionsPath: "reflexiones",
  },
  seo: {
    siteNameKey: "common.site.name" as MessageReference,
    siteHandleKey: "common.site.handle" as MessageReference,
    defaultDescriptionKey: "common.site.description" as MessageReference,
    defaultLongDescriptionKey: "common.site.longDescription" as MessageReference,
    homeTitleKey: "pages.home.metadataTitle" as MessageReference,
    notFoundTitleKey: "pages.errors.notFoundTitle" as MessageReference,
  },
} as const;
