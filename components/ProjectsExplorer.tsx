"use client";

import { useMemo, useState } from "react";
import { FolderCode } from "lucide-react";
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

/** Projeler listesi — mono etiket filtre rail'i + boş durum (client). */
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
			<div className="mb-9 mt-7 flex flex-wrap gap-2">
				{tags.map((tag) => {
					const on = tag === filter;
					return (
						<button
							key={tag}
							type="button"
							onClick={() => setFilter(tag)}
							aria-pressed={on}
							className={
								"rounded-full border px-3.5 py-1.5 font-mono text-[0.76rem] transition-colors " +
								(on
									? "border-foreground bg-foreground text-background"
									: "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground")
							}
						>
							{tag}
						</button>
					);
				})}
			</div>

			{filtered.length > 0 ? (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((p, index) => (
						<ProjectCard
							key={p.id}
							project={p}
							locale={locale}
							index={index}
							labels={{ viewDetails: labels.viewDetails }}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
					<FolderCode className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
					<p className="text-muted-foreground">{labels.empty}</p>
					<button
						type="button"
						onClick={() => setFilter(labels.all)}
						className="rounded-lg border border-border px-4 py-2 font-mono text-sm transition-colors hover:bg-secondary"
					>
						{labels.clearFilter}
					</button>
				</div>
			)}
		</>
	);
}
