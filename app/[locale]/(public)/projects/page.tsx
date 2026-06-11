import { getLocale, getTranslations } from "next-intl/server";
import { FolderCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
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
			{projects.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{projects.map((p, index) => (
						<Reveal key={p.id} delay={Math.min(index, 5) * 0.06} className="h-full">
							<ProjectCard
								project={p}
								locale={locale}
								labels={{ viewDetails: t("common.viewDetails") }}
							/>
						</Reveal>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
					<FolderCode className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
					<p className="text-muted-foreground">{t("projects.empty")}</p>
				</div>
			)}
		</div>
	);
}
