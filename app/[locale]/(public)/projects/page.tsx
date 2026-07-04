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
		<div className="wrap page">
			<div className="page-head">
				<span className="eyebrow">{t("header.projects")}</span>
				<h1>{t("header.projects")}</h1>
				<p>{t("projects.lead")}</p>
			</div>

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
				<div className="placeholder">
					<div className="icon">∅</div>
					<div className="big">{t("projects.empty")}</div>
				</div>
			)}
		</div>
	);
}
