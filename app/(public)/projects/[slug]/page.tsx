import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Github } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProjectDemo } from "@/components/ProjectDemo";
import type { Locale } from "@/i18n/request";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const project = await prisma.project.findUnique({ where: { slug } });
	if (!project) return { title: "Not found" };
	return {
		title: `${project.titleEn} — Sezer Demir DEDEK`,
		description: project.summaryEn,
	};
}

export default async function ProjectDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();

	const project = await prisma.project.findUnique({
		where: { slug },
		include: { images: { orderBy: { order: "asc" } } },
	});

	if (!project) notFound();

	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
	const desc = locale === "tr" ? project.descTr : project.descEn;

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl animate-fade-in">
			<Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
				<Link href="/projects">
					<ArrowLeft /> {t("common.backToProjects")}
				</Link>
			</Button>

			<header className="space-y-3">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
				<p className="text-lg text-muted-foreground">{summary}</p>
				{project.repoUrl && (
					<Button variant="outline" size="sm" asChild>
						<Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
							<Github /> GitHub
						</Link>
					</Button>
				)}
			</header>

			<section className="mt-10 prose prose-zinc dark:prose-invert max-w-none">
				<p className="leading-relaxed whitespace-pre-line">{desc}</p>
			</section>

			<section className="mt-10">
				<ProjectDemo
					project={project}
					locale={locale}
					labels={{
						downloadCta: locale === "tr" ? "İndir" : "Download",
						openExternal: locale === "tr" ? "Aç" : "Open",
						demoUnavailable: locale === "tr" ? "Demo henüz mevcut değil." : "Demo not available yet.",
					}}
				/>
			</section>
		</div>
	);
}
