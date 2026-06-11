"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Locale artık cookie ile değil URL ile taşınıyor (i18n/routing.ts);
// dil değişimi LanguageToggle'da router.replace(pathname, { locale }) ile yapılır.

const THEME_COOKIE = "theme";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setTheme(theme: "light" | "dark") {
	const store = await cookies();
	store.set(THEME_COOKIE, theme, {
		path: "/",
		maxAge: ONE_YEAR_SECONDS,
		sameSite: "lax",
	});
	revalidatePath("/", "layout");
}
