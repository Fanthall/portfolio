import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "@/i18n/navigation";
import { buildLanguageAlternates, localizeUrl } from "@/lib/site";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProjectDemo } from "@/components/ProjectDemo";
import type { Locale } from "@/i18n/routing";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const locale = (await getLocale()) as Locale;
	const project = await prisma.project.findUnique({ where: { slug } });
	if (!project) return { title: "Not found" };
	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const description = locale === "tr" ? project.summaryTr : project.summaryEn;
	const path = `/projects/${slug}`;
	return {
		title: `${title} — Sezer Demir DEDEK`,
		description,
		alternates: {
			canonical: localizeUrl(path, locale),
			languages: buildLanguageAlternates(path),
		},
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

			<header className="space-y-4">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
				<p className="text-lg text-muted-foreground">{summary}</p>
				{project.tags.length > 0 && (
					<ul className="flex flex-wrap gap-1.5" aria-label={t("projects.technologies")}>
						{project.tags.map((tag) => (
							<li
								key={tag}
								className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
							>
								{tag}
							</li>
						))}
					</ul>
				)}
				{project.repoUrl && (
					<Button variant="outline" size="sm" asChild>
						<NextLink href={project.repoUrl} target="_blank" rel="noopener noreferrer">
							<Github /> GitHub
						</NextLink>
					</Button>
				)}
			</header>

			{project.coverImage && (
				<div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border bg-muted">
					<Image
						src={project.coverImage}
						alt={title}
						fill
						sizes="(min-width: 1024px) 56rem, 100vw"
						className="object-cover"
						priority
					/>
				</div>
			)}

			<section className="mt-10 prose prose-zinc dark:prose-invert max-w-none">
				<ReactMarkdown>{desc}</ReactMarkdown>
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
