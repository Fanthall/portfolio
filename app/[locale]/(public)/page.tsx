import Image from "next/image";
import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
	getAboutContent,
	getFeaturedProjects,
	getProjectCount,
	getWorkExperiences,
} from "@/lib/data/queries";
import { parseSkills } from "@/lib/skills";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusLine } from "@/components/StatusLine";
import { TechMarquee } from "@/components/TechMarquee";
import { Reveal } from "@/components/motion/Reveal";
import { StructuredData } from "@/components/StructuredData";
import { getPageMetadata } from "@/lib/seo";
import { getSiteUrl, localizeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export const generateMetadata = () => getPageMetadata("HOME");

const MAX_HERO_TECH = 10;

/**
 * Stajları saymadan ilk işe başlama YILINDAN bugüne takvim yılı farkı.
 * Yıl bazlı olduğu için her yeni yılda otomatik +1 artar (ör. 2021 başlangıç
 * → 2026'da 5, 2027'de 6).
 */
function experienceYears(experiences: { startDate: Date; roleTr: string }[]) {
	const nonIntern = experiences.filter((e) => !e.roleTr.toLowerCase().includes("staj"));
	const pool = nonIntern.length > 0 ? nonIntern : experiences;
	if (pool.length === 0) return 0;
	const earliest = pool.reduce(
		(min, e) => (e.startDate < min ? e.startDate : min),
		pool[0].startDate,
	);
	return Math.max(0, new Date().getFullYear() - earliest.getFullYear());
}

// Çalışılan (üzerinde çalışılmış) toplam proje sayısı — vitrindeki proje
// sayısından bağımsız kişisel metrik. DB'deki proje sayısı bunu aşarsa o kullanılır.
const PROJECTS_WORKED = 7;

export default async function HomePage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const [about, featuredProjects, experiences, projectCount] = await Promise.all([
		getAboutContent(),
		getFeaturedProjects(3),
		getWorkExperiences(),
		getProjectCount(),
	]);

	const professional = experiences.filter(
		(e) => !e.roleTr.toLowerCase().includes("staj"),
	);
	const companyCount = new Set(
		(professional.length > 0 ? professional : experiences).map((e) => e.companyName),
	).size;
	const years = experienceYears(experiences);

	const title = locale === "tr" ? about?.titleTr : about?.titleEn;
	const bio = locale === "tr" ? about?.bioTr : about?.bioEn;
	const bioFirstParagraph = bio?.split("\n\n")[0] ?? "";
	// Hero rol + alt-metin: DB (admin'den düzenlenebilir) → yoksa i18n fallback
	const role = (locale === "tr" ? about?.roleTr : about?.roleEn)?.trim() || t("home.eyebrow");
	const tagline =
		(locale === "tr" ? about?.taglineTr : about?.taglineEn)?.trim() || t("home.subtitle");

	const techHighlights = [
		...new Set(parseSkills(about?.skills).flatMap((g) => g.items)),
	].slice(0, MAX_HERO_TECH);

	const base = getSiteUrl();
	const socials = (about?.socialLinks ?? {}) as {
		github?: string;
		linkedin?: string;
		instagram?: string;
		gmail?: string;
	};
	const socialIconLinks = [
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: "E-posta" },
	].filter(Boolean) as { href: string; icon: typeof Github; label: string }[];

	const sameAs = [socials.github, socials.linkedin, socials.instagram].filter(
		(v): v is string => !!v,
	);
	const siteName = about?.siteTitle?.trim() || "Sezer Demir DEDEK";
	const profileImage = about?.photoUrl
		? about.photoUrl.startsWith("http")
			? about.photoUrl
			: `${base}${about.photoUrl}`
		: undefined;

	const personSchema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: "Sezer Demir DEDEK",
		url: base,
		jobTitle:
			locale === "tr"
				? "Front-End & AI Ajan Geliştirici"
				: "Front-End & AI Agent Engineer",
		alumniOf: [
			{ "@type": "CollegeOrUniversity", name: "Eskişehir Osmangazi Üniversitesi" },
			{ "@type": "CollegeOrUniversity", name: "Pamukkale Üniversitesi" },
		],
		knowsAbout: techHighlights,
	};
	if (profileImage) personSchema.image = profileImage;
	if (socials.gmail) personSchema.email = `mailto:${socials.gmail}`;
	if (sameAs.length > 0) personSchema.sameAs = sameAs;

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		url: localizeUrl("/", locale),
		inLanguage: locale === "tr" ? "tr-TR" : "en-US",
	};

	const stats = [
		{ value: `${years}+`, label: t("home.stats.experience") },
		{
			value: `${about?.projectsWorked ?? Math.max(projectCount, PROJECTS_WORKED)}`,
			label: t("home.stats.projects"),
		},
		{ value: `${companyCount}`, label: t("home.stats.companies") },
	];

	const presentLabel = t("career.present");
	const topExperiences = (professional.length > 0 ? professional : experiences).slice(0, 4);
	const formatSpan = (e: { startDate: Date; endDate: Date | null }) =>
		`${e.startDate.getFullYear()} — ${e.endDate ? e.endDate.getFullYear() : presentLabel}`;

	return (
		<div className="mx-auto max-w-[1180px] px-6">
			<StructuredData data={personSchema} />
			<StructuredData data={websiteSchema} />

			{/* HERO */}
			<section className="relative grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-[1.5fr_1fr] md:py-20">
				<span
					className="pointer-events-none absolute inset-x-[-50vw] inset-y-[-60px] -z-10 bg-[linear-gradient(hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.5)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_65%_at_35%_32%,#000_20%,transparent_72%)]"
					aria-hidden
				/>
				<div className="space-y-5">
					<p className="eyebrow">{role}</p>
					<h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
						{title}
					</h1>
					<p className="max-w-prose text-lg text-muted-foreground">{tagline}</p>
					<div>
						<StatusLine
							availableLabel={t("home.available")}
							remoteLabel={t("home.remote")}
						/>
					</div>
					<p className="max-w-prose leading-relaxed">
						{bioFirstParagraph}{" "}
						<Link
							href="/about"
							className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-sm text-primary hover:underline"
						>
							{t("home.readMore")} <ArrowRight className="h-3.5 w-3.5" />
						</Link>
					</p>
					<div className="flex flex-wrap items-center gap-3 pt-1">
						<Link
							href="/projects"
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							{t("home.viewAll")} <ArrowRight className="h-4 w-4" />
						</Link>
						<Link
							href="/contact"
							className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-display text-sm font-medium transition-colors hover:bg-secondary"
						>
							{t("header.contact")}
						</Link>
						{socialIconLinks.length > 0 && (
							<div className="flex items-center gap-1">
								{socialIconLinks.map((link) => (
									<NextLink
										key={link.label}
										href={link.href}
										target={link.href.startsWith("http") ? "_blank" : undefined}
										rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
										aria-label={link.label}
										className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
									>
										<link.icon className="h-4 w-4" />
									</NextLink>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-center md:justify-end">
					<div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-2xl border border-border bg-[radial-gradient(hsl(var(--border))_1px,transparent_1.4px)] [background-size:18px_18px]">
						<span
							className="absolute right-0 top-0 h-11 w-11 bg-primary [clip-path:polygon(100%_0,0_0,100%_100%)]"
							aria-hidden
						/>
						{about?.photoUrl ? (
							<Image
								src={about.photoUrl}
								alt={title ?? "Sezer Demir DEDEK"}
								fill
								sizes="(min-width: 768px) 300px, 100vw"
								className="object-cover"
								priority
							/>
						) : (
							<span className="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-border">
								SD
							</span>
						)}
					</div>
				</div>
			</section>

			{/* TECH MARQUEE */}
			{techHighlights.length > 0 && (
				<div className="-mx-6">
					<TechMarquee items={techHighlights} />
				</div>
			)}

			{/* 01 — SELECTED WORK */}
			{featuredProjects.length > 0 && (
				<section className="py-16 md:py-20">
					<Reveal>
						<SectionHeading
							num="01"
							label={t("home.sections.work")}
							title={t("home.featuredTitle")}
							more={{ href: "/projects", label: t("home.viewAll") }}
						/>
					</Reveal>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
						{featuredProjects.map((p, index) => (
							<Reveal key={p.id} delay={index * 0.08} className="h-full">
								<ProjectCard
									project={p}
									locale={locale}
									index={index}
									labels={{ viewDetails: t("common.viewDetails") }}
								/>
							</Reveal>
						))}
					</div>
				</section>
			)}

			{/* 02 — BY THE NUMBERS */}
			<section className="pb-16 md:pb-20">
				<Reveal>
					<SectionHeading num="02" label={t("home.sections.stats")} title={t("home.sections.stats")} />
				</Reveal>
				<Reveal>
					<div className="grid grid-cols-1 sm:grid-cols-3">
						{stats.map((stat, i) => (
							<div
								key={stat.label}
								className={
									i === 0
										? "py-4 sm:pr-8"
										: "border-t border-border py-4 sm:border-l sm:border-t-0 sm:px-8"
								}
							>
								<p className="font-display text-4xl font-bold leading-none tracking-tight md:text-5xl">
									{stat.value.replace(/\+$/, "")}
									{stat.value.endsWith("+") && <span className="text-primary">+</span>}
								</p>
								<p className="mt-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				</Reveal>
			</section>

			{/* 03 — EXPERIENCE */}
			{topExperiences.length > 0 && (
				<section className="pb-16 md:pb-20">
					<Reveal>
						<SectionHeading
							num="03"
							label={t("home.sections.experience")}
							title={t("home.sections.experience")}
							more={{ href: "/career", label: t("header.career") }}
						/>
					</Reveal>
					<Reveal>
						<div>
							{topExperiences.map((e, i) => (
								<div
									key={e.id}
									className={`grid grid-cols-1 items-baseline gap-2 py-4 sm:grid-cols-[160px_1fr_auto] sm:gap-5 ${
										i > 0 ? "border-t border-border" : ""
									}`}
								>
									<span className="font-mono text-sm text-muted-foreground">
										{formatSpan(e)}
									</span>
									<div>
										<h3 className="font-display font-semibold">
											{locale === "tr" ? e.roleTr : e.roleEn}
										</h3>
										<span className="text-sm text-muted-foreground">
											{e.companyName.split(" — ")[0]}
										</span>
									</div>
									{e.endDate === null ? (
										<span className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/50 px-2 py-0.5 font-mono text-[0.68rem] text-emerald-600 dark:text-emerald-400">
											<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
											{t("career.active")}
										</span>
									) : (
										<span className="hidden font-mono text-sm text-muted-foreground sm:inline">
											—
										</span>
									)}
								</div>
							))}
						</div>
					</Reveal>
				</section>
			)}

			{/* 04 — ABOUT */}
			<section className="pb-16 md:pb-20">
				<Reveal>
					<SectionHeading
						num="04"
						label={t("home.sections.about")}
						title={t("home.sections.about")}
						more={{ href: "/about", label: t("home.readMore") }}
					/>
				</Reveal>
				<Reveal>
					<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
						<p className="leading-relaxed text-muted-foreground">{bioFirstParagraph}</p>
						<div className="space-y-4">
							{parseSkills(about?.skills).map((group) => (
								<div key={group.titleEn}>
									<p className="mb-2 font-mono text-xs uppercase tracking-wider text-primary">
										{locale === "tr" ? group.titleTr : group.titleEn}
									</p>
									<ul className="flex flex-wrap gap-1.5">
										{group.items.map((item) => (
											<li
												key={item}
												className="inline-flex items-center rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[0.68rem]"
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</Reveal>
			</section>

			{/* CONTACT BAND */}
			<section className="pb-20">
				<Reveal>
					<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center md:p-16">
						<span className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden />
						<p className="eyebrow">05 — {t("header.contact")}</p>
						<h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight md:text-4xl">
							{t("home.letsWork")}
						</h2>
						{socials.gmail && (
							<p className="mt-4 font-mono text-muted-foreground">{socials.gmail}</p>
						)}
						<Link
							href="/contact"
							className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							{t("contact.send")} <ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</Reveal>
			</section>
		</div>
	);
}
