import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface ProjectCardProps {
	project: Project;
	locale: Locale;
	labels: {
		viewDetails: string;
	};
	/** Editöryel index damgası (01, 02…). Verilmezse project.order kullanılır. */
	index?: number;
}

const MAX_VISIBLE_TAGS = 4;

/** Studio Ink editöryel proje kartı — Home (öne çıkanlar) ve Projeler listesinde ortak. */
export function ProjectCard({ project, locale, labels, index }: ProjectCardProps) {
	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
	const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS);
	const hiddenTagCount = project.tags.length - visibleTags.length;
	const ix = String((index ?? project.order) + 1).padStart(2, "0");
	const year = project.createdAt.getFullYear();

	return (
		<article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_10px_28px_hsl(var(--foreground)/0.07)]">
			<Link
				href={`/projects/${project.slug}`}
				className="relative block aspect-[16/10] w-full overflow-hidden"
				aria-label={title}
			>
				{project.coverImage ? (
					<Image
						src={project.coverImage}
						alt={title}
						fill
						sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
						className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
					/>
				) : (
					<div className="relative h-full w-full bg-[radial-gradient(hsl(var(--border))_1px,transparent_1.4px)] [background-size:16px_16px]">
						<span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-border">
							{title.charAt(0)}
						</span>
					</div>
				)}
				<span className="absolute left-3.5 top-3 font-mono text-[0.72rem] text-muted-foreground">
					{ix}
				</span>
				<span className="absolute right-3.5 top-3 font-mono text-[0.72rem] text-primary">
					{year}
				</span>
			</Link>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
					<Link
						href={`/projects/${project.slug}`}
						className="transition-colors hover:text-primary"
					>
						{title}
					</Link>
				</h3>
				<p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{summary}</p>
				{visibleTags.length > 0 && (
					<ul className="flex flex-wrap gap-1.5">
						{visibleTags.map((tag) => (
							<li
								key={tag}
								className="inline-flex items-center rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[0.68rem] text-foreground"
							>
								{tag}
							</li>
						))}
						{hiddenTagCount > 0 && (
							<li className="inline-flex items-center px-1 font-mono text-[0.68rem] text-muted-foreground">
								+{hiddenTagCount}
							</li>
						)}
					</ul>
				)}
				<div className="mt-auto flex items-center justify-between pt-1">
					<Link
						href={`/projects/${project.slug}`}
						className="group/link inline-flex items-center gap-1.5 font-mono text-[0.78rem] text-primary"
					>
						{labels.viewDetails}
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
					</Link>
					{project.repoUrl && (
						<NextLink
							href={project.repoUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="font-mono text-[0.72rem] text-muted-foreground transition-colors hover:text-foreground"
						>
							GitHub ↗
						</NextLink>
					)}
				</div>
			</div>
		</article>
	);
}
