import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import {
	buildLanguageAlternates,
	localizeUrl,
	PAGE_PATHS,
	type PageKeyValue,
} from "@/lib/site";

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

	// Her sayfa için TR + EN ayrı kayıt; her kayıtta hreflang alternates
	// (Google çok dilli site rehberi — sitemap üzerinden hreflang bildirimi).
	const staticEntries: MetadataRoute.Sitemap = (
		Object.keys(PAGE_PATHS) as PageKeyValue[]
	)
		.filter((key) => !seoMap.get(key)?.noIndex)
		.flatMap((key) => {
			const path = PAGE_PATHS[key];
			const lastModified = seoMap.get(key)?.updatedAt ?? aboutUpdated;
			const alternates = { languages: buildLanguageAlternates(path) };
			return (["tr", "en"] as const).map((locale) => ({
				url: localizeUrl(path, locale),
				lastModified,
				changeFrequency: "monthly" as const,
				priority: STATIC_PRIORITY[key],
				alternates,
			}));
		});

	const projectEntries: MetadataRoute.Sitemap = projects.flatMap((p) => {
		const path = `/projects/${p.slug}`;
		const alternates = { languages: buildLanguageAlternates(path) };
		return (["tr", "en"] as const).map((locale) => ({
			url: localizeUrl(path, locale),
			lastModified: p.updatedAt,
			changeFrequency: "monthly" as const,
			priority: 0.6,
			alternates,
		}));
	});

	return [...staticEntries, ...projectEntries];
}
