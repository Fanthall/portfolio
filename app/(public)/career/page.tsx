import type { WorkExperience } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("CAREER");

function formatMonth(date: Date, locale: Locale) {
	return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
		year: "numeric",
		month: "short",
	}).format(date);
}

function formatPeriod(start: Date, end: Date | null, locale: Locale) {
	const startStr = formatMonth(start, locale);
	const endStr = end ? formatMonth(end, locale) : locale === "tr" ? "Devam ediyor" : "Present";
	return `${startStr} — ${endStr}`;
}

interface CompanyGroup {
	companyName: string;
	earliestStart: Date;
	latestEnd: Date | null; // null = at least one active
	hasActive: boolean;
	positions: WorkExperience[];
}

function groupByCompany(experiences: WorkExperience[]): CompanyGroup[] {
	const map = new Map<string, CompanyGroup>();

	for (const exp of experiences) {
		const existing = map.get(exp.companyName);
		if (existing) {
			existing.positions.push(exp);
			if (exp.startDate < existing.earliestStart) {
				existing.earliestStart = exp.startDate;
			}
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
	for (const g of groups) {
		g.positions.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
	}

	// Order: active groups first, then by latestEnd / earliestStart desc
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
	const t = await getTranslations("header");
	const experiences = await prisma.workExperience.findMany();
	const groups = groupByCompany(experiences);

	const activeLabel = locale === "tr" ? "Aktif" : "Active";

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl animate-fade-in">
			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
				{t("career")}
			</h1>

			<ol className="space-y-4">
				{groups.map((group) => (
					<li key={group.companyName}>
						<Card
							className={cn(
								"transition-shadow",
								group.hasActive && "ring-1 ring-emerald-500/40",
							)}
						>
							<CardContent className="p-6">
								<header className="flex flex-wrap items-start justify-between gap-3 mb-4">
									<div className="flex items-start gap-3 min-w-0">
										<div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<Building2 className="h-5 w-5" />
										</div>
										<div className="min-w-0">
											<h2 className="font-semibold text-base leading-tight">
												{group.companyName}
											</h2>
											<p className="text-xs text-muted-foreground mt-1">
												{formatPeriod(group.earliestStart, group.latestEnd, locale)}
											</p>
										</div>
									</div>
									{group.hasActive && (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
											<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
											{activeLabel}
										</span>
									)}
								</header>

								<ol className="relative border-s border-border ml-5 space-y-5">
									{group.positions.map((pos) => {
										const isActive = pos.endDate === null;
										return (
											<li key={pos.id} className="ms-5">
												<span
													className={cn(
														"absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background",
														isActive ? "bg-emerald-500" : "bg-primary",
													)}
												/>
												<p className="text-[11px] uppercase tracking-wider text-muted-foreground">
													{formatPeriod(pos.startDate, pos.endDate, locale)}
												</p>
												<h3 className="font-medium mt-0.5">
													{locale === "tr" ? pos.roleTr : pos.roleEn}
												</h3>
												<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
													{locale === "tr" ? pos.descTr : pos.descEn}
												</p>
											</li>
										);
									})}
								</ol>
							</CardContent>
						</Card>
					</li>
				))}
				{groups.length === 0 && <li className="text-muted-foreground">—</li>}
			</ol>
		</div>
	);
}
