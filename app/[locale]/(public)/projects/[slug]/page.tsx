import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { Link } from "@/i18n/navigation";
import { buildLanguageAlternates, localizeUrl } from "@/lib/site";
import { getProjectBySlug } from "@/lib/data/queries";
import { ProjectDemo } from "@/components/ProjectDemo";
import type { Locale } from "@/i18n/routing";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const locale = (await getLocale()) as Locale;
	const project = await getProjectBySlug(slug);
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

	const project = await getProjectBySlug(slug);
	if (!project) notFound();

	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
	const desc = locale === "tr" ? project.descTr : project.descEn;
	const year = project.createdAt.getFullYear();

	return (
		<div className="wrap page">
			<Link
				href="/projects"
				className="si-mono"
				style={{ color: "var(--muted)", fontSize: "0.78rem", display: "inline-block", marginBottom: 18 }}
			>
				← {t("common.backToProjects")}
			</Link>

			<div className="page-head" style={{ marginBottom: 24 }}>
				<span className="eyebrow">
					{year} · {project.tags.slice(0, 3).join(" · ")}
				</span>
				<h1>{title}</h1>
				<p>{summary}</p>
			</div>

			<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 28 }}>
				{project.tags.length > 0 && (
					<div className="tags">
						{project.tags.map((tag) => (
							<span key={tag} className="tag-chip">
								{tag}
							</span>
						))}
					</div>
				)}
				{project.repoUrl && (
					<NextLink href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">
						GitHub ↗
					</NextLink>
				)}
			</div>

			{project.coverImage && (
				<div
					style={{
						position: "relative",
						aspectRatio: "16 / 9",
						width: "100%",
						overflow: "hidden",
						borderRadius: 12,
						border: "1px solid var(--line)",
						marginBottom: 32,
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={project.coverImage}
						alt={title}
						style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
					/>
				</div>
			)}

			<section className="prose prose-zinc max-w-none dark:prose-invert">
				<ReactMarkdown>{desc}</ReactMarkdown>
			</section>

			<section style={{ marginTop: 40 }}>
				<ProjectDemo
					project={project}
					locale={locale}
					labels={{
						downloadCta: locale === "tr" ? "İndir" : "Download",
						openExternal: locale === "tr" ? "Aç" : "Open",
						demoUnavailable:
							locale === "tr" ? "Demo henüz mevcut değil." : "Demo not available yet.",
					}}
				/>
			</section>
		</div>
	);
}
