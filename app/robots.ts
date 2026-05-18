import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Site URL env-driven; force dynamic so it's always fresh
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
	const base = getSiteUrl();
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/admin/", "/api", "/api/"],
			},
		],
		sitemap: `${base}/sitemap.xml`,
		host: base,
	};
}
