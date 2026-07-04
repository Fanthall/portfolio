import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { getAboutContent } from "@/lib/about";
import { parseSkills } from "@/lib/skills";
import { getPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/request";

export const generateMetadata = () => getPageMetadata("ABOUT");

interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
}

export default async function AboutPage() {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();
	const about = await getAboutContent();
	const title = locale === "tr" ? about?.titleTr : about?.titleEn;
	const bio = locale === "tr" ? about?.bioTr : about?.bioEn;
	const paragraphs = (bio ?? "").split("\n\n").filter(Boolean);
	const skillGroups = parseSkills(about?.skills);
	const socials = (about?.socialLinks ?? {}) as SocialLinks;

	const socialLinks = [
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: socials.gmail },
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
	].filter(Boolean) as { href: string; icon: typeof Mail; label: string }[];

	const eduTr = [
		{ h: "Bilgisayar Mühendisliği", s: "Eskişehir Osmangazi Üniversitesi", m: "Lisans" },
		{ h: "Bilgisayar Programcılığı", s: "Pamukkale Üniversitesi · Okul birincisi", m: "Ön Lisans" },
	];
	const eduEn = [
		{ h: "Computer Engineering", s: "Eskişehir Osmangazi University", m: "BSc" },
		{ h: "Computer Programming", s: "Pamukkale University · Valedictorian", m: "Associate" },
	];
	const edu = locale === "tr" ? eduTr : eduEn;

	return (
		<div className="wrap page">
			<div className="page-head">
				<span className="eyebrow">{t("header.about")}</span>
				<h1>{title}</h1>
			</div>

			<div className="about-grid">
				<div className="portrait">
					<div className="corner" aria-hidden />
					{about?.photoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={about.photoUrl} alt={title ?? "Sezer Demir Dedek"} />
					) : (
						<span className="face">SD</span>
					)}
				</div>

				<div>
					<div className="about-bio">
						{paragraphs.map((p, i) => (
							<p key={i}>{p}</p>
						))}
					</div>

					<div style={{ marginTop: 26 }}>
						{skillGroups.map((group) => (
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

					{socialLinks.length > 0 && (
						<div className="socials" style={{ marginLeft: 0, marginTop: 20 }}>
							{socialLinks.map((link) => (
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

					<div className="sec-head" style={{ marginTop: 34, marginBottom: 0 }}>
						<div>
							<span className="num">— {locale === "tr" ? "Eğitim" : "Education"}</span>
							<h2 style={{ fontSize: "1.3rem" }}>{locale === "tr" ? "Okullar" : "Schools"}</h2>
						</div>
					</div>
					<div className="edu">
						{edu.map((e) => (
							<div className="item" key={e.h}>
								<div>
									<h4>{e.h}</h4>
									<div className="school">{e.s}</div>
								</div>
								<span className="meta">{e.m}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
