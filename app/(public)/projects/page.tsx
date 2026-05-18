import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("PROJECTS");

export default async function ProjectsPage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const projects = await prisma.project.findMany({
		orderBy: [{ order: "asc" }, { createdAt: "desc" }],
	});

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in">
			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
				{t("header.projects")}
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{projects.map((p) => (
					<Card key={p.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
						{p.coverImage && (
							<div className="relative aspect-video w-full bg-muted">
								<Image
									src={p.coverImage}
									alt={locale === "tr" ? p.titleTr : p.titleEn}
									fill
									className="object-cover"
								/>
							</div>
						)}
						<CardContent className="flex flex-col flex-1 p-6 gap-3">
							<h2 className="font-semibold text-lg">
								{locale === "tr" ? p.titleTr : p.titleEn}
							</h2>
							<p className="text-sm text-muted-foreground line-clamp-3 flex-1">
								{locale === "tr" ? p.summaryTr : p.summaryEn}
							</p>
							<div className="flex gap-2 mt-auto">
								<Button size="sm" asChild>
									<Link href={`/projects/${p.slug}`} target="_blank">
										{t("common.viewDetails")} <ArrowUpRight />
									</Link>
								</Button>
								{p.repoUrl && (
									<Button size="sm" variant="outline" asChild>
										<Link href={p.repoUrl} target="_blank" rel="noopener noreferrer">
											GitHub
										</Link>
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				))}
				{projects.length === 0 && (
					<p className="text-muted-foreground col-span-full">—</p>
				)}
			</div>
		</div>
	);
}
