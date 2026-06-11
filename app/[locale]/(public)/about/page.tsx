import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { getAboutContent } from "@/lib/about";
import { parseSkills } from "@/lib/skills";
import { Card, CardContent } from "@/components/ui/card";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("ABOUT");

interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
	outlook?: string;
}

export default async function AboutPage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const about = await getAboutContent();
	const title = locale === "tr" ? about?.titleTr : about?.titleEn;
	const bio = locale === "tr" ? about?.bioTr : about?.bioEn;
	const socials = (about?.socialLinks ?? {}) as SocialLinks;

	const socialLinks = [
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: socials.gmail },
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
	].filter(Boolean) as { href: string; icon: typeof Mail; label: string }[];

	const skillGroups = parseSkills(about?.skills).map((g) => ({
		title: locale === "tr" ? g.titleTr : g.titleEn,
		items: g.items,
	}));

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in">
			{/* Hero */}
			<section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-start gap-10 lg:gap-16">
				<div className="flex justify-center lg:justify-start">
					{about?.photoUrl && (
						<div className="relative h-56 w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 overflow-hidden rounded-3xl ring-2 ring-border shadow-xl">
							<Image
								src={about.photoUrl}
								alt={title ?? "Profile"}
								fill
								sizes="(min-width: 1024px) 18rem, 16rem"
								className="object-cover"
								priority
							/>
						</div>
					)}
				</div>

				<div className="space-y-5">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
							{t("header.about")}
						</p>
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
							{title}
						</h1>
					</div>
					<p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-3xl whitespace-pre-line">
						{bio}
					</p>
					{socialLinks.length > 0 && (
						<div className="flex flex-wrap gap-2 pt-2">
							{socialLinks.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									target={link.href.startsWith("http") ? "_blank" : undefined}
									rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
									className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<link.icon className="h-4 w-4" />
									<span>{link.label}</span>
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Skills */}
			<section className="mt-20">
				<h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
					{t("about.skillsTitle")}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{skillGroups.map((group) => (
						<Card key={group.title}>
							<CardContent className="p-6 space-y-3">
								<h3 className="font-semibold">{group.title}</h3>
								<ul className="flex flex-wrap gap-2">
									{group.items.map((skill) => (
										<li
											key={skill}
											className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
										>
											{skill}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
