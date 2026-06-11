import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const ADMIN_SESSION_COOKIE = "admin_session";

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Admin: locale yok, yalnız oturum cookie'si varlık kontrolü
	// (asıl doğrulama admin layout'taki getCurrentAdmin'de).
	if (pathname.startsWith("/admin")) {
		if (pathname === "/admin/login") {
			return NextResponse.next();
		}
		const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
		if (token) {
			return NextResponse.next();
		}
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = "/admin/login";
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Public rotalar: next-intl locale çözümleme (URL prefix + redirect/rewrite)
	return intlMiddleware(request);
}

export const config = {
	// api, Next internal'ları, metadata route'ları (opengraph-image) ve
	// uzantılı statik dosyalar (uploads/demos/assets) hariç
	matcher: ["/((?!api|_next|_vercel|opengraph-image|.*\\..*).*)"],
};
