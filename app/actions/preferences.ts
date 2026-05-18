"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/request";

const LOCALE_COOKIE = "locale";
const THEME_COOKIE = "theme";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
	if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) return;
	const store = await cookies();
	store.set(LOCALE_COOKIE, locale, {
		path: "/",
		maxAge: ONE_YEAR_SECONDS,
		sameSite: "lax",
	});
	revalidatePath("/", "layout");
}

export async function setTheme(theme: "light" | "dark") {
	const store = await cookies();
	store.set(THEME_COOKIE, theme, {
		path: "/",
		maxAge: ONE_YEAR_SECONDS,
		sameSite: "lax",
	});
	revalidatePath("/", "layout");
}
