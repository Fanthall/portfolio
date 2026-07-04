import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
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
import { StructuredData } from "@/components/StructuredData";
import { getPageMetadata } from "@/lib/seo";
import { getSiteUrl, localizeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export const generateMetadata = () => getPageMetadata("HOME");

const MAX_HERO_TECH = 10;
const PROJECTS_WORKED = 7;

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
		jobTitle: role,
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

	const projectsStat = about?.projectsWorked ?? Math.max(projectCount, PROJECTS_WORKED);
	const presentLabel = t("career.present");
	const topExperiences = (professional.length > 0 ? professional : experiences).slice(0, 4);
	const marqueeItems = [...techHighlights, ...techHighlights];

	return (
		<>
			<StructuredData data={personSchema} />
			<StructuredData data={websiteSchema} />

			{/* HERO */}
			<div className="wrap">
				<section className="hero">
					<div>
						<span className="eyebrow">{role}</span>
						<h1>{title}</h1>
						<p className="lead">{tagline}</p>
						<div>
							<StatusLine
								availableLabel={t("home.available")}
								remoteLabel={t("home.remote")}
							/>
						</div>
						<div className="cta">
							<Link href="/projects" className="btn primary">
								{t("home.viewAll")} →
							</Link>
							<Link href="/contact" className="btn ghost">
								{t("header.contact")}
							</Link>
							{socialIconLinks.length > 0 && (
								<div className="socials">
									{socialIconLinks.map((link) => (
										<NextLink
											key={link.label}
											href={link.href}
											target={link.href.startsWith("http") ? "_blank" : undefined}
											rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
											aria-label={link.label}
										>
											<link.icon className="h-4 w-4" />
										</NextLink>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="portrait">
						<div className="corner" aria-hidden />
						{about?.photoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={about.photoUrl} alt={title ?? "Sezer Demir Dedek"} />
						) : (
							<span className="face">SD</span>
						)}
					</div>
				</section>
			</div>

			{/* TECH MARQUEE — tam ekran band */}
			{techHighlights.length > 0 && (
				<div className="marquee" aria-hidden>
					<div className="track">
						{marqueeItems.map((tech, i) => (
							<span key={`${tech}-${i}`}>{tech}</span>
						))}
					</div>
				</div>
			)}

			{/* 01 — SELECTED WORK */}
			{featuredProjects.length > 0 && (
				<section className="block">
					<div className="wrap">
						<SectionHeading
							num="01"
							label={t("home.sections.work")}
							title={t("home.featuredTitle")}
							more={{ href: "/projects", label: t("home.viewAll") }}
						/>
						<div className="work-grid">
							{featuredProjects.map((p, index) => (
								<ProjectCard
									key={p.id}
									project={p}
									locale={locale}
									index={index}
									labels={{ viewDetails: t("common.viewDetails") }}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{/* 02 — BY THE NUMBERS */}
			<section className="block" style={{ paddingTop: 0 }}>
				<div className="wrap">
					<SectionHeading num="02" label={t("home.sections.stats")} title={t("home.sections.stats")} />
					<div className="stats">
						<div className="stat">
							<div className="v">
								{years}
								<em>+</em>
							</div>
							<div className="l">{t("home.stats.experience")}</div>
						</div>
						<div className="stat">
							<div className="v">{projectsStat}</div>
							<div className="l">{t("home.stats.projects")}</div>
						</div>
						<div className="stat">
							<div className="v">{companyCount}</div>
							<div className="l">{t("home.stats.companies")}</div>
						</div>
					</div>
				</div>
			</section>

			{/* 03 — EXPERIENCE */}
			{topExperiences.length > 0 && (
				<section className="block" style={{ paddingTop: 0 }}>
					<div className="wrap">
						<SectionHeading
							num="03"
							label={t("home.sections.experience")}
							title={t("home.sections.experience")}
							more={{ href: "/career", label: t("header.career") }}
						/>
						<div className="exp">
							{topExperiences.map((e) => (
								<div key={e.id} className="row">
									<span className="when">
										{e.startDate.getFullYear()} —{" "}
										{e.endDate ? e.endDate.getFullYear() : presentLabel}
									</span>
									<div className="what">
										<h4>{locale === "tr" ? e.roleTr : e.roleEn}</h4>
										<span className="co">{e.companyName.split(" — ")[0]}</span>
									</div>
									{e.endDate === null ? (
										<span className="live">
											<span className="dot" />
											{t("career.active")}
										</span>
									) : (
										<span className="when">—</span>
									)}
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* 04 — ABOUT */}
			<section className="block" style={{ paddingTop: 0 }}>
				<div className="wrap">
					<SectionHeading
						num="04"
						label={t("home.sections.about")}
						title={t("home.sections.about")}
						more={{ href: "/about", label: t("home.readMore") }}
					/>
					<div className="about">
						<div>
							<p>{bioFirstParagraph}</p>
						</div>
						<div>
							{parseSkills(about?.skills).map((group) => (
								<div className="skillgroup" key={group.titleEn}>
									<div className="gt">{locale === "tr" ? group.titleTr : group.titleEn}</div>
									<div className="gi">
										{group.items.map((item) => (
											<span key={item} className="tag-chip">
												{item}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CONTACT BAND */}
			<section className="block" style={{ paddingTop: 0 }}>
				<div className="wrap">
					<div className="contact">
						<span className="eyebrow">05 — {t("header.contact")}</span>
						<h2 style={{ marginTop: 10 }}>{t("home.letsWork")}</h2>
						{socials.gmail && <span className="em">{socials.gmail}</span>}
						<Link href="/contact" className="btn primary">
							{t("contact.send")} →
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
