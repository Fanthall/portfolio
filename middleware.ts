import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
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

export const config = {
	matcher: ["/admin/:path*"],
};
