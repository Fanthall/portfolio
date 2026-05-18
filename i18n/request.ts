import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["tr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = "tr";
const LOCALE_COOKIE = "locale";

function resolveLocale(value: string | undefined): Locale {
	if (value && (SUPPORTED_LOCALES as readonly string[]).includes(value)) {
		return value as Locale;
	}
	return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
	const cookieStore = await cookies();
	const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
	const messages = (await import(`../messages/${locale}.json`)).default;
	return { locale, messages };
});

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE };
export type { Locale };
