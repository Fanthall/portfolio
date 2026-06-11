import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

const SUPPORTED_LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

export default getRequestConfig(async ({ requestLocale }) => {
	// Middleware'den (URL'den) gelen locale; admin/api gibi locale dışı
	// rotalarda bulunmaz → varsayılana düş.
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	const messages = (await import(`../messages/${locale}.json`)).default;
	return { locale, messages };
});

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
export type { Locale };
