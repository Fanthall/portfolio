import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Admin: locale yok. Supabase oturumunu tazele + gercek kullanici kontrolu.
	if (pathname.startsWith("/admin")) {
		const { supabaseResponse, user } = await updateSession(request);

		if (pathname === "/admin/login") {
			return supabaseResponse;
		}

		if (!user) {
			const loginUrl = request.nextUrl.clone();
			loginUrl.pathname = "/admin/login";
			loginUrl.searchParams.set("from", pathname);
			const redirectRes = NextResponse.redirect(loginUrl);
			// Tazelenen auth cookie'lerini redirect'e tasi
			supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
			return redirectRes;
		}

		return supabaseResponse;
	}

	// Public rotalar: next-intl locale çözümleme (URL prefix + redirect/rewrite)
	return intlMiddleware(request);
}

export const config = {
	// api, Next internal'ları, metadata route'ları (opengraph-image) ve
	// uzantılı statik dosyalar (uploads/demos/assets) hariç
	matcher: ["/((?!api|_next|_vercel|opengraph-image|.*\\..*).*)"],
};
