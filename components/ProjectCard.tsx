import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight, FolderCode } from "lucide-react";
import type { Project } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";

interface ProjectCardProps {
	project: Project;
	locale: Locale;
	labels: {
		viewDetails: string;
	};
}

const MAX_VISIBLE_TAGS = 4;

/** Home (öne çıkanlar) ve Projeler listesinde ortak proje kartı. */
export function ProjectCard({ project, locale, labels }: ProjectCardProps) {
	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
	const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS);
	const hiddenTagCount = project.tags.length - visibleTags.length;

	return (
		<Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
			<Link
				href={`/projects/${project.slug}`}
				className="relative block aspect-video w-full overflow-hidden bg-muted"
				tabIndex={-1}
				aria-hidden
			>
				{project.coverImage ? (
					<Image
						src={project.coverImage}
						alt={title}
						fill
						sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
						<FolderCode className="h-10 w-10" strokeWidth={1.5} />
					</div>
				)}
			</Link>
			<CardContent className="flex flex-1 flex-col gap-3 p-6">
				<h3 className="text-lg font-semibold leading-snug">
					<Link
						href={`/projects/${project.slug}`}
						className="transition-colors hover:text-primary"
					>
						{title}
					</Link>
				</h3>
				{visibleTags.length > 0 && (
					<ul className="flex flex-wrap gap-1.5">
						{visibleTags.map((tag) => (
							<li
								key={tag}
								className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
							>
								{tag}
							</li>
						))}
						{hiddenTagCount > 0 && (
							<li className="inline-flex items-center rounded-md px-1 text-[11px] text-muted-foreground">
								+{hiddenTagCount}
							</li>
						)}
					</ul>
				)}
				<p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{summary}</p>
				<div className="mt-auto flex items-center gap-2">
					<Button size="sm" asChild>
						<Link href={`/projects/${project.slug}`}>
							{labels.viewDetails} <ArrowRight />
						</Link>
					</Button>
					{project.repoUrl && (
						<Button size="sm" variant="outline" asChild>
							<NextLink href={project.repoUrl} target="_blank" rel="noopener noreferrer">
								GitHub
							</NextLink>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
