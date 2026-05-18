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
