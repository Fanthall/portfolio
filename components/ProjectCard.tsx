import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface ProjectCardProps {
	project: Project;
	locale: Locale;
	labels: { viewDetails: string };
	index?: number;
}

const MAX_VISIBLE_TAGS = 4;

/** Prototip .card — mono index+yıl damgası, noktalı kapak, hover accent. */
export function ProjectCard({ project, locale, labels, index }: ProjectCardProps) {
	const title = locale === "tr" ? project.titleTr : project.titleEn;
	const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
	const tags = project.tags.slice(0, MAX_VISIBLE_TAGS);
	const ix = String((index ?? project.order) + 1).padStart(2, "0");
	const year = project.createdAt.getFullYear();

	return (
		<Link href={`/projects/${project.slug}`} className="card si">
			<div className="cover">
				<span className="ix">{ix}</span>
				<span className="yr">{year}</span>
				{project.coverImage ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={project.coverImage} alt={title} loading="lazy" />
				) : (
					<span className="glyph">{title.charAt(0)}</span>
				)}
			</div>
			<div className="body">
				<h3>{title}</h3>
				<p>{summary}</p>
				{tags.length > 0 && (
					<div className="tags">
						{tags.map((tag) => (
							<span key={tag} className="tag-chip">
								{tag}
							</span>
						))}
					</div>
				)}
				<span className="arrow">
					{labels.viewDetails} <ArrowRight className="h-3.5 w-3.5" />
				</span>
			</div>
		</Link>
	);
}
