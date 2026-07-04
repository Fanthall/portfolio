"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/data/types";
import type { Locale } from "@/i18n/routing";
import { ProjectCard } from "@/components/ProjectCard";

interface ProjectsExplorerProps {
	projects: Project[];
	locale: Locale;
	labels: {
		viewDetails: string;
		all: string;
		empty: string;
		clearFilter: string;
	};
}

/** Prototip view-projects — .filters rail + .proj-grid + boş durum (.placeholder). */
export function ProjectsExplorer({ projects, locale, labels }: ProjectsExplorerProps) {
	const [filter, setFilter] = useState<string>(labels.all);

	const tags = useMemo(() => {
		const set = new Set<string>();
		for (const p of projects) for (const tag of p.tags) set.add(tag);
		return [labels.all, ...Array.from(set).sort()];
	}, [projects, labels.all]);

	const filtered =
		filter === labels.all
			? projects
			: projects.filter((p) => p.tags.includes(filter));

	return (
		<>
			<div className="filters">
				{tags.map((tag) => (
					<button
						key={tag}
						type="button"
						onClick={() => setFilter(tag)}
						aria-pressed={tag === filter}
						className={`filter${tag === filter ? " on" : ""}`}
					>
						{tag}
					</button>
				))}
			</div>

			{filtered.length > 0 ? (
				<div className="proj-grid">
					{filtered.map((p) => (
						<ProjectCard
							key={p.id}
							project={p}
							locale={locale}
							labels={{ viewDetails: labels.viewDetails }}
						/>
					))}
				</div>
			) : (
				<div className="placeholder">
					<div className="icon">∅</div>
					<div className="big">{labels.empty}</div>
					<button
						type="button"
						className="btn ghost"
						onClick={() => setFilter(labels.all)}
					>
						{labels.clearFilter}
					</button>
				</div>
			)}
		</>
	);
}
