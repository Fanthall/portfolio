import { defineRouting } from "next-intl/routing";

/**
 * Path-based locale: TR varsayılan ve prefix'siz (`/about`),
 * EN `/en` prefix'i ile (`/en/about`). SEO için her dil ayrı URL.
 */
export const routing = defineRouting({
	locales: ["tr", "en"],
	defaultLocale: "tr",
	localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
