import { getLocale, getTranslations } from "next-intl/server";
import { getAllProjects } from "@/lib/data/queries";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("PROJECTS");

export default async function ProjectsPage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const projects = await getAllProjects();

	return (
		<div className="mx-auto max-w-[1180px] px-6 py-14 md:py-20">
			<p className="eyebrow">{t("header.projects")}</p>
			<h1 className="mt-2.5 font-display text-3xl font-semibold tracking-tight md:text-5xl">
				{t("header.projects")}
			</h1>
			<p className="mt-3 max-w-[52ch] text-muted-foreground">{t("projects.lead")}</p>

			{projects.length > 0 ? (
				<ProjectsExplorer
					projects={projects}
					locale={locale}
					labels={{
						viewDetails: t("common.viewDetails"),
						all: t("projects.filterAll"),
						empty: t("projects.filterEmpty"),
						clearFilter: t("projects.clearFilter"),
					}}
				/>
			) : (
				<div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
					<p className="text-muted-foreground">{t("projects.empty")}</p>
				</div>
			)}
		</div>
	);
}
