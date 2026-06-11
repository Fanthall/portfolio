import Image from "next/image";
import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { getAboutContent } from "@/lib/about";
import { parseSkills } from "@/lib/skills";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { StructuredData } from "@/components/StructuredData";
import { getPageMetadata } from "@/lib/seo";
import { getSiteUrl, localizeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export const generateMetadata = () => getPageMetadata("HOME");

const MAX_HERO_TECH = 8;

/** Stajları saymadan ilk işe başlama tarihinden bugüne tam yıl. */
function experienceYears(experiences: { startDate: Date; roleTr: string }[]) {
	const nonIntern = experiences.filter((e) => !e.roleTr.toLowerCase().includes("staj"));
	const pool = nonIntern.length > 0 ? nonIntern : experiences;
	if (pool.length === 0) return 0;
	const earliest = pool.reduce(
		(min, e) => (e.startDate < min ? e.startDate : min),
		pool[0].startDate,
	);
	const years = (Date.now() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
	return Math.max(0, Math.floor(years));
}

export default async function HomePage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const [about, featuredProjects, experiences, projectCount] = await Promise.all([
		getAboutContent(),
		prisma.project.findMany({
			where: { isFeatured: true },
			orderBy: { order: "asc" },
			take: 3,
		}),
		prisma.workExperience.findMany({
			select: { startDate: true, endDate: true, roleTr: true, roleEn: true, companyName: true },
			orderBy: { startDate: "desc" },
		}),
		prisma.project.count(),
	]);

	const activeJob = experiences.find((e) => e.endDate === null) ?? null;
	// Staj kayıtları şirket sayısına girmesin (ör. üniversite bilgi işlem stajı)
	const professional = experiences.filter(
		(e) => !e.roleTr.toLowerCase().includes("staj"),
	);
	const companyCount = new Set(
		(professional.length > 0 ? professional : experiences).map((e) => e.companyName),
	).size;
	const years = experienceYears(experiences);

	const title = locale === "tr" ? about?.titleTr : about?.titleEn;
	const bio = locale === "tr" ? about?.bioTr : about?.bioEn;
	// Hero'da kesik metin yerine ilk paragraf + "Devamını oku"
	const bioFirstParagraph = bio?.split("\n\n")[0] ?? "";

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
			locale === "tr" ? "Front-End Yazılım Mühendisi" : "Front-End Software Engineer",
		alumniOf: [
			{
				"@type": "CollegeOrUniversity",
				name: "Eskişehir Osmangazi Üniversitesi",
			},
			{
				"@type": "CollegeOrUniversity",
				name: "Pamukkale Üniversitesi",
			},
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
		{ value: `${projectCount}`, label: t("home.stats.projects") },
		{ value: `${companyCount}`, label: t("home.stats.companies") },
	];

	return (
		<div className="container mx-auto px-4 py-12 md:py-20">
			<StructuredData data={personSchema} />
			<StructuredData data={websiteSchema} />

			{/* Hero */}
			<section className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
				<Stagger className="space-y-5">
					<StaggerItem>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
					</StaggerItem>
					<StaggerItem>
						<p className="text-lg text-muted-foreground">{t("home.subtitle")}</p>
					</StaggerItem>
					{activeJob && (
						<StaggerItem>
							<Link
								href="/career"
								className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm hover:bg-accent transition-colors"
							>
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
								</span>
								<Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">{t("home.currently")}:</span>
								<span className="font-medium">
									{locale === "tr" ? activeJob.roleTr : activeJob.roleEn}
								</span>
								<span className="text-muted-foreground">·</span>
								<span className="font-medium">{activeJob.companyName.split(" — ")[0]}</span>
							</Link>
						</StaggerItem>
					)}
					<StaggerItem>
						<p className="leading-relaxed max-w-prose">
							{bioFirstParagraph}{" "}
							<Link
								href="/about"
								className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
							>
								{t("home.readMore")} <ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</p>
					</StaggerItem>
					{techHighlights.length > 0 && (
						<StaggerItem>
							<ul className="flex flex-wrap gap-1.5">
								{techHighlights.map((tech) => (
									<li
										key={tech}
										className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
									>
										{tech}
									</li>
								))}
							</ul>
						</StaggerItem>
					)}
					<StaggerItem>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild>
								<Link href="/projects">
									{t("header.projects")} <ArrowRight />
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/contact">{t("header.contact")}</Link>
							</Button>
							{socialIconLinks.length > 0 && (
								<div className="flex items-center gap-1">
									{socialIconLinks.map((link) => (
										<NextLink
											key={link.label}
											href={link.href}
											target={link.href.startsWith("http") ? "_blank" : undefined}
											rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
											aria-label={link.label}
											className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
										>
											<link.icon className="h-4 w-4" />
										</NextLink>
									))}
								</div>
							)}
						</div>
					</StaggerItem>
				</Stagger>
				<div className="flex justify-center md:justify-end">
					{about?.photoUrl && (
						<div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-full ring-2 ring-border shadow-lg">
							<Image
								src={about.photoUrl}
								alt={title ?? "Profile"}
								fill
								sizes="(min-width: 768px) 20rem, 16rem"
								className="object-cover"
								priority
							/>
						</div>
					)}
				</div>
			</section>

			{/* Stats */}
			<Reveal>
				<section className="mt-16 grid grid-cols-3 gap-4 rounded-2xl border bg-card/50 px-6 py-8">
					{stats.map((stat) => (
						<div key={stat.label} className="text-center">
							<p className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
								{stat.value}
							</p>
							<p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
						</div>
					))}
				</section>
			</Reveal>

			{/* Featured projects */}
			{featuredProjects.length > 0 && (
				<section className="mt-20">
					<Reveal>
						<div className="flex items-end justify-between mb-6">
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
								{t("home.featuredTitle")}
							</h2>
							<Button variant="ghost" asChild>
								<Link href="/projects">
									{t("common.viewDetails")} <ArrowRight />
								</Link>
							</Button>
						</div>
					</Reveal>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{featuredProjects.map((p, index) => (
							<Reveal key={p.id} delay={index * 0.08} className="h-full">
								<ProjectCard
									project={p}
									locale={locale}
									labels={{ viewDetails: t("common.viewDetails") }}
								/>
							</Reveal>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
