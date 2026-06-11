import type { Locale } from "@/i18n/routing";

export function getSiteUrl(): string {
	const raw = process.env.NEXT_PUBLIC_SITE_URL;
	if (!raw) return "http://localhost:3001";
	return raw.replace(/\/$/, "");
}

export const PAGE_PATHS = {
	HOME: "/",
	ABOUT: "/about",
	CAREER: "/career",
	PROJECTS: "/projects",
	CONTACT: "/contact",
} as const;

export type PageKeyValue = keyof typeof PAGE_PATHS;

/** Locale prefix'li path: tr → /about, en → /en/about (kök: / ve /en). */
export function localizePath(path: string, locale: Locale): string {
	if (locale === "tr") return path;
	return path === "/" ? "/en" : `/en${path}`;
}

/** Locale prefix'li mutlak URL. */
export function localizeUrl(path: string, locale: Locale): string {
	const base = getSiteUrl();
	const localized = localizePath(path, locale);
	return localized === "/" ? base : `${base}${localized}`;
}

/**
 * hreflang alternates — Next Metadata `alternates.languages` formatında.
 * x-default = TR (varsayılan dil, prefix'siz URL).
 */
export function buildLanguageAlternates(path: string): Record<string, string> {
	return {
		tr: localizeUrl(path, "tr"),
		en: localizeUrl(path, "en"),
		"x-default": localizeUrl(path, "tr"),
	};
}
