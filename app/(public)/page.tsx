import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StructuredData } from "@/components/StructuredData";
import { getPageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("HOME");

export default async function HomePage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const about = await prisma.aboutContent.findUnique({ where: { id: 1 } });
	const featuredProjects = await prisma.project.findMany({
		where: { isFeatured: true },
		orderBy: { order: "asc" },
		take: 3,
	});
	const activeJob = await prisma.workExperience.findFirst({
		where: { endDate: null },
		orderBy: { startDate: "desc" },
	});

	const title = locale === "tr" ? about?.titleTr : about?.titleEn;
	const bioPreview = locale === "tr" ? about?.bioTr : about?.bioEn;
	const activeRoleLabel = locale === "tr" ? "Şu an" : "Currently";

	const base = getSiteUrl();
	const socials = (about?.socialLinks ?? {}) as {
		github?: string;
		linkedin?: string;
		instagram?: string;
		gmail?: string;
	};
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
		knowsAbout: [
			"React",
			"React Native",
			"TypeScript",
			"Next.js",
			"Node.js",
			"Java",
			"Spring Boot",
			"PostgreSQL",
		],
	};
	if (profileImage) personSchema.image = profileImage;
	if (socials.gmail) personSchema.email = `mailto:${socials.gmail}`;
	if (sameAs.length > 0) personSchema.sameAs = sameAs;

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		url: base,
		inLanguage: locale === "tr" ? "tr-TR" : "en-US",
	};

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in">
			<StructuredData data={personSchema} />
			<StructuredData data={websiteSchema} />
			<section className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
				<div className="space-y-5">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
						{title}
					</h1>
					<p className="text-lg text-muted-foreground">{t("home.subtitle")}</p>
					{activeJob && (
						<Link
							href="/career"
							className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm hover:bg-accent transition-colors"
						>
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
							</span>
							<Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
							<span className="text-muted-foreground">{activeRoleLabel}:</span>
							<span className="font-medium">
								{locale === "tr" ? activeJob.roleTr : activeJob.roleEn}
							</span>
							<span className="text-muted-foreground">·</span>
							<span className="font-medium">{activeJob.companyName.split(" — ")[0]}</span>
						</Link>
					)}
					<p className="leading-relaxed max-w-prose">
						{bioPreview && bioPreview.length > 280
							? `${bioPreview.slice(0, 280)}…`
							: bioPreview}
					</p>
					<div className="flex flex-wrap gap-3">
						<Button asChild>
							<Link href="/projects">
								{t("header.projects")} <ArrowRight />
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/contact">{t("header.contact")}</Link>
						</Button>
					</div>
				</div>
				<div className="flex justify-center md:justify-end">
					{about?.photoUrl && (
						<div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-full ring-2 ring-border shadow-lg">
							<Image
								src={about.photoUrl}
								alt={title ?? "Profile"}
								fill
								className="object-cover"
								priority
							/>
						</div>
					)}
				</div>
			</section>

			{featuredProjects.length > 0 && (
				<section className="mt-20">
					<div className="flex items-end justify-between mb-6">
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
							{t("header.projects")}
						</h2>
						<Button variant="ghost" asChild>
							<Link href="/projects">
								{t("common.viewDetails")} <ArrowRight />
							</Link>
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{featuredProjects.map((p) => (
							<Card key={p.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6 space-y-3">
									<h3 className="font-semibold text-lg">
										{locale === "tr" ? p.titleTr : p.titleEn}
									</h3>
									<p className="text-sm text-muted-foreground line-clamp-3">
										{locale === "tr" ? p.summaryTr : p.summaryEn}
									</p>
									<Button variant="link" className="px-0 h-auto" asChild>
										<Link href={`/projects/${p.slug}`} target="_blank">
											{t("common.openInNewTab")} <ArrowRight />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
