import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl, PAGE_PATHS, type PageKeyValue } from "@/lib/site";

// DB'ye bağımlı; build-time prerender etme.
export const dynamic = "force-dynamic";

const STATIC_PRIORITY: Record<PageKeyValue, number> = {
	HOME: 1.0,
	ABOUT: 0.8,
	PROJECTS: 0.8,
	CAREER: 0.7,
	CONTACT: 0.6,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = getSiteUrl();

	const [projects, pageSeoRows, about] = await Promise.all([
		prisma.project.findMany({ select: { slug: true, updatedAt: true } }),
		prisma.pageSeo.findMany({
			select: { pageKey: true, noIndex: true, updatedAt: true },
		}),
		prisma.aboutContent.findUnique({
			where: { id: 1 },
			select: { updatedAt: true },
		}),
	]);

	const seoMap = new Map(
		pageSeoRows.map((r) => [r.pageKey, { noIndex: r.noIndex, updatedAt: r.updatedAt }]),
	);
	const aboutUpdated = about?.updatedAt ?? new Date();

	const staticEntries: MetadataRoute.Sitemap = (
		Object.keys(PAGE_PATHS) as PageKeyValue[]
	)
		.filter((key) => !seoMap.get(key)?.noIndex)
		.map((key) => {
			const path = PAGE_PATHS[key];
			const url = path === "/" ? base : `${base}${path}`;
			return {
				url,
				lastModified: seoMap.get(key)?.updatedAt ?? aboutUpdated,
				changeFrequency: "monthly",
				priority: STATIC_PRIORITY[key],
			};
		});

	const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
		url: `${base}/projects/${p.slug}`,
		lastModified: p.updatedAt,
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	return [...staticEntries, ...projectEntries];
}
