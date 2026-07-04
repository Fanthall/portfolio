import { getLocale, getTranslations } from "next-intl/server";
import { getWorkExperiences } from "@/lib/data/queries";
import type { WorkExperience } from "@/lib/data/types";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("CAREER");

function formatMonth(date: Date, locale: Locale) {
	return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
		year: "numeric",
		month: "short",
	}).format(date);
}

function formatPeriod(start: Date, end: Date | null, locale: Locale, present: string) {
	return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : present}`;
}

interface CompanyGroup {
	companyName: string;
	earliestStart: Date;
	latestEnd: Date | null;
	hasActive: boolean;
	positions: WorkExperience[];
}

function groupByCompany(experiences: WorkExperience[]): CompanyGroup[] {
	const map = new Map<string, CompanyGroup>();
	for (const exp of experiences) {
		const existing = map.get(exp.companyName);
		if (existing) {
			existing.positions.push(exp);
			if (exp.startDate < existing.earliestStart) existing.earliestStart = exp.startDate;
			if (exp.endDate === null) {
				existing.hasActive = true;
				existing.latestEnd = null;
			} else if (existing.latestEnd !== null && exp.endDate > existing.latestEnd) {
				existing.latestEnd = exp.endDate;
			}
		} else {
			map.set(exp.companyName, {
				companyName: exp.companyName,
				earliestStart: exp.startDate,
				latestEnd: exp.endDate,
				hasActive: exp.endDate === null,
				positions: [exp],
			});
		}
	}
	const groups = Array.from(map.values());
	for (const g of groups) g.positions.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
	groups.sort((a, b) => {
		if (a.hasActive !== b.hasActive) return a.hasActive ? -1 : 1;
		const aRef = a.latestEnd ?? a.earliestStart;
		const bRef = b.latestEnd ?? b.earliestStart;
		return bRef.getTime() - aRef.getTime();
	});
	return groups;
}

export default async function CareerPage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const experiences = await getWorkExperiences();
	const groups = groupByCompany(experiences);
	const present = t("career.present");
	const activeLabel = t("career.active");

	return (
		<div className="wrap page">
			<div className="page-head">
				<span className="eyebrow">{t("header.career")}</span>
				<h1>{locale === "tr" ? "Çalıştığım yerler" : "Where I've worked"}</h1>
				<p>
					{locale === "tr"
						? "Şirkete göre gruplanmış deneyim; aktif rol yeşil ile işaretli."
						: "Experience grouped by company; the active role is marked green."}
				</p>
			</div>

			<div className="timeline">
				{groups.map((group) => (
					<div key={group.companyName} className={`company${group.hasActive ? " active" : ""}`}>
						<div className="chead">
							<div>
								<div className="cname">{group.companyName.split(" — ")[0]}</div>
								<div className="cspan">
									{formatPeriod(group.earliestStart, group.latestEnd, locale, present)}
								</div>
							</div>
							{group.hasActive && (
								<span className="live">
									<span className="dot" />
									{activeLabel}
								</span>
							)}
						</div>
						<div className="roles">
							{group.positions.map((pos) => (
								<div
									key={pos.id}
									className={`role-item${pos.endDate === null ? " live" : ""}`}
								>
									<div className="rp">
										{formatPeriod(pos.startDate, pos.endDate, locale, present)}
									</div>
									<h4>{locale === "tr" ? pos.roleTr : pos.roleEn}</h4>
									<p>{locale === "tr" ? pos.descTr : pos.descEn}</p>
								</div>
							))}
						</div>
					</div>
				))}
				{groups.length === 0 && (
					<div className="placeholder">
						<div className="big">{t("career.empty")}</div>
					</div>
				)}
			</div>
		</div>
	);
}
